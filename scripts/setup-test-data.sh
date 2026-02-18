#!/bin/bash
#
# Create test indices with sample data for the OpenSearch Index Manager plugin
#
# Usage: ./scripts/setup-test-data.sh [options]
#   Options:
#     -c, --clean      Delete existing indices before creating
#     -a, --all        Create all test indices
#     --simple         Create only simple flat documents index
#     --nested         Create only nested objects index
#     --arrays         Create only arrays of objects index
#     --types          Create only various field types index
#     -h, --help       Show help
#
# Examples:
#   ./scripts/setup-test-data.sh              # Create all test indices
#   ./scripts/setup-test-data.sh -c           # Clean and create all
#   ./scripts/setup-test-data.sh --nested     # Create only nested index

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TEST_DATA_DIR="$PROJECT_ROOT/test-data"

OPENSEARCH_URL="${OPENSEARCH_URL:-http://localhost:9200}"
CLEAN=false
CREATE_SIMPLE=false
CREATE_NESTED=false
CREATE_ARRAYS=false
CREATE_TYPES=false

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# Show help
show_help() {
    cat << 'EOF'
Usage: ./scripts/setup-test-data.sh [options]

Options:
  -c, --clean      Delete existing indices before creating
  -a, --all        Create all test indices (default)
  --simple         Create only simple flat documents index
  --nested         Create only nested objects index
  --arrays         Create only arrays of objects index
  --types          Create only various field types index
  -h, --help       Show this help message

Environment Variables:
  OPENSEARCH_URL   OpenSearch URL (default: http://localhost:9200)

Examples:
  ./scripts/setup-test-data.sh              # Create all test indices
  ./scripts/setup-test-data.sh -c           # Clean and create all
  ./scripts/setup-test-data.sh --nested     # Create only nested index
EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -c|--clean)
            CLEAN=true
            shift
            ;;
        -a|--all)
            CREATE_SIMPLE=true
            CREATE_NESTED=true
            CREATE_ARRAYS=true
            CREATE_TYPES=true
            shift
            ;;
        --simple)
            CREATE_SIMPLE=true
            shift
            ;;
        --nested)
            CREATE_NESTED=true
            shift
            ;;
        --arrays)
            CREATE_ARRAYS=true
            shift
            ;;
        --types)
            CREATE_TYPES=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Default to all if none specified
if [ "$CREATE_SIMPLE" = false ] && [ "$CREATE_NESTED" = false ] && [ "$CREATE_ARRAYS" = false ] && [ "$CREATE_TYPES" = false ]; then
    CREATE_SIMPLE=true
    CREATE_NESTED=true
    CREATE_ARRAYS=true
    CREATE_TYPES=true
fi

# Check if OpenSearch is available
check_opensearch() {
    log_step "Checking OpenSearch connection..."
    if ! curl -s "$OPENSEARCH_URL" > /dev/null 2>&1; then
        log_error "Cannot connect to OpenSearch at $OPENSEARCH_URL"
        log_info "Make sure OpenSearch is running: ./scripts/start-local.sh"
        exit 1
    fi
    
    local version=$(curl -s "$OPENSEARCH_URL" | grep -o '"number" : "[^"]*"' | cut -d'"' -f4)
    log_info "Connected to OpenSearch version: $version"
}

# Delete index if exists
delete_index() {
    local index=$1
    if curl -s "$OPENSEARCH_URL/$index" > /dev/null 2>&1; then
        log_warn "Deleting existing index: $index"
        curl -s -X DELETE "$OPENSEARCH_URL/$index" > /dev/null
        sleep 1
    fi
}

# Create index with mapping
create_index() {
    local index=$1
    local mapping=$2
    
    log_step "Creating index: $index"
    
    if [ "$CLEAN" = true ]; then
        delete_index "$index"
    fi
    
    curl -s -X PUT "$OPENSEARCH_URL/$index" \
        -H 'Content-Type: application/json' \
        -d "$mapping" > /dev/null
    
    log_info "Index created: $index"
}

# Index documents from JSON file
index_documents() {
    local index=$1
    local file=$2
    
    log_step "Indexing documents from $file..."
    
    # Use bulk API
    local bulk_data=""
    while IFS= read -r line; do
        bulk_data+='{"index":{"_index":"'$index'"}}'$'\n'
        bulk_data+="$line"$'\n'
    done < "$file"
    
    local response=$(curl -s -X POST "$OPENSEARCH_URL/_bulk" \
        -H 'Content-Type: application/json' \
        -d "$bulk_data")
    
    local count=$(echo "$response" | grep -o '"_id"' | wc -l)
    log_info "Indexed $count documents into $index"
}

