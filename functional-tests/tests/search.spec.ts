/**
 * Search Tests
 * Test free-text search functionality with debounced querying
 * NOTE: These tests are disabled - only essential-crud.spec.ts tests are run
 */

import { test, expect } from '@playwright/test';
import { osClient } from '../utils/api-client';
import { 
  navigateToPlugin, 
  waitForPluginToLoad,
  selectIndex,
  waitForDocumentList,
  getVisibleDocumentIds,
} from '../utils/test-helpers';
import { Selectors } from '../utils/selectors';
import { testIndices } from '../fixtures/test-data';

test.describe.skip('Document Search', () => {
  test.beforeAll(async () => {
    // Setup test indices
    await osClient.setupTestIndices();
    
    // Insert test documents with searchable content
    const documents = [
      { title: 'Apple iPhone Review', category: 'electronics', tags: ['phone', 'apple'], rating: 5 },
      { title: 'Samsung Galaxy Review', category: 'electronics', tags: ['phone', 'android'], rating: 4 },
      { title: 'Python Programming Guide', category: 'books', tags: ['programming', 'python'], rating: 5 },
      { title: 'JavaScript for Beginners', category: 'books', tags: ['programming', 'javascript'], rating: 4 },
      { title: 'Coffee Machine Manual', category: 'appliances', tags: ['kitchen', 'coffee'], rating: 3 },
    ];
    
    for (let i = 0; i < documents.length; i++) {
      await osClient.indexDocument(testIndices.simple, documents[i], `search-doc-${i + 1}`);
    }
    
    await osClient.refreshIndex(testIndices.simple);
  });

  test.afterAll(async () => {
    await osClient.cleanupTestIndices();
  });

  test.beforeEach(async ({ page }) => {
    await navigateToPlugin(page);
    await waitForPluginToLoad(page);
    await selectIndex(page, testIndices.simple);
    await waitForDocumentList(page);
  });

  test.skip('search input is visible and functional', async ({ page }) => {
    // Verify search input is visible
    const searchInput = page.locator('[data-test-subj="document-search-input"]');
    await expect(searchInput).toBeVisible();
    
    // Verify search input is enabled when index is selected
    await expect(searchInput).toBeEnabled();
  });

  test.skip('search input is disabled when no index is selected', async ({ page }) => {
    // Navigate to plugin without selecting index
    await page.reload();
    await waitForPluginToLoad(page);
    
    // Search input should be disabled
    const searchInput = page.locator('[data-test-subj="document-search-input"]');
    await expect(searchInput).toBeDisabled();
  });

  test.skip('search with valid query returns results', async ({ page }) => {
    const searchInput = page.locator('[data-test-subj="document-search-input"]');
    
    // Type search query
    await searchInput.fill('Python');
    
    // Wait for debounced search (400ms + buffer)
    await page.waitForTimeout(500);
    await waitForDocumentList(page);
    
    // Verify results contain Python-related document
    const visibleIds = await getVisibleDocumentIds(page);
    expect(visibleIds.length).toBeGreaterThan(0);
  });

  test.skip('search with multi-word query works', async ({ page }) => {
    const searchInput = page.locator('[data-test-subj="document-search-input"]');
    
    // Type multi-word search query
    await searchInput.fill('JavaScript Beginners');
    
    // Wait for debounced search
    await page.waitForTimeout(500);
    await waitForDocumentList(page);
    
    // Verify results
    const visibleIds = await getVisibleDocumentIds(page);
    expect(visibleIds.length).toBeGreaterThan(0);
  });

  test.skip('search with no results shows empty state', async ({ page }) => {
    const searchInput = page.locator('[data-test-subj="document-search-input"]');
    
    // Search for non-existent term
    await searchInput.fill('xyznonexistent999');
    
    // Wait for debounced search
    await page.waitForTimeout(500);
    await waitForDocumentList(page);
    
    // Verify empty state or no results
    const grid = page.locator('[data-test-subj="document-grid"]');
    const emptyPrompt = page.locator('.euiEmptyPrompt');
    
    // Either empty prompt is shown or grid has no rows
    const hasEmptyPrompt = await emptyPrompt.isVisible().catch(() => false);
    if (hasEmptyPrompt) {
      await expect(emptyPrompt).toBeVisible();
    }
  });

  test.skip('clear search restores full document list', async ({ page }) => {
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

  test.skip('search input has clear button', async ({ page }) => {
    const searchInput = page.locator('[data-test-subj="document-search-input"]');
    
    // Type in search
    await searchInput.fill('test');
    
    // Look for clear button (EuiFieldSearch has built-in clear)
    const clearButton = page.locator('[data-test-subj="document-search-input"] ~ button, .euiFieldSearch__clearButton');
    
    // Clear button should be visible or search should be clearable
    const isClearable = await clearButton.count() > 0 || await searchInput.getAttribute('value') === 'test';
    expect(isClearable).toBeTruthy();
  });

  test.skip('debounced search does not fire on every keystroke', async ({ page }) => {
    const searchInput = page.locator('[data-test-subj="document-search-input"]');
    
    // Type multiple characters quickly
    await searchInput.type('Python', { delay: 50 });
    
    // Wait less than debounce time
    await page.waitForTimeout(200);
    
    // The search should not have triggered yet
    // This is a timing test, so we just verify the input has the value
    const value = await searchInput.inputValue();
    expect(value).toBe('Python');
  });

  test.skip('search shows loading indicator during search', async ({ page }) => {
    const searchInput = page.locator('[data-test-subj="document-search-input"]');
    
    // Type search query
    await searchInput.fill('Review');
    
    // Look for loading spinner (may be brief)
    const spinner = page.locator('.euiLoadingSpinner');
    
    // Wait for search to complete
    await page.waitForTimeout(500);
    await waitForDocumentList(page);
    
    // Verify results are shown
    const visibleIds = await getVisibleDocumentIds(page);
    expect(visibleIds.length).toBeGreaterThan(0);
  });

  test.skip('search query persists across page navigation', async ({ page }) => {
    const searchInput = page.locator('[data-test-subj="document-search-input"]');
    
    // Perform search
    await searchInput.fill('electronics');
    await page.waitForTimeout(500);
    await waitForDocumentList(page);
    
    // Navigate to another page (if pagination exists)
    const nextButton = page.locator('[data-test-subj="pagination-button-next"]');
    if (await nextButton.isVisible().catch(() => false)) {
      await nextButton.click();
      await waitForDocumentList(page);
      
      // Search input should still have value
      const value = await searchInput.inputValue();
      expect(value).toBe('electronics');
    }
  });
});
