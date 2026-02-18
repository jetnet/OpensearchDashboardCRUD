#!/bin/bash
#
# Build Plugin for Specific OSD Version
# Usage: ./build-for-version.sh <OSD_VERSION> [PLUGIN_PATH]
#
# Example:
#   ./build-for-version.sh 2.19.0
#   ./build-for-version.sh 2.19.0 ../opensearch_index_manager
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
OSD_VERSION="${1:-2.19.0}"
PLUGIN_PATH="${2:-./opensearch_index_manager}"
PLUGIN_NAME="opensearch_index_manager"
NODE_VERSION="18.19.0"
BUILD_DIR="./build"
TEMP_DIR=$(mktemp -d)

# Cleanup function
cleanup() {
    echo -e "${BLUE}Cleaning up temporary files...${NC}"
    if [[ -d "$TEMP_DIR" ]]; then
        rm -rf "$TEMP_DIR"
    fi
}

trap cleanup EXIT

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

# Help function
show_help() {
    cat << EOF
Build Plugin for Specific OSD Version

Usage: $(basename "$0") [OPTIONS] <OSD_VERSION> [PLUGIN_PATH]

Arguments:
  OSD_VERSION    OpenSearch Dashboards version to build for (default: 2.19.0)
  PLUGIN_PATH    Path to plugin directory (default: ./opensearch_index_manager)

Options:
  -h, --help     Show this help message
  -c, --clean    Clean build directory before building
  -v, --verbose  Enable verbose output
  --skip-verify  Skip artifact verification

Examples:
  $(basename "$0") 2.19.0
  $(basename "$0") 2.19.4 ../my-plugin
  $(basename "$0") --clean 2.19.1

EOF
}

# Parse options
CLEAN_BUILD=false
VERBOSE=false
SKIP_VERIFY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -c|--clean)
            CLEAN_BUILD=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --skip-verify)
            SKIP_VERIFY=true
            shift
            ;;
        -*)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
        *)
            break
            ;;
    esac
done

# Update positional arguments
OSD_VERSION="${1:-$OSD_VERSION}"
PLUGIN_PATH="${2:-$PLUGIN_PATH}"

# Validate inputs
if [[ -z "$OSD_VERSION" ]]; then
    log_error "OSD version is required"
    show_help
    exit 1
fi

if [[ ! -d "$PLUGIN_PATH" ]]; then
    log_error "Plugin directory not found: $PLUGIN_PATH"
    exit 1
fi

# Check if OSD version is supported
SUPPORTED_VERSIONS=$(cat .github/osd-versions.json 2>/dev/null | grep -o '"2\.[0-9]\+\.[0-9]\+"' | tr -d '"' || echo "2.19.0 2.19.1 2.19.2 2.19.3 2.19.4")
if [[ ! " $SUPPORTED_VERSIONS " =~ " $OSD_VERSION " ]]; then
    log_warning "OSD version $OSD_VERSION may not be officially supported"
    log_info "Supported versions: $SUPPORTED_VERSIONS"
fi

log_info "Building $PLUGIN_NAME for OSD $OSD_VERSION"
log_info "Plugin path: $(realpath "$PLUGIN_PATH")"
log_info "Build directory: $BUILD_DIR"