# Create osim-simple index
create_simple_index() {
    local index="osim-simple"
    local mapping='{
        "mappings": {
            "properties": {
                "title": { "type": "text" },
                "description": { "type": "text" },
                "category": { "type": "keyword" },
                "status": { "type": "keyword" },
                "priority": { "type": "integer" },
                "created_at": { "type": "date" },
                "updated_at": { "type": "date" },
                "is_active": { "type": "boolean" },
                "tags": { "type": "keyword" }
            }
        },
        "settings": {
            "number_of_shards": 1,
            "number_of_replicas": 0
        }
    }'
    
    create_index "$index" "$mapping"
    
    if [ -f "$TEST_DATA_DIR/simple-documents.json" ]; then
        index_documents "$index" "$TEST_DATA_DIR/simple-documents.json"
    else
        # Generate sample data inline
        log_info "Generating sample data for $index..."
        cat > /tmp/simple-docs.json << 'EOF'
{"title": "First Document", "description": "This is the first test document", "category": "general", "status": "active", "priority": 1, "created_at": "2024-01-15T10:00:00Z", "updated_at": "2024-01-15T12:00:00Z", "is_active": true, "tags": ["test", "sample"]}
{"title": "Second Document", "description": "Another test document for the system", "category": "technical", "status": "pending", "priority": 2, "created_at": "2024-01-16T09:30:00Z", "updated_at": "2024-01-16T09:30:00Z", "is_active": true, "tags": ["tech", "important"]}
{"title": "Project Alpha", "description": "Overview of Project Alpha implementation", "category": "project", "status": "active", "priority": 5, "created_at": "2024-01-10T08:00:00Z", "updated_at": "2024-01-20T15:30:00Z", "is_active": true, "tags": ["project", "alpha", "priority"]}
{"title": "Bug Report #123", "description": "Critical bug found in production", "category": "bug", "status": "urgent", "priority": 10, "created_at": "2024-01-21T14:00:00Z", "updated_at": "2024-01-21T14:30:00Z", "is_active": true, "tags": ["bug", "critical", "production"]}
{"title": "Feature Request", "description": "Request for new dashboard feature", "category": "feature", "status": "backlog", "priority": 3, "created_at": "2024-01-18T11:00:00Z", "updated_at": "2024-01-18T11:00:00Z", "is_active": false, "tags": ["feature", "enhancement"]}
{"title": "Documentation Update", "description": "Update API documentation", "category": "docs", "status": "active", "priority": 2, "created_at": "2024-01-22T10:00:00Z", "updated_at": "2024-01-22T10:00:00Z", "is_active": true, "tags": ["docs", "api"]}
{"title": "Performance Review", "description": "Q1 2024 performance analysis", "category": "analytics", "status": "completed", "priority": 4, "created_at": "2024-01-05T09:00:00Z", "updated_at": "2024-01-25T16:00:00Z", "is_active": true, "tags": ["analytics", "performance", "q1"]}
{"title": "Security Audit", "description": "Annual security audit results", "category": "security", "status": "active", "priority": 8, "created_at": "2024-01-12T13:00:00Z", "updated_at": "2024-01-26T11:00:00Z", "is_active": true, "tags": ["security", "audit", "annual"]}
{"title": "User Feedback", "description": "Collection of user feedback from January", "category": "feedback", "status": "review", "priority": 3, "created_at": "2024-01-28T10:00:00Z", "updated_at": "2024-01-28T10:00:00Z", "is_active": true, "tags": ["feedback", "users", "january"]}
{"title": "Deployment Notes", "description": "Notes for upcoming deployment", "category": "deployment", "status": "draft", "priority": 6, "created_at": "2024-01-30T08:00:00Z", "updated_at": "2024-01-30T08:00:00Z", "is_active": false, "tags": ["deployment", "notes", "upcoming"]}
EOF
        index_documents "$index" "/tmp/simple-docs.json"
        rm -f /tmp/simple-docs.json
    fi
}

