# OpenSearch Index Manager Plugin

A comprehensive OpenSearch Dashboards plugin that provides a CRUD interface for managing documents in OpenSearch indices.

## Features

- **Index Management**: Browse and select from available OpenSearch indices
- **Document CRUD**: Create, read, update, and delete documents
- **Nested Field Support**: Edit arbitrarily nested JSON structures with a recursive field editor
- **Mapping Viewer**: Visualize index mappings in tree or JSON view
- **Search**: Query documents using OpenSearch DSL
- **Multi-Version Support**: Compatible with OpenSearch Dashboards 2.19.0 - 2.19.4

## Installation

1. Clone or copy this plugin to the `plugins` directory of your OpenSearch Dashboards installation:
   ```bash
   cp -r opensearch_index_manager /path/to/opensearch-dashboards/plugins/
   ```

2. Install dependencies and build:
   ```bash
   cd /path/to/opensearch-dashboards/plugins/opensearch_index_manager
   yarn install
   yarn build
   ```

3. Start OpenSearch Dashboards

## Configuration

Add the following to your `opensearch_dashboards.yml`:

```yaml
opensearch_index_manager:
  enabled: true
  maxDocumentsPerPage: 1000
  defaultDocumentsPerPage: 20
  maxNestedDepth: 10
  enableRawJsonEdit: true
  enableDeleteConfirmation: true
```

## API Endpoints

### Index Operations
- `GET /api/opensearch_index_manager/indices` - List all indices
- `GET /api/opensearch_index_manager/indices/{index}/mapping` - Get index mapping
- `GET /api/opensearch_index_manager/indices/{index}/settings` - Get index settings

### Document Operations
- `GET /api/opensearch_index_manager/indices/{index}/documents` - List documents
- `GET /api/opensearch_index_manager/indices/{index}/documents/{id}` - Get document by ID
- `POST /api/opensearch_index_manager/indices/{index}/documents` - Create document
- `PUT /api/opensearch_index_manager/indices/{index}/documents/{id}` - Update document
- `DELETE /api/opensearch_index_manager/indices/{index}/documents/{id}` - Delete document

### Search Operations
- `POST /api/opensearch_index_manager/indices/{index}/search` - Search with DSL
- `POST /api/opensearch_index_manager/indices/{index}/query` - Simple query string search

## Usage

1. Navigate to **OpenSearch Plugins > Index Manager** in the left sidebar
2. Select an index from the dropdown
3. View documents in the table
4. Click **Create Document** to add new documents
5. Use the edit/delete actions on each row to modify documents
6. Toggle **Show Mapping** to view the index structure

## Development

### Project Structure
```
opensearch_index_manager/
├── common/           # Shared types and utilities
├── public/           # Client-side code
│   ├── components/   # React components
│   └── services/     # API services
├── server/           # Server-side code
│   ├── routes/       # API routes
│   └── lib/          # Utilities
└── utils/            # Additional utilities
```

### Building for Different Versions

```bash
# Build for specific version
yarn build:2.19.0
yarn build:2.19.1
yarn build:2.19.2
yarn build:2.19.3
yarn build:2.19.4

# Build for all versions
yarn build:all
```

## Local Development with Podman

This plugin includes a complete Podman-based local testing infrastructure for development and testing.

### Prerequisites

- **Podman** and **podman-compose**: Container runtime and orchestration
  ```bash
  # Fedora/RHEL
  sudo dnf install podman podman-compose
  
  # Ubuntu/Debian
  sudo apt-get install podman podman-compose
  
  # macOS
  brew install podman podman-compose
  ```

- **Node.js** 18.x and **Yarn** 1.22.x: For building the plugin
  ```bash
  # Using nvm
  nvm install 18
  nvm use 18
  
  # Install Yarn
  npm install -g yarn@1.22
  ```

- **curl**: For test data setup (usually pre-installed)

### Quick Start

1. **Clone the repository** (if not already done):
   ```bash
   cd /path/to/opensearch_index_manager
   ```

2. **Start the local environment**:
   ```bash
   ./scripts/start-local.sh [version]
   
   # Examples:
   ./scripts/start-local.sh              # Start with OSD 2.19.0 (default)
   ./scripts/start-local.sh 2.19.2       # Start with OSD 2.19.2
   ```

   This will:
   - Start OpenSearch on port 9200
   - Start OpenSearch Dashboards on port 5601
   - Mount the plugin directory for live development

