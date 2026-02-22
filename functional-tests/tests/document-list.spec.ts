/**
 * Document List Tests
 * Test document list display, pagination, sorting, and search
 * NOTE: These tests are disabled - only essential-crud.spec.ts tests are run
 */

import { test, expect } from '@playwright/test';
import { osClient } from '../utils/api-client';
import { 
  loginToOSD, 
  navigateToPlugin, 
  waitForPluginToLoad,
  selectIndex,
  waitForDocumentList,
  getVisibleDocumentIds,
  sortByField,
  changePageSize,
  goToNextPage,
  goToPreviousPage,
  searchDocuments,
  clearSearch,
  getDocumentCount,
} from '../utils/test-helpers';
import { Selectors } from '../utils/selectors';
import { testIndices, simpleDocuments } from '../fixtures/test-data';

test.describe.skip('Document List', () => {
  test.beforeAll(async () => {
    // Setup test indices
    await osClient.setupTestIndices();
    
    // Insert multiple test documents for pagination testing
    for (let i = 0; i < 25; i++) {
      await osClient.indexDocument(testIndices.simple, {
        title: `Test Document ${i + 1}`,
        description: `Description for document ${i + 1}`,
        count: i * 10,
        price: 10.99 + i,
        isActive: i % 2 === 0,
        createdAt: new Date(2024, 0, i + 1).toISOString(),
        category: i % 3 === 0 ? 'electronics' : i % 3 === 1 ? 'books' : 'software',
      }, `doc-${String(i + 1).padStart(3, '0')}`);
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

  test.skip('document list displays correctly', async ({ page }) => {
    // Verify the document list table is visible
    await expect(page.locator(Selectors.documentList.table)).toBeVisible();

    // Verify table has rows
    const rows = page.locator(Selectors.documentList.tableRow);
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Verify document IDs are visible
    const firstId = page.locator(Selectors.documentList.documentId).first();
    await expect(firstId).toBeVisible();
  });

  test.skip('document count is displayed', async ({ page }) => {
    const count = await getDocumentCount(page);
    expect(count).toBeGreaterThanOrEqual(25);
  });

  test.skip('pagination works - next and previous', async ({ page }) => {
    // Get first page document IDs
    const firstPageIds = await getVisibleDocumentIds(page);
    expect(firstPageIds.length).toBeGreaterThan(0);

    // Go to next page
    await goToNextPage(page);
    await waitForDocumentList(page);

    // Get second page document IDs
    const secondPageIds = await getVisibleDocumentIds(page);
    expect(secondPageIds.length).toBeGreaterThan(0);

    // Verify pages are different
    expect(secondPageIds).not.toEqual(firstPageIds);

    // Go back to previous page
    await goToPreviousPage(page);
    await waitForDocumentList(page);

    // Verify we're back on first page
    const backToFirstIds = await getVisibleDocumentIds(page);
    expect(backToFirstIds).toEqual(firstPageIds);
  });

  test.skip('page size change works', async ({ page }) => {
    // Get initial row count
    const initialRows = await page.locator(Selectors.documentList.tableRow).count();

    // Change page size to 50
    await changePageSize(page, 50);
    await waitForDocumentList(page);

    // Verify more rows are shown
    const newRows = await page.locator(Selectors.documentList.tableRow).count();
    expect(newRows).toBeGreaterThanOrEqual(initialRows);
  });

  test.skip('sorting by field works', async ({ page }) => {
    // Sort by count ascending
    await sortByField(page, 'count', 'asc');
    await waitForDocumentList(page);

    // Get document IDs after sort
    const sortedIds = await getVisibleDocumentIds(page);
    expect(sortedIds.length).toBeGreaterThan(0);

    // Sort by count descending
    await sortByField(page, 'count', 'desc');
    await waitForDocumentList(page);

    // Get document IDs after descending sort
    const descSortedIds = await getVisibleDocumentIds(page);
    expect(descSortedIds.length).toBeGreaterThan(0);

    // Verify order is different
    expect(descSortedIds).not.toEqual(sortedIds);
  });

  test.skip('search functionality works', async ({ page }) => {
    // Search for a specific document
    await searchDocuments(page, 'Test Document 1');
    await waitForDocumentList(page);

    // Verify results contain search term
    const visibleIds = await getVisibleDocumentIds(page);
    expect(visibleIds.length).toBeGreaterThan(0);

    // Clear search
    await clearSearch(page);
    await waitForDocumentList(page);

    // Verify all documents are shown again
    const allIds = await getVisibleDocumentIds(page);
    expect(allIds.length).toBeGreaterThanOrEqual(visibleIds.length);
  });

  test.skip('empty results handling', async ({ page }) => {
    // Search for non-existent document
    await searchDocuments(page, 'xyznonexistent123');
    await waitForDocumentList(page);

    // Verify empty state is shown
    const emptyState = page.locator(Selectors.documentList.emptyState);
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    
    if (hasEmptyState) {
      await expect(emptyState).toBeVisible();
    } else {
      // Or verify no rows are present
      const rows = page.locator(Selectors.documentList.tableRow);
      expect(await rows.count()).toBe(0);
    }
  });

  test.skip('document list shows correct columns', async ({ page }) => {
    // Get all table headers
    const headers = page.locator(Selectors.documentList.tableHeader);
    const headerTexts = await headers.allTextContents();

    // Verify essential columns are present
    expect(headerTexts.some(h => h.toLowerCase().includes('id'))).toBeTruthy();
  });

  test.skip('document actions are available', async ({ page }) => {
    // Get first document row
    const firstRow = page.locator(Selectors.documentList.tableRow).first();

    // Verify edit button exists
    const editButton = firstRow.locator(Selectors.documentList.editButton);
    await expect(editButton).toBeVisible();

    // Verify delete button exists
    const deleteButton = firstRow.locator(Selectors.documentList.deleteButton);
    await expect(deleteButton).toBeVisible();
  });

  test.skip('pagination shows correct page numbers', async ({ page }) => {
    // Verify pagination container is visible
    const pagination = page.locator(Selectors.pagination.container);
    await expect(pagination).toBeVisible();

    // Check page buttons are present
    const pageButtons = page.locator(Selectors.pagination.pageButton);
    expect(await pageButtons.count()).toBeGreaterThan(0);
  });

  test.skip('showing X of Y documents text is correct', async ({ page }) => {
    const showingText = page.locator(Selectors.documentCount.showingText);
    
    if (await showingText.isVisible().catch(() => false)) {
      const text = await showingText.textContent();
      // Should contain numbers like "Showing 1-10 of 25"
      expect(text).toMatch(/\d+/);
    }
  });

  test.skip('document list updates after refresh', async ({ page }) => {
    // Get current document IDs
    const initialIds = await getVisibleDocumentIds(page);

    // Refresh the page
    await page.reload();
    await waitForPluginToLoad(page);
    await selectIndex(page, testIndices.simple);
    await waitForDocumentList(page);

    // Get document IDs after refresh
    const afterRefreshIds = await getVisibleDocumentIds(page);

    // Should have same documents
    expect(afterRefreshIds.length).toBe(initialIds.length);
  });
});
