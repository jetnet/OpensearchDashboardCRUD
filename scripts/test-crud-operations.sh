#!/bin/bash
# Test all CRUD operations via API
# This script tests all endpoints of the CRUD plugin

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DASHBOARDS_HOST="${DASHBOARDS_HOST:-localhost}"
DASHBOARDS_PORT="${DASHBOARDS_PORT:-5601}"
BASE_URL="http://${DASHBOARDS_HOST}:${DASHBOARDS_PORT}"
API_BASE="${BASE_URL}/api/crud"

# Counters
TESTS_PASSED=0
TESTS_FAILED=0

echo -e "${BLUE}=== CRUD Plugin API Tests ===${NC}"
echo ""
echo -e "${CYAN}Testing against: ${API_BASE}${NC}"
echo ""

# Function to test an endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local expected_status=$4
    local data=$5
    
    echo -e "${YELLOW}Testing: ${description}${NC}"
    echo -e "  ${method} ${endpoint}"
    
    if [ -n "$data" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -X "${method}" "${endpoint}" \
            -H "Content-Type: application/json" \
            -H "osd-xsrf: true" \
            -d "${data}" 2>/dev/null)
    else
        RESPONSE=$(curl -s -w "\n%{http_code}" -X "${method}" "${endpoint}" \
            -H "Content-Type: application/json" \
            -H "osd-xsrf: true" 2>/dev/null)
    fi
    
    HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_STATUS" -eq "$expected_status" ]; then
        echo -e "  ${GREEN}✓ Status: ${HTTP_STATUS} (expected ${expected_status})${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        
        # Pretty print JSON response if present
        if [ -n "$BODY" ] && [ "$BODY" != "" ]; then
            echo "$BODY" | jq '.' 2>/dev/null | head -c 500
            if [ $(echo "$BODY" | wc -c) -gt 500 ]; then
                echo "... (truncated)"
            fi
        fi
    else
        echo -e "  ${RED}✗ Status: ${HTTP_STATUS} (expected ${expected_status})${NC}"
        echo "  Response: $BODY"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    echo ""
}

# Function to test that should fail (negative test)
test_endpoint_fail() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo -e "${YELLOW}Testing (negative): ${description}${NC}"
    echo -e "  ${method} ${endpoint}"
    
    if [ -n "$data" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -X "${method}" "${endpoint}" \
            -H "Content-Type: application/json" \
            -H "osd-xsrf: true" \
            -d "${data}" 2>/dev/null)
    else
        RESPONSE=$(curl -s -w "\n%{http_code}" -X "${method}" "${endpoint}" \
            -H "Content-Type: application/json" \
            -H "osd-xsrf: true" 2>/dev/null)
    fi
    
    HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_STATUS" -ge 400 ] && [ "$HTTP_STATUS" -lt 500 ]; then
        echo -e "  ${GREEN}✓ Correctly rejected with status: ${HTTP_STATUS}${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "  ${RED}✗ Unexpected status: ${HTTP_STATUS} (expected 4xx)${NC}"
        echo "  Response: $BODY"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    echo ""
}

# Check if OpenSearch Dashboards is accessible
echo -e "${YELLOW}Checking OpenSearch Dashboards connection...${NC}"
if ! curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/status" | grep -q "200"; then
    echo -e "${RED}Error: Cannot connect to OpenSearch Dashboards at ${BASE_URL}${NC}"
    echo "Make sure OpenSearch Dashboards is running with the plugin installed."
    exit 1
fi
echo -e "${GREEN}OpenSearch Dashboards is accessible${NC}"
echo ""

# ============================================
# TEST 1: CREATE Operations
# ============================================
echo -e "${BLUE}=== CREATE Operations ===${NC}"
echo ""

# Test CREATE: Single entity
test_endpoint "POST" "${API_BASE}/entities" \
    "Create single entity" 201 \
    '{
        "title": "Test Entity Created",
        "description": "This is a test entity created via API",
        "status": "active",
        "priority": "high",
        "tags": ["test", "api"],
        "category": "testing",
        "assignee": "test.user",
        "dueDate": "2026-03-15T00:00:00Z"
    }'

# Store the created entity ID for later tests
CREATED_ID=$(echo "$BODY" | jq -r '.id // .data.id // empty' 2>/dev/null)
if [ -n "$CREATED_ID" ] && [ "$CREATED_ID" != "null" ]; then
    echo -e "${CYAN}Created entity ID: ${CREATED_ID}${NC}"
    echo ""
