#!/bin/bash
#
# Local build and test script for OpenSearch Index Manager plugin
# This script:
#   1. Builds the plugin in a Docker/Podman container
#   2. Starts local OS/OSD cluster
#   3. Installs the built plugin
#   4. Runs functional tests (including browser tests)
#   5. Reports results
#
# Usage: ./scripts/local-build-and-test.sh [options]
#   Options:
#     -v, --version    OSD version to build for (default: 2.19.0)
#     -a, --all        Build and test for all supported versions
#     -s, --skip-tests Skip functional tests
#     -k, --keep       Keep containers running after tests
#     -h, --help       Show help
#
# Examples:
#   ./scripts/local-build-and-test.sh              # Build and test default version
#   ./scripts/local-build-and-test.sh -v 2.19.2    # Build and test specific version
#   ./scripts/local-build-and-test.sh -a           # Build and test all versions

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PLUGIN_NAME="opensearch_index_manager"
PLUGIN_VERSION="1.0.0"

# Default values
OSD_VERSION="2.19.0"
BUILD_ALL=false
SKIP_TESTS=false
KEEP_CONTAINERS=false
CONTAINER_NAME="osim-dashboards"

# Supported versions
VALID_VERSIONS=("2.19.0" "2.19.1" "2.19.2" "2.19.3" "2.19.4")

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# Show help
show_help() {
    cat << 'EOF'
Usage: ./scripts/local-build-and-test.sh [options]

Options:
  -v, --version    OSD version to build for (default: 2.19.0)
  -a, --all        Build and test for all supported versions
  -s, --skip-tests Skip functional tests
  -k, --keep       Keep containers running after tests
  -h, --help       Show this help message

Supported versions: 2.19.0 2.19.1 2.19.2 2.19.3 2.19.4

Examples:
  ./scripts/local-build-and-test.sh              # Build and test default version
  ./scripts/local-build-and-test.sh -v 2.19.2    # Build and test specific version
  ./scripts/local-build-and-test.sh -a           # Build and test all versions
  ./scripts/local-build-and-test.sh -v 2.19.0 -s # Build only, skip tests
EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--version)
            OSD_VERSION="$2"
            shift 2
            ;;
        -a|--all)
            BUILD_ALL=true
            shift
            ;;
        -s|--skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        -k|--keep)
            KEEP_CONTAINERS=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        -*)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
        *)
            OSD_VERSION="$1"
            shift
            ;;
    esac
done

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

# Check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."
    
    if ! command -v podman &> /dev/null; then
        log_error "podman is not installed"
        exit 1
    fi
    
    if ! command -v podman-compose &> /dev/null; then
        log_error "podman-compose is not installed"
        exit 1
    fi
    
    log_info "Prerequisites check passed"
}

# Build plugin in container
build_plugin() {
    local version=$1
    local image_tag="osim-builder:${version}"
    local output_dir="$PROJECT_ROOT/dist"
    local plugin_zip="${PLUGIN_NAME}-${PLUGIN_VERSION}-osd-${version}.zip"
    
    log_step "Building plugin for OSD ${version}..."
    
    # Create output directory
    mkdir -p "$output_dir"
    
    # Check if we already have the builder image
    if ! podman image exists "$image_tag"; then
        log_info "Building container image ${image_tag}..."
        podman build \
            --build-arg OSD_VERSION="${version}" \
            --build-arg PLUGIN_VERSION="${PLUGIN_VERSION}" \
            -t "$image_tag" \
            -f "$SCRIPT_DIR/Dockerfile.build" \
            "$PROJECT_ROOT"
    else
        log_info "Using existing builder image: ${image_tag}"
    fi
    
    # Run the build
    log_info "Running build in container..."
    podman run --rm \
        -v "${PROJECT_ROOT}/opensearch_index_manager:/plugin-source:ro" \
        -v "${output_dir}:/output:rw" \
        "$image_tag"
    
    # Verify output
    if [ -f "${output_dir}/${plugin_zip}" ]; then
        log_info "Build successful: ${output_dir}/${plugin_zip}"
        ls -lh "${output_dir}/${plugin_zip}"
        return 0
    else
        log_error "Build failed - output file not found"
        return 1
    fi
}

# Start local cluster
start_cluster() {
    log_step "Starting local OpenSearch/OSD cluster..."
    "$SCRIPT_DIR/start-local.sh" "$OSD_VERSION"
}

