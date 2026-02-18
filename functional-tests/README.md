# OpenSearch Index Manager - Functional Tests

This directory contains a comprehensive browser-based functional testing suite for the `opensearch_index_manager` plugin using [Playwright](https://playwright.dev/).

## Overview

The functional test suite validates the plugin's UI functionality across multiple browsers, including:

- Plugin installation and navigation
- Index selection and management
- Document CRUD operations
- Nested field handling
- Array manipulation
- Mapping visualization
- Search and filtering

## Prerequisites

- Node.js 18+ installed
- OpenSearch and OpenSearch Dashboards running (via Podman/Docker)
- Plugin installed in OSD

## Setup

### 1. Install Dependencies

```bash
cd functional-tests
npm install
```

### 2. Install Playwright Browsers

```bash
npm run install:browsers
```

Or install with system dependencies:

```bash
npm run install:deps
```

### 3. Start Test Infrastructure

```bash
# From project root
cd ..
./scripts/start-local.sh
```

Or use Podman Compose directly:

```bash
podman-compose up -d
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Browser

```bash
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

### Run with UI Mode (Debugging)

```bash
npm run test:ui
```

### Run in Headed Mode (See browser window)

```bash
npm run test:headed
```

### Run with Debug

```bash
npm run test:debug
```

## Test Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OSD_BASE_URL` | OpenSearch Dashboards URL | `http://localhost:5601` |
| `OS_HOST` | OpenSearch host | `localhost` |
| `OS_PORT` | OpenSearch port | `9200` |
| `OS_PROTOCOL` | OpenSearch protocol | `http` |
| `OS_USERNAME` | OSD username (if auth enabled) | `admin` |
| `OS_PASSWORD` | OSD password (if auth enabled) | `admin` |
| `START_CONTAINERS` | Auto-start containers in setup | `true` |
| `STOP_CONTAINERS` | Auto-stop containers in teardown | `false` |
| `CLEANUP_DATA` | Clean up test data after tests | `true` |
| `CI` | Running in CI environment | - |

### Example with Custom URL

```bash
OSD_BASE_URL=http://my-osd:5601 npm test
```

## Test Structure

```
functional-tests/
├── playwright.config.ts      # Playwright configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── global-setup.ts           # Global test setup
├── global-teardown.ts        # Global test teardown
├── utils/
│   ├── selectors.ts          # UI element selectors
│   ├── api-client.ts         # OpenSearch API client
│   ├── test-helpers.ts       # Test helper functions
│   └── index.ts              # Utility exports
├── fixtures/
│   └── test-data.ts          # Test data and fixtures
└── tests/
    ├── plugin-installation.spec.ts  # Plugin installation tests
    ├── index-selection.spec.ts      # Index selection tests
    ├── document-list.spec.ts        # Document list tests
    ├── document-crud.spec.ts        # Document CRUD tests
    ├── nested-fields.spec.ts        # Nested field tests
    └── mapping-viewer.spec.ts       # Mapping viewer tests
```

## Test Reports

After running tests, reports are available in:

```
test-output/functional-tests/
├── html-report/              # HTML test report
│   └── index.html
├── test-results/             # Test artifacts (screenshots, videos)
├── results.json              # JSON test results
└── junit-results.xml         # JUnit XML report
```

To view the HTML report:

```bash
npm run test:report
```

## Debugging Failed Tests

### 1. View Screenshots

Screenshots are automatically captured on failure:

```
test-output/functional-tests/test-results/
```

### 2. View Videos

Videos are recorded for failed tests (configured in `playwright.config.ts`):

```
test-output/functional-tests/test-results/
```

### 3. Use UI Mode

```bash
npm run test:ui
```

UI Mode provides:
- Time-travel debugging
- Watch mode
- Network request inspection
- Console logs
- Source maps

### 4. Use Trace Viewer

Traces are collected on first retry:

```bash
npx playwright show-trace test-output/functional-tests/test-results/<test-name>/trace.zip
```

## Adding New Tests

### 1. Create Test File

Create a new file in `tests/`:

```typescript
import { test, expect } from '@playwright/test';
import { navigateToPlugin, waitForPluginToLoad } from '../utils/test-helpers';
import { Selectors } from '../utils/selectors';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPlugin(page);
    await waitForPluginToLoad(page);
  });

  test('my test case', async ({ page }) => {
    // Test implementation
  });
});
```

### 2. Add Test Data (if needed)

Add test data to `fixtures/test-data.ts`.

### 3. Add Selectors (if needed)

Add new selectors to `utils/selectors.ts`.

### 4. Add Helper Functions (if needed)

Add helper functions to `utils/test-helpers.ts`.

## Best Practices

1. **Use Selectors**: Always use selectors from `Selectors` object for consistency
2. **Wait for Elements**: Use explicit waits instead of arbitrary timeouts
3. **Clean State**: Use `beforeEach`/`afterEach` to ensure clean test state
4. **Descriptive Names**: Use descriptive test names that explain what is being tested
5. **One Assertion Per Test**: Keep tests focused on single behavior
6. **Handle Flakiness**: Use retries and proper waiting strategies

## CI/CD Integration

The tests are integrated into the CI/CD pipeline (see `.github/workflows/ci-cd.yml`):

```yaml
- name: Run Functional Tests
  run: |
    cd functional-tests
    npm ci
    npm run install:browsers
    npm test
```

Test artifacts (screenshots, videos, traces) are uploaded on failure.

## Troubleshooting

### Tests Fail to Connect to OSD

1. Verify OSD is running: `curl http://localhost:5601/api/status`
2. Check environment variables: `echo $OSD_BASE_URL`
3. Verify network connectivity between test runner and OSD

### Browser Installation Issues

```bash
# Remove existing browsers
rm -rf ~/Library/Caches/ms-playwright  # macOS
rm -rf ~/.cache/ms-playwright          # Linux

# Reinstall
npm run install:browsers
```

### Container Startup Issues

```bash
# Check container status
podman ps

# View container logs
podman logs opensearch-node
podman logs opensearch-dashboards

# Restart containers
podman-compose restart
```

### Timeout Issues

Increase timeouts in `playwright.config.ts`:

```typescript
timeout: 120000,  // Increase from 60000
```

Or set via environment variable:

```bash
SETUP_TIMEOUT=600000 npm test
```

## Contributing

When adding new features to the plugin:

1. Add corresponding functional tests
2. Update this README if new environment variables or commands are added
3. Ensure tests pass on all supported browsers (Chromium, Firefox, WebKit)
4. Run linting: `npm run lint`

## License

Apache-2.0 (same as the main project)