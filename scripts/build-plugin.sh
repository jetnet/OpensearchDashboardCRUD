#!/bin/bash
#
# Build the OpenSearch Index Manager plugin for a specific OSD version
#
# Usage: ./scripts/build-plugin.sh [version]
#   version: OSD version to build for (default: 2.19.0)
#
# Examples:
#   ./scripts/build-plugin.sh              # Build for default version 2.19.0
#   ./scripts/build-plugin.sh 2.19.2       # Build for version 2.19.2
#   ./scripts/build-plugin.sh --all        # Build for all supported versions

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PLUGIN_DIR="$PROJECT_ROOT/opensearch_index_manager"

# Supported versions
VALID_VERSIONS=("2.19.0" "2.19.1" "2.19.2" "2.19.3" "2.19.4")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate version
validate_version() {
    local version=$1
    for v in "${VALID_VERSIONS[@]}"; do
        if [ "$v" == "$version" ]; then
            return 0
        fi
    done
    return 1
}

# Build for a specific version
build_version() {
    local VERSION=$1
    local BUILD_DIR="$PROJECT_ROOT/build-$VERSION"
    
    log_info "Building plugin for OSD $VERSION..."
    
    cd "$PLUGIN_DIR"
    
    # Update version in opensearch_dashboards.json
    log_info "Updating version configuration..."
    if [ -f "versions/$VERSION/opensearch_dashboards.json" ]; then
        cp "versions/$VERSION/opensearch_dashboards.json" .
    else
        # Create version-specific config
        cat > opensearch_dashboards.json << EOF
{
  "id": "opensearch_index_manager",
  "version": "1.0.0",
  "opensearchDashboardsVersion": "$VERSION",
  "server": true,
  "ui": true,
  "requiredPlugins": ["navigation", "data"],
  "optionalPlugins": ["securityDashboards", "dataSource"],
  "requiredBundles": ["opensearchDashboardsUtils", "opensearchDashboardsReact"],
  "configPath": ["opensearch_index_manager"]
}
EOF
    fi
    
    # Update package.json version
    log_info "Updating package.json..."
    if command -v jq &> /dev/null; then
        jq --arg v "$VERSION" '.opensearchDashboards.version = $v' package.json > package.json.tmp && mv package.json.tmp package.json
    else
        log_warn "jq not found, skipping package.json version update"
    fi
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        log_info "Installing dependencies..."
        yarn install --frozen-lockfile 2>/dev/null || yarn install
    fi
    
    # Build the plugin
    log_info "Running build..."
    if [ -f "$PROJECT_ROOT/scripts/plugin_helpers" ]; then
        node "$PROJECT_ROOT/scripts/plugin_helpers" build
    else
        # Try to use OSD plugin helpers from common locations
        if command -v node &> /dev/null; then
            # Check if we have access to OSD source
            if [ -n "$OSD_HOME" ] && [ -f "$OSD_HOME/scripts/plugin_helpers" ]; then
                node "$OSD_HOME/scripts/plugin_helpers" build
            else
                log_warn "OSD plugin_helpers not found, attempting direct build..."
                yarn build 2>/dev/null || {
                    log_error "Build failed. Ensure OSD_HOME is set or run from OSD plugins directory."
                    return 1
                }
            fi
        fi
    fi
    
    # Move build to version-specific directory
    if [ -d "build" ]; then
        rm -rf "$BUILD_DIR"
        mv build "$BUILD_DIR"
        log_info "Build complete: $BUILD_DIR"
        
        # Create plugin zip
        cd "$PROJECT_ROOT"
        zip -r "opensearch_index_manager-$VERSION.zip" "build-$VERSION" > /dev/null 2>&1
        log_info "Created: opensearch_index_manager-$VERSION.zip"
    else
        log_error "Build directory not found"
        return 1
    fi
}

# Show help
show_help() {
    echo "Usage: ./scripts/build-plugin.sh [version|--all]"
    echo ""
    echo "Options:"
    echo "  version      OSD version to build for (e.g., 2.19.0)"
    echo "  --all        Build for all supported versions"
    echo "  -h, --help   Show this help message"
    echo ""
    echo "Supported versions: ${VALID_VERSIONS[*]}"
    echo ""
    echo "Examples:"
    echo "  ./scripts/build-plugin.sh              # Build for default (2.19.0)"
    echo "  ./scripts/build-plugin.sh 2.19.2       # Build for version 2.19.2"
    echo "  ./scripts/build-plugin.sh --all        # Build for all versions"
}

# Main
main() {
    local VERSION="${1:-2.19.0}"
    
    # Check for help
    if [ "$VERSION" == "-h" ] || [ "$VERSION" == "--help" ]; then
        show_help
        exit 0
    fi
    
    # Check for --all
    if [ "$VERSION" == "--all" ]; then
        log_info "Building for all supported versions..."
        for v in "${VALID_VERSIONS[@]}"; do
            echo ""
            log_info "========================================"
            log_info "Building for OSD $v"
            log_info "========================================"
            build_version "$v" || log_error "Build failed for $v"
        done
        echo ""
        log_info "All builds complete!"
        exit 0
    fi
    
    # Validate single version
    if ! validate_version "$VERSION"; then
        log_error "Invalid version: $VERSION"
        log_error "Valid versions: ${VALID_VERSIONS[*]}"
        exit 1
    fi
    
    # Check prerequisites
    if ! command -v yarn &> /dev/null; then
        log_error "yarn is not installed"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        log_error "node is not installed"
        exit 1
    fi
    
    # Build
    build_version "$VERSION"
    
    echo ""
    log_info "Build successful!"
    log_info "Output: $PROJECT_ROOT/build-$VERSION"
    log_info "Zip: $PROJECT_ROOT/opensearch_index_manager-$VERSION.zip"
}

main "$@"