fi

# Test CREATE: Entity with minimal fields
test_endpoint "POST" "${API_BASE}/entities" \
    "Create entity with minimal fields" 201 \
    '{
        "title": "Minimal Entity"
    }'

# Test CREATE: Validation error (missing required field)
test_endpoint_fail "POST" "${API_BASE}/entities" \
    "Create entity without title (should fail)" \
    '{
        "description": "Missing title field"
    }'

# Test CREATE: Bulk create
test_endpoint "POST" "${API_BASE}/entities/bulk" \
    "Bulk create entities" 200 \
    '{
        "entities": [
            {"title": "Bulk Entity 1", "status": "pending", "priority": "low"},
            {"title": "Bulk Entity 2", "status": "pending", "priority": "medium"},
            {"title": "Bulk Entity 3", "status": "pending", "priority": "high"}
        ]
    }'

# ============================================
# TEST 2: READ Operations
# ============================================
echo -e "${BLUE}=== READ Operations ===${NC}"
echo ""

# Test READ: List all entities
test_endpoint "GET" "${API_BASE}/entities" \
    "List all entities (default pagination)" 200

# Test READ: List with pagination
test_endpoint "GET" "${API_BASE}/entities?page=1&size=5" \
    "List entities with pagination (page=1, size=5)" 200

# Test READ: List with sorting
test_endpoint "GET" "${API_BASE}/entities?sortField=createdAt&sortOrder=desc&size=5" \
    "List entities sorted by createdAt descending" 200

# Test READ: Get by ID (if we have an ID)
if [ -n "$CREATED_ID" ] && [ "$CREATED_ID" != "null" ]; then
    test_endpoint "GET" "${API_BASE}/entities/${CREATED_ID}" \
        "Get entity by ID" 200
else
    echo -e "${YELLOW}Skipping get by ID test (no ID from create)${NC}"
    echo ""
fi

# Test READ: Get non-existent entity
test_endpoint "GET" "${API_BASE}/entities/non-existent-id-12345" \
    "Get non-existent entity" 404

# ============================================
# TEST 3: FILTERING Operations
# ============================================
echo -e "${BLUE}=== FILTERING Operations ===${NC}"
echo ""

# Test FILTER: By status
test_endpoint "GET" "${API_BASE}/entities?status=active" \
    "Filter by status=active" 200

# Test FILTER: By priority
test_endpoint "GET" "${API_BASE}/entities?priority=high" \
    "Filter by priority=high" 200

# Test FILTER: By multiple criteria
test_endpoint "GET" "${API_BASE}/entities?status=active&priority=high" \
    "Filter by status=active AND priority=high" 200

# Test FILTER: By assignee
test_endpoint "GET" "${API_BASE}/entities?assignee=john.doe" \
    "Filter by assignee" 200

# Test FILTER: By category
test_endpoint "GET" "${API_BASE}/entities?category=feature" \
    "Filter by category=feature" 200

# Test FILTER: By tags (if supported)
test_endpoint "GET" "${API_BASE}/entities?tags=security" \
    "Filter by tag=security" 200

# Test FILTER: Search query
test_endpoint "GET" "${API_BASE}/entities?search=authentication" \
    "Search for 'authentication'" 200

# Test FILTER: Combined search and filter
test_endpoint "GET" "${API_BASE}/entities?status=active&search=test" \
    "Combined filter and search" 200

# ============================================
# TEST 4: UPDATE Operations
# ============================================
echo -e "${BLUE}=== UPDATE Operations ===${NC}"
echo ""

# Test UPDATE: Update entity (if we have an ID)
if [ -n "$CREATED_ID" ] && [ "$CREATED_ID" != "null" ]; then
    test_endpoint "PUT" "${API_BASE}/entities/${CREATED_ID}" \
        "Update entity" 200 \
        '{
            "title": "Test Entity Updated",
            "description": "This entity has been updated",
            "status": "in_progress",
            "priority": "critical"
        }'
else
    echo -e "${YELLOW}Skipping update test (no ID from create)${NC}"
    echo ""
fi

# Test UPDATE: Update non-existent entity
test_endpoint "PUT" "${API_BASE}/entities/non-existent-id-12345" \
    "Update non-existent entity" 404 \
    '{
        "title": "This should fail"
    }'