# Clean build directory if requested
if [[ "$CLEAN_BUILD" == "true" && -d "$BUILD_DIR" ]]; then
    log_info "Cleaning build directory..."
    rm -rf "$BUILD_DIR"/*
fi

# Create build directory
mkdir -p "$BUILD_DIR"

# Step 1: Clone OSD source
log_info "Step 1/6: Cloning OSD source (version $OSD_VERSION)..."
OSD_SOURCE_DIR="$TEMP_DIR/osd-source"

if [[ "$VERBOSE" == "true" ]]; then
    git clone --depth 1 --branch "$OSD_VERSION" \
        https://github.com/opensearch-project/OpenSearch-Dashboards.git \
        "$OSD_SOURCE_DIR"
else
    git clone --depth 1 --branch "$OSD_VERSION" \
        https://github.com/opensearch-project/OpenSearch-Dashboards.git \
        "$OSD_SOURCE_DIR" 2>/dev/null
fi

if [[ ! -d "$OSD_SOURCE_DIR" ]]; then
    log_error "Failed to clone OSD source"
    exit 1
fi

log_success "OSD source cloned successfully"

# Step 2: Setup Node.js
log_info "Step 2/6: Setting up Node.js environment..."

# Check if correct Node version is available
if command -v nvm &> /dev/null; then
    source ~/.nvm/nvm.sh
    nvm use "$NODE_VERSION" 2>/dev/null || nvm install "$NODE_VERSION"
fi

# Verify Node version
CURRENT_NODE=$(node --version 2>/dev/null || echo "none")
if [[ "$CURRENT_NODE" != "v$NODE_VERSION" ]]; then
    log_warning "Node version mismatch: expected v$NODE_VERSION, got $CURRENT_NODE"
    log_info "Attempting to continue with current Node version..."
fi

# Setup Yarn
if ! command -v yarn &> /dev/null; then
    log_info "Installing Yarn..."
    npm install -g yarn@1.22.21
fi

yarn config set network-timeout 600000

log_success "Node.js environment ready"

# Step 3: Bootstrap OSD
log_info "Step 3/6: Bootstrapping OSD (this may take several minutes)..."
cd "$OSD_SOURCE_DIR"

if [[ "$VERBOSE" == "true" ]]; then
    yarn osd bootstrap --single-version=loose
else
    yarn osd bootstrap --single-version=loose > "$TEMP_DIR/bootstrap.log" 2>&1
    if [[ $? -ne 0 ]]; then
        log_error "Bootstrap failed. See $TEMP_DIR/bootstrap.log"
        exit 1
    fi
fi

log_success "OSD bootstrap completed"

# Step 4: Copy plugin
log_info "Step 4/6: Copying plugin to OSD plugins directory..."
PLUGIN_DEST_DIR="$OSD_SOURCE_DIR/plugins/$PLUGIN_NAME"

mkdir -p "$PLUGIN_DEST_DIR"
rsync -av --exclude='node_modules' --exclude='build' \
    "$PLUGIN_PATH/" "$PLUGIN_DEST_DIR/"

# Install plugin dependencies
log_info "Installing plugin dependencies..."
cd "$PLUGIN_DEST_DIR"

if [[ "$VERBOSE" == "true" ]]; then
    yarn install --frozen-lockfile
else
    yarn install --frozen-lockfile > "$TEMP_DIR/plugin-deps.log" 2>&1
    if [[ $? -ne 0 ]]; then
        log_error "Plugin dependency installation failed"
        exit 1
    fi
fi

log_success "Plugin copied and dependencies installed"

# Step 5: Build plugin
log_info "Step 5/6: Building plugin..."
BUILD_OUTPUT_DIR="$PLUGIN_DEST_DIR/build"

# Clean previous build
rm -rf "$BUILD_OUTPUT_DIR"
mkdir -p "$BUILD_OUTPUT_DIR"

if [[ "$VERBOSE" == "true" ]]; then
    yarn plugin-helpers build
else
    yarn plugin-helpers build > "$TEMP_DIR/build.log" 2>&1
    if [[ $? -ne 0 ]]; then
        log_error "Build failed. See $TEMP_DIR/build.log"
        exit 1
    fi
fi

log_success "Build completed"

# Step 6: Package artifact
log_info "Step 6/6: Packaging artifact..."

# Get plugin version from package.json
PLUGIN_VERSION=$(cat "$PLUGIN_DEST_DIR/package.json" | grep '"version"' | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[:space:]')

# Rename artifact with version info
ARTIFACT_NAME="${PLUGIN_NAME}-${PLUGIN_VERSION}-osd-${OSD_VERSION}.zip"
ARTIFACT_PATH="$BUILD_DIR/$ARTIFACT_NAME"

# Find and rename the built artifact
BUILT_ARTIFACT=$(find "$BUILD_OUTPUT_DIR" -name "*.zip" | head -1)
if [[ -f "$BUILT_ARTIFACT" ]]; then
    cp "$BUILT_ARTIFACT" "$ARTIFACT_PATH"
else
    log_error "Build artifact not found in $BUILD_OUTPUT_DIR"
    exit 1
fi

# Verify artifact
if [[ "$SKIP_VERIFY" == "false" ]]; then
    log_info "Verifying artifact..."
    
    # Check file exists and is not empty
    if [[ ! -s "$ARTIFACT_PATH" ]]; then
        log_error "Artifact is empty or does not exist"
        exit 1
    fi
    
    # Check if it's a valid zip
    if ! unzip -t "$ARTIFACT_PATH" > /dev/null 2>&1; then
        log_error "Artifact is not a valid zip file"
        exit 1
    fi
    
    # List contents
    log_info "Artifact contents:"
    unzip -l "$ARTIFACT_PATH" | tail -5
    
    # Generate checksum
    CHECKSUM=$(sha256sum "$ARTIFACT_PATH" | awk '{ print $1 }')
    echo "$CHECKSUM  $ARTIFACT_NAME" > "$ARTIFACT_PATH.sha256"
    
    log_success "Artifact verified (SHA256: $CHECKSUM)"
fi

# Final output
echo ""
log_success "Build completed successfully!"
echo ""
echo -e "${GREEN}Artifact:${NC} $ARTIFACT_PATH"
echo -e "${GREEN}Size:${NC} $(du -h "$ARTIFACT_PATH" | cut -f1)"
echo -e "${GREEN}Checksum:${NC} $(cat "$ARTIFACT_PATH.sha256" | awk '{ print $1 }')"
echo ""
log_info "To install this plugin:"
echo "  ./bin/opensearch-dashboards-plugin install file://$(realpath "$ARTIFACT_PATH")"
echo ""

exit 0