# Create osim-nested index
create_nested_index() {
    local index="osim-nested"
    local mapping='{
        "mappings": {
            "properties": {
                "name": { "type": "text" },
                "email": { "type": "keyword" },
                "profile": {
                    "properties": {
                        "firstName": { "type": "text" },
                        "lastName": { "type": "text" },
                        "age": { "type": "integer" },
                        "address": {
                            "properties": {
                                "street": { "type": "text" },
                                "city": { "type": "keyword" },
                                "zipCode": { "type": "keyword" },
                                "country": {
                                    "properties": {
                                        "name": { "type": "keyword" },
                                        "code": { "type": "keyword" }
                                    }
                                }
                            }
                        }
                    }
                },
                "employment": {
                    "properties": {
                        "company": { "type": "text" },
                        "department": { "type": "keyword" },
                        "position": { "type": "text" },
                        "manager": {
                            "properties": {
                                "name": { "type": "text" },
                                "email": { "type": "keyword" },
                                "level": { "type": "integer" }
                            }
                        }
                    }
                },
                "created_at": { "type": "date" }
            }
        },
        "settings": {
            "number_of_shards": 1,
            "number_of_replicas": 0
        }
    }'
    
    create_index "$index" "$mapping"
    
    if [ -f "$TEST_DATA_DIR/nested-documents.json" ]; then
        index_documents "$index" "$TEST_DATA_DIR/nested-documents.json"
    else
        log_info "Generating nested sample data for $index..."
        cat > /tmp/nested-docs.json << 'EOF'
{"name": "John Doe", "email": "john.doe@example.com", "profile": {"firstName": "John", "lastName": "Doe", "age": 32, "address": {"street": "123 Main St", "city": "New York", "zipCode": "10001", "country": {"name": "United States", "code": "US"}}}, "employment": {"company": "Tech Corp", "department": "Engineering", "position": "Senior Developer", "manager": {"name": "Jane Smith", "email": "jane.smith@techcorp.com", "level": 3}}, "created_at": "2024-01-15T10:00:00Z"}
{"name": "Alice Johnson", "email": "alice.j@example.com", "profile": {"firstName": "Alice", "lastName": "Johnson", "age": 28, "address": {"street": "456 Oak Ave", "city": "San Francisco", "zipCode": "94102", "country": {"name": "United States", "code": "US"}}}, "employment": {"company": "Startup Inc", "department": "Product", "position": "Product Manager", "manager": {"name": "Bob Wilson", "email": "bob@startup.com", "level": 4}}, "created_at": "2024-01-16T11:30:00Z"}
{"name": "Carlos Rodriguez", "email": "carlos.r@example.com", "profile": {"firstName": "Carlos", "lastName": "Rodriguez", "age": 35, "address": {"street": "789 Pine Rd", "city": "Miami", "zipCode": "33101", "country": {"name": "United States", "code": "US"}}}, "employment": {"company": "Global Systems", "department": "Operations", "position": "Operations Lead", "manager": {"name": "Maria Garcia", "email": "maria@global.com", "level": 5}}, "created_at": "2024-01-17T09:00:00Z"}
{"name": "Sophie Martin", "email": "sophie.m@example.com", "profile": {"firstName": "Sophie", "lastName": "Martin", "age": 29, "address": {"street": "321 Rue de Paris", "city": "Paris", "zipCode": "75001", "country": {"name": "France", "code": "FR"}}}, "employment": {"company": "European Tech", "department": "Design", "position": "UX Designer", "manager": {"name": "Pierre Dubois", "email": "pierre@eutech.com", "level": 3}}, "created_at": "2024-01-18T14:00:00Z"}
{"name": "Yuki Tanaka", "email": "yuki.t@example.com", "profile": {"firstName": "Yuki", "lastName": "Tanaka", "age": 31, "address": {"street": "1-2-3 Shibuya", "city": "Tokyo", "zipCode": "150-0002", "country": {"name": "Japan", "code": "JP"}}}, "employment": {"company": "Asia Digital", "department": "Engineering", "position": "DevOps Engineer", "manager": {"name": "Kenji Sato", "email": "kenji@asiadigital.com", "level": 4}}, "created_at": "2024-01-19T08:30:00Z"}
EOF
        index_documents "$index" "/tmp/nested-docs.json"
        rm -f /tmp/nested-docs.json
    fi
}

