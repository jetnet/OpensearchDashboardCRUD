# OpenSearch Index Manager - Build and Test Infrastructure

This directory contains the complete containerized build and test infrastructure for the OpenSearch Index Manager plugin.

## Quick Start

One-command build and test:

```bash
# Build and test for default version (2.19.0)
./scripts/local-build-and-test.sh

# Build and test for specific version
./scripts/local-build-and-test.sh -v 2.19.2

# Build for all supported versions
./scripts/local-build-and-test.sh -a

# Build only (no tests, no cluster startup)
./scripts/local-build-and-test.sh -b

# Skip tests but start cluster and install plugin
./scripts/local-build-and-test.sh -s

# Keep containers running after tests
./scripts/local-build-and-test.sh -k
```

## Prerequisites

- **Podman** - Container engine (tested with podman 4.x)
- **podman-compose** - For orchestrating multi-container setup
- **curl** - For health checks
- **bash** 4.0+ - For script execution

### Installing Prerequisites

**Fedora/RHEL:**
```bash
sudo dnf install podman podman-compose curl
```

**Ubuntu/Debian:**
```bash
sudo apt-get install podman podman-compose curl
```

## Architecture

The build infrastructure consists of:

### 1. Build Container ([`Dockerfile.build`](Dockerfile.build))

- Based on `docker.io/node:18.19.0-slim`
- Clones OpenSearch Dashboards source code
- Bootstraps the OSD development environment
- Builds the plugin using OSD's plugin_helpers
- Outputs the built plugin to `dist/` directory

**Key features:**
- Smart yarn installation (checks if yarn exists first)
- Proper error handling and validation
- Volume mounts for plugin source and output

### 2. Main Script ([`local-build-and-test.sh`](local-build-and-test.sh))

**Phases:**
1. **Prerequisites Check** - Verifies podman, podman-compose are available
2. **Build** - Creates builder image and runs containerized build
3. **Cluster Startup** - Starts OpenSearch and OSD containers
4. **Plugin Installation** - Installs the built plugin into OSD
5. **Test Data Setup** - Creates sample indices and documents
6. **Functional Tests** - Runs Playwright-based browser tests
7. **Health Checks** - Verifies all services are working
8. **Cleanup** - Stops and removes containers (unless -k flag used)

**Supported OSD versions:** 2.19.0, 2.19.1, 2.19.2, 2.19.3, 2.19.4

### 3. Helper Scripts

| Script | Purpose |
|--------|---------|
| [`start-local.sh`](start-local.sh) | Start OpenSearch + OSD containers |
| [`stop-local.sh`](stop-local.sh) | Stop and cleanup containers |
| [`install-plugin.sh`](install-plugin.sh) | Install plugin into running OSD |
| [`build-plugin.sh`](build-plugin.sh) | Build plugin (local or containerized) |
| [`setup-test-data.sh`](setup-test-data.sh) | Create test indices with sample data |

## Directory Structure

```
.
├── dist/                          # Built plugin artifacts (created by build)
├── opensearch_index_manager/      # Plugin source code
├── functional-tests/              # Playwright-based tests
├── podman-compose.yml             # Container orchestration
└── scripts/
    ├── Dockerfile.build           # Build container definition
    ├── local-build-and-test.sh    # Main orchestration script
    ├── start-local.sh             # Start local cluster
    ├── stop-local.sh              # Stop local cluster
    ├── install-plugin.sh          # Install plugin to cluster
    ├── build-plugin.sh            # Build plugin locally
    └── setup-test-data.sh         # Create test data
```

## Image References

All podman/docker images use fully qualified names to avoid short-name resolution issues:

- `docker.io/opensearchproject/opensearch:2.19.0`
- `docker.io/opensearchproject/opensearch-dashboards:2.19.0`
- `docker.io/node:18.19.0-slim`
- `localhost/osim-builder:2.19.0` (locally built)

## Error Handling

All scripts implement:

- `set -euo pipefail` for strict error handling
- Trap-based cleanup on error
- Detailed error messages with context
- Exit code propagation
- Color-coded output for readability

## Output

Build artifacts are placed in `dist/` directory:

```
dist/
└── opensearch_index_manager-1.0.0-osd-2.19.0.zip
```

## Testing

### Manual Testing

```bash
# 1. Start the cluster
./scripts/start-local.sh

# 2. Build and install the plugin
./scripts/local-build-and-test.sh -b -s -k

# 3. Setup test data
./scripts/setup-test-data.sh

# 4. Access the plugin
# Open http://localhost:5601/app/opensearch_index_manager

# 5. Stop when done
./scripts/stop-local.sh
```

### Automated Testing

```bash
# Run full test suite
./scripts/local-build-and-test.sh

# Test specific version
./scripts/local-build-and-test.sh -v 2.19.2

# Test all versions
./scripts/local-build-and-test.sh -a
```

## Troubleshooting

### Build Issues

**Problem:** Yarn installation fails in container  
**Solution:** The Dockerfile now checks if yarn exists before installing

**Problem:** Builder image exists but is outdated  
**Solution:** Remove the image manually:
```bash
podman rmi localhost/osim-builder:2.19.0
```

**Problem:** Build fails with permission errors  
**Solution:** Ensure your user is in the proper groups for podman

### Container Issues

**Problem:** Short-name resolution error  
**Solution:** All images now use fully qualified names (docker.io/...)

**Problem:** Containers fail to start  
**Solution:** Check logs:
```bash
podman logs osim-opensearch
podman logs osim-dashboards
```

**Problem:** Port conflicts  
**Solution:** Stop other services using ports 9200 or 5601

### Test Issues

**Problem:** Playwright browsers not installed  
**Solution:** The script auto-installs them, or manually:
```bash
cd functional-tests
npx playwright install chromium
```

**Problem:** Tests timeout  
**Solution:** Increase timeout in playwright.config.ts or check if services are healthy

## CI/CD Integration

This infrastructure is designed to mirror the GitHub Actions CI/CD pipeline. Running locally first validates everything before pushing to GitHub.

### Pre-push Checklist

```bash
# 1. Build and test
./scripts/local-build-and-test.sh

# 2. Check the built artifact
ls -la dist/

# 3. Verify it can be installed
./scripts/start-local.sh
./scripts/local-build-and-test.sh -b -s -k

# 4. All good? Push to GitHub
git push origin main
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENSEARCH_URL` | OpenSearch endpoint | `http://localhost:9200` |
| `OSD_BASE_URL` | Dashboards URL for tests | `http://localhost:5601` |

## License

Same as the OpenSearch Index Manager plugin (Apache 2.0)
