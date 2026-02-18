# OpenSearch Index Manager

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-Apache%202.0-green.svg" alt="License">
  <img src="https://img.shields.io/badge/OSD-2.19.0--2.19.4-orange.svg" alt="OSD Versions">
</p>

<p align="center">
  <a href="https://github.com/opensearch-project/opensearch_index_manager/actions/workflows/ci-cd.yml">
    <img src="https://github.com/opensearch-project/opensearch_index_manager/workflows/CI/CD/badge.svg" alt="CI/CD Status">
  </a>
  <a href="https://github.com/opensearch-project/opensearch_index_manager/releases">
    <img src="https://img.shields.io/github/v/release/opensearch-project/opensearch_index_manager" alt="Latest Release">
  </a>
</p>

---

A comprehensive OpenSearch Dashboards plugin that provides an intuitive CRUD interface for managing documents in OpenSearch indices with advanced support for nested field structures.

## 📋 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Usage Guide](#-usage-guide)
- [Compatibility](#-compatibility)
- [Development](#-development)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [Support](#-support)
- [License](#-license)

## ✨ Features

### Core Capabilities

- **📊 Index Management**: Browse and select from available OpenSearch indices with real-time mapping visualization
- **📝 Document CRUD**: Create, read, update, and delete documents with an intuitive interface
- **🔄 Nested Field Support**: Edit arbitrarily nested JSON structures (up to 10 levels deep) with a recursive field editor
- **🔍 Mapping Viewer**: Visualize index mappings in both tree and JSON views
- **🔎 Advanced Search**: Query documents using OpenSearch DSL with query builder assistance
- **📱 Responsive UI**: Clean, modern interface built with OpenSearch Dashboards UI components

### Advanced Features

- **Multi-Version Support**: Compatible with OpenSearch Dashboards 2.19.0 through 2.19.4
- **Field Type Detection**: Automatic handling of different field types (text, keyword, date, boolean, nested, arrays)
- **Raw JSON Mode**: Toggle between structured form editing and raw JSON editing
- **Bulk Operations**: Efficient handling of large document sets with pagination
- **Security Integration**: Compatible with OpenSearch Security plugin and multi-tenant setups

## 📸 Screenshots

> Screenshots will be added in a future release. For now, see the [User Guide](docs/user-guide.md) for detailed feature descriptions.

```
┌─────────────────────────────────────────────────────────────────┐
│                    OpenSearch Index Manager                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Index: [my-index ▼]  [Create Document]  [Toggle Mapping]       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Search: [query dsl or simple text...              🔍]  │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │  Documents (1-20 of 1,247)                              │    │
│  ├──────────┬──────────┬──────────┬──────────┬────────────┤    │
│  │ _id      │ title    │ status   │ created  │ Actions    │    │
│  ├──────────┼──────────┼──────────┼──────────┼────────────┤    │
│  │ doc_001  │ ...      │ active   │ ...      │ [Edit][Del]│    │
│  │ doc_002  │ ...      │ pending  │ ...      │ [Edit][Del]│    │
│  ├──────────┴──────────┴──────────┴──────────┴────────────┤    │
│  │  [← Previous]  Page 1 of 63  [Next →]                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- OpenSearch 2.19.x cluster (local or remote)
- OpenSearch Dashboards 2.19.0 - 2.19.4
- Node.js 18.x and Yarn 1.22.x (for building from source)

### Docker/Podman Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/opensearch-project/opensearch_index_manager.git
cd opensearch_index_manager

# 2. Start OpenSearch and OSD with Podman
./scripts/start-local.sh

# 3. The plugin will be available at
open http://localhost:5601/app/opensearch_index_manager
```

### Manual Installation

```bash
# Download the latest release for your OSD version
wget https://github.com/opensearch-project/opensearch_index_manager/releases/download/v1.0.0/opensearch_index_manager-1.0.0-osd-2.19.0.zip

# Install the plugin
./bin/opensearch-dashboards-plugin install file://$(pwd)/opensearch_index_manager-1.0.0-osd-2.19.0.zip

# Restart OpenSearch Dashboards
```

## 📦 Installation

### Installation Methods

#### Method 1: From GitHub Release (Recommended)

```bash
# Replace VERSION and OSD_VERSION with actual versions
VERSION=1.0.0
OSD_VERSION=2.19.0

wget https://github.com/opensearch-project/opensearch_index_manager/releases/download/v${VERSION}/opensearch_index_manager-${VERSION}-osd-${OSD_VERSION}.zip

# Install plugin
sudo bin/opensearch-dashboards-plugin install \
  file://$(pwd)/opensearch_index_manager-${VERSION}-osd-${OSD_VERSION}.zip
```

#### Method 2: From OSD Plugins Directory

```bash
# Clone into OSD plugins directory
cd /path/to/opensearch-dashboards/plugins
git clone https://github.com/opensearch-project/opensearch_index_manager.git

# Install dependencies and build
cd opensearch_index_manager
yarn install
yarn build

# Restart OSD
```

#### Method 3: Using Plugin Helper

```bash
# From OSD root directory
./bin/opensearch-dashboards-plugin install \
  https://github.com/opensearch-project/opensearch_index_manager/releases/download/v1.0.0/opensearch_index_manager-1.0.0-osd-2.19.0.zip
```

### Version Compatibility

| Plugin Version | OSD Versions | OpenSearch | Status |
|----------------|--------------|------------|--------|
| 1.0.0 | 2.19.0 - 2.19.4 | 2.19.x | ✅ Supported |

### Configuration

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

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `true` | Enable/disable the plugin |
| `maxDocumentsPerPage` | number | `1000` | Maximum documents per page |
| `defaultDocumentsPerPage` | number | `20` | Default page size |
| `maxNestedDepth` | number | `10` | Maximum nesting depth for field editor |
| `enableRawJsonEdit` | boolean | `true` | Allow raw JSON editing |
| `enableDeleteConfirmation` | boolean | `true` | Show confirmation before delete |

## 📖 Usage Guide

### Accessing the Plugin

1. Log in to OpenSearch Dashboards
2. Navigate to **OpenSearch Plugins > Index Manager** in the left sidebar
3. The Index Manager interface will load

### Managing Documents

#### Selecting an Index

1. Use the index dropdown to select an available index
2. The mapping viewer will display the index structure
3. Documents will load automatically

#### Creating Documents

1. Click **Create Document**
2. Enter the document ID (optional - auto-generated if empty)
3. Add fields using the structured form editor:
   - Click **Add Field** to add top-level fields
   - Use the **+** button on nested objects to add child fields
   - Select field type from the dropdown
4. Or switch to **JSON Mode** to paste raw JSON
5. Click **Save** to create the document

#### Editing Documents

1. Find the document in the list
2. Click the **Edit** action
3. Modify fields in the editor:
   - Edit primitive values (text, numbers, booleans) directly
   - Expand nested objects to edit children
   - Add or remove fields as needed
4. Click **Save** to update or **Cancel** to discard

#### Deleting Documents

1. Find the document in the list
2. Click the **Delete** action
3. Confirm deletion in the dialog

### Searching Documents

#### Simple Search

Enter text in the search box for basic query string search across all fields.

#### DSL Search

Use OpenSearch Query DSL for advanced queries:

```json
{
  "query": {
    "bool": {
      "must": [
        { "match": { "status": "active" } },
        { "range": { "created_at": { "gte": "2024-01-01" } } }
      ]
    }
  }
}
```

### Working with Nested Fields

The plugin provides specialized handling for nested structures:

```json
{
  "user": {
    "profile": {
      "name": "John Doe",
      "address": {
        "city": "New York",
        "country": "USA"
      }
    },
    "preferences": {
      "notifications": true
    }
  }
}
```

1. Click the expand arrow to navigate nested levels
2. Each level shows its own field editor
3. Arrays of objects are handled with indexed editors
4. Changes are validated against the index mapping

### Viewing Mappings

Click **Toggle Mapping** to see:
- **Tree View**: Hierarchical view of field types
- **JSON View**: Raw mapping JSON

## 🔧 Compatibility

### OpenSearch Dashboards Versions

| OSD Version | Node.js | Plugin Compatibility |
|-------------|---------|---------------------|
| 2.19.0 | 18.19.0 | ✅ Fully Compatible |
| 2.19.1 | 18.19.0 | ✅ Fully Compatible |
| 2.19.2 | 18.19.0 | ✅ Fully Compatible |
| 2.19.3 | 18.19.0 | ✅ Fully Compatible |
| 2.19.4 | 18.19.0 | ✅ Fully Compatible |

### OpenSearch Versions

The plugin is tested with OpenSearch 2.19.x. It should work with other 2.x versions but is optimized for 2.19.x.

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 💻 Development

### Prerequisites

- Node.js 18.x
- Yarn 1.22.x
- Podman (for local testing)

### Setting Up Development Environment

```bash
# Clone the repository
git clone https://github.com/opensearch-project/opensearch_index_manager.git
cd opensearch_index_manager

# Start local OpenSearch and OSD
./scripts/start-local.sh

# Install dependencies
cd opensearch_index_manager
yarn install

# Build the plugin
yarn build

# Install into running OSD
./scripts/install-plugin.sh -b -r
```

### Project Structure

```
opensearch_index_manager/
├── common/               # Shared types and utilities
│   ├── types.ts         # TypeScript interfaces
│   ├── constants.ts     # Constants
│   └── field_utils.ts   # Field manipulation utilities
├── public/              # Client-side code
│   ├── components/      # React components
│   │   ├── app_root.tsx
│   │   ├── index_selector/
│   │   ├── document_list/
│   │   ├── document_editor/
│   │   └── mapping_viewer/
│   └── services/        # API services
├── server/              # Server-side code
│   ├── routes/          # API routes
│   └── lib/             # Server utilities
└── utils/               # Shared utilities
```

### Building for Multiple Versions

```bash
# Build for all supported OSD versions
yarn build:all

# Build for specific version
yarn build:2.19.0
yarn build:2.19.2
```

See [OSD_SOURCE_INTEGRATION.md](OSD_SOURCE_INTEGRATION.md) for advanced development setup with OSD source code.

## 🧪 Testing

### Test Suite Overview

The project includes multiple types of tests:

| Test Type | Location | Framework | Coverage |
|-----------|----------|-----------|----------|
| Unit Tests | `opensearch_index_manager/` | Jest | Core logic |
| Integration Tests | `scripts/ci/` | Custom | API routes |
| Functional Tests | `functional-tests/` | Playwright | E2E workflows |

### Running Tests

```bash
# Unit tests
cd opensearch_index_manager
yarn test

# Integration tests
./scripts/ci/run-integration-tests.sh

# Functional tests
cd functional-tests
npm install
npm test

# Run specific test file
npx playwright test document-crud.spec.ts
```

### Test Data Setup

```bash
# Create test indices with sample data
./scripts/setup-test-data.sh

# Options:
./scripts/setup-test-data.sh --simple   # Flat documents
./scripts/setup-test-data.sh --nested   # Nested objects
./scripts/setup-test-data.sh --arrays   # Array fields
./scripts/setup-test-data.sh --types    # Various field types
```

### Continuous Integration

The project uses GitHub Actions for CI/CD:

- **CI/CD Pipeline**: [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml)
- **PR Checks**: [`.github/workflows/pr-checks.yml`](.github/workflows/pr-checks.yml)
- **Nightly Builds**: [`.github/workflows/nightly.yml`](.github/workflows/nightly.yml)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`yarn test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Resources

- [Architecture Documentation](docs/architecture.md)
- [User Guide](docs/user-guide.md)
- [Release Process](RELEASING.md)
- [OSD Source Integration](OSD_SOURCE_INTEGRATION.md)

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [User Guide](docs/user-guide.md) | End-user documentation |
| [Architecture](docs/architecture.md) | Technical architecture |
| [Contributing](CONTRIBUTING.md) | Contribution guidelines |
| [Releasing](RELEASING.md) | Release process |
| [Changelog](CHANGELOG.md) | Version history |

## 🆘 Support

### Getting Help

- 📖 [Documentation](docs/user-guide.md)
- 🐛 [Issue Tracker](https://github.com/opensearch-project/opensearch_index_manager/issues)
- 💬 [Discussions](https://github.com/opensearch-project/opensearch_index_manager/discussions)

### Reporting Issues

Please use our issue templates:
- 🐛 [Bug Report](https://github.com/opensearch-project/opensearch_index_manager/issues/new?template=bug_report.md)
- ✨ [Feature Request](https://github.com/opensearch-project/opensearch_index_manager/issues/new?template=feature_request.md)

### Security

For security issues, please see [SECURITY.md](SECURITY.md).

## 📜 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the [OpenSearch](https://opensearch.org/) project
- Uses [OpenSearch Dashboards](https://github.com/opensearch-project/OpenSearch-Dashboards) plugin APIs
- UI components from [OpenSearch Dashboards UI Framework](https://oui.opensearch.org/)

---

<p align="center">
  Made with ❤️ for the OpenSearch community
</p>