#!/bin/bash
#
# Prepare Release Artifacts for OpenSearch Index Manager Plugin
# Usage: ./prepare-release.sh <VERSION> [OPTIONS]
#
# Example:
#   ./prepare-release.sh 1.0.0
#   ./prepare-release.sh 1.0.0 --draft --notes "Bug fixes and improvements"
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
VERSION=""
DRAFT=false
PRERELEASE=false
GENERATE_NOTES=true
RELEASE_NOTES=""
ARTIFACTS_DIR="./build"
OUTPUT_DIR="./release"
SKIP_BUILD=false
SKIP_VERIFY=false
SIGN_ARTIFACTS=false

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${CYAN}[STEP $1/6]${NC} $2"
}

# Help function
show_help() {
    cat << EOF
Prepare Release Artifacts for OpenSearch Index Manager Plugin

Usage: $(basename "$0") [OPTIONS] <VERSION>

Arguments:
  VERSION                 Release version (e.g., 1.0.0, 1.1.0-beta.1)

Options:
  -h, --help              Show this help message
  --draft                 Mark as draft release
  --prerelease            Mark as pre-release
  --no-notes              Don't generate release notes
  --notes TEXT            Custom release notes text
  --artifacts-dir PATH    Directory containing build artifacts (default: ./build)
  --output-dir PATH       Directory for release output (default: ./release)
  --skip-build            Skip building artifacts (use existing)
  --skip-verify           Skip artifact verification
  --sign                  Sign artifacts with GPG
  --changelog PATH        Path to CHANGELOG.md

Examples:
  $(basename "$0") 1.0.0
  $(basename "$0") 1.0.0 --draft --notes "Bug fixes"
  $(basename "$0") 2.0.0-beta.1 --prerelease
  $(basename "$0") 1.0.0 --skip-build --artifacts-dir ./existing-builds

EOF
}

# Parse options
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        --draft)
            DRAFT=true
            shift
            ;;
        --prerelease)
            PRERELEASE=true
            shift
            ;;
        --no-notes)
            GENERATE_NOTES=false
            shift
            ;;
        --notes)
            RELEASE_NOTES="$2"
            shift 2
            ;;
        --artifacts-dir)
            ARTIFACTS_DIR="$2"
            shift 2
            ;;
        --output-dir)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-verify)
            SKIP_VERIFY=true
            shift
            ;;
        --sign)
            SIGN_ARTIFACTS=true
            shift
            ;;
        --changelog)
            CHANGELOG_PATH="$2"
            shift 2
            ;;
        -*)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
        *)
            if [[ -z "$VERSION" ]]; then
                VERSION="$1"
            else
                log_error "Unexpected argument: $1"
                show_help
                exit 1
            fi
            shift
            ;;
    esac
done

# Validate version
if [[ -z "$VERSION" ]]; then
    log_error "Version is required"
    show_help
    exit 1
fi

# Validate version format
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$ ]]; then
    log_error "Invalid version format: $VERSION"
    log_info "Expected format: MAJOR.MINOR.PATCH[-prerelease][+build]"
    exit 1
fi

# Check if prerelease based on version string
if [[ "$VERSION" =~ -[a-zA-Z] ]] && [[ "$PRERELEASE" == "false" ]]; then
    log_info "Detected pre-release version: $VERSION"
    PRERELEASE=true
fi

PLUGIN_NAME="opensearch_index_manager"
OSD_VERSIONS=$(cat .github/osd-versions.json 2>/dev/null | jq -r '.versions | join(" ")' || echo "2.19.0 2.19.1 2.19.2 2.19.3 2.19.4")

# Header
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         OpenSearch Index Manager Release Preparation       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

log_info "Release Configuration:"
echo "  Version: $VERSION"
echo "  Draft: $DRAFT"
echo "  Prerelease: $PRERELEASE"
echo "  Generate Notes: $GENERATE_NOTES"
echo "  Skip Build: $SKIP_BUILD"
echo "  Sign Artifacts: $SIGN_ARTIFACTS"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Step 1: Update version in package.json
log_step 1 "Updating version in package.json"

if [[ -f "$PLUGIN_NAME/package.json" ]]; then
    # Update version using jq if available
    if command -v jq &> /dev/null; then
        jq ".version = \"$VERSION\"" "$PLUGIN_NAME/package.json" > "$PLUGIN_NAME/package.json.tmp"
        mv "$PLUGIN_NAME/package.json.tmp" "$PLUGIN_NAME/package.json"
    else
        # Fallback to sed
        sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" "$PLUGIN_NAME/package.json"
    fi
    log_success "Updated package.json to version $VERSION"
else
    log_warning "package.json not found at $PLUGIN_NAME/package.json"
fi

