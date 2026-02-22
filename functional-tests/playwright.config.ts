import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Functional test configuration for OpenSearch Index Manager plugin
 * @see https://playwright.dev/docs/test-configuration
 */

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',

  /* Run tests in files in parallel - disable in CI for stability */
  fullyParallel: !isCI,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: isCI,

  /* Retry more in CI to handle flaky browser resource issues */
  retries: isCI ? 3 : 1,

  /* Single worker in CI to avoid resource exhaustion */
  workers: isCI ? 1 : undefined,

  /* Maximum failures before stopping - fail fast in CI */
  maxFailures: isCI ? 3 : undefined,

  /* Reporter to use */
  reporter: [
    ['html', { outputFolder: '../test-output/functional-tests/html-report' }],
    ['list'],
    ...(isCI ? [['github'] as const] : []),
    ['json', { outputFile: '../test-output/functional-tests/results.json' }],
    ['junit', { outputFile: '../test-output/functional-tests/junit-results.xml' }]
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.OSD_BASE_URL || 'http://localhost:5601',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Capture screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video for debugging */
    video: 'on-first-retry',

    /* Action timeout - longer in CI for stability */
    actionTimeout: isCI ? 20000 : 15000,

    /* Navigation timeout - longer in CI */
    navigationTimeout: isCI ? 45000 : 30000,

    /* Viewport size */
    viewport: { width: 1920, height: 1080 },

    /* CI-specific launch options for resource optimization */
    launchOptions: isCI ? {
      args: [
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-accelerated-2d-canvas',
        '--disable-accelerated-jpeg-decoding',
        '--disable-accelerated-mjpeg-decode',
        '--disable-accelerated-video-decode',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-breakpad',
        '--disable-cache',
        '--disable-component-extensions-with-background-pages',
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-hang-monitor',
        '--disable-impl-side-painting',
        '--disable-popup-blocking',
        '--disable-prompt-on-repost',
        '--disable-sync',
        '--disable-translate',
        '--memory-pressure-off',
        '--no-first-run',
        '--single-process',
      ],
    } : {
      args: [
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
    },
  },

  /* Timeout for each test - longer in CI */
  timeout: isCI ? 90000 : 60000,

  /* Expect timeout for assertions */
  expect: {
    timeout: isCI ? 15000 : 10000
  },

  /* Global setup and teardown */
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),

  /* Output directory for test artifacts */
  outputDir: '../test-output/functional-tests/test-results',

  /* Configure projects based on environment */
  projects: isCI
    ? [
        /* CI: Only run essential tests */
        {
          name: 'essential-chromium',
          testMatch: /essential-crud\.spec\.ts/,
          use: devices['Desktop Chrome'],
        },
      ]
    : [
        /* Local development: Run essential tests only */
        {
          name: 'essential-chromium',
          testMatch: /essential-crud\.spec\.ts/,
          use: {
            ...devices['Desktop Chrome'],
            launchOptions: {
              args: ['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process'],
            },
          },
        },
      ],

  /* Run local dev server before starting the tests */
  // webServer: {
  //   command: '../scripts/start-local.sh',
  //   url: 'http://localhost:5601',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120000,
  // },
});
