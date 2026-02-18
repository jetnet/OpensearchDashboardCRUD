# Releasing OpenSearch Index Manager Plugin

This document describes the release process for the OpenSearch Index Manager plugin.

## Table of Contents

- [Overview](#overview)
- [Versioning](#versioning)
- [Release Process](#release-process)
- [CI/CD Pipeline](#cicd-pipeline)
- [Manual Release](#manual-release)
- [GitHub Package Registry](#github-package-registry)
- [Troubleshooting](#troubleshooting)

## Overview

The plugin follows [Semantic Versioning](https://semver.org/) (SemVer) and supports multiple OpenSearch Dashboards (OSD) versions simultaneously. Each release produces plugin artifacts for all supported OSD versions (currently 2.19.0 through 2.19.4).

### Supported OSD Versions

| OSD Version | Node.js Version | Status |
|-------------|-----------------|--------|
| 2.19.0 | 18.19.0 | ✅ Supported |
| 2.19.1 | 18.19.0 | ✅ Supported |
| 2.19.2 | 18.19.0 | ✅ Supported |
| 2.19.3 | 18.19.0 | ✅ Supported |
| 2.19.4 | 18.19.0 | ✅ Supported |

## Versioning

### Version Format

```
MAJOR.MINOR.PATCH[-prerelease][+build]
```

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)
- **prerelease**: Pre-release versions (e.g., `beta.1`, `rc.1`)

### Examples

| Version | Type | Description |
|---------|------|-------------|
| `1.0.0` | Stable | First stable release |
| `1.1.0` | Stable | New features added |
| `1.1.1` | Stable | Bug fixes |
| `2.0.0-beta.1` | Pre-release | Beta version for v2.0.0 |
| `1.2.0-rc.1` | Pre-release | Release candidate |

## Release Process

### Automated Release (Recommended)

The recommended way to create a release is by pushing a git tag, which triggers the CI/CD pipeline:

```bash
# 1. Ensure you're on the main branch and up to date
git checkout main
git pull origin main

# 2. Update version in package.json (if not already done)
npm version 1.0.0 --no-git-tag-version

# 3. Commit version bump
git add opensearch_index_manager/package.json
git commit -m "chore(release): prepare v1.0.0"

# 4. Create and push a tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main
git push origin v1.0.0
```

The CI/CD pipeline will:
1. Build the plugin for all OSD versions
2. Run integration tests
3. Create a GitHub Release with all artifacts
4. Generate release notes

### Manual Release

For more control over the release process, use the provided scripts:

```bash
# 1. Prepare release artifacts
./scripts/ci/prepare-release.sh 1.0.0

# 2. This creates artifacts in ./release/ directory
# Review the generated files

# 3. Create a git tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# 4. Upload artifacts to GitHub Release manually
# Or trigger the CI/CD pipeline
```

#### Script Options

```bash
# Create a draft release
./scripts/ci/prepare-release.sh 1.0.0 --draft

# Create a pre-release
./scripts/ci/prepare-release.sh 2.0.0-beta.1 --prerelease

# Use existing artifacts (skip build)
./scripts/ci/prepare-release.sh 1.0.0 --skip-build --artifacts-dir ./existing-builds

# Add custom release notes
./scripts/ci/prepare-release.sh 1.0.0 --notes "Added new features X, Y, Z"

# Sign artifacts with GPG
./scripts/ci/prepare-release.sh 1.0.0 --sign
```

## CI/CD Pipeline

### Workflows

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| CI/CD | `.github/workflows/ci-cd.yml` | Push, PR, Tags, Manual | Main pipeline: build, test, release |
| PR Checks | `.github/workflows/pr-checks.yml` | Pull requests | Quick validation on PRs |
| Nightly | `.github/workflows/nightly.yml` | Schedule (02:00 UTC), Manual | Nightly builds and security scans |

### CI/CD Pipeline Stages

```
┌─────────────────────────────────────────────────────────────────┐
│                        CI/CD Pipeline                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐                                               │
│  │ Lint & Type  │                                               │
│  │    Check     │                                               │
│  └──────┬───────┘                                               │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │ Build Matrix │───▶│  Integration │───▶│   Release    │      │
│  │  (Parallel)  │    │    Tests     │    │   (Tags)     │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                                                                 │
│  OSD Versions: 2.19.0, 2.19.1, 2.19.2, 2.19.3, 2.19.4          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Build Matrix

Each OSD version is built in parallel:

| Job | OSD Version | Node.js | OS |
|-----|-------------|---------|-----|
| build-2.19.0 | 2.19.0 | 18.19.0 | ubuntu-latest |
| build-2.19.1 | 2.19.1 | 18.19.0 | ubuntu-latest |
| build-2.19.2 | 2.19.2 | 18.19.0 | ubuntu-latest |
| build-2.19.3 | 2.19.3 | 18.19.0 | ubuntu-latest |
| build-2.19.4 | 2.19.4 | 18.19.0 | ubuntu-latest |

### Triggering CI/CD Manually

```bash
# Via GitHub CLI
gh workflow run ci-cd.yml --ref main

# With parameters
gh workflow run ci-cd.yml \
  --ref main \
  -f osd_version=2.19.0 \
  -f skip_tests=false \
  -f release_draft=true
```

## GitHub Package Registry

### Package Naming Convention

| Element | Format | Example |
|---------|--------|---------|
| Package Name | `opensearch_index_manager` | `opensearch_index_manager` |
| Version Tag | `v{version}-osd-{osd_version}` | `v1.0.0-osd-2.19.0` |
| Container | `ghcr.io/OWNER/opensearch_index_manager` | `ghcr.io/myorg/opensearch_index_manager` |

### Authentication

To authenticate with GitHub Package Registry:

```bash
# Using personal access token
export CR_PAT=YOUR_GITHUB_TOKEN
echo $CR_PAT | podman login ghcr.io -u USERNAME --password-stdin
```

### Installing from GitHub Packages

```bash
# Install specific version
./bin/opensearch-dashboards-plugin install \
  https://github.com/OWNER/REPO/releases/download/v1.0.0/opensearch_index_manager-1.0.0-osd-2.19.0.zip
```

## Release Checklist

Use this checklist before creating a release:

- [ ] All tests passing locally
- [ ] Version updated in `package.json`
- [ ] `CHANGELOG.md` updated with changes
- [ ] Documentation updated (if needed)
- [ ] Breaking changes documented (if any)
- [ ] Version compatibility matrix checked
- [ ] No critical security vulnerabilities (`yarn audit`)
- [ ] Git tag follows format `v{version}`

### Pre-Release Checklist

- [ ] Marked as pre-release in GitHub
- [ ] Version includes prerelease identifier (e.g., `-beta.1`)
- [ ] Clearly documented as unstable/testing

### Post-Release Checklist

- [ ] GitHub Release created with artifacts
- [ ] Release notes published
- [ ] Checksums verified
- [ ] Installation instructions tested
- [ ] Announcement sent (if applicable)

## Troubleshooting

### Build Failures

#### OSD Bootstrap Fails

```bash
# Clear yarn cache
yarn cache clean

# Retry with verbose output
yarn osd bootstrap --verbose
```

#### Out of Memory During Build

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
```

### Release Failures

#### Artifact Upload Fails

```bash
# Verify artifacts exist
ls -la build/*.zip

# Check artifact size
find build -name "*.zip" -size +1M
```

#### Integration Tests Fail

```bash
# Run tests locally with verbose output
./scripts/ci/run-integration-tests.sh --verbose --keep-containers

# Check container logs
podman logs opensearch-dashboards
```

### Version Conflicts

If the OSD version matrix needs updating:

1. Edit `.github/osd-versions.json`
2. Update version list and any related metadata
3. Test builds for new versions
4. Update this documentation

## Scripts Reference

| Script | Purpose | Usage |
|--------|---------|-------|
| `scripts/ci/build-for-version.sh` | Build for specific OSD version | `./build-for-version.sh 2.19.0` |
| `scripts/ci/run-integration-tests.sh` | Run integration tests | `./run-integration-tests.sh` |
| `scripts/ci/prepare-release.sh` | Prepare release artifacts | `./prepare-release.sh 1.0.0` |

## Support

For issues with the release process:

1. Check the [CI/CD workflow logs](https://github.com/OWNER/REPO/actions)
2. Review this documentation
3. Open an issue with:
   - Release version
   - Error messages
   - Workflow run URL
   - Steps to reproduce

---

*Last updated: 2024*
