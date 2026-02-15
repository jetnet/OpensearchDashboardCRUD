#!/bin/bash
# Create test data in OpenSearch using curl
# This script creates the index with mapping and inserts sample entities

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
OPENSEARCH_HOST="${OPENSEARCH_HOST:-localhost}"
OPENSEARCH_PORT="${OPENSEARCH_PORT:-9200}"
OPENSEARCH_URL="http://${OPENSEARCH_HOST}:${OPENSEARCH_PORT}"
INDEX_NAME="crud-entities"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DATA_FILE="${SCRIPT_DIR}/../tests/test-data/entities.json"

echo -e "${BLUE}=== Creating Test Data ===${NC}"
echo ""

# Check if OpenSearch is accessible
echo -e "${YELLOW}Checking OpenSearch connection...${NC}"
if ! curl -s -o /dev/null -w "%{http_code}" "${OPENSEARCH_URL}/_cluster/health" | grep -q "200"; then
    echo -e "${RED}Error: Cannot connect to OpenSearch at ${OPENSEARCH_URL}${NC}"
    echo "Make sure OpenSearch is running: ./scripts/start-containers.sh"
    exit 1
fi
echo -e "${GREEN}OpenSearch is accessible${NC}"
echo ""

# Check if data file exists
if [ ! -f "${DATA_FILE}" ]; then
    echo -e "${RED}Error: Test data file not found: ${DATA_FILE}${NC}"
    exit 1
fi

# Delete existing index if it exists
echo -e "${YELLOW}Deleting existing index if present...${NC}"
curl -s -X DELETE "${OPENSEARCH_URL}/${INDEX_NAME}" 2>/dev/null || true
echo -e "${GREEN}Done${NC}"

# Create index with settings and mapping
echo ""
echo -e "${YELLOW}Creating index with mapping...${NC}"

# Extract settings and mapping from JSON file
SETTINGS=$(cat "${DATA_FILE}" | jq '.settings')
MAPPING=$(cat "${DATA_FILE}" | jq '.mapping')

# Create index
curl -s -X PUT "${OPENSEARCH_URL}/${INDEX_NAME}" \
    -H "Content-Type: application/json" \
    -d "{
        \"settings\": ${SETTINGS},
        \"mappings\": ${MAPPING}
    }" | jq '.'

echo ""
echo -e "${GREEN}Index created successfully${NC}"

# Insert documents
echo ""
echo -e "${YELLOW}Inserting test documents...${NC}"

# Get document count
DOC_COUNT=$(cat "${DATA_FILE}" | jq '.documents | length')
echo "Found ${DOC_COUNT} documents to insert"

# Insert each document
cat "${DATA_FILE}" | jq -c '.documents[]' | while read -r doc; do
    DOC_ID=$(echo "${doc}" | jq -r '.id')
    
    # Remove id field from document before indexing (it's stored as _id)
    DOC_BODY=$(echo "${doc}" | jq 'del(.id)')
    
    # Index document
    RESPONSE=$(curl -s -X PUT "${OPENSEARCH_URL}/${INDEX_NAME}/_doc/${DOC_ID}" \
        -H "Content-Type: application/json" \
        -d "${DOC_BODY}")
    
    RESULT=$(echo "${RESPONSE}" | jq -r '.result')
    echo "  Document ${DOC_ID}: ${RESULT}"
done

# Refresh index to make documents searchable
echo ""
echo -e "${YELLOW}Refreshing index...${NC}"
curl -s -X POST "${OPENSEARCH_URL}/${INDEX_NAME}/_refresh" | jq '.'

# Verify data
echo ""
echo -e "${YELLOW}Verifying data...${NC}"

# Count documents
ACTUAL_COUNT=$(curl -s "${OPENSEARCH_URL}/${INDEX_NAME}/_count" | jq '.count')
echo -e "${GREEN}Total documents in index: ${ACTUAL_COUNT}${NC}"

# Show sample document
echo ""
echo -e "${BLUE}Sample document:${NC}"
curl -s "${OPENSEARCH_URL}/${INDEX_NAME}/_search?size=1&sort=createdAt:desc" | jq '.hits.hits[0]._source'

# Show status breakdown
echo ""
echo -e "${BLUE}Status breakdown:${NC}"
curl -s -X POST "${OPENSEARCH_URL}/${INDEX_NAME}/_search" \
    -H "Content-Type: application/json" \
    -d '{
        "size": 0,
        "aggs": {
            "status_counts": {
                "terms": {
                    "field": "status"
                }
            },
            "priority_counts": {
                "terms": {
                    "field": "priority"
                }
            }
        }
    }' | jq '{
        status: .aggregations.status_counts.buckets,
        priority: .aggregations.priority_counts.buckets
    }'

echo ""
echo -e "${GREEN}=== Test Data Created Successfully ===${NC}"
echo ""
echo -e "${BLUE}Index: ${INDEX_NAME}${NC}"
echo -e "${BLUE}Documents: ${ACTUAL_COUNT}${NC}"
echo ""
echo "You can now test the CRUD plugin with this data."
