#!/bin/bash
# Start OpenSearch and OpenSearch Dashboards containers using Podman
# This script sets up a local testing environment with security disabled

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
OPENSEARCH_PORT=9200
DASHBOARDS_PORT=5601
OPENSEARCH_VERSION="${OPENSEARCH_VERSION:-latest}"

echo -e "${BLUE}=== OpenSearch Local Testing Environment ===${NC}"
echo ""

# Check if podman is installed
if ! command -v podman &> /dev/null; then
    echo -e "${RED}Error: podman is not installed.${NC}"
    echo "Please install podman first:"
    echo "  https://podman.io/getting-started/installation"
    exit 1
fi

echo -e "${GREEN}Podman found: $(podman --version)${NC}"

# Function to check if a container is running
is_container_running() {
    podman ps --format '{{.Names}}' | grep -q "^$1$"
}

# Function to check if a container exists (running or stopped)
container_exists() {
    podman ps -a --format '{{.Names}}' | grep -q "^$1$"
}

# Function to wait for OpenSearch to be ready
wait_for_opensearch() {
    echo -e "${YELLOW}Waiting for OpenSearch to be ready...${NC}"
    local max_attempts=60
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" "http://localhost:${OPENSEARCH_PORT}/_cluster/health" | grep -q "200"; then
            echo -e "${GREEN}OpenSearch is ready!${NC}"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}Timeout waiting for OpenSearch${NC}"
    return 1
}

# Function to wait for OpenSearch Dashboards to be ready
wait_for_dashboards() {
    echo -e "${YELLOW}Waiting for OpenSearch Dashboards to be ready...${NC}"
    local max_attempts=90
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" "http://localhost:${DASHBOARDS_PORT}/api/status" | grep -q "200"; then
            echo -e "${GREEN}OpenSearch Dashboards is ready!${NC}"
            return 0
        fi
        echo -n "."
        sleep 3
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}Timeout waiting for OpenSearch Dashboards${NC}"
    return 1
}

# Create network if it doesn't exist
echo -e "${BLUE}Setting up network...${NC}"
if ! podman network exists "${NETWORK_NAME}" 2>/dev/null; then
    podman network create "${NETWORK_NAME}"
    echo -e "${GREEN}Network '${NETWORK_NAME}' created${NC}"
else
    echo -e "${YELLOW}Network '${NETWORK_NAME}' already exists${NC}"
fi

# Start OpenSearch container
echo ""
echo -e "${BLUE}Setting up OpenSearch container...${NC}"
if is_container_running "${OPENSEARCH_CONTAINER}"; then
    echo -e "${YELLOW}OpenSearch container is already running${NC}"
elif container_exists "${OPENSEARCH_CONTAINER}"; then
    echo -e "${YELLOW}Starting existing OpenSearch container...${NC}"
    podman start "${OPENSEARCH_CONTAINER}"
else
    echo -e "${YELLOW}Creating and starting OpenSearch container...${NC}"
    podman run -d \
        --name "${OPENSEARCH_CONTAINER}" \
        --network "${NETWORK_NAME}" \
        -p ${OPENSEARCH_PORT}:${OPENSEARCH_PORT} \
        -p 9600:9600 \
        -e "discovery.type=single-node" \
        -e "DISABLE_SECURITY_PLUGIN=true" \
        -e "OPENSEARCH_JAVA_OPTS=-Xms512m -Xmx512m" \
        -e "cluster.name=opensearch-dev" \
        -e "node.name=opensearch-node1" \
        --health-cmd="curl -f http://localhost:9200/_cluster/health || exit 1" \
        --health-interval=10s \
        --health-timeout=5s \
        --health-retries=5 \
        docker.io/opensearchproject/opensearch:${OPENSEARCH_VERSION}
    echo -e "${GREEN}OpenSearch container created${NC}"
fi

# Wait for OpenSearch to be ready
wait_for_opensearch

# Start OpenSearch Dashboards container
echo ""
echo -e "${BLUE}Setting up OpenSearch Dashboards container...${NC}"
if is_container_running "${DASHBOARDS_CONTAINER}"; then
    echo -e "${YELLOW}OpenSearch Dashboards container is already running${NC}"
elif container_exists "${DASHBOARDS_CONTAINER}"; then
    echo -e "${YELLOW}Starting existing OpenSearch Dashboards container...${NC}"
    podman start "${DASHBOARDS_CONTAINER}"
else
    echo -e "${YELLOW}Creating and starting OpenSearch Dashboards container...${NC}"
    podman run -d \
        --name "${DASHBOARDS_CONTAINER}" \
        --network "${NETWORK_NAME}" \
        -p ${DASHBOARDS_PORT}:${DASHBOARDS_PORT} \
        -e "OPENSEARCH_HOSTS=http://${OPENSEARCH_CONTAINER}:${OPENSEARCH_PORT}" \
        -e "DISABLE_SECURITY_DASHBOARDS_PLUGIN=true" \
        --health-cmd="curl -f http://localhost:5601/api/status || exit 1" \
        --health-interval=10s \
        --health-timeout=5s \
        --health-retries=5 \
        docker.io/opensearchproject/opensearch-dashboards:${OPENSEARCH_VERSION}
    echo -e "${GREEN}OpenSearch Dashboards container created${NC}"
fi

# Wait for Dashboards to be ready
wait_for_dashboards

# Display connection information
echo ""
echo -e "${GREEN}=== Environment Ready ===${NC}"
echo ""
echo -e "${BLUE}Connection Information:${NC}"
echo "  OpenSearch:          http://localhost:${OPENSEARCH_PORT}"
echo "  OpenSearch Dashboards: http://localhost:${DASHBOARDS_PORT}"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "  Check OpenSearch health:  curl http://localhost:${OPENSEARCH_PORT}/_cluster/health"
echo "  Check Dashboards status:  curl http://localhost:${DASHBOARDS_PORT}/api/status"
echo "  View OpenSearch logs:     podman logs ${OPENSEARCH_CONTAINER}"
echo "  View Dashboards logs:     podman logs ${DASHBOARDS_CONTAINER}"
echo "  Stop all containers:      ./scripts/stop-containers.sh"
echo ""
echo -e "${BLUE}Container Status:${NC}"
podman ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAME|opensearch"
