# Release Instructions

This document provides instructions for creating releases of the OpenSearch Dashboards CRUD Plugin.

## Prerequisites

Before creating a release, ensure you have:

1. Built the plugin successfully using the build script
2. Tested the plugin with the target OpenSearch Dashboards version
3. Updated the version number in `opensearch-crud-plugin/package.json`
4. Updated `CHANGELOG.md` with the release notes

## Step 1: Build the Plugin

```bash
# Build with specific OSD version
./scripts/build-with-osd.sh 2.11.0 1.0.0

# The built plugin will be in:
# build/releases/crudPlugin-1.0.0-osd-2.11.0.zip
```

## Step 2: Create a Git Tag

```bash
# Create an annotated tag
git tag -a v1.0.0 -m "Release v1.0.0"

# Push the tag to GitHub
git push origin v1.0.0
```

## Step 3: Create a GitHub Release

### Option A: Using GitHub CLI (if installed)

```bash
# Install GitHub CLI if needed (Debian/Ubuntu)
sudo apt install gh

# Authenticate
gh auth login

# Create the release
gh release create v1.0.0 \
  --title "v1.0.0 - Initial Release" \
  --notes-file CHANGELOG.md \
  build/releases/crudPlugin-1.0.0-osd-2.11.0.zip
```

### Option B: Using GitHub Web Interface

1. Go to https://github.com/jetnet/OpensearchDashboardCRUD/releases
2. Click "Draft a new release"
3. Select the tag (or create one: `v1.0.0`)
4. Fill in the release title: `v1.0.0 - Initial Release`
5. Copy the relevant section from `CHANGELOG.md` into the description
6. Upload the plugin zip file:
   - `build/releases/crudPlugin-1.0.0-osd-2.11.0.zip`
   - `build/releases/crudPlugin-1.0.0-osd-2.11.0.zip.sha256`
7. Click "Publish release"

## Step 4: Verify the Release

After publishing, verify:

1. The release appears at: https://github.com/jetnet/OpensearchDashboardCRUD/releases
2. The zip file can be downloaded
3. The plugin can be installed from the release:

```bash
# In OpenSearch Dashboards installation directory
./bin/opensearch-dashboards-plugin install https://github.com/jetnet/OpensearchDashboardCRUD/releases/download/v1.0.0/crudPlugin-1.0.0-osd-2.11.0.zip
```

## Release Checklist

- [ ] Update version in `opensearch-crud-plugin/package.json`
- [ ] Update `CHANGELOG.md` with release notes
- [ ] Build the plugin: `./scripts/build-with-osd.sh <osd-version> <plugin-version>`
- [ ] Test the built plugin
- [ ] Create and push git tag
- [ ] Create GitHub release with zip attachment
- [ ] Verify release installation works

## Version Naming Convention

- Plugin version: `MAJOR.MINOR.PATCH` (e.g., `1.0.0`)
- Release artifacts: `crudPlugin-{plugin-version}-osd-{osd-version}.zip`
- Git tags: `v{plugin-version}` (e.g., `v1.0.0`)

## Supported OpenSearch Dashboards Versions

| Plugin Version | OSD Version | Artifact Name |
|----------------|-------------|---------------|
| 1.0.0 | 2.11.0 | crudPlugin-1.0.0-osd-2.11.0.zip |
| 1.0.0 | 2.10.0 | crudPlugin-1.0.0-osd-2.10.0.zip |

For each supported OSD version, build and release a separate artifact.
