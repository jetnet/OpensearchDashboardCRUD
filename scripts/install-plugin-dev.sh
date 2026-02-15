#!/bin/bash
# Install plugin in development mode
# This script installs the CRUD plugin into an OpenSearch Dashboards container

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PLUGIN_NAME="opensearch-crud-plugin"
PLUGIN_DIR="$(cd "$(dirname "$0")/.." && pwd)/${PLUGIN_NAME}"
DASHBOARDS_CONTAINER="${DASHBOARDS_CONTAINER:-opensearch-dashboards}"
DASHBOARDS_PORT=5601

echo -e "${BLUE}=== Plugin Development Installation ===${NC}"
echo ""

# Check if plugin directory exists
if [ ! -d "${PLUGIN_DIR}" ]; then
    echo -e "${RED}Error: Plugin directory not found: ${PLUGIN_DIR}${NC}"
    exit 1
fi

echo -e "${GREEN}Plugin directory: ${PLUGIN_DIR}${NC}"

# Check if container is running
if ! podman ps --format '{{.Names}}' | grep -q "^${DASHBOARDS_CONTAINER}$"; then
    echo -e "${RED}Error: Container '${DASHBOARDS_CONTAINER}' is not running.${NC}"
    echo "Please start the containers first: ./scripts/start-containers.sh"
    exit 1
fi

echo -e "${GREEN}Container '${DASHBOARDS_CONTAINER}' is running${NC}"
echo ""

# Method selection
echo -e "${BLUE}Installation Methods:${NC}"
echo "  1) Build and copy to container (recommended for testing)"
echo "  2) Mount plugin directory (for active development with restart)"
echo "  3) Remove plugin from container"
echo ""
read -p "Select method (1-3): " -n 1 -r
echo ""

case $REPLY in
    1)
        # Build and copy method
        echo -e "${YELLOW}Building plugin...${NC}"
        
        # Check if node is available
        if ! command -v node &> /dev/null; then
            echo -e "${RED}Error: node is not installed.${NC}"
            exit 1
        fi
        
        # Build the plugin
        cd "${PLUGIN_DIR}"
        
        # Check for package.json
        if [ ! -f "package.json" ]; then
            echo -e "${RED}Error: package.json not found in plugin directory${NC}"
            exit 1
        fi
        
        # Install dependencies and build
        echo -e "${YELLOW}Installing dependencies...${NC}"
        npm install
        
        echo -e "${YELLOW}Building plugin...${NC}"
        npm run build
        
        # Create a tarball of the built plugin
        echo -e "${YELLOW}Creating plugin archive...${NC}"
        tar -czf /tmp/${PLUGIN_NAME}.tar.gz \
            --exclude='node_modules' \
            --exclude='.git' \
            --exclude='tests' \
            --exclude='*.test.ts' \
            --exclude='*.test.tsx' \
            .
        
        # Remove existing plugin if present
        echo -e "${YELLOW}Removing existing plugin from container...${NC}"
        podman exec "${DASHBOARDS_CONTAINER}" rm -rf "/usr/share/opensearch-dashboards/plugins/${PLUGIN_NAME}" 2>/dev/null || true
        
        # Copy plugin to container
        echo -e "${YELLOW}Copying plugin to container...${NC}"
        podman cp /tmp/${PLUGIN_NAME}.tar.gz "${DASHBOARDS_CONTAINER}:/tmp/${PLUGIN_NAME}.tar.gz"
        
        # Extract plugin in container
        echo -e "${YELLOW}Installing plugin in container...${NC}"
        podman exec "${DASHBOARDS_CONTAINER}" bash -c "
            mkdir -p /usr/share/opensearch-dashboards/plugins/${PLUGIN_NAME}
            cd /usr/share/opensearch-dashboards/plugins/${PLUGIN_NAME}
            tar -xzf /tmp/${PLUGIN_NAME}.tar.gz
            rm /tmp/${PLUGIN_NAME}.tar.gz
        "
        
        # Restart container
        echo -e "${YELLOW}Restarting container...${NC}"
        podman restart "${DASHBOARDS_CONTAINER}"
        
        # Wait for Dashboards to be ready
        echo -e "${YELLOW}Waiting for OpenSearch Dashboards to be ready...${NC}"
        sleep 10
        for i in {1..30}; do
            if curl -s -o /dev/null -w "%{http_code}" "http://localhost:${DASHBOARDS_PORT}/api/status" | grep -q "200"; then
                echo -e "${GREEN}OpenSearch Dashboards is ready!${NC}"
                break
            fi
            echo -n "."
            sleep 2
        done
        
        # Clean up
        rm /tmp/${PLUGIN_NAME}.tar.gz
        
        echo ""
        echo -e "${GREEN}Plugin installed successfully!${NC}"
        echo -e "${BLUE}Access the plugin at: http://localhost:${DASHBOARDS_PORT}/app/crud${NC}"
        ;;
        
    2)
        # Mount method - requires container recreation
        echo -e "${YELLOW}This method requires recreating the container.${NC}"
        read -p "Continue? (y/N) " -n 1 -r
        echo ""
        
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Cancelled."
            exit 0
        fi
        
        # Get current container settings
        echo -e "${YELLOW}Stopping and removing current container...${NC}"
        podman stop "${DASHBOARDS_CONTAINER}" 2>/dev/null || true
        podman rm "${DASHBOARDS_CONTAINER}" 2>/dev/null || true
        
        # Create new container with mounted plugin
        echo -e "${YELLOW}Creating new container with mounted plugin...${NC}"
        podman run -d \
            --name "${DASHBOARDS_CONTAINER}" \
            --network opensearch-network \
            -p 5601:5601 \
            -e "OPENSEARCH_HOSTS=http://opensearch-node:9200" \
            -e "DISABLE_SECURITY_DASHBOARDS_PLUGIN=true" \
            -v "${PLUGIN_DIR}:/usr/share/opensearch-dashboards/plugins/${PLUGIN_NAME}:Z" \
            docker.io/opensearchproject/opensearch-dashboards:latest
        
        echo -e "${GREEN}Container created with mounted plugin.${NC}"
        echo -e "${YELLOW}Note: Changes to plugin source require rebuilding and container restart.${NC}"
        echo -e "${BLUE}To rebuild: cd ${PLUGIN_DIR} && npm run build${NC}"
        echo -e "${BLUE}To restart: podman restart ${DASHBOARDS_CONTAINER}${NC}"
        ;;
        
    3)
        # Remove plugin
        echo -e "${YELLOW}Removing plugin from container...${NC}"
        podman exec "${DASHBOARDS_CONTAINER}" rm -rf "/usr/share/opensearch-dashboards/plugins/${PLUGIN_NAME}" 2>/dev/null || true
        
        echo -e "${YELLOW}Restarting container...${NC}"
        podman restart "${DASHBOARDS_CONTAINER}"
        
        echo -e "${GREEN}Plugin removed successfully!${NC}"
        ;;
        
    *)
        echo -e "${RED}Invalid selection${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}Plugin status:${NC}"
podman exec "${DASHBOARDS_CONTAINER}" ls -la /usr/share/opensearch-dashboards/plugins/ 2>/dev/null || echo "Could not list plugins"