# Step 2: Build artifacts for all OSD versions
log_step 2 "Building artifacts for all OSD versions"

if [[ "$SKIP_BUILD" == "false" ]]; then
    mkdir -p "$ARTIFACTS_DIR"
    
    for osd_version in $OSD_VERSIONS; do
        log_info "Building for OSD $osd_version..."
        
        if [[ -x "scripts/ci/build-for-version.sh" ]]; then
            ./scripts/ci/build-for-version.sh "$osd_version" "$PLUGIN_NAME" || {
                log_error "Build failed for OSD $osd_version"
                exit 1
            }
        else
            log_error "Build script not found or not executable: scripts/ci/build-for-version.sh"
            exit 1
        fi
    done
    
    log_success "All builds completed"
else
    log_info "Skipping build (using existing artifacts)"
fi

# Step 3: Verify artifacts
log_step 3 "Verifying build artifacts"

if [[ "$SKIP_VERIFY" == "false" ]]; then
    MISSING_ARTIFACTS=()
    
    for osd_version in $OSD_VERSIONS; do
        ARTIFACT_PATTERN="${PLUGIN_NAME}-${VERSION}-osd-${osd_version}.zip"
        
        if [[ ! -f "$ARTIFACTS_DIR/$ARTIFACT_PATTERN" ]]; then
            # Try to find any matching artifact
            FOUND=$(find "$ARTIFACTS_DIR" -name "*osd-${osd_version}.zip" | head -1)
            if [[ -z "$FOUND" ]]; then
                MISSING_ARTIFACTS+=("$osd_version")
            fi
        fi
    done
    
    if [[ ${#MISSING_ARTIFACTS[@]} -gt 0 ]]; then
        log_error "Missing artifacts for OSD versions: ${MISSING_ARTIFACTS[*]}"
        exit 1
    fi
    
    log_success "All artifacts verified"
else
    log_warning "Skipping artifact verification"
fi

# Step 4: Generate checksums
log_step 4 "Generating checksums"

cd "$ARTIFACTS_DIR"
CHECKSUM_FILE="${PLUGIN_NAME}-${VERSION}-checksums.txt"
echo "# SHA256 Checksums for ${PLUGIN_NAME} ${VERSION}" > "$CHECKSUM_FILE"
echo "# Generated: $(date -u +"%Y-%m-%d %H:%M UTC")" >> "$CHECKSUM_FILE"
echo "" >> "$CHECKSUM_FILE"

for artifact in ${PLUGIN_NAME}-${VERSION}-osd-*.zip; do
    if [[ -f "$artifact" ]]; then
        sha256sum "$artifact" >> "$CHECKSUM_FILE"
    fi
done

cd - > /dev/null

cp "$ARTIFACTS_DIR/$CHECKSUM_FILE" "$OUTPUT_DIR/"
log_success "Checksums generated: $CHECKSUM_FILE"

# Step 5: Sign artifacts (optional)
log_step 5 "Signing artifacts"

if [[ "$SIGN_ARTIFACTS" == "true" ]]; then
    if command -v gpg &> /dev/null; then
        log_info "Signing artifacts with GPG..."
        
        cd "$ARTIFACTS_DIR"
        for artifact in ${PLUGIN_NAME}-${VERSION}-osd-*.zip; do
            if [[ -f "$artifact" ]]; then
                gpg --armor --detach-sign "$artifact" || {
                    log_warning "Failed to sign $artifact"
                }
            fi
        done
        cd - > /dev/null
        
        log_success "Artifacts signed"
    else
        log_warning "GPG not available, skipping signing"
    fi
else
    log_info "Skipping artifact signing (use --sign to enable)"
fi

# Step 6: Generate release notes
log_step 6 "Generating release notes"

if [[ "$GENERATE_NOTES" == "true" ]]; then
    RELEASE_NOTES_FILE="$OUTPUT_DIR/RELEASE_NOTES.md"
    
    cat > "$RELEASE_NOTES_FILE" << EOF
# OpenSearch Index Manager v${VERSION}

$(if [[ "$DRAFT" == "true" ]]; then echo "> ⚠️ This is a **DRAFT** release"; fi)
$(if [[ "$PRERELEASE" == "true" ]]; then echo "> ⚠️ This is a **PRE-RELEASE** version"; fi)

## Supported OpenSearch Dashboards Versions

| OSD Version | Status |
|-------------|--------|
$(for v in $OSD_VERSIONS; do echo "| $v | ✅ Supported |"; done)

## Installation

Choose the appropriate plugin zip file for your OpenSearch Dashboards version:

\`\`\`bash
# For OSD 2.19.0
./bin/opensearch-dashboards-plugin install \
  https://github.com/OWNER/REPO/releases/download/v${VERSION}/${PLUGIN_NAME}-${VERSION}-osd-2.19.0.zip
\`\`\`

Replace \`OWNER/REPO\` with your repository path and adjust the version accordingly.

## Artifacts

### Plugin Packages

| File | OSD Version | Size |
|------|-------------|------|
$(cd "$ARTIFACTS_DIR" && for f in ${PLUGIN_NAME}-${VERSION}-osd-*.zip; do
  if [[ -f "$f" ]]; then
    size=$(du -h "$f" | cut -f1)
    osd_ver=$(echo "$f" | grep -oE 'osd-[0-9]+\.[0-9]+\.[0-9]+' | sed 's/osd-//')
    echo "| $f | $osd_ver | $size |"
  fi
done)

### Checksums

SHA256 checksums are provided in \`${CHECKSUM_FILE}\`.

## Verification

Verify downloaded artifacts:

\`\`\`bash
# Linux/macOS
sha256sum -c ${CHECKSUM_FILE}

# After installation, verify the plugin
./bin/opensearch-dashboards-plugin list
\`\`\`

## Changes

$(if [[ -n "$RELEASE_NOTES" ]]; then
    echo "$RELEASE_NOTES"
else
    echo "See [CHANGELOG.md](../CHANGELOG.md) for detailed changes."
fi)

## Compatibility

This release is compatible with:
- OpenSearch Dashboards versions: $(echo $OSD_VERSIONS | tr '\n' ', ' | sed 's/, $//')
- OpenSearch version: $(cat .github/osd-versions.json | jq -r '.opensearchVersion // "2.19.0"')
- Node.js version: $(cat .github/osd-versions.json | jq -r '.nodeVersion // "18.19.0"')

## Support

For issues and feature requests, please visit:
https://github.com/OWNER/REPO/issues

---

*Released: $(date -u +"%Y-%m-%d %H:%M UTC")*
EOF

    log_success "Release notes generated: $RELEASE_NOTES_FILE"
else
    log_info "Release notes generation skipped"
fi

# Copy artifacts to output directory
log_info "Copying artifacts to output directory..."

cp "$ARTIFACTS_DIR"/${PLUGIN_NAME}-${VERSION}-osd-*.zip "$OUTPUT_DIR/" 2>/dev/null || true
cp "$ARTIFACTS_DIR"/${PLUGIN_NAME}-${VERSION}-osd-*.zip.asc "$OUTPUT_DIR/" 2>/dev/null || true

# Create a manifest file
cat > "$OUTPUT_DIR/manifest.json" << EOF
{
  "name": "${PLUGIN_NAME}",
  "version": "${VERSION}",
  "release_date": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "draft": ${DRAFT},
  "prerelease": ${PRERELEASE},
  "osd_versions": [$(echo $OSD_VERSIONS | sed 's/[^ ]*/"&"/g' | sed 's/ /, /g')],
  "artifacts": [
$(cd "$OUTPUT_DIR" && for f in ${PLUGIN_NAME}-${VERSION}-osd-*.zip; do
  if [[ -f "$f" ]]; then
    size=$(stat -c%s "$f" 2>/dev/null || stat -f%z "$f" 2>/dev/null || echo "0")
    checksum=$(sha256sum "$f" 2>/dev/null | awk '{print $1}' || echo "")
    osd_ver=$(echo "$f" | grep -oE 'osd-[0-9]+\.[0-9]+\.[0-9]+' | sed 's/osd-//')
    echo "    {"
    echo "      \"file\": \"$f\","
    echo "      \"osd_version\": \"$osd_ver\","
    echo "      \"size\": $size,"
    echo "      \"sha256\": \"$checksum\""
    echo "    },"
  fi
done | sed '$ s/,$//')
  ],
  "checksum_file": "${CHECKSUM_FILE}"
}
EOF

# Summary
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    Release Summary                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
log_success "Release v${VERSION} prepared successfully!"
echo ""
echo -e "${CYAN}Output Directory:${NC} $(realpath "$OUTPUT_DIR")"
echo ""
echo -e "${CYAN}Generated Files:${NC}"
ls -la "$OUTPUT_DIR/"
echo ""
echo -e "${CYAN}Next Steps:${NC}"
if [[ "$DRAFT" == "true" ]]; then
    echo "  1. Review the release notes: $OUTPUT_DIR/RELEASE_NOTES.md"
    echo "  2. Publish the draft release on GitHub"
else
    echo "  1. Review the release notes: $OUTPUT_DIR/RELEASE_NOTES.md"
    echo "  2. Create a git tag: git tag -a v${VERSION} -m \"Release ${VERSION}\""
    echo "  3. Push the tag: git push origin v${VERSION}"
    echo "  4. Create a GitHub release with the artifacts"
fi
echo ""
log_info "Done!"
echo ""

exit 0
