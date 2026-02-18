#!/bin/bash
#
# Stop and clean up OpenSearch and OpenSearch Dashboards containers
#
# Usage: ./scripts/stop-local.sh [options]
#   Options:
#     -v, --volumes    Remove volumes (clean slate - removes all data)
#     -a, --all        Stop and remove all containers, volumes, and images
#
# Examples:
#   ./scripts/stop-local.sh              # Stop containers (preserve data)
#   ./scripts/stop-local.sh -v           # Stop and remove volumes
#   ./scripts/stop-local.sh --all        # Complete cleanup

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Fully qualified image references
OPENSEARCH_IMAGE="docker.io/opensearchproject/opensearch"
DASHBOARDS_IMAGE="docker.io/opensearchproject/opensearch-dashboards"

REMOVE_VOLUMES=false
REMOVE_ALL=false

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--volumes)
            REMOVE_VOLUMES=true
            shift
            ;;
        -a|--all)
            REMOVE_ALL=true
            shift
            ;;
        -h|--help)
            echo "Usage: ./scripts/stop-local.sh [options]"
            echo ""
            echo "Options:"
            echo "  -v, --volumes    Remove volumes (removes all data)"
            echo "  -a, --all        Complete cleanup including images"
            echo "  -h, --help       Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

echo "=============================================="
echo "Stopping OpenSearch Index Manager Services"
echo "=============================================="

# Check if podman is available
if ! command -v podman &> /dev/null; then
    log_error "podman is not installed"
    exit 1
fi

# Stop containers gracefully
stop_containers() {
    local containers=("osim-dashboards" "osim-opensearch")
    for container in "${containers[@]}"; do
        if podman ps --format "{{.Names}}" | grep -q "^${container}$"; then
            log_info "Stopping container: $container"
            podman stop "$container" 2>/dev/null || {
                log_warn "Failed to stop $container gracefully, forcing..."
                podman kill "$container" 2>/dev/null || true
            }
        fi
    done
}

# Remove containers
remove_containers() {
    local containers=("osim-dashboards" "osim-opensearch")
    for container in "${containers[@]}"; do
        if podman ps -a --format "{{.Names}}" | grep -q "^${container}$"; then
            log_info "Removing container: $container"
            podman rm "$container" 2>/dev/null || {
                log_warn "Failed to remove container $container"
            }
        fi
    done
}

# Remove volumes
remove_volumes() {
    local volumes=("opensearch-data" "dashboards-data")
    for volume in "${volumes[@]}"; do
        if podman volume ls --format "{{.Name}}" | grep -q "^${volume}$"; then
            log_info "Removing volume: $volume"
            podman volume rm "$volume" 2>/dev/null || {
                log_warn "Failed to remove volume $volume (may be in use)"
            }
        fi
    done
}

# Remove images
remove_images() {
    log_info "Removing images..."
    # Get all versions we might have used
    local versions=("2.19.0" "2.19.1" "2.19.2" "2.19.3" "2.19.4")
    for version in "${versions[@]}"; do
        podman rmi "${OPENSEARCH_IMAGE}:${version}" 2>/dev/null || true
        podman rmi "${DASHBOARDS_IMAGE}:${version}" 2>/dev/null || true
    done
}

# Main cleanup logic
stop_containers
remove_containers

# Handle volumes
if [ "$REMOVE_ALL" = true ] || [ "$REMOVE_VOLUMES" = true ]; then
    remove_volumes
    log_info "All data has been removed."
fi

# Remove images if --all
if [ "$REMOVE_ALL" = true ]; then
    remove_images
fi

# Clean up temporary compose file if exists
if [ -f "$PROJECT_ROOT/.podman-compose.temp.yml" ]; then
    rm -f "$PROJECT_ROOT/.podman-compose.temp.yml"
fi

# Clean up builder images if --all
if [ "$REMOVE_ALL" = true ]; then
    log_info "Removing builder images..."
    podman rmi -f $(podman images --format "{{.Repository}}:{{.Tag}}" | grep "osim-builder" || echo "") 2>/dev/null || true
fi

echo "=============================================="
if [ "$REMOVE_ALL" = true ]; then
    echo "Complete cleanup finished!"
elif [ "$REMOVE_VOLUMES" = true ]; then
    echo "Containers stopped and volumes removed!"
else
    echo "Containers stopped (data preserved)!"
fi
echo "=============================================="

# Show status
echo ""
echo "Container status:"
if podman ps -a --filter "name=osim-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null | grep -q "osim-"; then
    podman ps -a --filter "name=osim-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
else
    echo "  No OSIM containers found"
fi