# Create osim-arrays index
create_arrays_index() {
    local index="osim-arrays"
    local mapping='{
        "mappings": {
            "properties": {
                "product_name": { "type": "text" },
                "sku": { "type": "keyword" },
                "categories": { "type": "keyword" },
                "tags": { "type": "keyword" },
                "variants": {
                    "properties": {
                        "color": { "type": "keyword" },
                        "size": { "type": "keyword" },
                        "price": { "type": "float" },
                        "stock": { "type": "integer" }
                    }
                },
                "reviews": {
                    "properties": {
                        "user": { "type": "keyword" },
                        "rating": { "type": "integer" },
                        "comment": { "type": "text" },
                        "date": { "type": "date" }
                    }
                },
                "suppliers": {
                    "properties": {
                        "name": { "type": "text" },
                        "contact": {
                            "properties": {
                                "email": { "type": "keyword" },
                                "phone": { "type": "keyword" }
                            }
                        }
                    }
                },
                "created_at": { "type": "date" }
            }
        },
        "settings": {
            "number_of_shards": 1,
            "number_of_replicas": 0
        }
    }'
    
    create_index "$index" "$mapping"
    
    if [ -f "$TEST_DATA_DIR/array-documents.json" ]; then
        index_documents "$index" "$TEST_DATA_DIR/array-documents.json"
    else
        log_info "Generating array sample data for $index..."
        cat > /tmp/array-docs.json << 'EOF'
{"product_name": "Wireless Headphones", "sku": "WH-001", "categories": ["Electronics", "Audio", "Wireless"], "tags": ["bluetooth", "noise-cancelling", "premium"], "variants": [{"color": "Black", "size": "One Size", "price": 199.99, "stock": 50}, {"color": "Silver", "size": "One Size", "price": 199.99, "stock": 30}, {"color": "Blue", "size": "One Size", "price": 209.99, "stock": 20}], "reviews": [{"user": "user123", "rating": 5, "comment": "Great sound quality!", "date": "2024-01-10T10:00:00Z"}, {"user": "user456", "rating": 4, "comment": "Good but pricey", "date": "2024-01-12T14:30:00Z"}], "suppliers": [{"name": "AudioTech Inc", "contact": {"email": "orders@audiotech.com", "phone": "+1-555-0101"}}, {"name": "SoundSystems Ltd", "contact": {"email": "sales@soundsystems.com", "phone": "+1-555-0102"}}], "created_at": "2024-01-15T08:00:00Z"}
{"product_name": "Smart Watch Pro", "sku": "SW-PRO-002", "categories": ["Electronics", "Wearables", "Fitness"], "tags": ["smartwatch", "fitness", "gps", "waterproof"], "variants": [{"color": "Space Gray", "size": "42mm", "price": 399.99, "stock": 100}, {"color": "Rose Gold", "size": "38mm", "price": 379.99, "stock": 75}, {"color": "Silver", "size": "42mm", "price": 399.99, "stock": 60}], "reviews": [{"user": "fitness_fan", "rating": 5, "comment": "Best fitness tracker ever!", "date": "2024-01-08T09:00:00Z"}, {"user": "tech_guru", "rating": 5, "comment": "Amazing features", "date": "2024-01-11T16:00:00Z"}, {"user": "casual_user", "rating": 4, "comment": "Great but battery could last longer", "date": "2024-01-14T11:00:00Z"}], "suppliers": [{"name": "TechWear Co", "contact": {"email": "support@techwear.com", "phone": "+1-555-0201"}}], "created_at": "2024-01-16T10:30:00Z"}
{"product_name": "Ergonomic Office Chair", "sku": "CHAIR-ERG-003", "categories": ["Furniture", "Office", "Ergonomic"], "tags": ["ergonomic", "office", "comfortable", "adjustable"], "variants": [{"color": "Black", "size": "Standard", "price": 449.99, "stock": 25}, {"color": "Gray", "size": "Standard", "price": 449.99, "stock": 20}, {"color": "Black", "size": "Tall", "price": 499.99, "stock": 15}], "reviews": [{"user": "office_worker", "rating": 5, "comment": "Saved my back!", "date": "2024-01-05T13:00:00Z"}, {"user": "home_office", "rating": 4, "comment": "Very comfortable", "date": "2024-01-09T15:00:00Z"}], "suppliers": [{"name": "ComfortSeating", "contact": {"email": "orders@comfortseating.com", "phone": "+1-555-0301"}}, {"name": "ErgoFurniture Ltd", "contact": {"email": "sales@ergofurniture.com", "phone": "+1-555-0302"}}, {"name": "OfficePlus", "contact": {"email": "buy@officeplus.com", "phone": "+1-555-0303"}}], "created_at": "2024-01-17T11:00:00Z"}
EOF
        index_documents "$index" "/tmp/array-docs.json"
        rm -f /tmp/array-docs.json
    fi
}

