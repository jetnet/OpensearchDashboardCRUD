/**
 * Essential CRUD Tests
 * Core smoke tests for OpenSearch Index Manager plugin
 * These tests verify essential functionality only
 */

import { test, expect } from '@playwright/test';
import { osClient } from '../utils/api-client';
import { 
  loginToOSD, 
  navigateToPlugin, 
  waitForPluginToLoad,
  selectIndex,
  waitForDocumentList,
  createDocument,
  getVisibleDocumentIds,
} from '../utils/test-helpers';
import { Selectors } from '../utils/selectors';
import { testIndices, newSimpleDocument, simpleDocuments } from '../fixtures/test-data';

test.describe('Essential Tests @essential', () => {
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

  test.describe('Smoke Tests @smoke', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await loginToOSD(page);
    });

    /**
     * Test 1: Plugin loads in OSD navigation
     * Essential Tests @essential › Smoke Tests @smoke › 1. Plugin loads in OSD navigation
     */
    test('1. Plugin loads in OSD navigation', async ({ page }) => {
      // Look for the plugin navigation link
      const navLink = page.locator(Selectors.plugin.navLink);
      
      // The link should be visible in the navigation
      await expect(navLink).toBeVisible();
      
      // Verify the link text contains our plugin name
      const linkText = await navLink.textContent();
      expect(linkText?.toLowerCase()).toContain('index');
    });
  });

  test.describe('Index Selection @index', () => {
    test.beforeEach(async ({ page }) => {
      await navigateToPlugin(page);
      await waitForPluginToLoad(page);
    });

    /**
     * Test 4: Index dropdown loads available indices
     * Essential Tests @essential › Index Selection @index › 3. Index dropdown loads available indices
     */
    test('3. Index dropdown loads available indices', async ({ page }) => {
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

    /**
     * Test 6: Selecting an index loads its mapping
     * Essential Tests @essential › Index Selection @index › 4. Selecting an index loads its mapping
     */
    test('4. Selecting an index loads its mapping', async ({ page }) => {
      // Select the simple test index
      await selectIndex(page, testIndices.simple);

      // Verify the mapping viewer shows the selected index's fields
      await expect(page.locator(Selectors.mappingViewer.container)).toBeVisible();
      
      // Check that some fields from the mapping are displayed
      const fieldNodes = page.locator(Selectors.mappingViewer.fieldNode);
      await expect(fieldNodes.first()).toBeVisible();
    });
  });

  test.describe('Document CRUD @crud', () => {
    test.beforeEach(async ({ page }) => {
      await navigateToPlugin(page);
      await waitForPluginToLoad(page);
      await selectIndex(page, testIndices.simple);
      await waitForDocumentList(page);
    });

    test.afterEach(async ({ page }) => {
      // Close any toasts
      const { closeToasts } = await import('../utils/test-helpers');
      await closeToasts(page);
    });

    /**
     * Test 8: Create document with required fields
     * Essential Tests @essential › Document CRUD @crud › 5. Create document with required fields
     */
    test('5. Create document with required fields', async ({ page }) => {
      const docId = `essential-test-${Date.now()}`;
      
      // Click create button
      const createButton = page.locator(Selectors.createDocument.button);
      await createButton.click();

      // Wait for editor modal
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'visible' });

      // Fill in document ID
      await page.fill(Selectors.documentEditor.idInput, docId);

      // Fill in text field
      await page.fill('[data-test-subj="field-title"] input, input[name="title"]', newSimpleDocument.title);
      
      // Fill in description
      await page.fill('[data-test-subj="field-description"] input, input[name="description"]', newSimpleDocument.description);
      
      // Fill in number field
      await page.fill('[data-test-subj="field-count"] input, input[name="count"]', newSimpleDocument.count.toString());
      
      // Fill in price
      await page.fill('[data-test-subj="field-price"] input, input[name="price"]', newSimpleDocument.price.toString());

      // Save document
      await page.click(Selectors.documentEditor.saveButton);

      // Wait for save to complete
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'hidden', timeout: 10000 });

      // Verify success toast
      await expect(page.locator(Selectors.osd.toastSuccess)).toBeVisible({ timeout: 5000 });

      // Refresh and verify document appears in list
      await page.reload();
      await waitForPluginToLoad(page);
      await selectIndex(page, testIndices.simple);
      await waitForDocumentList(page);

      const { documentExists } = await import('../utils/test-helpers');
      const exists = await documentExists(page, docId);
      expect(exists).toBeTruthy();
    });
  });

  test.describe('Search @search', () => {
    test.beforeEach(async ({ page }) => {
      await navigateToPlugin(page);
      await waitForPluginToLoad(page);
      await selectIndex(page, testIndices.simple);
      await waitForDocumentList(page);
    });

    /**
     * Test 14: Clear search restores full list
     * Essential Tests @essential › Search @search › 10. Clear search restores full list
     */
    test('10. Clear search restores full list', async ({ page }) => {
      const searchInput = page.locator('[data-test-subj="document-search-input"]');
      
      // First perform a search
      await searchInput.fill('electronics');
      await page.waitForTimeout(500);
      await waitForDocumentList(page);
      
      const searchResults = await getVisibleDocumentIds(page);
      
      // Clear search by emptying input
      await searchInput.fill('');
      await page.waitForTimeout(500);
      await waitForDocumentList(page);
      
      // Verify more documents are shown
      const allResults = await getVisibleDocumentIds(page);
      expect(allResults.length).toBeGreaterThanOrEqual(searchResults.length);
    });
  });

  test.describe('Display @display', () => {
    test.beforeEach(async ({ page }) => {
      await navigateToPlugin(page);
      await waitForPluginToLoad(page);
    });

    /**
     * Test 17: Mapping displays field names and types
     * Essential Tests @essential › Display @display › 12. Mapping displays field names and types
     */
    test('12. Mapping displays field names and types', async ({ page }) => {
      await selectIndex(page, testIndices.simple);

      // Get all field names
      const fieldNames = page.locator(Selectors.mappingViewer.fieldName);
      const texts = await fieldNames.allTextContents();

      // Verify expected fields are present
      const expectedFields = ['title', 'description', 'count', 'price', 'isActive', 'createdAt', 'category'];
      
      for (const field of expectedFields) {
        const found = texts.some(text => text.toLowerCase().includes(field.toLowerCase()));
        expect(found).toBeTruthy();
      }

      // Verify type indicators exist
      const typeIndicators = page.locator(Selectors.mappingViewer.fieldTypeIndicator);
      
      if (await typeIndicators.first().isVisible().catch(() => false)) {
        expect(await typeIndicators.count()).toBeGreaterThan(0);
      }

      // Check for specific type indicators
      const typeText = page.locator(Selectors.mappingViewer.typeText);
      const typeKeyword = page.locator(Selectors.mappingViewer.typeKeyword);
      const typeInteger = page.locator(Selectors.mappingViewer.typeInteger);

      // At least one type should be visible
      const hasType = await typeText.isVisible().catch(() => false) ||
                      await typeKeyword.isVisible().catch(() => false) ||
                      await typeInteger.isVisible().catch(() => false);
      
      expect(hasType).toBeTruthy();
    });
  });
});
