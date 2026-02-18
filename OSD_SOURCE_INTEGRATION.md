# OpenSearch Dashboards Source Integration Guide

This guide explains how to set up the OpenSearch Index Manager plugin for development using the OpenSearch Dashboards (OSD) source code.

## Overview

For active plugin development, it's recommended to run OSD from source with the plugin linked directly. This allows for:
- Hot reloading of plugin changes
- Debugging capabilities
- Running OSD tests alongside plugin tests
- Full access to OSD APIs and utilities

## Prerequisites

- **Node.js**: Version 18.x (matching OSD 2.19.x requirements)
- **Yarn**: Version 1.22.x
- **Git**: For cloning OSD source
- **Java**: OpenJDK 11 or 17 (for running OpenSearch)

## Step 1: Clone OpenSearch Dashboards Source

```bash
# Choose a directory for OSD source
cd ~/projects

# Clone the OSD repository (use the version matching your plugin)
git clone --branch 2.19 --single-branch https://github.com/opensearch-project/OpenSearch-Dashboards.git

# Or clone a specific tag
git clone --branch 2.19.0 --single-branch https://github.com/opensearch-project/OpenSearch-Dashboards.git opensearch-dashboards-2.19.0

cd OpenSearch-Dashboards
```

## Step 2: Install OSD Dependencies

```bash
# Use the correct Node.js version (if using nvm)
nvm use 18

# Install OSD dependencies
yarn install

# This may take several minutes
```

## Step 3: Link the Plugin

### Option A: Clone Plugin into Plugins Directory

```bash
# From OSD root directory
cd plugins

# Clone or copy your plugin
git clone <your-plugin-repo-url> opensearch_index_manager
# OR
cp -r /path/to/opensearch_index_manager .

cd ..
```

### Option B: Symlink Existing Plugin Directory

```bash
# From OSD root directory
cd plugins

# Create symlink to your plugin
ln -s /path/to/your/opensearch_index_manager opensearch_index_manager

cd ..
```

## Step 4: Install Plugin Dependencies

```bash
# Navigate to plugin directory
cd plugins/opensearch_index_manager

# Install plugin dependencies
yarn install

cd ../..
```

## Step 5: Configure OpenSearch

Create or update `config/opensearch_dashboards.yml`:

```yaml
# OpenSearch connection
opensearch.hosts: ["http://localhost:9200"]
opensearch.ssl.verificationMode: none

# Disable security for local development
opensearch_security.enabled: false

# Plugin configuration
opensearch_index_manager:
  enabled: true
  maxDocumentsPerPage: 1000
  defaultDocumentsPerPage: 20
  maxNestedDepth: 10
  enableRawJsonEdit: true
  enableDeleteConfirmation: true

# Development settings
logging.verbose: true
server.host: "0.0.0.0"
```

## Step 6: Start OpenSearch

### Using Podman (Recommended)

```bash
# From your plugin project directory
./scripts/start-local.sh

# This starts OpenSearch on port 9200
```

### Using Local OpenSearch

```bash
# Download and run OpenSearch
curl -fsSL https://artifacts.opensearch.org/releases/bundle/opensearch/2.19.0/opensearch-2.19.0-linux-x64.tar.gz | tar -xz
cd opensearch-2.19.0
./opensearch-tar-install.sh
```

## Step 7: Start OSD in Development Mode

```bash
# From OSD root directory

# Start with the plugin
yarn start --oss

# Or with specific configuration
yarn start --oss --config config/opensearch_dashboards.yml
```

OSD will:
1. Bootstrap the plugin
2. Compile plugin code
3. Start the development server on http://localhost:5601

## Development Workflow

### Making Changes

1. **Edit plugin code** in `plugins/opensearch_index_manager/`
2. **OSD automatically reloads** when files change (usually)
3. **Refresh browser** to see changes

### Building the Plugin

```bash
# From OSD root
cd plugins/opensearch_index_manager

# Build plugin
yarn build

# Output goes to build/ directory
```

### Running Plugin Tests

```bash
# From OSD root
cd plugins/opensearch_index_manager

# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch
```

### Running OSD Tests with Plugin

```bash
# From OSD root

# Run OSD tests including plugin
yarn test:jest plugins/opensearch_index_manager

# Run specific test file
yarn test:jest plugins/opensearch_index_manager/server/routes/indices_routes.test.ts
```

## Debugging

### Server-side Debugging

1. Start OSD with debug flag:
   ```bash
   node --inspect scripts/opensearch_dashboards --dev
   ```

2. Attach debugger in VS Code or Chrome DevTools

### Client-side Debugging

1. Open browser DevTools (F12)
2. Go to Sources tab
3. Find plugin code under `webpack://./plugins/opensearch_index_manager/`

### Common Debug Configuration (VS Code)

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug OSD with Plugin",
      "runtimeExecutable": "yarn",
      "runtimeArgs": ["start", "--oss"],
      "port": 9229,
      "cwd": "${workspaceFolder}"
    }
  ]
}
```

## Version Compatibility

The plugin supports OSD versions 2.19.0 through 2.19.4. When working with OSD source:

| OSD Version | Branch/Tag | Node Version |
|-------------|------------|--------------|
| 2.19.0 | `2.19` or `2.19.0` | 18.x |
| 2.19.1 | `2.19` or `2.19.1` | 18.x |
| 2.19.2 | `2.19` or `2.19.2` | 18.x |
| 2.19.3 | `2.19` or `2.19.3` | 18.x |
| 2.19.4 | `2.19` or `2.19.4` | 18.x |

## Troubleshooting

### Plugin Not Loading

```bash
# Check if plugin is recognized
yarn opensearch-dashboards-plugin list

# Should show: opensearch_index_manager@1.0.0
```

### Build Errors

```bash
# Clear caches and rebuild
yarn osd clean
yarn osd bootstrap
```

### Module Not Found Errors

```bash
# Reinstall dependencies
rm -rf node_modules plugins/opensearch_index_manager/node_modules
yarn install
cd plugins/opensearch_index_manager && yarn install
```

### Port Conflicts

If port 5601 is in use:

```bash
# Kill existing process
lsof -ti:5601 | xargs kill -9

# Or use different port
yarn start --oss --server.port 5602
```

### Memory Issues

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
yarn start --oss
```

## Building for Distribution

When ready to distribute:

```bash
# From plugin directory
cd plugins/opensearch_index_manager

# Build for all supported versions
yarn build:all

# Or specific version
yarn build:2.19.0

# Output in build-*/ directories
```

## Useful Commands Reference

| Command | Description |
|---------|-------------|
| `yarn start --oss` | Start OSD in dev mode |
| `yarn osd bootstrap` | Install all dependencies |
| `yarn osd clean` | Clean build caches |
| `yarn build` | Build plugin |
| `yarn test` | Run plugin tests |
| `yarn lint` | Run linter |
| `node scripts/plugin_helpers.js build` | Build plugin via helper |

## Next Steps

After setting up:
1. Create test data: `./scripts/setup-test-data.sh`
2. Access plugin: http://localhost:5601/app/opensearch_index_manager
3. Start developing!

For container-based development without OSD source, see the [README.md](README.md) Quick Start guide.
