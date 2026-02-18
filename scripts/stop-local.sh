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

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

REMOVE_VOLUMES=false
REMOVE_ALL=false

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
            echo "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

echo "=============================================="
echo "Stopping OpenSearch Index Manager Services"
echo "=============================================="

# Check if containers are running
if ! podman ps --format "{{.Names}}" | grep -qE "osim-opensearch|osim-dashboards"; then
    echo "No OSIM containers are currently running."
else
    echo "Stopping containers..."
    podman stop osim-dashboards osim-opensearch 2>/dev/null || true
fi

# Remove containers
if podman ps -a --format "{{.Names}}" | grep -qE "osim-opensearch|osim-dashboards"; then
    echo "Removing containers..."
    podman rm osim-dashboards osim-opensearch 2>/dev/null || true
fi

# Handle volumes
if [ "$REMOVE_ALL" = true ] || [ "$REMOVE_VOLUMES" = true ]; then
    echo "Removing volumes..."
    podman volume rm opensearch-data dashboards-data 2>/dev/null || true
    echo "All data has been removed."
fi

# Remove images if --all
if [ "$REMOVE_ALL" = true ]; then
    echo "Removing images..."
    podman rmi opensearchproject/opensearch-dashboards:2.19.0 2>/dev/null || true
    podman rmi opensearchproject/opensearch:2.19.0 2>/dev/null || true
fi

# Clean up temporary compose file if exists
if [ -f "$PROJECT_ROOT/.podman-compose.temp.yml" ]; then
    rm -f "$PROJECT_ROOT/.podman-compose.temp.yml"
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
podman ps -a --filter "name=osim-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "  No OSIM containers found"
