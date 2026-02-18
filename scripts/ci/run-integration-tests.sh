#!/bin/bash
#
# Run Integration Tests for OpenSearch Index Manager Plugin
# Usage: ./run-integration-tests.sh [OPTIONS]
#
# Example:
#   ./run-integration-tests.sh
#   ./run-integration-tests.sh --osd-version 2.19.0 --keep-containers
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
OSD_VERSION="${OSD_VERSION:-2.19.0}"
OPENSEARCH_VERSION="${OPENSEARCH_VERSION:-2.19.0}"
PLUGIN_NAME="opensearch_index_manager"
BUILD_DIR="${BUILD_DIR:-./build}"
TEST_RESULTS_DIR="${TEST_RESULTS_DIR:-./test-results}"
KEEP_CONTAINERS=false
VERBOSE=false
SKIP_BUILD_CHECK=false
TIMEOUT=180

# API endpoints
OSD_URL="http://localhost:5601"
OS_URL="http://localhost:9200"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

# Help function
show_help() {
    cat << EOF
Run Integration Tests for OpenSearch Index Manager Plugin

Usage: $(basename "$0") [OPTIONS]

Options:
  -h, --help              Show this help message
  -v, --verbose           Enable verbose output
  --osd-version VERSION   OSD version to test (default: 2.19.0)
  --os-version VERSION    OpenSearch version (default: 2.19.0)
  --build-dir PATH        Path to build directory (default: ./build)
  --keep-containers       Keep containers running after tests
  --skip-build-check      Skip build artifact check
  --timeout SECONDS       Timeout for service startup (default: 180)
  --results-dir PATH      Directory for test results (default: ./test-results)

Environment Variables:
  OSD_VERSION             OSD version to test
  OPENSEARCH_VERSION      OpenSearch version
  BUILD_DIR               Path to build directory
  TEST_RESULTS_DIR        Directory for test results

Examples:
  $(basename "$0")
  $(basename "$0") --osd-version 2.19.4 --verbose
  $(basename "$0") --keep-containers --skip-build-check

EOF
}

# Parse options
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --osd-version)
            OSD_VERSION="$2"
            shift 2
            ;;
        --os-version)
            OPENSEARCH_VERSION="$2"
            shift 2
            ;;
        --build-dir)
            BUILD_DIR="$2"
            shift 2
            ;;
        --results-dir)
            TEST_RESULTS_DIR="$2"
            shift 2
            ;;
        --keep-containers)
            KEEP_CONTAINERS=true
            shift
            ;;
        --skip-build-check)
            SKIP_BUILD_CHECK=true
            shift
            ;;
        --timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        -*)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
        *)
            log_error "Unexpected argument: $1"
            show_help
            exit 1
            ;;
    esac
done

# Export for compose file
export OSD_VERSION
export OPENSEARCH_VERSION

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Cleanup function
cleanup() {
    if [[ "$KEEP_CONTAINERS" == "false" ]]; then
        log_info "Cleaning up containers..."
        podman-compose -f podman-compose.yml down -v 2>/dev/null || true
        podman system prune -f 2>/dev/null || true
    else
        log_info "Keeping containers running (as requested)"
        log_info "To clean up manually, run: podman-compose -f podman-compose.yml down -v"
    fi
}

trap cleanup EXIT

# Test helper functions
assert_status_code() {
    local url="$1"
    local expected="$2"
    local description="$3"
    local auth="${4:-}"
    
    local curl_opts="-s -o /dev/null -w %{http_code}"
    if [[ -n "$auth" ]]; then
        curl_opts="$curl_opts -u $auth"
    fi
    
    local actual
    actual=$(curl $curl_opts "$url" 2>/dev/null || echo "000")
    
    if [[ "$actual" == "$expected" ]]; then
        log_success "✓ $description (HTTP $actual)"
        ((TESTS_PASSED++))
        return 0
    else
        log_error "✗ $description (expected HTTP $expected, got $actual)"
        ((TESTS_FAILED++))
        return 1
    fi
}

assert_contains() {
    local url="$1"
    local expected="$2"
    local description="$3"
    local auth="${4:-}"
    
    local curl_opts="-s"
    if [[ -n "$auth" ]]; then
        curl_opts="$curl_opts -u $auth"
    fi
    
    local response
    response=$(curl $curl_opts "$url" 2>/dev/null || echo "")
    
    if echo "$response" | grep -q "$expected"; then
        log_success "✓ $description"
        ((TESTS_PASSED++))
        return 0
    else
        log_error "✗ $description (expected to contain: $expected)"
        ((TESTS_FAILED++))
        return 1
    fi
}

