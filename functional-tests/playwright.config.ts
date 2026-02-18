import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Functional test configuration for OpenSearch Index Manager plugin
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  
  /* Opt out of parallel tests on CI for stability */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use */
  reporter: [
    ['html', { outputFolder: '../test-output/functional-tests/html-report' }],
    ['list'],
    ...(process.env.CI ? [['github'] as const] : []),
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
    
    /* Action timeout */
    actionTimeout: 15000,
    
    /* Navigation timeout */
    navigationTimeout: 30000,
    
    /* Viewport size */
    viewport: { width: 1920, height: 1080 },
  },
  
  /* Timeout for each test */
  timeout: 60000,
  
  /* Expect timeout for assertions */
  expect: {
    timeout: 10000
  },
  
  /* Global setup and teardown */
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),
  
  /* Output directory for test artifacts */
  outputDir: '../test-output/functional-tests/test-results',
  
  /* Configure projects for major browsers */
  projects: [
    /* Smoke test project - runs first to verify plugin loads */
    {
      name: 'smoke',
      testMatch: /plugin-installation\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']
        }
      },
    },
    
    {
      name: 'chromium',
      dependencies: ['smoke'],
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']
        }
      },
    },
    
    {
      name: 'firefox',
      dependencies: ['smoke'],
      use: {
        ...devices['Desktop Firefox'],
        launchOptions: {
          firefoxUserPrefs: {
            'security.fileuri.strict_origin_policy': false
          }
        }
      },
    },
    
    {
      name: 'webkit',
      dependencies: ['smoke'],
      use: {
        ...devices['Desktop Safari'],
      },
    },
    
    /* Test against mobile viewports */
    {
      name: 'Mobile Chrome',
      dependencies: ['smoke'],
      use: { ...devices['Pixel 5'] },
    },
    
    /* Test against branded browsers */
    {
      name: 'Microsoft Edge',
      dependencies: ['smoke'],
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    
    {
      name: 'Google Chrome',
      dependencies: ['smoke'],
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
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