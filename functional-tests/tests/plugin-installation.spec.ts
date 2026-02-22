/**
 * Plugin Installation Tests
 * Verify plugin is installed and accessible in OSD
 * NOTE: These tests are disabled - only essential-crud.spec.ts tests are run
 */

import { test, expect } from '@playwright/test';
import { loginToOSD, waitForPluginToLoad } from '../utils/test-helpers';
import { Selectors } from '../utils/selectors';

test.describe.skip('Plugin Installation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await loginToOSD(page);
  });

  test.skip('plugin appears in OSD navigation', async ({ page }) => {
    // Look for the plugin navigation link
    const navLink = page.locator(Selectors.plugin.navLink);
    
    // The link should be visible in the navigation
    await expect(navLink).toBeVisible();
    
    // Verify the link text contains our plugin name
    const linkText = await navLink.textContent();
    expect(linkText?.toLowerCase()).toContain('index');
  });

  test.skip('plugin navigation works', async ({ page }) => {
    // Click on the plugin navigation link
    const navLink = page.locator(Selectors.plugin.navLink);
    await navLink.click();

    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');

    // Verify URL contains plugin path
    await expect(page).toHaveURL(/.*opensearch_index_manager.*/);
  });

  test.skip('plugin loads without errors', async ({ page }) => {
    // Navigate to the plugin
    await page.goto('/app/opensearch_index_manager');

    // Wait for plugin to load
    await waitForPluginToLoad(page);

    // Verify the app container is visible
    await expect(page.locator(Selectors.plugin.appContainer)).toBeVisible();

    // Verify no error messages are displayed
    const errorMessage = page.locator(Selectors.plugin.errorMessage);
    await expect(errorMessage).not.toBeVisible();
  });

  test.skip('plugin page has correct title', async ({ page }) => {
    // Navigate to the plugin
    await page.goto('/app/opensearch_index_manager');
    await waitForPluginToLoad(page);

    // Verify page title
    const pageTitle = page.locator(Selectors.plugin.pageTitle);
    await expect(pageTitle).toBeVisible();
    
    const titleText = await pageTitle.textContent();
    expect(titleText?.toLowerCase()).toMatch(/index manager|opensearch index manager/);
  });

  test.skip('no console errors on plugin load', async ({ page }) => {
    // Collect console errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Also collect page errors
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error);
    });

    // Navigate to the plugin
    await page.goto('/app/opensearch_index_manager');
    await waitForPluginToLoad(page);

    // Wait a bit for any deferred scripts to execute
    await page.waitForTimeout(2000);

    // Verify no console errors
    // Filter out known benign errors
    const filteredErrors = consoleErrors.filter(error => 
      !error.includes('favicon') &&
      !error.includes('SourceMap') &&
      !error.includes('manifest')
    );
    
    expect(filteredErrors).toHaveLength(0);
    expect(pageErrors).toHaveLength(0);
  });

  test.skip('plugin components are rendered', async ({ page }) => {
    // Navigate to the plugin
    await page.goto('/app/opensearch_index_manager');
    await waitForPluginToLoad(page);

    // Verify index selector is present
    await expect(page.locator(Selectors.indexSelector.container)).toBeVisible();

    // Verify main content area is present
    await expect(page.locator(Selectors.layout.mainContent)).toBeVisible();
  });

  test.skip('plugin responds to browser back button', async ({ page }) => {
    // Navigate to OSD home first
    await page.goto('/app/home');
    await page.waitForLoadState('networkidle');

    // Navigate to the plugin
    await page.goto('/app/opensearch_index_manager');
    await waitForPluginToLoad(page);

    // Go back
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // Should be back at home
    await expect(page).not.toHaveURL(/.*opensearch_index_manager.*/);

    // Go forward
    await page.goForward();
    await waitForPluginToLoad(page);

    // Should be back at the plugin
    await expect(page).toHaveURL(/.*opensearch_index_manager.*/);
  });

  test.skip('plugin is accessible via direct URL', async ({ page }) => {
    // Clear any existing storage
    await page.context().clearCookies();

    // Navigate directly to plugin
    await page.goto('/app/opensearch_index_manager');
    
    // If auth is required, login form should appear or plugin should load
    const isLoginForm = await page.locator(Selectors.osd.loginForm).isVisible().catch(() => false);
    const isPluginLoaded = await page.locator(Selectors.plugin.appContainer).isVisible().catch(() => false);

    expect(isLoginForm || isPluginLoaded).toBeTruthy();
  });
});
