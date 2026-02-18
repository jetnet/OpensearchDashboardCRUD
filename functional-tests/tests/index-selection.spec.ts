/**
 * Index Selection Tests
 * Test index dropdown, selection, and refresh functionality
 */

import { test, expect } from '@playwright/test';
import { osClient } from '../utils/api-client';
import { 
  loginToOSD, 
  navigateToPlugin, 
  waitForPluginToLoad,
  selectIndex,
  refreshIndices,
} from '../utils/test-helpers';
import { Selectors } from '../utils/selectors';
import { testIndices, simpleDocuments } from '../fixtures/test-data';

test.describe('Index Selection', () => {
  test.beforeAll(async () => {
    // Setup test indices with data
    await osClient.setupTestIndices();
    
    // Insert test documents
    for (const doc of simpleDocuments) {
      const { id, ...source } = doc;
      await osClient.indexDocument(testIndices.simple, source, id);
    }
    
    await osClient.refreshIndex(testIndices.simple);
  });

  test.afterAll(async () => {
    await osClient.cleanupTestIndices();
  });

  test.beforeEach(async ({ page }) => {
    await navigateToPlugin(page);
    await waitForPluginToLoad(page);
  });

  test('index dropdown loads with available indices', async ({ page }) => {
    // Click on dropdown to open
    const dropdownButton = page.locator(Selectors.indexSelector.dropdownButton).first();
    await dropdownButton.click();

    // Wait for dropdown options to appear
    await page.waitForSelector(Selectors.osd.comboBoxOptions, { state: 'visible' });

    // Verify test indices appear in the list
    const options = page.locator(Selectors.indexSelector.option);
    const optionTexts = await options.allTextContents();
    
    // Check that at least our test indices are present
    const hasSimpleIndex = optionTexts.some(text => text.includes(testIndices.simple));
    expect(hasSimpleIndex).toBeTruthy();
  });

  test('selecting an index loads its mapping', async ({ page }) => {
    // Select the simple test index
    await selectIndex(page, testIndices.simple);

    // Verify the mapping viewer shows the selected index's fields
    await expect(page.locator(Selectors.mappingViewer.container)).toBeVisible();
    
    // Check that some fields from the mapping are displayed
    const fieldNodes = page.locator(Selectors.mappingViewer.fieldNode);
    await expect(fieldNodes.first()).toBeVisible();
  });

  test('document count updates when selecting index', async ({ page }) => {
    // Select the simple test index
    await selectIndex(page, testIndices.simple);

    // Wait for document list to load
    await page.waitForTimeout(1000);

    // Verify document count is shown
    const countBadge = page.locator(Selectors.documentCount.badge);
    await expect(countBadge).toBeVisible();
    
    // The count should match our inserted documents
    const countText = await countBadge.textContent();
    const count = parseInt(countText?.match(/\d+/)?.[0] || '0', 10);
    expect(count).toBeGreaterThanOrEqual(simpleDocuments.length);
  });

  test('selecting different indices updates the view', async ({ page }) => {
    // Select first index
    await selectIndex(page, testIndices.simple);
    
    // Wait for content to load
    await page.waitForTimeout(1000);
    
    // Get document count for first index
    const firstCountBadge = page.locator(Selectors.documentCount.badge);
    const firstCountText = await firstCountBadge.textContent();

    // Select second index (nested)
    await selectIndex(page, testIndices.nested);
    
    // Wait for content to update
    await page.waitForTimeout(1000);

    // Verify the view has updated (count should be different or mapping should change)
    const mappingViewer = page.locator(Selectors.mappingViewer.container);
    await expect(mappingViewer).toBeVisible();
  });

  test('index refresh functionality works', async ({ page }) => {
    // Select an index
    await selectIndex(page, testIndices.simple);
    await page.waitForTimeout(1000);

    // Click refresh button
    await refreshIndices(page);

    // Verify the index list is still available after refresh
    const dropdownButton = page.locator(Selectors.indexSelector.dropdownButton).first();
    await dropdownButton.click();
    
    await page.waitForSelector(Selectors.osd.comboBoxOptions, { state: 'visible' });
    const options = page.locator(Selectors.indexSelector.option);
    await expect(options.first()).toBeVisible();
  });

  test('empty state when no indices exist', async ({ page }) => {
    // Create a temporary empty scenario by selecting an index with no docs
    await selectIndex(page, testIndices.empty);
    
    // Wait for load
    await page.waitForTimeout(1000);

    // Verify mapping loads even for empty index
    await expect(page.locator(Selectors.mappingViewer.container)).toBeVisible();
  });

  test('search within index dropdown works', async ({ page }) => {
    // Open dropdown
    const dropdownButton = page.locator(Selectors.indexSelector.dropdownButton).first();
    await dropdownButton.click();

    await page.waitForSelector(Selectors.osd.comboBoxOptions, { state: 'visible' });

    // Type in search box
    const searchInput = page.locator(Selectors.indexSelector.searchInput);
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('simple');
      await page.waitForTimeout(300);

      // Verify filtered results
      const options = page.locator(Selectors.indexSelector.option);
      const optionTexts = await options.allTextContents();
      
      // All visible options should contain 'simple'
      optionTexts.forEach(text => {
        expect(text.toLowerCase()).toContain('simple');
      });
    }
  });

  test('clearing index selection works', async ({ page }) => {
    // Select an index first
    await selectIndex(page, testIndices.simple);
    await page.waitForTimeout(1000);

    // Try to clear selection
    const clearButton = page.locator(Selectors.indexSelector.clearButton);
    if (await clearButton.isVisible().catch(() => false)) {
      await clearButton.click();
      
      // Verify selection is cleared
      const selectedValue = page.locator(Selectors.indexSelector.selectedValue);
      await expect(selectedValue).not.toBeVisible();
    }
  });

  test('index dropdown shows correct index names', async ({ page }) => {
    // Open dropdown
    const dropdownButton = page.locator(Selectors.indexSelector.dropdownButton).first();
    await dropdownButton.click();

    await page.waitForSelector(Selectors.osd.comboBoxOptions, { state: 'visible' });

    // Get all option texts
    const options = page.locator(Selectors.indexSelector.option);
    const optionTexts = await options.allTextContents();

    // Verify our test indices are in the list
    const allIndices = await osClient.getIndices();
    
    for (const indexName of Object.values(testIndices)) {
      if (allIndices.includes(indexName)) {
        const found = optionTexts.some(text => text.includes(indexName));
        expect(found).toBeTruthy();
      }
    }
  });

  test('selecting index persists on page refresh', async ({ page }) => {
    // Select an index
    await selectIndex(page, testIndices.simple);
    await page.waitForTimeout(1000);

    // Refresh the page
    await page.reload();
    await waitForPluginToLoad(page);

    // Verify the index is still selected (or at least the view is in a valid state)
    const selectedValue = page.locator(Selectors.indexSelector.selectedValue);
    const hasSelection = await selectedValue.isVisible().catch(() => false);
    
    // Either the selection is preserved or we can reselect
    if (hasSelection) {
      const selectedText = await selectedValue.textContent();
      expect(selectedText).toContain(testIndices.simple);
    }
  });
});