# Create osim-types index with various field types
create_types_index() {
    local index="osim-types"
    local mapping='{
        "mappings": {
            "properties": {
                "text_field": { "type": "text" },
                "keyword_field": { "type": "keyword" },
                "integer_field": { "type": "integer" },
                "long_field": { "type": "long" },
                "float_field": { "type": "float" },
                "double_field": { "type": "double" },
                "boolean_field": { "type": "boolean" },
                "date_field": { "type": "date" },
                "geo_point_field": { "type": "geo_point" },
                "ip_field": { "type": "ip" },
                "range_field": { "type": "integer_range" },
                "binary_field": { "type": "binary" },
                "object_field": {
                    "properties": {
                        "nested_text": { "type": "text" },
                        "nested_number": { "type": "float" }
                    }
                },
                "text_with_subfields": {
                    "type": "text",
                    "fields": {
                        "keyword": { "type": "keyword" },
                        "english": { "type": "text", "analyzer": "english" }
                    }
                }
            }
        },
        "settings": {
            "number_of_shards": 1,
            "number_of_replicas": 0
        }
    }'
    
    create_index "$index" "$mapping"
    
    if [ -f "$TEST_DATA_DIR/typed-documents.json" ]; then
        index_documents "$index" "$TEST_DATA_DIR/typed-documents.json"
    else
        log_info "Generating typed sample data for $index..."
        cat > /tmp/typed-docs.json << 'EOF'
{"text_field": "This is a long text field that can be searched and analyzed. It supports full-text search capabilities.", "keyword_field": "exact-match-keyword", "integer_field": 42, "long_field": 9223372036854775807, "float_field": 3.14159, "double_field": 2.718281828459045, "boolean_field": true, "date_field": "2024-01-15T10:30:00Z", "geo_point_field": {"lat": 40.7128, "lon": -74.006}, "ip_field": "192.168.1.100", "range_field": {"gte": 10, "lte": 100}, "binary_field": "U29tZSBiaW5hcnkgZGF0YQ==", "object_field": {"nested_text": "Nested text value", "nested_number": 123.456}, "text_with_subfields": "Sample text with multiple analyzers"}
{"text_field": "Another example of text content for testing various field types and their behaviors in OpenSearch.", "keyword_field": "ANOTHER_KEYWORD", "integer_field": -100, "long_field": -9999999999, "float_field": -1.5, "double_field": 1.414213562, "boolean_field": false, "date_field": "2024-06-20T15:45:30Z", "geo_point_field": {"lat": 51.5074, "lon": -0.1278}, "ip_field": "10.0.0.1", "range_field": {"gte": 1, "lte": 50}, "binary_field": "QmluYXJ5IGNvbnRlbnQ=", "object_field": {"nested_text": "Another nested value", "nested_number": 789.012}, "text_with_subfields": "English language text content for analysis"}
{"text_field": "Sample document demonstrating the variety of field types available in OpenSearch mappings.", "keyword_field": "lowercase-keyword", "integer_field": 0, "long_field": 0, "float_field": 0.0, "double_field": 0.0, "boolean_field": true, "date_field": "2023-12-25T00:00:00Z", "geo_point_field": {"lat": 35.6762, "lon": 139.6503}, "ip_field": "2001:0db8:85a3:0000:0000:8a2e:0370:7334", "range_field": {"gte": 1000, "lte": 9999}, "binary_field": "SGVsbG8gV29ybGQh", "object_field": {"nested_text": "Third nested example", "nested_number": 999.999}, "text_with_subfields": "Multi-field text example with keyword backup"}
EOF
        index_documents "$index" "/tmp/typed-docs.json"
        rm -f /tmp/typed-docs.json
    fi
}

# Main
main() {
    log_info "=============================================="
    log_info "OpenSearch Index Manager - Test Data Setup"
    log_info "=============================================="
    log_info "OpenSearch URL: $OPENSEARCH_URL"
    echo ""
    
    check_opensearch
    
    # Create indices based on flags
    if [ "$CREATE_SIMPLE" = true ]; then
        echo ""
        create_simple_index
    fi
    
    if [ "$CREATE_NESTED" = true ]; then
        echo ""
        create_nested_index
    fi
    
    if [ "$CREATE_ARRAYS" = true ]; then
        echo ""
        create_arrays_index
    fi
    
    if [ "$CREATE_TYPES" = true ]; then
        echo ""
        create_types_index
    fi
    
    # Summary
    echo ""
    log_info "=============================================="
    log_info "Test Data Setup Complete!"
    log_info "=============================================="
    log_info "Created indices:"
    [ "$CREATE_SIMPLE" = true ] && log_info "  - osim-simple    (Flat documents)"
    [ "$CREATE_NESTED" = true ] && log_info "  - osim-nested    (Nested objects, 2-3 levels)"
    [ "$CREATE_ARRAYS" = true ] && log_info "  - osim-arrays    (Arrays of objects)"
    [ "$CREATE_TYPES" = true ] && log_info "  - osim-types     (Various field types)"
    echo ""
    log_info "View indices:"
    log_info "  curl $OPENSEARCH_URL/_cat/indices?v"
    log_info "View mappings:"
    log_info "  curl $OPENSEARCH_URL/osim-*/_mapping"
    log_info "=============================================="
}

main "$@"
