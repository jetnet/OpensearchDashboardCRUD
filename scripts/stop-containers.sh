#!/bin/bash
# Stop OpenSearch and OpenSearch Dashboards containers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NETWORK_NAME="opensearch-network"
OPENSEARCH_CONTAINER="opensearch-node"
DASHBOARDS_CONTAINER="opensearch-dashboards"

echo -e "${BLUE}=== Stopping OpenSearch Testing Environment ===${NC}"
echo ""

# Function to check if a container is running
is_container_running() {
    podman ps --format '{{.Names}}' | grep -q "^$1$"
}

# Function to check if a container exists
container_exists() {
    podman ps -a --format '{{.Names}}' | grep -q "^$1$"
}

# Stop OpenSearch Dashboards
if is_container_running "${DASHBOARDS_CONTAINER}"; then
    echo -e "${YELLOW}Stopping OpenSearch Dashboards...${NC}"
    podman stop "${DASHBOARDS_CONTAINER}"
    echo -e "${GREEN}OpenSearch Dashboards stopped${NC}"
elif container_exists "${DASHBOARDS_CONTAINER}"; then
    echo -e "${YELLOW}OpenSearch Dashboards is not running${NC}"
else
    echo -e "${YELLOW}OpenSearch Dashboards container does not exist${NC}"
fi

# Stop OpenSearch
if is_container_running "${OPENSEARCH_CONTAINER}"; then
    echo -e "${YELLOW}Stopping OpenSearch...${NC}"
    podman stop "${OPENSEARCH_CONTAINER}"
    echo -e "${GREEN}OpenSearch stopped${NC}"
elif container_exists "${OPENSEARCH_CONTAINER}"; then
    echo -e "${YELLOW}OpenSearch is not running${NC}"
else
    echo -e "${YELLOW}OpenSearch container does not exist${NC}"
fi

# Ask if user wants to remove containers
echo ""
read -p "Remove containers? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if container_exists "${DASHBOARDS_CONTAINER}"; then
        echo -e "${YELLOW}Removing OpenSearch Dashboards container...${NC}"
        podman rm "${DASHBOARDS_CONTAINER}"
    fi
    if container_exists "${OPENSEARCH_CONTAINER}"; then
        echo -e "${YELLOW}Removing OpenSearch container...${NC}"
        podman rm "${OPENSEARCH_CONTAINER}"
    fi
    
    # Ask if user wants to remove network
    read -p "Remove network? (y/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if podman network exists "${NETWORK_NAME}" 2>/dev/null; then
            echo -e "${YELLOW}Removing network...${NC}"
            podman network rm "${NETWORK_NAME}"
            echo -e "${GREEN}Network removed${NC}"
        fi
    fi
fi

echo ""
echo -e "${GREEN}=== Environment Stopped ===${NC}"