# Install plugin
install_plugin() {
    local version=$1
    local plugin_zip="${PROJECT_ROOT}/dist/${PLUGIN_NAME}-${PLUGIN_VERSION}-osd-${version}.zip"
    
    log_step "Installing plugin into local cluster..."
    
    if [ ! -f "$plugin_zip" ]; then
        log_error "Plugin zip not found: ${plugin_zip}"
        return 1
    fi
    
    # Check if container is running
    if ! podman ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
        log_error "OSD container not running"
        return 1
    fi
    
    # Copy and install plugin
    log_info "Copying plugin to container..."
    podman cp "$plugin_zip" "${CONTAINER_NAME}:/tmp/plugin.zip"
    
    log_info "Installing plugin..."
    podman exec "$CONTAINER_NAME" sh -c "
        cd /usr/share/opensearch-dashboards && \
        rm -rf plugins/${PLUGIN_NAME} && \
        unzip -q /tmp/plugin.zip -d /tmp/plugin-extract && \
        mv /tmp/plugin-extract/* plugins/${PLUGIN_NAME} && \
        rm -rf /tmp/plugin-extract /tmp/plugin.zip && \
        chown -R opensearch-dashboards:opensearch-dashboards plugins/${PLUGIN_NAME}
    "
    
    # Restart OSD
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
    
    log_info "Plugin installed successfully"
}

# Setup test data
setup_test_data() {
    log_step "Setting up test data..."
    "$SCRIPT_DIR/setup-test-data.sh"
}

# Run functional tests
run_tests() {
    if [ "$SKIP_TESTS" = true ]; then
        log_warn "Skipping tests as requested"
        return 0
    fi
    
    log_step "Running functional tests..."
    
    # Check if functional-tests directory exists
    if [ ! -d "$PROJECT_ROOT/functional-tests" ]; then
        log_warn "functional-tests directory not found, skipping tests"
        return 0
    fi
    
    cd "$PROJECT_ROOT/functional-tests"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        log_info "Installing test dependencies..."
        npm ci
    fi
    
    # Install playwright browsers if needed
    if [ ! -d "$HOME/.cache/ms-playwright" ]; then
        log_info "Installing Playwright browsers..."
        npx playwright install chromium
    fi
    
    # Run tests
    log_info "Running tests..."
    export OSD_BASE_URL=http://localhost:5601
    export OS_HOST=localhost
    export OS_PORT=9200
    export START_CONTAINERS=false
    export STOP_CONTAINERS=false
    export CLEANUP_DATA=true
    
    if npm test; then
        log_info "All tests passed!"
        return 0
    else
        log_error "Tests failed!"
        return 1
    fi
}

# Run browser screenshots
run_screenshots() {
    log_step "Taking verification screenshots..."
    
    # Wait for OSD to be fully ready
    sleep 5
    
    # Create screenshots directory
    mkdir -p "$PROJECT_ROOT/screenshots"
    
    # Use curl to check if plugin page is accessible
    if curl -s http://localhost:5601/app/opensearch_index_manager > /dev/null 2>&1; then
        log_info "Plugin page is accessible"
    else
        log_warn "Plugin page may not be fully loaded yet"
    fi
    
    log_info "Screenshots can be taken manually at:"
    log_info "  http://localhost:5601/app/opensearch_index_manager"
}

# Cleanup
cleanup() {
    if [ "$KEEP_CONTAINERS" = false ]; then
        log_step "Cleaning up..."
        "$SCRIPT_DIR/stop-local.sh" || true
    else
        log_info "Containers kept running as requested"
        log_info "Stop them later with: ./scripts/stop-local.sh"
    fi
}

# Test single version
test_version() {
    local version=$1
    
    echo ""
    echo "=============================================="
    log_step "Testing OSD version: ${version}"
    echo "=============================================="
    
    # Build
    if ! build_plugin "$version"; then
        log_error "Build failed for version ${version}"
        return 1
    fi
    
    # Start cluster (only once)
    if ! podman ps --format "{{.Names}}" | grep -q "osim-opensearch"; then
        start_cluster
    fi
    
    # Install plugin
    if ! install_plugin "$version"; then
        log_error "Installation failed for version ${version}"
        return 1
    fi
    
    # Setup test data (only once)
    if [ "$version" == "${VALID_VERSIONS[0]}" ]; then
        setup_test_data
    fi
    
    # Run tests
    if ! run_tests; then
        log_error "Tests failed for version ${version}"
        return 1
    fi
    
    # Screenshots
    run_screenshots
    
    log_info "Version ${version} testing complete!"
    return 0
}

# Main execution
main() {
    echo "=============================================="
    echo "OpenSearch Index Manager - Local Build & Test"
    echo "=============================================="
    echo "Plugin: ${PLUGIN_NAME} v${PLUGIN_VERSION}"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Validate version if not building all
    if [ "$BUILD_ALL" = false ]; then
        if ! validate_version "$OSD_VERSION"; then
            log_error "Invalid version: $OSD_VERSION"
            log_error "Valid versions: ${VALID_VERSIONS[*]}"
            exit 1
        fi
    fi
    
    # Create dist directory
    mkdir -p "$PROJECT_ROOT/dist"
    
    # Track results
    local results=()
    local failed=0
    
    if [ "$BUILD_ALL" = true ]; then
        # Build and test all versions
        for version in "${VALID_VERSIONS[@]}"; do
            if test_version "$version"; then
                results+=("${GREEN}✓${NC} ${version}")
            else
                results+=("${RED}✗${NC} ${version}")
                ((failed++))
            fi
        done
    else
        # Build and test single version
        if test_version "$OSD_VERSION"; then
            results+=("${GREEN}✓${NC} ${OSD_VERSION}")
        else
            results+=("${RED}✗${NC} ${OSD_VERSION}")
            ((failed++))
        fi
    fi
    
    # Cleanup
    cleanup
    
    # Summary
    echo ""
    echo "=============================================="
    echo "Test Results Summary"
    echo "=============================================="
    for result in "${results[@]}"; do
        echo -e "  $result"
    done
    echo "=============================================="
    
    if [ $failed -eq 0 ]; then
        log_info "All tests passed successfully!"
        log_info "Built artifacts are in: $PROJECT_ROOT/dist/"
        echo ""
        log_info "You can now push to GitHub to trigger CI/CD"
        exit 0
    else
        log_error "${failed} version(s) failed testing"
        exit 1
    fi
}

# Run main
main "$@"
