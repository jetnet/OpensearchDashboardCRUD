# Release Guide

This document describes the process for publishing releases of the OpenSearch Dashboards CRUD Plugin to GitHub.

## Prerequisites

- Committer access to the repository
- GPG key for signing (optional, but recommended)
- Node.js >= 14.0.0 installed
- Yarn >= 1.21.1 installed

## Release Process

### 1. Prepare Release

#### 1.1 Update Version

Update the version in [`opensearch-crud-plugin/package.json`](opensearch-crud-plugin/package.json):

```json
{
  "version": "1.0.0"
}
```

#### 1.2 Update Changelog

Update [`CHANGELOG.md`](CHANGELOG.md) with the release notes:

```markdown
## [1.0.0] - 2024-01-15

### Added
- Initial release
- CRUD operations for OpenSearch documents
- Pagination support
- Filtering and sorting capabilities
- Bulk operations

### Fixed
- Bug fixes since last release

### Changed
- Changes and improvements
```

#### 1.3 Create Pull Request

1. Create a new branch for the release:
   ```bash
   git checkout -b release/v1.0.0
   ```

2. Commit the changes:
   ```bash
   git add opensearch-crud-plugin/package.json CHANGELOG.md
   git commit -m "chore: prepare release v1.0.0"
   ```

3. Push and create a pull request:
   ```bash
   git push origin release/v1.0.0
   ```

4. Wait for CI to pass and get approval from at least one other committer.

### 2. Tag and Release

#### 2.1 Merge and Tag

After the PR is merged to main:

1. Pull the latest changes:
   ```bash
   git checkout main
   git pull origin main
   ```

2. Create an annotated tag:
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   ```

3. Push the tag:
   ```bash
   git push origin v1.0.0
   ```

#### 2.2 Automated Release Process

When a tag is pushed, the GitHub Actions workflow (`.github/workflows/release.yml`) will automatically:

1. Build the plugin
2. Run tests
3. Create a zip artifact
4. Create a GitHub Release with the artifact attached

### 3. Verify Release

1. Go to the [Releases](https://github.com/opensearch-project/opensearch-crud-plugin/releases) page
2. Verify the release was created with the correct version
3. Download and test the zip artifact

### 4. Manual Release (if needed)

If the automated release fails or needs to be done manually:

#### 4.1 Build Locally

```bash
# Run the build script
./scripts/build.sh

# Or manually
cd opensearch-crud-plugin
yarn install
yarn lint
yarn test
yarn build
yarn release
```

#### 4.2 Create GitHub Release

1. Go to [Releases](https://github.com/opensearch-project/opensearch-crud-plugin/releases/new)
2. Click "Draft a new release"
3. Select the tag (or create one)
4. Fill in the release title and notes
5. Upload the zip artifact
6. Click "Publish release"

## Version Naming Convention

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality in a backwards compatible manner
- **PATCH** version for backwards compatible bug fixes

Examples:
- `1.0.0` - Initial stable release
- `1.1.0` - New features added
- `1.1.1` - Bug fixes
- `2.0.0` - Breaking changes

## Release Checklist

- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md`
- [ ] Ensure all tests pass
- [ ] Ensure linting passes
- [ ] Create PR and get approval
- [ ] Merge PR to main
- [ ] Create and push tag
- [ ] Verify automated release
- [ ] Test installation from release

## Installation from Release

Users can install the plugin from a GitHub release:

```bash
# Install from GitHub release
./bin/opensearch-dashboards-plugin install https://github.com/opensearch-project/opensearch-crud-plugin/releases/download/v1.0.0/opensearch-crud-plugin-1.0.0.zip

# Or from a local file
./bin/opensearch-dashboards-plugin install file:///path/to/opensearch-crud-plugin-1.0.0.zip
```

## Troubleshooting

### Build Fails

1. Check Node.js version: `node -v` (should be >= 14.0.0)
2. Check yarn version: `yarn -v` (should be >= 1.21.1)
3. Try cleaning and rebuilding:
   ```bash
   rm -rf node_modules yarn.lock
   yarn install
   yarn build
   ```

### Release Workflow Fails

1. Check the GitHub Actions logs for errors
2. Verify the tag format matches `v*.*.*`
3. Ensure all required secrets are configured in the repository

### Plugin Installation Fails

1. Verify OpenSearch Dashboards version compatibility
2. Check the plugin is built for the correct platform
3. Review OpenSearch Dashboards logs for errors

## Rollback

If a release has critical issues:

1. Delete the GitHub release (keeps the tag)
2. Fix the issues in a new branch
3. Create a new patch release (e.g., 1.0.1)
4. Or, if necessary, delete the tag and re-release

## Support

For questions or issues with releases:

1. Open an issue on [GitHub](https://github.com/opensearch-project/opensearch-crud-plugin/issues)
2. Contact the maintainers
3. Check the [documentation](README.md)
