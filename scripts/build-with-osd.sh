#!/bin/bash
#
# Build script for OpenSearch Dashboards CRUD Plugin
# 
# This script builds the plugin within the OpenSearch Dashboards source tree.
# OSD plugins require the OSD source code for building due to dependencies on
# internal OSD types and build tools.
#
# Usage:
#   ./scripts/build-with-osd.sh [OSD_VERSION] [PLUGIN_VERSION]
#
# Arguments:
#   OSD_VERSION - OpenSearch Dashboards version (default: 2.11.0)
#   PLUGIN_VERSION - Plugin version (default: from package.json)
#
# Examples:
#   ./scripts/build-with-osd.sh                    # Use defaults
#   ./scripts/build-with-osd.sh 2.10.0 1.0.0       # Specify versions
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
OSD_VERSION="${1:-2.11.0}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
PLUGIN_DIR="${PROJECT_ROOT}/opensearch-crud-plugin"
BUILD_DIR="${PROJECT_ROOT}/build"
OSD_DIR="${BUILD_DIR}/opensearch-dashboards"

# Get plugin version from package.json
PLUGIN_VERSION="${2:-$(node -p "require('${PLUGIN_DIR}/package.json').version")}"
PLUGIN_NAME="crudPlugin"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}OpenSearch Dashboards CRUD Plugin Build${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "OSD Version:    ${GREEN}${OSD_VERSION}${NC}"
echo -e "Plugin Version: ${GREEN}${PLUGIN_VERSION}${NC}"
echo -e "Plugin Name:    ${GREEN}${PLUGIN_NAME}${NC}"
echo ""

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Error: Node.js is not installed.${NC}"
        exit 1
    fi
    echo -e "  ${GREEN}✓${NC} Node.js $(node --version)"
    
    # Check yarn
    if ! command -v yarn &> /dev/null; then
        echo -e "${RED}Error: yarn is not installed.${NC}"
        echo -e "  Install with: npm install -g yarn"
        exit 1
    fi
    echo -e "  ${GREEN}✓${NC} yarn $(yarn --version)"
    
    # Check git
    if ! command -v git &> /dev/null; then
        echo -e "${RED}Error: git is not installed.${NC}"
        exit 1
    fi
    echo -e "  ${GREEN}✓${NC} git $(git --version | cut -d' ' -f3)"
    
    echo ""
}

# Clone OpenSearch Dashboards
clone_osd() {
    echo -e "${YELLOW}Cloning OpenSearch Dashboards ${OSD_VERSION}...${NC}"
    
    mkdir -p "${BUILD_DIR}"
    
    if [ -d "${OSD_DIR}" ]; then
        echo -e "  ${YELLOW}OSD directory exists, checking version...${NC}"
        cd "${OSD_DIR}"
        CURRENT_TAG=$(git describe --tags 2>/dev/null || echo "unknown")
        if [ "${CURRENT_TAG}" = "v${OSD_VERSION}" ]; then
            echo -e "  ${GREEN}✓${NC} Correct version already cloned"
            return
        else
            echo -e "  ${YELLOW}Different version detected, re-cloning...${NC}"
            cd "${PROJECT_ROOT}"
            rm -rf "${OSD_DIR}"
        fi
    fi
    
    cd "${BUILD_DIR}"
    git clone --depth 1 --branch "v${OSD_VERSION}" \
        https://github.com/opensearch-project/OpenSearch-Dashboards.git \
        opensearch-dashboards
    
    echo -e "  ${GREEN}✓${NC} OpenSearch Dashboards cloned"
    cd "${PROJECT_ROOT}"
    echo ""
}

# Copy plugin to OSD plugins directory
copy_plugin() {
    echo -e "${YELLOW}Copying plugin to OSD plugins directory...${NC}"
    
    OSD_PLUGINS_DIR="${OSD_DIR}/plugins"
    mkdir -p "${OSD_PLUGINS_DIR}"
    
    # Remove existing plugin if present
    if [ -d "${OSD_PLUGINS_DIR}/${PLUGIN_NAME}" ]; then
        rm -rf "${OSD_PLUGINS_DIR}/${PLUGIN_NAME}"
    fi
    
    # Copy plugin (excluding node_modules and build artifacts)
    cp -r "${PLUGIN_DIR}" "${OSD_PLUGINS_DIR}/${PLUGIN_NAME}"
    
    # Clean up unnecessary files in the copy
    cd "${OSD_PLUGINS_DIR}/${PLUGIN_NAME}"
    rm -rf node_modules build target .eslintcache
    rm -f yarn.lock package-lock.json
    
    echo -e "  ${GREEN}✓${NC} Plugin copied to ${OSD_PLUGINS_DIR}/${PLUGIN_NAME}"
    cd "${PROJECT_ROOT}"
    echo ""
}

