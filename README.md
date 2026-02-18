# OpenSearch Dashboards CRUD Plugin

[![CI](https://github.com/jetnet/OpensearchDashboardCRUD/workflows/CI/badge.svg)](https://github.com/jetnet/OpensearchDashboardCRUD/actions/workflows/ci.yml)
[![Release](https://github.com/jetnet/OpensearchDashboardCRUD/workflows/Release/badge.svg)](https://github.com/jetnet/OpensearchDashboardCRUD/actions/workflows/release.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/jetnet/OpensearchDashboardCRUD/releases)

A feature-rich CRUD (Create, Read, Update, Delete) plugin for OpenSearch Dashboards with comprehensive entity management capabilities.

## Overview

The OpenSearch Dashboards CRUD Plugin provides a complete solution for managing entities within OpenSearch Dashboards. It offers a modern, responsive user interface built with OpenSearch Design System (OUI) components and a robust backend API for data persistence in OpenSearch clusters.

## Features

- **Full CRUD Operations**: Create, Read, Update, and Delete entities with a intuitive user interface
- **Server-side Pagination**: Efficient handling of large datasets with configurable page sizes
- **Complex Filtering**: Multi-field filtering with various operators including:
  - Equality operators (`eq`, `neq`)
  - Comparison operators (`gt`, `gte`, `lt`, `lte`)
  - String operators (`contains`, `startsWith`, `endsWith`)
  - Array operators (`in`, `notIn`)
  - Range operators (`between`)
  - Existence operators (`exists`, `notExists`)
- **Multi-column Sorting**: Sort by multiple columns simultaneously with priority ordering
- **Input Validation**: Comprehensive client-side and server-side validation with TypeScript strict typing
- **Bulk Entity Management**: Perform bulk create, update, and delete operations
- **OpenSearch Design System UI**: Modern, responsive interface using OUI components
- **Security Integration**: Optional integration with OpenSearch Security plugin

## Requirements

| Requirement | Version |
|-------------|---------|
| OpenSearch Dashboards | 2.x or higher |
| OpenSearch Cluster | 2.x or higher |
| Node.js | 14.x or higher |
| Yarn | 1.21.1 or higher |

## Installation

### From Release (Recommended)

1. Install the plugin directly from GitHub releases:

```bash
# Navigate to your OpenSearch Dashboards installation directory
cd /path/to/opensearch-dashboards

# Install the plugin from GitHub release
./bin/opensearch-dashboards-plugin install https://github.com/jetnet/OpensearchDashboardCRUD/releases/download/v1.0.0/opensearch-crud-plugin-1.0.0.zip
```

2. Restart OpenSearch Dashboards:

```bash
./bin/opensearch-dashboards
```

Alternatively, download the release zip and install locally:

```bash
# Download from https://github.com/jetnet/OpensearchDashboardCRUD/releases
./bin/opensearch-dashboards-plugin install file:///path/to/opensearch-crud-plugin-1.0.0.zip
```

### From Source (Requires OSD Source Tree)

> **Important**: OpenSearch Dashboards plugins require the OSD source tree for building because they depend on internal OSD types, build tools, and the plugin platform. You cannot build a standalone plugin without the OSD source code.

#### Option 1: Automated Build Script

We provide a build script that handles everything for you:

```bash
# Clone this repository
git clone https://github.com/jetnet/OpensearchDashboardCRUD.git
cd OpensearchDashboardCRUD

# Run the build script (this will clone OSD and build the plugin)
./scripts/build-with-osd.sh 2.11.0 1.0.0
```

The script will:
1. Clone OpenSearch Dashboards source (version specified)
2. Copy the plugin to the OSD plugins directory
3. Bootstrap OSD dependencies
4. Build and package the plugin
5. Output the zip file to `build/releases/`

#### Option 2: Manual Build

1. Clone OpenSearch Dashboards source:

```bash
git clone --depth 1 --branch v2.11.0 https://github.com/opensearch-project/OpenSearch-Dashboards.git
cd OpenSearch-Dashboards
```

2. Bootstrap OSD:

```bash
yarn osd bootstrap
```

3. Clone this plugin into the plugins directory:

```bash
cd plugins
git clone https://github.com/jetnet/OpensearchDashboardCRUD.git crudPlugin
cd crudPlugin/opensearch-crud-plugin
```

4. Build the plugin:

```bash
yarn build
```

5. Package the plugin:

```bash
yarn plugin-helpers pack
# The zip will be in the current directory
```

#### Option 3: Development Mode with Docker

For development and testing, use the provided Docker setup:

```bash
# Clone the repository
git clone https://github.com/jetnet/OpensearchDashboardCRUD.git
cd OpensearchDashboardCRUD

# Start OpenSearch and OpenSearch Dashboards containers
./scripts/start-containers.sh

# Install the plugin in development mode
./scripts/install-plugin-dev.sh

# The plugin will be available at http://localhost:5601
```

## Configuration

Add the following configuration options to your `opensearch_dashboards.yml` file:

```yaml
# crudPlugin settings
crudPlugin:
  # Index configuration
  index:
    name: '.crud_entities'
    numberOfShards: 1
    numberOfReplicas: 0
  
  # Pagination defaults
  pagination:
    defaultPageSize: 25
    maxPageSize: 500
    pageSizeOptions: [10, 25, 50, 100]
  
  # Filtering configuration
  filtering:
    maxFilters: 10
    debounceMs: 300
  
  # Sorting configuration
  sorting:
    maxSortFields: 3
    defaultSortDirection: 'asc'
  
  # Bulk operations
  bulk:
    maxBulkSize: 100
    enableBulkCreate: true
    enableBulkUpdate: true
    enableBulkDelete: true
  
  # Security settings
  security:
    enableAuditLog: true
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `index.name` | string | `.crud_entities` | OpenSearch index name for storing entities |
| `index.numberOfShards` | number | 1 | Number of primary shards |
| `index.numberOfReplicas` | number | 0 | Number of replica shards |
| `pagination.defaultPageSize` | number | 25 | Default number of items per page |
| `pagination.maxPageSize` | number | 500 | Maximum allowed page size |
| `filtering.maxFilters` | number | 10 | Maximum number of active filters |
| `filtering.debounceMs` | number | 300 | Debounce delay for filter changes (ms) |
| `sorting.maxSortFields` | number | 3 | Maximum number of sort fields |
| `bulk.maxBulkSize` | number | 100 | Maximum items per bulk operation |
| `security.enableAuditLog` | boolean | true | Enable audit logging for operations |

## Usage

### Accessing the Plugin

After installation, the CRUD plugin is accessible from the OpenSearch Dashboards navigation menu:

1. Open OpenSearch Dashboards in your browser
2. Click on the navigation menu (hamburger icon)
3. Select "CRUD Entities" from the plugin list

### Basic Operations

#### Creating an Entity

1. Click the "Create Entity" button in the toolbar
2. Fill in the required fields in the form
3. Click "Save" to create the entity

#### Editing an Entity

1. Click on the entity row or the edit icon
2. Modify the fields in the form
3. Click "Save" to update the entity

#### Deleting an Entity

1. Select the entity by clicking its row
2. Click the delete icon or "Delete" button
3. Confirm the deletion in the dialog

#### Bulk Operations

1. Select multiple entities using checkboxes
2. Use the bulk action bar to create, update, or delete
3. Confirm the operation in the dialog

### Filtering and Sorting

#### Adding Filters

1. Click the "Add Filter" button in the filter bar
2. Select a field, operator, and value
3. Click "Apply" to activate the filter

#### Available Filter Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equals | `status eq 'active'` |
| `neq` | Not equals | `status neq 'archived'` |
| `gt` | Greater than | `price gt 100` |
| `gte` | Greater than or equal | `price gte 100` |
| `lt` | Less than | `price lt 500` |
| `lte` | Less than or equal | `price lte 500` |
| `contains` | Contains substring | `name contains 'test'` |
| `startsWith` | Starts with | `name startsWith 'abc'` |
| `endsWith` | Ends with | `name endsWith 'xyz'` |
| `in` | In list | `status in ['active', 'pending']` |
| `notIn` | Not in list | `status notIn ['deleted']` |
| `between` | Between values | `created between ['2024-01-01', '2024-12-31']` |
| `exists` | Field exists | `email exists` |
| `notExists` | Field does not exist | `deletedAt notExists` |

#### Multi-column Sorting

1. Click on a column header to sort by that column
2. Hold Shift and click another column to add secondary sorting
3. Sort priority is indicated by numbered badges

## API Reference

### Entity Endpoints

#### GET /api/crud/entities

List entities with pagination, filtering, and sorting.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (1-indexed) |
| `pageSize` | number | Items per page |
| `sort` | string | Sort field and direction (e.g., `name:asc,created:desc`) |
| `filters` | JSON string | Array of filter objects |

**Example Request:**

```http
GET /api/crud/entities?page=1&pageSize=25&sort=name:asc&filters=[{"field":"status","operator":"eq","value":"active"}]
```

**Response:**

```json
{
  "entities": [
    {
      "id": "abc123",
      "version": 1,
      "attributes": {
        "name": "Example Entity",
        "description": "A sample entity",
        "status": "active",
        "tags": ["example", "sample"]
      },
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 25,
  "hasMore": true
}
```

#### GET /api/crud/entities/:id

Retrieve a single entity by ID.

**Example Request:**

```http
GET /api/crud/entities/abc123
```

**Response:**

```json
{
  "id": "abc123",
  "version": 1,
  "attributes": {
    "name": "Example Entity",
    "description": "A sample entity",
    "status": "active",
    "tags": ["example", "sample"]
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

#### POST /api/crud/entities

Create a new entity.

**Request Body:**

```json
{
  "attributes": {
    "name": "New Entity",
    "description": "A new entity description",
    "status": "active",
    "tags": ["new", "created"]
  }
}
```

**Response:**

```json
{
  "id": "def456",
  "version": 1,
  "attributes": {
    "name": "New Entity",
    "description": "A new entity description",
    "status": "active",
    "tags": ["new", "created"]
  },
  "created_at": "2024-01-15T11:00:00Z"
}
```

#### PUT /api/crud/entities/:id

Update an existing entity.

**Request Body:**

```json
{
  "attributes": {
    "name": "Updated Entity",
    "description": "Updated description",
    "status": "inactive"
  },
  "version": 1
}
```

**Response:**

```json
{
  "id": "abc123",
  "version": 2,
  "attributes": {
    "name": "Updated Entity",
    "description": "Updated description",
    "status": "inactive",
    "tags": ["example", "sample"]
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T11:30:00Z"
}
```

#### DELETE /api/crud/entities/:id

Delete an entity by ID.

**Response:** HTTP 204 No Content

### Bulk Endpoints

#### POST /api/crud/bulk/create

Create multiple entities in a single request.

**Request Body:**

```json
{
  "entities": [
    {
      "attributes": {
        "name": "Entity 1",
        "status": "active"
      }
    },
    {
      "attributes": {
        "name": "Entity 2",
        "status": "active"
      }
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "created": [
    { "id": "ent1", "status": "created" },
    { "id": "ent2", "status": "created" }
  ],
  "failed": [],
  "totalCreated": 2,
  "totalFailed": 0
}
```

#### POST /api/crud/bulk/update

Update multiple entities in a single request.

**Request Body:**

```json
{
  "updates": [
    {
      "id": "ent1",
      "attributes": {
        "status": "inactive"
      }
    },
    {
      "id": "ent2",
      "attributes": {
        "status": "inactive"
      }
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "updated": [
    { "id": "ent1", "status": "updated" },
    { "id": "ent2", "status": "updated" }
  ],
  "failed": [],
  "totalUpdated": 2,
  "totalFailed": 0
}
```

#### POST /api/crud/bulk/delete

Delete multiple entities in a single request.

**Request Body:**

```json
{
  "ids": ["ent1", "ent2", "ent3"]
}
```

**Response:**

```json
{
  "success": true,
  "deleted": ["ent1", "ent2", "ent3"],
  "failed": [],
  "totalDeleted": 3,
  "totalFailed": 0
}
```

### Error Responses

All endpoints return consistent error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "fields": [
        {
          "field": "name",
          "message": "Name is required"
        }
      ]
    }
  },
  "statusCode": 400
}
```

**Error Codes:**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `NOT_FOUND` | 404 | Entity not found |
| `CONFLICT` | 409 | Version conflict (optimistic locking) |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `RATE_LIMITED` | 429 | Too many requests |

## Development

### Prerequisites

- Node.js 16.x or higher
- Yarn 1.22.x or higher
- Docker and Docker Compose (for containerized development)
- OpenSearch Dashboards source code (for building)

### Quick Start with Docker

The fastest way to get started with development:

```bash
# Clone the repository
git clone https://github.com/jetnet/OpensearchDashboardCRUD.git
cd OpensearchDashboardCRUD

# Start containers (OpenSearch + OpenSearch Dashboards)
./scripts/start-containers.sh

# Wait for services to be ready, then install the plugin
./scripts/install-plugin-dev.sh

# Run tests
cd opensearch-crud-plugin
yarn test
```

### Setup for Building

1. Clone the repository:

```bash
git clone https://github.com/jetnet/OpensearchDashboardCRUD.git
cd OpensearchDashboardCRUD
```

2. Install plugin dependencies (for development and testing):

```bash
cd opensearch-crud-plugin
yarn install
```

3. For building the plugin, you need the OSD source tree:

```bash
# Use our build script (recommended)
./scripts/build-with-osd.sh

# Or manually clone OSD and build within it
# See "From Source" section above
```

### Testing

```bash
# Run all tests
cd opensearch-crud-plugin
yarn test

# Run tests with coverage
yarn test:coverage

# Run specific test file
yarn test -- path/to/test.file.ts

# Run tests in watch mode
yarn test:watch
```

### Linting

```bash
# Run ESLint
yarn lint

# Fix lint issues automatically
yarn lint:fix
```

### Type Check

```bash
# Run TypeScript type checking
yarn typecheck
```

### Project Scripts

| Script | Description |
|--------|-------------|
| `yarn build` | Build the plugin (requires OSD source) |
| `yarn test` | Run unit tests |
| `yarn test:coverage` | Run tests with coverage report |
| `yarn lint` | Run ESLint |
| `yarn lint:fix` | Fix lint issues |
| `yarn typecheck` | Run TypeScript compiler |

## Project Structure

```
opensearch-crud-plugin/
|-- opensearch_dashboards.json     # Plugin manifest
|-- package.json                   # NPM package definition
|-- tsconfig.json                  # TypeScript configuration
|-- kbn.tsconfig.json              # OpenSearch Dashboards TypeScript config
|-- common/                        # Shared code (server + public)
|   |-- index.ts                   # Common exports and types
|-- public/                        # Frontend code
|   |-- index.ts                   # Public plugin entry point
|   |-- plugin.ts                  # Frontend plugin class
|   |-- types/                     # TypeScript type definitions
|   |-- components/                # React components
|   |   |-- bulk_actions_bar/      # Bulk operations toolbar
|   |   |-- confirm_modal/         # Confirmation dialogs
|   |   |-- entity_form/           # Entity create/edit form
|   |   |-- entity_list_view/      # Main list view
|   |   |-- filter_bar/            # Filtering UI
|   |   |-- pagination_bar/        # Pagination controls
|   |-- contexts/                  # React context providers
|   |-- hooks/                     # Custom React hooks
|   |-- services/                  # Frontend services
|-- server/                        # Backend code
|   |-- index.ts                   # Server plugin entry point
|   |-- plugin.ts                  # Server plugin class
|   |-- routes/                    # HTTP route handlers
|   |   |-- entity_routes.ts       # Entity CRUD endpoints
|   |-- services/                  # Backend services
|   |   |-- opensearch_service.ts  # OpenSearch client wrapper
|   |   |-- validation_service.ts  # Server-side validation
|   |-- types/                     # Server type definitions
|-- tests/                         # Test files
    |-- __mocks__/                 # Test mocks
    |-- setup/                     # Test setup files
    |-- unit/                      # Unit tests
        |-- public/                # Frontend unit tests
        |-- server/                # Backend unit tests
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Code of Conduct
- How to submit issues
- How to submit pull requests
- Development workflow
- Code style guidelines
- Commit message conventions

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

```
Copyright 2024 OpenSearch Project Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

## Acknowledgments

- [OpenSearch Project](https://opensearch.org/) - For the amazing search and analytics platform
- [OpenSearch Dashboards](https://opensearch.org/docs/latest/dashboards/) - For the visualization framework
- [OpenSearch Design System](https://oui.opensearch.org/) - For the beautiful UI components
- All contributors who have helped improve this plugin

## Support

- **Documentation**: [Plugin Architecture](plans/ARCHITECTURE.md)
- **Issues**: [GitHub Issues](https://github.com/jetnet/OpensearchDashboardCRUD/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jetnet/OpensearchDashboardCRUD/discussions)
- **Releases**: [GitHub Releases](https://github.com/jetnet/OpensearchDashboardCRUD/releases)
- **OpenSearch Community**: [OpenSearch Forums](https://forum.opensearch.org/)