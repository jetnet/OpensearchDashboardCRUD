# Test Data for OpenSearch Index Manager

This directory contains sample data files for testing the OpenSearch Index Manager plugin.

## File Format

All `.json` files in this directory use **NDJSON** (Newline Delimited JSON) format, which is compatible with the OpenSearch Bulk API. Each line is a separate JSON object.

## Data Files

### simple-documents.json
Flat documents with basic field types for testing simple CRUD operations.

**Fields:**
- `title` (text) - Document title
- `description` (text) - Document description
- `category` (keyword) - Document category
- `status` (keyword) - Current status
- `priority` (integer) - Priority level
- `created_at` (date) - Creation timestamp
- `updated_at` (date) - Last update timestamp
- `is_active` (boolean) - Active flag
- `tags` (keyword[]) - Array of tags

**Usage:**
```bash
./scripts/setup-test-data.sh --simple
```

### nested-documents.json
Documents with 2-3 level deep nested objects for testing nested field editing.

**Structure:**
```
{
  "name": "...",
  "email": "...",
  "profile": {
    "firstName": "...",
    "lastName": "...",
    "age": ...,
    "address": {
      "street": "...",
      "city": "...",
      "country": {
        "name": "...",
        "code": "..."
      }
    }
  },
  "employment": {
    "company": "...",
    "manager": {
      "name": "...",
      "level": ...
    }
  }
}
```

**Usage:**
```bash
./scripts/setup-test-data.sh --nested
```

### array-documents.json
Documents containing arrays of objects for testing array field editing.

**Fields with arrays:**
- `categories` (keyword[]) - Product categories
- `tags` (keyword[]) - Product tags
- `variants` (object[]) - Product variants with color, size, price, stock
- `reviews` (object[]) - User reviews with rating, comment, date
- `suppliers` (object[]) - Supplier information with nested contact details

**Usage:**
```bash
./scripts/setup-test-data.sh --arrays
```

### typed-documents.json
Documents showcasing various OpenSearch field types.

**Field Types:**
- `text_field` (text) - Full-text searchable content
- `keyword_field` (keyword) - Exact match keyword
- `integer_field` (integer) - 32-bit integer
- `long_field` (long) - 64-bit integer
- `float_field` (float) - Single precision float
- `double_field` (double) - Double precision float
- `boolean_field` (boolean) - True/false value
- `date_field` (date) - ISO 8601 timestamp
- `geo_point_field` (geo_point) - Latitude/longitude coordinates
- `ip_field` (ip) - IPv4 or IPv6 address
- `range_field` (integer_range) - Numeric range
- `binary_field` (binary) - Base64-encoded binary data
- `object_field` (object) - Nested object
- `text_with_subfields` (text with keyword subfield) - Multi-field mapping

**Usage:**
```bash
./scripts/setup-test-data.sh --types
```

## Creating Indices

All indices can be created using the setup script:

```bash
# Create all test indices
./scripts/setup-test-data.sh

# Create specific indices only
./scripts/setup-test-data.sh --simple --nested

# Clean and recreate (removes existing data)
./scripts/setup-test-data.sh -c --all
```

## Manual Import

To import data manually using curl:

```bash
# Import simple documents
curl -X POST "localhost:9200/_bulk" \
  -H "Content-Type: application/json" \
  --data-binary @test-data/simple-documents.json

# Import with specific index name
curl -X POST "localhost:9200/my-index/_bulk" \
  -H "Content-Type: application/json" \
  --data-binary @test-data/simple-documents.json
```

## Generated Indices

After running setup-test-data.sh, the following indices will be created:

| Index Name | Description | Documents |
|------------|-------------|-----------|
| `osim-simple` | Flat documents | ~12 |
| `osim-nested` | Nested objects (2-3 levels) | ~8 |
| `osim-arrays` | Arrays of objects | ~3 |
| `osim-types` | Various field types | ~5 |

## Custom Data

To create your own test data:

1. Create a new `.json` file in this directory
2. Use NDJSON format (one JSON object per line)
3. Update `scripts/setup-test-data.sh` to include your new index
4. Run the setup script

Example NDJSON format:
```ndjson
{"field1": "value1", "field2": 123}
{"field1": "value2", "field2": 456}
```

## Geo Coordinates Reference

The typed-documents.json includes coordinates for:
- New York: 40.7128, -74.0060
- London: 51.5074, -0.1278
- Tokyo: 35.6762, 139.6503
- San Francisco: 37.7749, -122.4194
- Sydney: -33.8688, 151.2093