wait_for_service() {
    local url="$1"
    local service="$2"
    local timeout="$3"
    local health_check="${4:-}"
    
    log_info "Waiting for $service to be ready (timeout: ${timeout}s)..."
    
    local start_time=$(date +%s)
    local end_time=$((start_time + timeout))
    
    while [[ $(date +%s) -lt $end_time ]]; do
        if curl -s "$url" > /dev/null 2>&1; then
            if [[ -n "$health_check" ]]; then
                if curl -s "$url" | grep -q "$health_check"; then
                    log_success "$service is ready"
                    return 0
                fi
            else
                log_success "$service is ready"
                return 0
            fi
        fi
        sleep 2
        echo -n "."
    done
    
    log_error "$service failed to start within ${timeout} seconds"
    return 1
}

# Main execution
echo "========================================"
echo "  OpenSearch Index Manager Integration Tests"
echo "========================================"
echo ""

log_info "Configuration:"
echo "  OSD Version: $OSD_VERSION"
echo "  OpenSearch Version: $OPENSEARCH_VERSION"
echo "  Build Directory: $BUILD_DIR"
echo "  Results Directory: $TEST_RESULTS_DIR"
echo "  Timeout: ${TIMEOUT}s"
echo ""

# Check prerequisites
log_info "Checking prerequisites..."

if ! command -v podman &> /dev/null; then
    log_error "Podman is not installed"
    exit 1
fi

if ! command -v podman-compose &> /dev/null; then
    log_error "podman-compose is not installed"
    exit 1
fi

log_success "Prerequisites check passed"

# Find plugin artifact
if [[ "$SKIP_BUILD_CHECK" == "false" ]]; then
    log_info "Looking for plugin artifact..."
    
    PLUGIN_ARTIFACT=$(find "$BUILD_DIR" -name "${PLUGIN_NAME}*-osd-${OSD_VERSION}.zip" | head -1)
    
    if [[ -z "$PLUGIN_ARTIFACT" ]]; then
        # Try without version suffix
        PLUGIN_ARTIFACT=$(find "$BUILD_DIR" -name "${PLUGIN_NAME}*.zip" | head -1)
    fi
    
    if [[ -z "$PLUGIN_ARTIFACT" ]]; then
        log_error "Plugin artifact not found in $BUILD_DIR"
        log_info "Please build the plugin first or use --skip-build-check"
        exit 1
    fi
    
    log_success "Found plugin artifact: $(basename "$PLUGIN_ARTIFACT")"
else
    PLUGIN_ARTIFACT="${BUILD_DIR}/${PLUGIN_NAME}-latest.zip"
    log_warning "Skipping build check, using: $PLUGIN_ARTIFACT"
fi

# Create results directory
mkdir -p "$TEST_RESULTS_DIR"

# Start services
log_info "Starting services with podman-compose..."

if [[ "$VERBOSE" == "true" ]]; then
    podman-compose -f podman-compose.yml up -d
else
    podman-compose -f podman-compose.yml up -d > "$TEST_RESULTS_DIR/podman-up.log" 2>&1
fi

if [[ $? -ne 0 ]]; then
    log_error "Failed to start services"
    cat "$TEST_RESULTS_DIR/podman-up.log" 2>/dev/null || true
    exit 1
fi

log_success "Services started"

# Wait for OpenSearch
wait_for_service "$OS_URL" "OpenSearch" "$TIMEOUT" "cluster_name"

# Wait for OSD
wait_for_service "$OSD_URL/api/status" "OpenSearch Dashboards" "$TIMEOUT" "\"status\":{\"overall\""

# Install plugin
log_info "Installing plugin..."

PLUGIN_FILENAME=$(basename "$PLUGIN_ARTIFACT")
podman cp "$PLUGIN_ARTIFACT" "opensearch-dashboards:/tmp/$PLUGIN_FILENAME"
podman exec "opensearch-dashboards" ./bin/opensearch-dashboards-plugin install "file:///tmp/$PLUGIN_FILENAME" > "$TEST_RESULTS_DIR/plugin-install.log" 2>&1

if [[ $? -ne 0 ]]; then
    log_error "Plugin installation failed"
    cat "$TEST_RESULTS_DIR/plugin-install.log"
    exit 1
