# Package Configuration Guide

This document details the configuration options for publishing and consuming the OpenSearch Index Manager plugin through GitHub Package Registry.

## Table of Contents

- [Registry Configuration](#registry-configuration)
- [Authentication Setup](#authentication-setup)
- [CI/CD Configuration](#cicd-configuration)
- [Local Development](#local-development)
- [Organization Setup](#organization-setup)

## Registry Configuration

### GitHub Container Registry (ghcr.io)

The plugin artifacts are published to GitHub Container Registry as part of the release process.

#### Registry URLs

| Registry | URL |
|----------|-----|
| Container Registry | `ghcr.io` |
| Package Registry | `https://npm.pkg.github.com` |
| Maven Registry | `https://maven.pkg.github.com` |

#### Package Naming

```
ghcr.io/OWNER/REPO:TAG

Examples:
ghcr.io/opensearch-project/opensearch_index_manager:v1.0.0
ghcr.io/opensearch-project/opensearch_index_manager:latest
```

### Repository Configuration

#### Package Visibility

Packages inherit visibility from the repository:

- **Public Repository** → Public packages
- **Private Repository** → Private packages (requires authentication)

#### Package Settings

Configure package settings in GitHub:

1. Go to Repository → Settings → Packages
2. Configure:
   - **Package Visibility**: Public/Private
   - **Delete Protection**: Require admin approval
   - **Workflow Permissions**: Grant write access

## Authentication Setup

### Personal Access Token (PAT)

#### Required Permissions

| Scope | Description | Required For |
|-------|-------------|--------------|
| `read:packages` | Download packages | All users |
| `write:packages` | Upload packages | Maintainers |
| `delete:packages` | Delete packages | Admin |
| `repo` | Access repository | Private repos |

#### Creating a Token

1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select required scopes
4. Copy token immediately (shown only once)

### Environment Configuration

#### Linux/macOS

```bash
# Add to ~/.bashrc or ~/.zshrc
export GITHUB_TOKEN=your_token_here
export GITHUB_USERNAME=your_username

# For immediate use
source ~/.bashrc
```

#### Windows

```powershell
# PowerShell
[Environment]::SetEnvironmentVariable("GITHUB_TOKEN", "your_token", "User")

# Command Prompt
setx GITHUB_TOKEN "your_token"
```

### Container Runtime Authentication

#### Podman

```bash
# Login
echo $GITHUB_TOKEN | podman login ghcr.io -u $GITHUB_USERNAME --password-stdin

# Verify
podman login ghcr.io

# Logout (when needed)
podman logout ghcr.io
```

#### Docker

```bash
# Login
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin

# Verify
docker login ghcr.io

# Logout
docker logout ghcr.io
```

### GitHub Actions Authentication

Workflows automatically have access to `GITHUB_TOKEN`:

```yaml
jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
```

## CI/CD Configuration

### GitHub Actions Workflow

The CI/CD pipeline automatically handles package publishing:

#### Workflow Triggers

```yaml
on:
  push:
    tags:
      - 'v*'
  release:
    types: [published]
```

#### Build Matrix

```yaml
strategy:
  matrix:
    osd_version: ['2.19.0', '2.19.1', '2.19.2', '2.19.3', '2.19.4']
```

#### Artifact Upload

```yaml
- name: Upload to GitHub Releases
  uses: softprops/action-gh-release@v1
  with:
    files: build/*.zip
    token: ${{ secrets.GITHUB_TOKEN }}
```

### Release Configuration

#### Version Tagging

```bash
# Semantic versioning
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# Pre-release
git tag -a v1.1.0-beta.1 -m "Beta release v1.1.0-beta.1"
git push origin v1.1.0-beta.1
```

#### Release Notes Template

```markdown
## Changes
- Feature 1
- Feature 2

## Compatibility
- OpenSearch Dashboards 2.19.0 - 2.19.4
- OpenSearch 2.19.x

## Installation
\`\`\`bash
./bin/opensearch-dashboards-plugin install \
  https://github.com/opensearch-project/opensearch_index_manager/releases/download/v1.0.0/opensearch_index_manager-1.0.0-osd-2.19.0.zip
\`\`\`

## Artifacts
| OSD Version | Download |
|-------------|----------|
| 2.19.0 | [Download](link) |
| 2.19.1 | [Download](link) |
```

## Local Development

### Downloading Artifacts Locally

```bash
# Using curl with authentication
curl -L \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -o opensearch_index_manager.zip \
  https://github.com/opensearch-project/opensearch_index_manager/releases/download/v1.0.0/opensearch_index_manager-1.0.0-osd-2.19.0.zip

# Using wget
wget --header="Authorization: Bearer $GITHUB_TOKEN" \
  https://github.com/opensearch-project/opensearch_index_manager/releases/download/v1.0.0/opensearch_index_manager-1.0.0-osd-2.19.0.zip

# Using gh CLI
gh release download v1.0.0 \
  --repo opensearch-project/opensearch_index_manager \
  --pattern "opensearch_index_manager-1.0.0-osd-2.19.0.zip"
```

### Installing into Local OSD

```bash
# Navigate to OSD installation
cd /path/to/opensearch-dashboards

# Install plugin
./bin/opensearch-dashboards-plugin install \
  file:///path/to/downloaded/opensearch_index_manager-1.0.0-osd-2.19.0.zip

# Restart OSD
./bin/opensearch-dashboards
```

## Organization Setup

### Organization-Level Configuration

For organizations using GitHub Enterprise:

#### SSO Configuration

If SSO is enabled:

1. Generate PAT with SSO authorization
2. Authorize token for organization
3. Use token for authentication

#### Package Retention

Configure retention policies:

```yaml
# .github/package-retention.yml
package-rules:
  - name: opensearch_index_manager
    retention-days: 90
    keep-min-versions: 10
    keep-releases: true
```

#### Access Control

Manage package access:

1. Repository → Settings → Manage access
2. Add teams or individuals
3. Set permission levels:
   - Read: Download packages
   - Write: Upload packages
   - Admin: Full control

### Team Configuration

#### Creating Team Tokens

For CI/CD at organization level:

1. Create machine user account
2. Add to team with appropriate permissions
3. Generate PAT for machine user
4. Store as organization secret

#### Secret Management

```yaml
# Organization secret
ORG_GITHUB_TOKEN: ${{ secrets.ORG_GITHUB_TOKEN }}

# Repository secret
REPO_GITHUB_TOKEN: ${{ secrets.REPO_GITHUB_TOKEN }}
```

## Security Configuration

### Token Rotation

Best practices for token management:

1. **Regular Rotation**: Rotate PATs every 90 days
2. **Expiration**: Set expiration dates on tokens
3. **Scope Limitation**: Use minimal required scopes
4. **Monitoring**: Review token usage regularly

### Audit Logging

Enable audit logs for package operations:

1. Organization → Settings → Audit log
2. Filter by package operations
3. Export logs for compliance

### Vulnerability Scanning

Enable dependency scanning:

```yaml
# .github/workflows/security.yml
name: Security Scan
on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'ghcr.io/opensearch-project/opensearch_index_manager:v1.0.0'
          format: 'sarif'
          output: 'trivy-results.sarif'
```

## Troubleshooting

### Common Configuration Issues

#### 401 Unauthorized

**Cause**: Invalid or expired token

**Solution**:
```bash
# Verify token
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/user

# Regenerate token if needed
```

#### 403 Forbidden

**Cause**: Insufficient permissions

**Solution**:
- Check token scopes
- Verify repository access
- For SSO: authorize token for organization

#### 404 Not Found

**Cause**: Package doesn't exist or no access

**Solution**:
- Verify package name
- Check repository visibility
- Ensure authentication is configured

### Debug Mode

Enable debug logging:

```bash
# Podman
podman --log-level=debug login ghcr.io

# Curl
curl -v -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://ghcr.io/v2/opensearch-project/opensearch_index_manager/tags/list
```

## Additional Resources

- [GitHub Packages Configuration](https://docs.github.com/en/packages/learn-github-packages/introduction-to-github-packages)
- [Configuring Docker for GitHub Packages](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-docker-registry)
- [GitHub Actions Permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)