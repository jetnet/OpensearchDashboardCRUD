# OpenSearch Dashboards CRUD Plugin

A Generic Entity Management plugin for OpenSearch Dashboards that provides CRUD (Create, Read, Update, Delete) operations on entities stored in an OpenSearch index.

## Features

- **List Entities**: View all entities in a table with pagination and search.
- **Create Entity**: Add new entities via a flyout form.
- **Update Entity**: Edit existing entities.
- **Delete Entity**: Remove entities with a confirmation prompt.
- **Search**: Filter entities by name or description.

## Architecture

The plugin follows the standard OpenSearch Dashboards plugin architecture:

- **Client-side (`public/`)**: React-based UI using EUI (Elastic UI) components.
- **Server-side (`server/`)**: Hapi.js routes and services for interacting with OpenSearch.
- **Common (`common/`)**: Shared types and constants used by both client and server.

## Installation

To install the plugin from a zip file into an existing OpenSearch Dashboards installation:

1. Download the plugin artifact (e.g., `opensearch-dashboards-crud-1.0.0.zip`).
2. Run the following command from your OpenSearch Dashboards root directory:
   ```bash
   ./bin/opensearch-dashboards-plugin install file:///path/to/opensearch-dashboards-crud-1.0.0.zip
   ```
3. Restart OpenSearch Dashboards.

## Development

### Prerequisites

- Node.js (v18.x recommended)
- Yarn (v1.x)
- Docker (for running OpenSearch)

### Setup

We provide a `bootstrap.sh` script to automate the setup process. This script will:
1. Clone the `OpenSearch-Dashboards` repository (if not already present).
2. Link this plugin into the `plugins/` directory of OpenSearch Dashboards.
3. Run `yarn osd bootstrap` to install all dependencies.

```bash
chmod +x bootstrap.sh
./bootstrap.sh
```

### Running Locally

1. Start OpenSearch (e.g., using Docker):
   ```bash
   docker run -p 9200:9200 -p 9600:9600 -e "discovery.type=single-node" opensearchproject/opensearch:latest
   ```
2. Navigate to the `OpenSearch-Dashboards` directory:
   ```bash
   cd ../OpenSearch-Dashboards
   ```
3. Start OpenSearch Dashboards:
   ```bash
   yarn start --no-base-path
   ```

## Testing

### Cypress Tests

The plugin includes end-to-end tests using Cypress.

1. Ensure OpenSearch and OpenSearch Dashboards are running.
2. Run the tests:
   ```bash
   yarn cypress:run
   ```
   Or open the Cypress UI:
   ```bash
   yarn cypress:open
   ```

## Design Specification

Refer to [`plans/design.md`](plans/design.md) for detailed architecture, API specifications, and UI mockups.
