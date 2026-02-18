#!/bin/bash
#
# Start OpenSearch and OpenSearch Dashboards containers for local development
#
# Usage: ./scripts/start-local.sh [version]
#   version: OSD version to use (default: 2.19.0)
#
# Examples:
#   ./scripts/start-local.sh              # Start with default version 2.19.0
#   ./scripts/start-local.sh 2.19.2       # Start with version 2.19.2

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
OSD_VERSION="${1:-2.19.0}"

# Validate version
VALID_VERSIONS=("2.19.0" "2.19.1" "2.19.2" "2.19.3" "2.19.4")
VERSION_VALID=false
for v in "${VALID_VERSIONS[@]}"; do
    if [ "$v" == "$OSD_VERSION" ]; then
        VERSION_VALID=true
        break
    fi
done

if [ "$VERSION_VALID" = false ]; then
    echo "Error: Invalid version '$OSD_VERSION'"
    echo "Valid versions: ${VALID_VERSIONS[*]}"
    exit 1
fi

echo "=============================================="
echo "OpenSearch Index Manager - Local Development"
echo "=============================================="
echo "OSD Version: $OSD_VERSION"
echo ""

# Check if podman-compose is available
if ! command -v podman-compose &> /dev/null; then
    echo "Error: podman-compose is not installed"
    echo "Please install it: pip3 install podman-compose"
    exit 1
fi

# Create temporary compose file with correct version
COMPOSE_FILE="$PROJECT_ROOT/.podman-compose.temp.yml"
sed "s/opensearch-dashboards:2.19.0/opensearch-dashboards:$OSD_VERSION/g; s/opensearch:2.19.0/opensearch:$OSD_VERSION/g" "$PROJECT_ROOT/podman-compose.yml" > "$COMPOSE_FILE"

cleanup() {
    rm -f "$COMPOSE_FILE"
}
trap cleanup EXIT

cd "$PROJECT_ROOT"

echo "Starting OpenSearch container..."
podman-compose -f "$COMPOSE_FILE" up -d opensearch

echo "Waiting for OpenSearch to be healthy..."
for i in {1..30}; do
    if curl -s http://localhost:9200/_cluster/health > /dev/null 2>&1; then
        echo "OpenSearch is ready!"
        break
    fi
    echo -n "."
    sleep 2
done

# Check if OpenSearch is actually ready
if ! curl -s http://localhost:9200/_cluster/health > /dev/null 2>&1; then
    echo ""
    echo "Error: OpenSearch failed to start"
    echo "Check logs with: podman logs osim-opensearch"
    exit 1
fi

echo ""
echo "Starting OpenSearch Dashboards..."
podman-compose -f "$COMPOSE_FILE" up -d opensearch-dashboards

echo ""
echo "Waiting for OpenSearch Dashboards to be ready..."
for i in {1..60}; do
    if curl -s http://localhost:5601/api/status 2>/dev/null | grep -q '"state":"green\|"state":"yellow"'; then
        echo ""
        echo "OpenSearch Dashboards is ready!"
        break
    fi
    echo -n "."
    sleep 3
done

echo ""
echo "=============================================="
echo "All services are running!"
echo "=============================================="
echo "OpenSearch:        http://localhost:9200"
echo "OpenSearch Dashboards: http://localhost:5601"
echo ""
echo "Plugin URL:        http://localhost:5601/app/opensearch_index_manager"
echo ""
echo "Useful commands:"
echo "  View OpenSearch logs:    podman logs -f osim-opensearch"
echo "  View OSD logs:          podman logs -f osim-dashboards"
echo "  Stop all services:      ./scripts/stop-local.sh"
echo "  Check cluster health:   curl http://localhost:9200/_cluster/health"
echo "=============================================="