# Test UPDATE: Partial update (if supported)
if [ -n "$CREATED_ID" ] && [ "$CREATED_ID" != "null" ]; then
    test_endpoint "PATCH" "${API_BASE}/entities/${CREATED_ID}" \
        "Partial update entity" 200 \
        '{
            "status": "completed"
        }'
fi

# ============================================
# TEST 5: DELETE Operations
# ============================================
echo -e "${BLUE}=== DELETE Operations ===${NC}"
echo ""

# Create an entity to delete
DELETE_TEST_RESPONSE=$(curl -s -X POST "${API_BASE}/entities" \
    -H "Content-Type: application/json" \
    -H "osd-xsrf: true" \
    -d '{"title": "Entity to Delete", "status": "pending"}')
DELETE_ID=$(echo "$DELETE_TEST_RESPONSE" | jq -r '.id // .data.id // empty' 2>/dev/null)

if [ -n "$DELETE_ID" ] && [ "$DELETE_ID" != "null" ]; then
    # Test DELETE: Delete entity
    test_endpoint "DELETE" "${API_BASE}/entities/${DELETE_ID}" \
        "Delete entity" 200
    
    # Test DELETE: Verify entity is deleted
    test_endpoint "GET" "${API_BASE}/entities/${DELETE_ID}" \
        "Verify entity is deleted" 404
else
    echo -e "${YELLOW}Skipping delete test (could not create test entity)${NC}"
    echo ""
fi

# Test DELETE: Delete non-existent entity
test_endpoint "DELETE" "${API_BASE}/entities/non-existent-id-12345" \
    "Delete non-existent entity" 404

# Test DELETE: Bulk delete
test_endpoint "POST" "${API_BASE}/entities/bulk-delete" \
    "Bulk delete entities" 200 \
    '{
        "ids": ["bulk-delete-test-1", "bulk-delete-test-2"]
    }'

# ============================================
# TEST 6: BULK Operations
# ============================================
echo -e "${BLUE}=== BULK Operations ===${NC}"
echo ""

# Test BULK: Bulk update
test_endpoint "POST" "${API_BASE}/entities/bulk-update" \
    "Bulk update entities" 200 \
    '{
        "ids": ["entity-001", "entity-002"],
        "updates": {
            "status": "review"
        }
    }'

# Test BULK: Bulk status change
test_endpoint "POST" "${API_BASE}/entities/bulk-status" \
    "Bulk status change" 200 \
    '{
        "ids": ["entity-003", "entity-004"],
        "status": "archived"
    }'

# ============================================
# TEST 7: STATISTICS Operations
# ============================================
echo -e "${BLUE}=== STATISTICS Operations ===${NC}"
echo ""

# Test STATS: Get entity statistics
test_endpoint "GET" "${API_BASE}/entities/stats" \
    "Get entity statistics" 200

# Test STATS: Get counts by status
test_endpoint "GET" "${API_BASE}/entities/stats/by-status" \
    "Get counts by status" 200

# Test STATS: Get counts by priority
test_endpoint "GET" "${API_BASE}/entities/stats/by-priority" \
    "Get counts by priority" 200

# ============================================
# TEST 8: EDGE CASES
# ============================================
echo -e "${BLUE}=== EDGE CASES ===${NC}"
echo ""

# Test: Empty results
test_endpoint "GET" "${API_BASE}/entities?search=zzzzzzzzzzzzzz" \
    "Search with no results" 200

# Test: Invalid page number
test_endpoint "GET" "${API_BASE}/entities?page=-1" \
    "Invalid page number" 400

# Test: Invalid page size
test_endpoint "GET" "${API_BASE}/entities?size=10000" \
    "Page size too large" 400

# Test: Invalid sort field
test_endpoint "GET" "${API_BASE}/entities?sortField=invalid_field" \
    "Invalid sort field" 400

# Test: Invalid status value
test_endpoint_fail "POST" "${API_BASE}/entities" \
    "Create with invalid status" \
    '{
        "title": "Test",
        "status": "invalid_status_value"
    }'

# Test: Invalid priority value
test_endpoint_fail "POST" "${API_BASE}/entities" \
    "Create with invalid priority" \
    '{
        "title": "Test",
        "priority": "invalid_priority_value"
    }'

# ============================================
# TEST SUMMARY
# ============================================
echo -e "${BLUE}=== Test Summary ===${NC}"
echo ""
echo -e "${GREEN}Passed: ${TESTS_PASSED}${NC}"
echo -e "${RED}Failed: ${TESTS_FAILED}${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Please check the output above.${NC}"
    exit 1
fi
