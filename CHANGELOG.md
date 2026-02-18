# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Placeholder for upcoming features

### Changed
- Placeholder for upcoming changes

### Deprecated
- Placeholder for deprecated features

### Removed
- Placeholder for removed features

### Fixed
- Placeholder for bug fixes

### Security
- Placeholder for security updates

## [1.0.0] - 2024-02-18

### Added
- Initial release of OpenSearch Index Manager plugin
- **Index Management**: Browse and select from available OpenSearch indices
- **Document CRUD**: Create, read, update, and delete documents with intuitive interface
- **Nested Field Support**: Edit arbitrarily nested JSON structures (up to 10 levels deep) with recursive field editor
- **Mapping Viewer**: Visualize index mappings in tree and JSON views
- **Advanced Search**: Query documents using OpenSearch DSL
- **Multi-Version Support**: Compatible with OpenSearch Dashboards 2.19.0 through 2.19.4
- **Field Type Detection**: Automatic handling of different field types (text, keyword, date, boolean, nested, arrays)
- **Raw JSON Mode**: Toggle between structured form editing and raw JSON editing
- **Bulk Operations**: Efficient handling of large document sets with pagination
- **Security Integration**: Compatible with OpenSearch Security plugin
- **Comprehensive Testing**: Unit tests, integration tests, and Playwright functional tests
- **CI/CD Pipeline**: GitHub Actions workflows for automated building and testing
- **Podman-based Testing**: Complete local testing infrastructure
- **Documentation**: User guide, architecture docs, and API documentation

### API Endpoints
- `GET /api/opensearch_index_manager/indices` - List all indices
- `GET /api/opensearch_index_manager/indices/{index}/mapping` - Get index mapping
- `GET /api/opensearch_index_manager/indices/{index}/settings` - Get index settings
- `GET /api/opensearch_index_manager/indices/{index}/documents` - List documents
- `GET /api/opensearch_index_manager/indices/{index}/documents/{id}` - Get document by ID
- `POST /api/opensearch_index_manager/indices/{index}/documents` - Create document
- `PUT /api/opensearch_index_manager/indices/{index}/documents/{id}` - Update document
- `DELETE /api/opensearch_index_manager/indices/{index}/documents/{id}` - Delete document
- `POST /api/opensearch_index_manager/indices/{index}/search` - Search with DSL
- `POST /api/opensearch_index_manager/indices/{index}/query` - Simple query string search

### Configuration Options
- `enabled` - Enable/disable the plugin
- `maxDocumentsPerPage` - Maximum documents per page (default: 1000)
- `defaultDocumentsPerPage` - Default page size (default: 20)
- `maxNestedDepth` - Maximum nesting depth for field editor (default: 10)
- `enableRawJsonEdit` - Allow raw JSON editing (default: true)
- `enableDeleteConfirmation` - Show confirmation before delete (default: true)

### Security
- Input validation on all API endpoints
- Error handling without information leakage
- CORS configuration support
- Compatible with OpenSearch Security plugin

[Unreleased]: https://github.com/opensearch-project/opensearch_index_manager/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/opensearch-project/opensearch_index_manager/releases/tag/v1.0.0