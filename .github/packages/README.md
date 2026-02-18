# GitHub Package Registry

This directory contains documentation for publishing and consuming the OpenSearch Index Manager plugin through GitHub Package Registry.

## Overview

GitHub Package Registry provides a convenient way to distribute plugin artifacts. This document explains how to:

- Publish plugin artifacts to GitHub Packages
- Install plugins from GitHub Packages
- Configure authentication
- Manage package versions

## Package Information

| Property | Value |
|----------|-------|
| **Package Name** | `opensearch_index_manager` |
| **Registry** | GitHub Container Registry (ghcr.io) |
| **Organization** | opensearch-project |
| **Repository** | opensearch_index_manager |

## Authentication

### Personal Access Token

To interact with GitHub Package Registry, you need a personal access token (PAT) with appropriate permissions.

#### Creating a PAT

1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - `read:packages` - Download packages
   - `write:packages` - Upload packages (for maintainers)
   - `delete:packages` - Delete packages (for maintainers)

#### Authenticating with Podman/Docker

```bash
# Set your PAT as environment variable
export CR_PAT=YOUR_GITHUB_TOKEN

# Login to GitHub Container Registry
echo $CR_PAT | podman login ghcr.io -u USERNAME --password-stdin

# Or with Docker
echo $CR_PAT | docker login ghcr.io -u USERNAME --password-stdin
```

#### Authenticating with npm/yarn

Create or edit `.npmrc`:

```
@opensearch-project:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

## Installing from GitHub Packages

### Method 1: Direct Download

Download plugin artifacts directly from GitHub Releases (recommended):

```bash
# Download specific version
wget https://github.com/opensearch-project/opensearch_index_manager/releases/download/v1.0.0/opensearch_index_manager-1.0.0-osd-2.19.0.zip

# Install into OSD
./bin/opensearch-dashboards-plugin install \
  file://$(pwd)/opensearch_index_manager-1.0.0-osd-2.19.0.zip
```

### Method 2: Using GitHub CLI

```bash
# Download latest release
gh release download --repo opensearch-project/opensearch_index_manager \
  --pattern "*.zip"

# Download specific version
gh release download v1.0.0 --repo opensearch-project/opensearch_index_manager
```

### Method 3: Container Images (Future)

When container images are published:

```bash
# Pull container image
podman pull ghcr.io/opensearch-project/opensearch_index_manager:v1.0.0

# Use in docker-compose
docker-compose up -d
```

## Publishing Packages

### Automated Publishing (CI/CD)

Packages are automatically published via GitHub Actions when:
- A new release is created
- A version tag is pushed (e.g., `v1.0.0`)

See [`.github/workflows/ci-cd.yml`](../workflows/ci-cd.yml) for details.

### Manual Publishing

For maintainers only:

```bash
# 1. Build plugin
./scripts/ci/build-for-version.sh 2.19.0

# 2. Create release
gh release create v1.0.0 \
  --title "Release v1.0.0" \
  --notes "Release notes here" \
  build/*.zip

# 3. Packages will be attached to the release
```

## Package Versioning

### Version Format

```
v{plugin-version}-osd-{osd-version}

Examples:
- v1.0.0-osd-2.19.0
- v1.0.0-osd-2.19.1
- v1.1.0-beta.1-osd-2.19.2
```

### Version Tags

| Tag | Description |
|-----|-------------|
| `latest` | Latest stable release |
| `v1.0.0-osd-2.19.0` | Specific version |
| `main` | Development build from main branch |

### Finding Available Versions

```bash
# List releases
gh release list --repo opensearch-project/opensearch_index_manager

# View specific release
gh release view v1.0.0 --repo opensearch-project/opensearch_index_manager
```

## Package Structure

### Release Artifacts

Each release includes artifacts for all supported OSD versions:

```
release/
├── opensearch_index_manager-1.0.0-osd-2.19.0.zip
├── opensearch_index_manager-1.0.0-osd-2.19.1.zip
├── opensearch_index_manager-1.0.0-osd-2.19.2.zip
├── opensearch_index_manager-1.0.0-osd-2.19.3.zip
└── opensearch_index_manager-1.0.0-osd-2.19.4.zip
```

### Artifact Contents

```
opensearch_index_manager-{version}-osd-{osd-version}.zip
├── opensearch_index_manager/
│   ├── common/
│   ├── public/
│   ├── server/
│   ├── utils/
│   ├── config.ts
│   ├── opensearch_dashboards.json
│   └── package.json
└── [build artifacts]
```

## Troubleshooting

### Authentication Issues

**Error**: `denied: permission_denied`

**Solution**:
```bash
# Verify login status
podman login ghcr.io

# Re-authenticate
podman logout ghcr.io
echo $CR_PAT | podman login ghcr.io -u USERNAME --password-stdin
```

### Package Not Found

**Error**: `manifest unknown`

**Solution**:
- Verify package name and version
- Check repository visibility (must be public or you must have access)
- Ensure you're authenticated correctly

### Rate Limiting

GitHub Package Registry has rate limits:
- Authenticated: 5,000 requests per hour
- Unauthenticated: 60 requests per hour

**Solution**:
- Authenticate with personal access token
- Cache downloaded packages
- Use releases directly for downloads

## Best Practices

1. **Use Releases for Distribution**: GitHub Releases are the primary distribution method
2. **Version Pinning**: Always specify exact versions in production
3. **Checksum Verification**: Verify artifact checksums after download
4. **Automated Updates**: Use tools like Dependabot for update notifications

## Additional Resources

- [GitHub Packages Documentation](https://docs.github.com/en/packages)
- [Working with the Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)

## Support

For issues with GitHub Package Registry:
- [GitHub Support](https://support.github.com/)
- [GitHub Community](https://github.community/)