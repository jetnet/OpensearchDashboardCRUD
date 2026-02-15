#!/bin/bash
#
# Build script for OpenSearch Dashboards CRUD Plugin
# Builds the plugin and creates a zip artifact
#
# Usage: ./scripts/build.sh [options]
# Options:
#   --skip-tests    Skip running tests
#   --skip-lint     Skip linting
#   --dev           Development build (skip tests and lint)
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PLUGIN_DIR="$PROJECT_ROOT/opensearch-crud-plugin"

# Parse arguments
SKIP_TESTS=false
SKIP_LINT=false

for arg in "$@"; do
    case $arg in
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-lint)
            SKIP_LINT=true
            shift
            ;;
        --dev)
            SKIP_TESTS=true
            SKIP_LINT=true
            shift
            ;;
        *)
            echo "Unknown argument: $arg"
            exit 1
            ;;
    esac
done

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

# Error handler
error_handler() {
    log_error "Build failed at line $1"
    exit 1
}

trap 'error_handler $LINENO' ERR

# Step 1: Check Node.js version
log_info "Step 1: Checking Node.js version..."
NODE_VERSION=$(node -v 2>/dev/null || echo "not found")

if [ "$NODE_VERSION" = "not found" ]; then
    log_error "Node.js is not installed. Please install Node.js >= 14.0.0"
    exit 1
fi

NODE_MAJOR_VERSION=$(echo "$NODE_VERSION" | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_MAJOR_VERSION" -lt 14 ]; then
    log_error "Node.js version $NODE_VERSION is not supported. Please use Node.js >= 14.0.0"
    exit 1
fi

log_success "Node.js version: $NODE_VERSION"

# Step 2: Check yarn
log_info "Step 2: Checking yarn..."
if ! command -v yarn &> /dev/null; then
    log_error "yarn is not installed. Please install yarn >= 1.21.1"
    exit 1
fi

YARN_VERSION=$(yarn -v)
log_success "yarn version: $YARN_VERSION"

# Step 3: Install dependencies
log_info "Step 3: Installing dependencies..."
cd "$PLUGIN_DIR"

if [ -f "yarn.lock" ]; then
    yarn install --frozen-lockfile
else
    yarn install
fi

log_success "Dependencies installed"

# Step 4: Run linting
if [ "$SKIP_LINT" = false ]; then
    log_info "Step 4: Running linting..."
    yarn lint
    
    if [ $? -ne 0 ]; then
        log_error "Linting failed. Please fix the issues and try again."
        exit 1
    fi
    
    log_success "Linting passed"
else
    log_warning "Step 4: Skipping linting (--skip-lint)"
fi

# Step 5: Run tests
if [ "$SKIP_TESTS" = false ]; then
    log_info "Step 5: Running tests..."
    yarn test
    
    if [ $? -ne 0 ]; then
        log_error "Tests failed. Please fix the issues and try again."
        exit 1
    fi
    
    log_success "Tests passed"
else
    log_warning "Step 5: Skipping tests (--skip-tests)"
fi

# Step 6: Validate version
log_info "Step 6: Validating version..."
VERSION=$(node -p "require('./package.json').version")

if [ -z "$VERSION" ]; then
    log_error "Could not read version from package.json"
    exit 1
fi

# Validate semver format
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$ ]]; then
    log_error "Invalid version format: $VERSION. Expected semver format (e.g., 1.0.0)"
    exit 1
fi

log_success "Version: $VERSION"

# Step 7: Build plugin
log_info "Step 7: Building plugin..."
yarn build

if [ $? -ne 0 ]; then
    log_error "Build failed"
    exit 1
fi

log_success "Build completed"

# Step 8: Create zip artifact
log_info "Step 8: Creating zip artifact..."

ZIP_NAME="opensearch-crud-plugin-$VERSION.zip"

# Remove old zip if exists
if [ -f "$ZIP_NAME" ]; then
    rm "$ZIP_NAME"
fi

# Create zip from build directory
if [ -d "build" ]; then
    zip -r "$ZIP_NAME" build
    log_success "Created artifact: $ZIP_NAME"
elif [ -d "target" ]; then
    zip -r "$ZIP_NAME" target
    log_success "Created artifact: $ZIP_NAME (from target)"
else
    log_warning "No build or target directory found. Skipping zip creation."
fi

# Summary
echo ""
echo "========================================"
log_success "Build completed successfully!"
echo "========================================"
echo ""
echo "Version:    $VERSION"
echo "Artifact:   $PLUGIN_DIR/$ZIP_NAME"
echo ""
echo "To install the plugin:"
echo "  ./bin/opensearch-dashboards-plugin install file://$PLUGIN_DIR/$ZIP_NAME"
echo ""

cd "$PROJECT_ROOT"
