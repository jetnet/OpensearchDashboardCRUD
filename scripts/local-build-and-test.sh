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
#     -b, --build-only Only build the plugin, don't start services or test
#     -h, --help       Show help
#
# Examples:
#   ./scripts/local-build-and-test.sh              # Build and test default version
#   ./scripts/local-build-and-test.sh -v 2.19.2    # Build and test specific version
#   ./scripts/local-build-and-test.sh -a           # Build and test all versions
#   ./scripts/local-build-and-test.sh -b           # Build only, output to dist/

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PLUGIN_NAME="opensearch_index_manager"
PLUGIN_VERSION="1.0.0"

# Default values
OSD_VERSION="2.19.0"
BUILD_ALL=false
SKIP_TESTS=false
KEEP_CONTAINERS=false
BUILD_ONLY=false
CONTAINER_NAME="osim-dashboards"
OPENSEARCH_CONTAINER="osim-opensearch"

# Fully qualified image references (avoids short-name resolution issues)
BUILDER_IMAGE_BASE="localhost/osim-builder"
OPENSEARCH_IMAGE="docker.io/opensearchproject/opensearch"
DASHBOARDS_IMAGE="docker.io/opensearchproject/opensearch-dashboards"

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
log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# Error handler
error_exit() {
    log_error "$1"
    exit 1
}

# Cleanup handler
cleanup_on_error() {
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        log_error "Script failed with exit code $exit_code"
        if [ "$KEEP_CONTAINERS" = false ] && [ "$BUILD_ONLY" = false ]; then
            log_info "Cleaning up containers..."
            "$SCRIPT_DIR/stop-local.sh" 2>/dev/null || true
        fi
    fi
}
trap cleanup_on_error EXIT

# Show help
show_help() {
    cat << 'EOF'
Usage: ./scripts/local-build-and-test.sh [options]

Options:
  -v, --version    OSD version to build for (default: 2.19.0)
  -a, --all        Build and test for all supported versions
  -s, --skip-tests Skip functional tests
  -k, --keep       Keep containers running after tests
  -b, --build-only Only build the plugin, don't start services or test
  -h, --help       Show this help message

Supported versions: 2.19.0 2.19.1 2.19.2 2.19.3 2.19.4

Examples:
  ./scripts/local-build-and-test.sh              # Build and test default version
  ./scripts/local-build-and-test.sh -v 2.19.2    # Build and test specific version
  ./scripts/local-build-and-test.sh -a           # Build and test all versions
  ./scripts/local-build-and-test.sh -b           # Build only, output to dist/
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
        -b|--build-only)
            BUILD_ONLY=true
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
        error_exit "podman is not installed"
    fi
    
    if [ "$BUILD_ONLY" = false ]; then
        if ! command -v podman-compose &> /dev/null; then
            error_exit "podman-compose is not installed"
        fi
    fi
    
    # Check if we can connect to podman
    if ! podman info &> /dev/null; then
        error_exit "Cannot connect to podman daemon. Is podman running?"
    fi
    
    log_info "Prerequisites check passed"
}

# Build plugin in container
build_plugin() {
    local version=$1
    local image_tag="${BUILDER_IMAGE_BASE}:${version}"
    local output_dir="$PROJECT_ROOT/dist"
    local plugin_zip="${PLUGIN_NAME}-${PLUGIN_VERSION}-osd-${version}.zip"
    
    log_step "Building plugin for OSD ${version}..."
    
    # Create output directory
    mkdir -p "$output_dir"
    
    # Check if we already have the builder image
    if ! podman image exists "$image_tag" &> /dev/null; then
        log_info "Building container image ${image_tag}..."
        podman build \
            --build-arg "OSD_VERSION=${version}" \
            --build-arg "PLUGIN_VERSION=${PLUGIN_VERSION}" \
            -t "$image_tag" \
            -f "$SCRIPT_DIR/Dockerfile.build" \
            "$PROJECT_ROOT" || error_exit "Failed to build container image"
    else
        log_info "Using existing builder image: ${image_tag}"
    fi
    
    # Run the build
    log_info "Running build in container..."
    podman run --rm \
        -v "${PROJECT_ROOT}/opensearch_index_manager:/plugin-source:ro,Z" \
        -v "${output_dir}:/output:rw,Z" \
        "$image_tag" || error_exit "Build failed in container"
    
    # Verify output
    if [ -f "${output_dir}/${plugin_zip}" ]; then
        log_info "Build successful: ${output_dir}/${plugin_zip}"
        ls -lh "${output_dir}/${plugin_zip}"
        return 0
    else
        log_error "Build failed - output file not found: ${output_dir}/${plugin_zip}"
        ls -la "$output_dir" || true
        return 1
    fi
}

# Start local cluster
start_cluster() {
    log_step "Starting local OpenSearch/OSD cluster..."
    "$SCRIPT_DIR/start-local.sh" "$OSD_VERSION" || error_exit "Failed to start cluster"
}