3. **Create test data**:
   ```bash
   ./scripts/setup-test-data.sh
   
   # Or with specific indices:
   ./scripts/setup-test-data.sh --nested --arrays
   ```

4. **Access the plugin**:
   - OpenSearch Dashboards: http://localhost:5601
   - Plugin URL: http://localhost:5601/app/opensearch_index_manager
   - OpenSearch API: http://localhost:9200

### Development Scripts

| Script | Description |
|--------|-------------|
| `./scripts/start-local.sh [version]` | Start OpenSearch and OSD containers |
| `./scripts/stop-local.sh [-v]` | Stop containers (`-v` to remove volumes) |
| `./scripts/build-plugin.sh [version\|--all]` | Build plugin for specific or all versions |
| `./scripts/install-plugin.sh [-b] [-r] [version]` | Install plugin into running OSD container |
| `./scripts/setup-test-data.sh [options]` | Create test indices with sample data |

### Testing Against Fresh OpenSearch Cluster

To test the plugin against a clean OpenSearch instance:

```bash
# 1. Stop and clean up everything
./scripts/stop-local.sh -v

# 2. Start fresh environment
./scripts/start-local.sh

# 3. Create test data
./scripts/setup-test-data.sh

# 4. Access the plugin at http://localhost:5601/app/opensearch_index_manager
```

### Live Development

The plugin directory is mounted as a read-only volume in the OSD container. For live development:

1. **Make changes** to plugin code in `opensearch_index_manager/`
2. **Rebuild** (if needed for server-side changes):
   ```bash
   ./scripts/build-plugin.sh
   ./scripts/install-plugin.sh -r  # Install and restart OSD
   ```
3. **Refresh browser** to see client-side changes

### Building and Installing Plugin

```bash
# Build for current version
./scripts/build-plugin.sh

# Build for specific version
./scripts/build-plugin.sh 2.19.2

# Build for all versions
./scripts/build-plugin.sh --all

# Install into running container
./scripts/install-plugin.sh 2.19.0

# Build, install, and restart
./scripts/install-plugin.sh -b -r 2.19.0
```

### Test Data Options

The `setup-test-data.sh` script creates indices with various document types:

```bash
# Create all test indices (default)
./scripts/setup-test-data.sh

# Create specific indices
./scripts/setup-test-data.sh --simple      # Flat documents
./scripts/setup-test-data.sh --nested      # Nested objects (2-3 levels)
./scripts/setup-test-data.sh --arrays      # Arrays of objects
./scripts/setup-test-data.sh --types       # Various field types

# Clean and recreate
./scripts/setup-test-data.sh -c --all
```

**Created Indices:**
- `osim-simple` - Flat documents with basic fields (text, keyword, date, boolean)
- `osim-nested` - Deeply nested objects (profile > address > country, employment > manager)
- `osim-arrays` - Arrays of objects (variants, reviews, suppliers)
- `osim-types` - Various OpenSearch field types (geo_point, ip, binary, range)

### Troubleshooting

#### Containers Won't Start

```bash
# Check if ports are already in use
sudo lsof -i :9200
sudo lsof -i :5601

# View container logs
podman logs osim-opensearch
podman logs osim-dashboards
```

#### OpenSearch Fails to Start

Usually due to memory or permissions:
```bash
# Check system memory
free -h

# Clear existing data and restart
./scripts/stop-local.sh -v
./scripts/start-local.sh
```

#### Plugin Not Showing in OSD

```bash
# Check if plugin files are in container
podman exec osim-dashboards ls -la /usr/share/opensearch-dashboards/plugins/opensearch_index_manager/

# Restart OSD
podman restart osim-dashboards
```

#### Permission Denied on Scripts

```bash
# Make scripts executable
chmod +x scripts/*.sh
```

#### Test Data Import Fails

```bash
# Check OpenSearch is accessible
curl http://localhost:9200/_cluster/health

# Import manually
curl -X POST "localhost:9200/_bulk" \
  -H "Content-Type: application/json" \
  --data-binary @test-data/simple-documents.json
```

### OSD Source Development

For advanced development with hot-reloading and debugging, see [OSD_SOURCE_INTEGRATION.md](../OSD_SOURCE_INTEGRATION.md) for instructions on:
- Cloning and setting up OSD source code
- Linking the plugin for development
- Running OSD in development mode
- Debugging server and client-side code

## License

Apache 2.0

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

For major changes, please open an issue first to discuss what you would like to change.