# Bootstrap OpenSearch Dashboards
bootstrap_osd() {
    echo -e "${YELLOW}Bootstrapping OpenSearch Dashboards...${NC}"
    echo -e "  ${YELLOW}This may take 10-20 minutes on first run...${NC}"
    
    cd "${OSD_DIR}"
    
    # Check if already bootstrapped
    if [ -d "node_modules" ] && [ -f "yarn.lock" ]; then
        echo -e "  ${GREEN}✓${NC} OSD appears to be bootstrapped already"
        echo -e "  ${YELLOW}Running yarn to ensure dependencies are up to date...${NC}"
        yarn --frozen-lockfile || yarn
    else
        # Install dependencies
        yarn osd bootstrap
    fi
    
    cd "${PROJECT_ROOT}"
    echo ""
}

# Build the plugin
build_plugin() {
    echo -e "${YELLOW}Building plugin...${NC}"
    
    cd "${OSD_DIR}/plugins/${PLUGIN_NAME}"
    
    # Build the plugin
    yarn build
    
    echo -e "  ${GREEN}✓${NC} Plugin built successfully"
    cd "${PROJECT_ROOT}"
    echo ""
}

# Package the plugin
package_plugin() {
    echo -e "${YELLOW}Packaging plugin...${NC}"
    
    cd "${OSD_DIR}/plugins/${PLUGIN_NAME}"
    
    # Create the plugin zip
    # OSD uses opensearch-dashboards-plugin packager
    yarn plugin-helpers pack
    
    # Find the generated zip file
    ZIP_FILE=$(find . -maxdepth 1 -name "*.zip" -type f | head -n 1)
    
    if [ -z "${ZIP_FILE}" ]; then
        # Alternative: manual packaging
        echo -e "  ${YELLOW}Creating zip manually...${NC}"
        ZIP_NAME="${PLUGIN_NAME}-${PLUGIN_VERSION}.zip"
        
        # Create zip with the required structure
        mkdir -p package
        cp -r build/opensearch-dashboards/* package/ 2>/dev/null || true
        cp package.json package/
        cp opensearch_dashboards.json package/
        
        # If build directory exists with the plugin
        if [ -d "build" ]; then
            cd build
            zip -r "../${ZIP_NAME}" .
            cd ..
        else
            zip -r "${ZIP_NAME}" package
        fi
        
        rm -rf package
        ZIP_FILE="./${ZIP_NAME}"
    fi
    
    # Copy to project build directory
    mkdir -p "${BUILD_DIR}/releases"
    FINAL_ZIP="${BUILD_DIR}/releases/${PLUGIN_NAME}-${PLUGIN_VERSION}-osd-${OSD_VERSION}.zip"
    cp "${ZIP_FILE}" "${FINAL_ZIP}"
    
    echo -e "  ${GREEN}✓${NC} Plugin packaged: ${FINAL_ZIP}"
    
    # Generate checksums
    cd "${BUILD_DIR}/releases"
    sha256sum "$(basename "${FINAL_ZIP}")" > "$(basename "${FINAL_ZIP}").sha256"
    
    cd "${PROJECT_ROOT}"
    echo ""
}

# Print summary
print_summary() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Build Complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "Plugin package: ${GREEN}${BUILD_DIR}/releases/${PLUGIN_NAME}-${PLUGIN_VERSION}-osd-${OSD_VERSION}.zip${NC}"
    echo ""
    echo -e "Installation command:"
    echo -e "  ${BLUE}./bin/opensearch-dashboards-plugin install file://${BUILD_DIR}/releases/${PLUGIN_NAME}-${PLUGIN_VERSION}-osd-${OSD_VERSION}.zip${NC}"
    echo ""
    echo -e "Or for a running container:"
    echo -e "  ${BLUE}docker cp ${BUILD_DIR}/releases/${PLUGIN_NAME}-${PLUGIN_VERSION}-osd-${OSD_VERSION}.zip osd-container:/tmp/${NC}"
    echo -e "  ${BLUE}docker exec osd-container ./bin/opensearch-dashboards-plugin install file:///tmp/${PLUGIN_NAME}-${PLUGIN_VERSION}-osd-${OSD_VERSION}.zip${NC}"
    echo ""
}

# Cleanup function
cleanup() {
    echo -e "${YELLOW}Cleaning up...${NC}"
    # Optionally remove OSD source to save space
    # Uncomment the following line if you want to clean up after build
    # rm -rf "${OSD_DIR}"
}

# Main execution
main() {
    check_prerequisites
    clone_osd
    copy_plugin
    bootstrap_osd
    build_plugin
    package_plugin
    print_summary
    
    echo -e "${GREEN}Done!${NC}"
}

# Run main function
main
