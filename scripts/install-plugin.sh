#!/bin/bash
#
# Install the plugin into a running OSD container
#
# Usage: ./scripts/install-plugin.sh [options] [version]
#   Options:
#     -r, --restart    Restart OSD container after installation
#     -b, --build      Build before installing
#   version: Plugin version to install (default: 2.19.0)
#
# Examples:
#   ./scripts/install-plugin.sh              # Install default version
#   ./scripts/install-plugin.sh 2.19.2       # Install specific version
#   ./scripts/install-plugin.sh -r 2.19.0    # Install and restart OSD
#   ./scripts/install-plugin.sh -b -r        # Build, install, and restart

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CONTAINER_NAME="osim-dashboards"

RESTART=false
BUILD=false
VERSION=""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -r|--restart)
            RESTART=true
            shift
            ;;
        -b|--build)
            BUILD=true
            shift
            ;;
        -h|--help)
            echo "Usage: ./scripts/install-plugin.sh [options] [version]"
            echo ""
            echo "Options:"
            echo "  -b, --build      Build plugin before installing"
            echo "  -r, --restart    Restart OSD container after installation"
            echo "  -h, --help       Show this help message"
            echo ""
            echo "Arguments:"
            echo "  version          Plugin version (default: 2.19.0)"
            exit 0
            ;;
        -*)
            log_error "Unknown option: $1"
            exit 1
            ;;
        *)
            VERSION="$1"
            shift
            ;;
    esac
done

VERSION="${VERSION:-2.19.0}"
PLUGIN_ZIP="$PROJECT_ROOT/opensearch_index_manager-$VERSION.zip"
BUILD_DIR="$PROJECT_ROOT/build-$VERSION"

# Check if container is running
check_container() {
    if ! podman ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
        log_error "Container '$CONTAINER_NAME' is not running"
        log_info "Start it with: ./scripts/start-local.sh"
        exit 1
    fi
}

# Build plugin if requested
if [ "$BUILD" = true ]; then
    log_info "Building plugin for version $VERSION..."
    "$SCRIPT_DIR/build-plugin.sh" "$VERSION" || {
        log_error "Build failed"
        exit 1
    }
fi

# Check for plugin files
if [ ! -f "$PLUGIN_ZIP" ] && [ ! -d "$BUILD_DIR" ]; then
    log_warn "Plugin not found at $PLUGIN_ZIP or $BUILD_DIR"
    log_info "Building now..."
    "$SCRIPT_DIR/build-plugin.sh" "$VERSION" || {
        log_error "Build failed"
        exit 1
    }
fi

check_container

log_info "Installing plugin version $VERSION into container $CONTAINER_NAME..."

# Get OSD version from container
OSD_VERSION=$(podman exec "$CONTAINER_NAME" sh -c 'cat /usr/share/opensearch-dashboards/package.json | grep "\"version\"" | head -1' 2>/dev/null | grep -o '"[0-9.]*"' | tr -d '"' || echo "$VERSION")
log_info "Target OSD version: $OSD_VERSION"

# Method 1: Copy build directory directly (preferred for development)
if [ -d "$BUILD_DIR" ]; then
    log_info "Installing from build directory..."
    
    # Remove old plugin if exists
    podman exec "$CONTAINER_NAME" rm -rf /usr/share/opensearch-dashboards/plugins/opensearch_index_manager 2>/dev/null || true
    
    # Copy new plugin
    log_info "Copying plugin files to container..."
    podman cp "$BUILD_DIR" "$CONTAINER_NAME:/usr/share/opensearch-dashboards/plugins/opensearch_index_manager"
    
    # Set proper permissions
    podman exec "$CONTAINER_NAME" chown -R opensearch-dashboards:opensearch-dashboards /usr/share/opensearch-dashboards/plugins/opensearch_index_manager
    
    log_info "Plugin files installed successfully"
fi

# Method 2: Install from zip (alternative)
if [ -f "$PLUGIN_ZIP" ] && [ ! -d "$BUILD_DIR" ]; then
    log_info "Installing from zip file..."
    
    # Copy zip to container
    podman cp "$PLUGIN_ZIP" "$CONTAINER_NAME:/tmp/opensearch_index_manager.zip"
    
    # Install using OSD plugin CLI
    podman exec "$CONTAINER_NAME" sh -c '
        cd /usr/share/opensearch-dashboards && \
        rm -rf plugins/opensearch_index_manager && \
        unzip -q /tmp/opensearch_index_manager.zip -d /tmp/ && \
        mv /tmp/build-* plugins/opensearch_index_manager && \
        chown -R opensearch-dashboards:opensearch-dashboards plugins/opensearch_index_manager
    '
    
    podman exec "$CONTAINER_NAME" rm -f /tmp/opensearch_index_manager.zip
fi

# Optimize/bundle if needed (OSD 2.x may need this)
log_info "Optimizing OpenSearch Dashboards..."
podman exec "$CONTAINER_NAME" sh -c '
    cd /usr/share/opensearch-dashboards && \
    NODE_OPTIONS="--max-old-space-size=4096" bin/opensearch-dashboards-plugin list
' || true

# Restart if requested
if [ "$RESTART" = true ]; then
    log_info "Restarting OpenSearch Dashboards..."
    podman restart "$CONTAINER_NAME"
    
    # Wait for OSD to be ready
    log_info "Waiting for OSD to be ready..."
    for i in {1..60}; do
        if curl -s http://localhost:5601/api/status 2>/dev/null | grep -q '"state":"green\|"state":"yellow"'; then
            echo ""
            log_info "OSD is ready!"
            break
        fi
        echo -n "."
        sleep 3
    done
else
    log_warn "OSD restart is required for plugin to be active"
    log_info "Restart with: podman restart $CONTAINER_NAME"
    log_info "Or use -r flag: ./scripts/install-plugin.sh -r $VERSION"
fi

# Verify installation
log_info "Verifying installation..."
if podman exec "$CONTAINER_NAME" test -d /usr/share/opensearch-dashboards/plugins/opensearch_index_manager; then
    log_info "Plugin installed successfully!"
    log_info "Plugin path: /usr/share/opensearch-dashboards/plugins/opensearch_index_manager"
    
    # Show plugin info
    log_info "Plugin contents:"
    podman exec "$CONTAINER_NAME" ls -la /usr/share/opensearch-dashboards/plugins/opensearch_index_manager/ | head -20
else
    log_error "Plugin installation verification failed"
    exit 1
fi

echo ""
log_info "Installation complete!"
if [ "$RESTART" = false ]; then
    log_warn "Remember to restart OSD: podman restart $CONTAINER_NAME"
fi
log_info "Plugin URL: http://localhost:5601/app/opensearch_index_manager"