# Wait for OpenSearch to be ready
wait_for_opensearch() {
    log_info "Waiting for OpenSearch to be ready..."
    local attempts=0
    local max_attempts=60
    
    while [ $attempts -lt $max_attempts ]; do
        if curl -s http://localhost:9200/_cluster/health 2>/dev/null | grep -q '"status":"green\|"status":"yellow\|"status":"red"'; then
            echo ""
            log_info "OpenSearch is ready!"
            return 0
        fi
        echo -n "."
        sleep 2
        ((attempts++))
    done
    
    echo ""
    log_error "OpenSearch failed to become ready after ${max_attempts} attempts"
    return 1
}

# Wait for OSD to be ready
wait_for_osd() {
    log_info "Waiting for OSD to be ready..."
    local attempts=0
    local max_attempts=60
    
    while [ $attempts -lt $max_attempts ]; do
        if curl -s http://localhost:5601/api/status 2>/dev/null | grep -q '"state":"green\|"state":"yellow"'; then
            echo ""
            log_info "OSD is ready!"
            return 0
        fi
        echo -n "."
        sleep 3
        ((attempts++))
    done
    
    echo ""
    log_error "OSD failed to become ready after ${max_attempts} attempts"
    return 1
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
        log_error "OSD container '${CONTAINER_NAME}' is not running"
        return 1
    fi
    
    # Always restart OSD without the plugin mount for clean installation
    log_info "Restarting OSD without plugin mount for installation..."
    
    # Stop and remove the current container
    podman stop "$CONTAINER_NAME" || true
    podman rm "$CONTAINER_NAME" || true
    
    # OSD image
    local osd_image
    osd_image="docker.io/opensearchproject/opensearch-dashboards:${version}"
    
    # Get the network name from the running OpenSearch container
    local network_name
    network_name=$(podman inspect osim-opensearch --format '{{range $k, $v := .NetworkSettings.Networks}}{{$k}}{{end}}')
    log_info "Using network: $network_name"
    
    # Start OSD without the plugin mount
    podman run -d \
        --replace \
        --name "$CONTAINER_NAME" \
        --network "$network_name" \
        -p 5601:5601 \
        -e 'OPENSEARCH_HOSTS=["http://osim-opensearch:9200"]' \
        -e "DISABLE_SECURITY_DASHBOARDS_PLUGIN=true" \
        -e "SERVER_HOST=0.0.0.0" \
        -e "SERVER_PORT=5601" \
        -e "OSD_OPTIMIZE_MEMORY=true" \
        -e "NODE_OPTIONS=--max-old-space-size=4096" \
        "$osd_image" || error_exit "Failed to start OSD container without mount"
    
    # Give OSD a moment to start
    sleep 5
    
    # Wait for OSD to be ready
    if ! wait_for_osd; then
        log_error "OSD failed to start. Checking container logs..."
        podman logs "$CONTAINER_NAME" --tail 50 || true
        return 1
    fi
    
    # Now install the plugin
    log_info "Copying plugin to container..."
    podman cp "$plugin_zip" "${CONTAINER_NAME}:/tmp/plugin.zip" || error_exit "Failed to copy plugin to container"
    
    log_info "Installing plugin..."
    podman exec "$CONTAINER_NAME" sh -c "
        cd /usr/share/opensearch-dashboards && \
        rm -rf plugins/${PLUGIN_NAME} && \
        mkdir -p plugins/${PLUGIN_NAME} && \
        python3 -c 'import zipfile; zipfile.ZipFile(\"/tmp/plugin.zip\").extractall(\"/tmp/plugin-extract\")' && \
        ls -la /tmp/plugin-extract/ && \
        # Find the actual plugin directory (handle nested structure)
        PLUGIN_DIR=\"/tmp/plugin-extract\" && \
        # Navigate into the root directory if it exists (could be plugin name or opensearch-dashboards)
        for dir in /tmp/plugin-extract/*/; do \
            if [ -d \"\${dir}\" ]; then \
                PLUGIN_DIR=\"\${dir%/}\" && \
                echo \"Found root directory: \${PLUGIN_DIR}\" && \
                break; \
            fi \
        done && \
        ls -la \"\${PLUGIN_DIR}/\" && \
        # Check for nested directory (double folder issue like opensearch_index_manager/opensearch_index_manager/)
        if [ -d \"\${PLUGIN_DIR}/opensearch_index_manager\" ]; then \
            echo 'Found nested opensearch_index_manager directory, flattening...' && \
            mv \"\${PLUGIN_DIR}/opensearch_index_manager\"/* plugins/${PLUGIN_NAME}/; \
        elif [ -f \"\${PLUGIN_DIR}/opensearch_dashboards.json\" ]; then \
            # This is the plugin root directory, move all contents
            echo 'Found plugin root with opensearch_dashboards.json' && \
            mv \"\${PLUGIN_DIR}\"/* plugins/${PLUGIN_NAME}/; \
        elif [ -d \"\${PLUGIN_DIR}/server\" ] && [ -d \"\${PLUGIN_DIR}/public\" ]; then \
            # Likely plugin root with standard directories
            echo 'Found plugin root with server/public directories' && \
            mv \"\${PLUGIN_DIR}\"/* plugins/${PLUGIN_NAME}/; \
        else \
            echo 'ERROR: Could not identify plugin root directory structure' && \
            echo 'Contents of PLUGIN_DIR:' && \
            ls -la \"\${PLUGIN_DIR}/\" && \
            exit 1; \
        fi && \
        rm -rf /tmp/plugin-extract /tmp/plugin.zip && \
        chown -R opensearch-dashboards:opensearch-dashboards plugins/${PLUGIN_NAME}
    " || error_exit "Failed to install plugin in container"
    
    # Restart OSD to load the plugin
    log_info "Restarting OpenSearch Dashboards to load plugin..."
    podman restart "$CONTAINER_NAME" || error_exit "Failed to restart OSD container"
    
    # Give OSD time to start up after restart
    sleep 10
    
    # Check if container is still running
    if ! podman ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
        log_error "OSD container stopped after restart. Attempting to start fresh..."
        # Try starting the container again
        podman start "$CONTAINER_NAME" || {
            log_error "Failed to start OSD container. Checking logs..."
            podman logs "$CONTAINER_NAME" --tail 100 || true
            return 1
        }
        sleep 10
    fi
    
    # Wait for OSD to be ready
    if ! wait_for_osd; then
        log_error "OSD failed to become ready after plugin installation"
        podman logs "$CONTAINER_NAME" --tail 100 || true
        return 1
    fi
    
    log_info "Plugin installed successfully"
}

# Setup test data
setup_test_data() {
    log_step "Setting up test data..."
    "$SCRIPT_DIR/setup-test-data.sh" || log_warn "Some test data setup failed, continuing..."
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
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        log_warn "package.json not found in functional-tests, skipping tests"
        return 0
    fi
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        log_info "Installing test dependencies..."
        # Use npm install if no package-lock.json exists, otherwise use npm ci
        if [ -f "package-lock.json" ]; then
            npm ci || {
                log_error "Failed to install test dependencies"
                return 1
            }
        else
            npm install || {
                log_error "Failed to install test dependencies"
                return 1
            }
        fi
    fi
    
    # Install playwright browsers if needed
    if [ ! -d "$HOME/.cache/ms-playwright" ]; then
        log_info "Installing Playwright browsers..."
        npx playwright install chromium || {
            log_error "Failed to install Playwright browsers"
            return 1
        }
    fi
    
    # Run tests
    log_info "Running tests..."
    export OSD_BASE_URL=http://localhost:5601
    export OS_HOST=localhost
    export OS_PORT=9200
    export START_CONTAINERS=false
    export STOP_CONTAINERS=false
    export CLEANUP_DATA=true
    
    # Run tests with --max-failures=1 to fail immediately on first failure
    if npm test -- --max-failures=1; then
        log_info "All tests passed!"
        return 0
    else
        log_error "Tests failed!"
        return 1
    fi
}

# Run API health checks
run_health_checks() {
    log_step "Running health checks..."
    
    # Check OpenSearch
    if curl -s http://localhost:9200 &> /dev/null; then
        log_info "OpenSearch is accessible"
    else
        log_error "OpenSearch is not accessible"
        return 1
    fi
    
    # Check OSD
    if curl -s http://localhost:5601/api/status &> /dev/null; then
        log_info "OSD is accessible"
    else
        log_error "OSD is not accessible"
        return 1
    fi
    
    # Check plugin API
    local plugin_response
    plugin_response=$(curl -s http://localhost:5601/api/opensearch_index_manager/indices 2>/dev/null || echo "")
    if [ -n "$plugin_response" ]; then
        log_info "Plugin API is responding"
    else
        log_warn "Plugin API may not be fully initialized yet"
    fi
    
    return 0
}

# Cleanup
cleanup() {
    if [ "$KEEP_CONTAINERS" = false ] && [ "$BUILD_ONLY" = false ]; then
        log_step "Cleaning up..."
        "$SCRIPT_DIR/stop-local.sh" 2>/dev/null || true
    else
        log_info "Containers kept running as requested"
        if [ "$BUILD_ONLY" = false ]; then
            log_info "Stop them later with: ./scripts/stop-local.sh"
        fi
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
    
    # If build-only mode, skip the rest
    if [ "$BUILD_ONLY" = true ]; then
        log_info "Build-only mode, skipping cluster startup and tests"
        return 0
    fi
    
    # Start cluster (only once)
    if ! podman ps --format "{{.Names}}" | grep -q "^${OPENSEARCH_CONTAINER}$"; then
        start_cluster
    else
        log_info "Cluster already running"
    fi
    
    # Wait for services to be ready
    wait_for_opensearch
    wait_for_osd
    
    # Install plugin
    if ! install_plugin "$version"; then
        log_error "Installation failed for version ${version}"
        return 1
    fi
    
    # Setup test data (only once)
    if [ "$version" == "${VALID_VERSIONS[0]}" ]; then
        setup_test_data
    fi
    
    # Run health checks
    if ! run_health_checks; then
        log_error "Health checks failed for version ${version}"
        return 1
    fi
    
    # Run tests
    if ! run_tests; then
        log_error "Tests failed for version ${version}"
        return 1
    fi
    
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
        ls -lh "$PROJECT_ROOT/dist/" 2>/dev/null || true
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