fi

log_success "Plugin installed"

# Restart OSD to load plugin
log_info "Restarting OSD to load plugin..."
podman restart "opensearch-dashboards"

# Wait for OSD to be ready again
wait_for_service "$OSD_URL/api/status" "OpenSearch Dashboards (with plugin)" "$TIMEOUT" "\"status\":{\"overall\""

# Run tests
echo ""
echo "========================================"
echo "  Running Tests"
echo "========================================"
echo ""

# Test 1: OSD Health
log_test "Test 1: OSD Health Check"
assert_status_code "$OSD_URL/api/status" "200" "OSD status endpoint returns 200"

# Test 2: Plugin Health
log_test "Test 2: Plugin Health Check"
assert_status_code "$OSD_URL/api/$PLUGIN_NAME/health" "200" "Plugin health endpoint returns 200"

# Test 3: OpenSearch Connectivity
log_test "Test 3: OpenSearch Connectivity"
assert_status_code "$OS_URL" "200" "OpenSearch is accessible" "admin:admin"

# Test 4: Indices API
log_test "Test 4: Indices API"
assert_status_code "$OSD_URL/api/$PLUGIN_NAME/indices" "200" "Indices API returns 200"

# Test 5: Search API (may be empty but should return 200)
log_test "Test 5: Search API"
assert_contains "$OSD_URL/api/$PLUGIN_NAME/search?index=*&query={}" "indices" "Search API returns valid response"

# Test 6: Verify plugin in OSD status
log_test "Test 6: Plugin Registration"
assert_contains "$OSD_URL/api/status" "$PLUGIN_NAME" "Plugin is registered in OSD"

# Optional: Run test data setup if available
if [[ -f "scripts/setup-test-data.sh" ]]; then
    log_info "Setting up test data..."
    chmod +x scripts/setup-test-data.sh
    ./scripts/setup-test-data.sh > "$TEST_RESULTS_DIR/test-data-setup.log" 2>&1 || true
fi

# Collect logs
log_info "Collecting logs and results..."

# Save container logs
podman logs opensearch > "$TEST_RESULTS_DIR/opensearch.log" 2>&1 || true
podman logs opensearch-dashboards > "$TEST_RESULTS_DIR/opensearch-dashboards.log" 2>&1 || true

# Save API responses
curl -s "$OSD_URL/api/status" | jq '.' > "$TEST_RESULTS_DIR/osd-status.json" 2>/dev/null || true
curl -s "$OS_URL" -u admin:admin | jq '.' > "$TEST_RESULTS_DIR/opensearch-info.json" 2>/dev/null || true
curl -s "$OSD_URL/api/$PLUGIN_NAME/indices" | jq '.' > "$TEST_RESULTS_DIR/indices-response.json" 2>/dev/null || true

# Generate test report
cat > "$TEST_RESULTS_DIR/test-report.md" << EOF
# Integration Test Report

**Date:** $(date -u +"%Y-%m-%d %H:%M UTC")
**OSD Version:** $OSD_VERSION
**OpenSearch Version:** $OPENSEARCH_VERSION

## Summary

| Metric | Value |
|--------|-------|
| Tests Passed | $TESTS_PASSED |
| Tests Failed | $TESTS_FAILED |
| Total Tests | $((TESTS_PASSED + TESTS_FAILED)) |

## Results

$(if [[ $TESTS_FAILED -eq 0 ]]; then echo "✅ All tests passed"; else echo "❌ Some tests failed"; fi)

## Environment

- Plugin: $PLUGIN_NAME
- Plugin Artifact: $PLUGIN_FILENAME
- OSD URL: $OSD_URL
- OpenSearch URL: $OS_URL

## Artifacts

- OpenSearch Logs: opensearch.log
- OSD Logs: opensearch-dashboards.log
- API Responses: *.json
EOF

echo ""
echo "========================================"
echo "  Test Summary"
echo "========================================"
echo ""

if [[ $TESTS_FAILED -eq 0 ]]; then
    log_success "All $TESTS_PASSED tests passed!"
    EXIT_CODE=0
else
    log_error "$TESTS_FAILED of $((TESTS_PASSED + TESTS_FAILED)) tests failed"
    EXIT_CODE=1
fi

echo ""
log_info "Test results saved to: $TEST_RESULTS_DIR"
log_info "View report: $TEST_RESULTS_DIR/test-report.md"
echo ""

exit $EXIT_CODE
