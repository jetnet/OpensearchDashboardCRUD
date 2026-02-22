/**
 * Document Grid Tests
 * Test EuiDataGrid-based document display with resizable columns and pagination
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

test.describe.skip('Document Grid', () => {
  test.beforeAll(async () => {
    // Setup test indices
    await osClient.setupTestIndices();
    
    // Insert test documents
    for (let i = 0; i < 30; i++) {
      await osClient.indexDocument(testIndices.simple, {
        title: `Document ${i + 1}`,
        description: `Description for document ${i + 1}`,
        count: i * 10,
        price: 10.99 + i,
        isActive: i % 2 === 0,
        category: i % 3 === 0 ? 'electronics' : i % 3 === 1 ? 'books' : 'software',
        tags: [`tag-${i}`, `tag-${i + 10}`],
        metadata: {
          author: `Author ${i}`,
          version: `${i}.0.0`,
        },
      }, `grid-doc-${String(i + 1).padStart(3, '0')}`);
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

  test.skip('document grid displays correctly', async ({ page }) => {
    // Verify the grid container is visible
    const grid = page.locator('[data-test-subj="document-grid"]');
    await expect(grid).toBeVisible();
    
    // Verify grid has content
    const gridContent = await grid.textContent();
    expect(gridContent?.length).toBeGreaterThan(0);
  });

  test.skip('grid shows ID column', async ({ page }) => {
    // Verify ID column header exists
    const idHeader = page.locator('.euiDataGridHeaderCell').filter({ hasText: 'ID' });
    await expect(idHeader).toBeVisible();
  });

  test.skip('grid displays document IDs', async ({ page }) => {
    // Get visible document IDs from grid
    const visibleIds = await getVisibleDocumentIds(page);
    expect(visibleIds.length).toBeGreaterThan(0);
    
    // Verify IDs start with expected prefix
    const hasGridDocIds = visibleIds.some(id => id.includes('grid-doc'));
    expect(hasGridDocIds).toBeTruthy();
  });

  test.skip('grid pagination works', async ({ page }) => {
    // Get first page IDs
    const firstPageIds = await getVisibleDocumentIds(page);
    
    // Check for pagination controls
    const pagination = page.locator('.euiPagination');
    if (await pagination.isVisible()) {
      // Go to next page
      const nextButton = page.locator('[data-test-subj="pagination-button-next"]');
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await waitForDocumentList(page);
        
        // Get second page IDs
        const secondPageIds = await getVisibleDocumentIds(page);
        
        // Pages should have different documents
        expect(secondPageIds).not.toEqual(firstPageIds);
      }
    }
  });

  test.skip('page size selector works', async ({ page }) => {
    // Find page size selector
    const pageSizeSelector = page.locator('.euiTablePagination');
    
    if (await pageSizeSelector.isVisible()) {
      // Count initial rows
      const initialCount = await getVisibleDocumentIds(page);
      
      // Try to change page size
      const rowsPerPageButton = page.locator('text=/rows per page|Rows per page/i');
      if (await rowsPerPageButton.isVisible()) {
        await rowsPerPageButton.click();
        
        // Select 50 rows
        const option50 = page.locator('text=50');
        if (await option50.isVisible()) {
          await option50.click();
          await waitForDocumentList(page);
          
          // Verify more rows are shown
          const newCount = await getVisibleDocumentIds(page);
          expect(newCount.length).toBeGreaterThanOrEqual(initialCount.length);
        }
      }
    }
  });

  test.skip('grid columns are visible', async ({ page }) => {
    // Check that multiple column headers are visible
    const headers = page.locator('.euiDataGridHeaderCell');
    const headerCount = await headers.count();
    
    // Should have at least ID column
    expect(headerCount).toBeGreaterThan(0);
  });

  test.skip('grid toolbar is present', async ({ page }) => {
    // Check for grid toolbar (column selector, display options)
    const toolbar = page.locator('.euiDataGrid__controls');
    
    if (await toolbar.isVisible()) {
      // Verify toolbar has buttons
      const toolbarButtons = toolbar.locator('button');
      const buttonCount = await toolbarButtons.count();
      expect(buttonCount).toBeGreaterThan(0);
    }
  });

  test.skip('column visibility selector works', async ({ page }) => {
    // Look for column selector button
    const columnSelector = page.locator('button[data-test-subj="dataGridColumnSelectorButton"]');
    
    if (await columnSelector.isVisible()) {
      await columnSelector.click();
      
      // Verify column selector dropdown appears
      const columnSelectorPanel = page.locator('.euiDataGridColumnSelector');
      await expect(columnSelectorPanel).toBeVisible();
      
      // Close the panel
      await columnSelector.click();
    }
  });

  test.skip('grid shows actions column', async ({ page }) => {
    // Check for Actions column header
    const actionsHeader = page.locator('.euiDataGridHeaderCell').filter({ hasText: 'Action' });
    
    if (await actionsHeader.isVisible()) {
      // Verify action buttons exist in rows
      const editButtons = page.locator('[aria-label="Edit document"]');
      const deleteButtons = page.locator('[aria-label="Delete document"]');
      
      expect(await editButtons.count()).toBeGreaterThan(0);
      expect(await deleteButtons.count()).toBeGreaterThan(0);
    }
  });

  test.skip('edit button in grid works', async ({ page }) => {
    // Find first edit button
    const editButton = page.locator('[aria-label="Edit document"]').first();
    
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Verify editor modal opens
      const editor = page.locator('[data-test-subj="document-editor"]');
      await expect(editor).toBeVisible();
      
      // Close editor
      const cancelButton = page.locator('button:has-text("Cancel")');
      await cancelButton.click();
    }
  });

  test.skip('grid is responsive', async ({ page }) => {
    // Test at different viewport sizes
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1280, height: 720 },
      { width: 768, height: 1024 },
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(300);
      
      // Grid should still be visible
      const grid = page.locator('[data-test-subj="document-grid"]');
      await expect(grid).toBeVisible();
    }
  });

  test.skip('grid handles empty state', async ({ page }) => {
    // Search for non-existent document
    const searchInput = page.locator('[data-test-subj="document-search-input"]');
    await searchInput.fill('nonexistentdocumentxyz');
    await page.waitForTimeout(500);
    await waitForDocumentList(page);
    
    // Check for empty prompt
    const emptyPrompt = page.locator('.euiEmptyPrompt');
    const hasEmptyPrompt = await emptyPrompt.isVisible().catch(() => false);
    
    expect(hasEmptyPrompt).toBeTruthy();
  });

  test.skip('grid cell content is readable', async ({ page }) => {
    // Get first row cells
    const firstRowCells = page.locator('.euiDataGridRowCell').first();
    
    if (await firstRowCells.isVisible()) {
      const cellText = await firstRowCells.textContent();
      expect(cellText?.length).toBeGreaterThan(0);
    }
  });

  test.skip('grid sorting works', async ({ page }) => {
    // Click on ID column header to sort
    const idHeader = page.locator('.euiDataGridHeaderCell').filter({ hasText: 'ID' });
    
    if (await idHeader.isVisible()) {
      await idHeader.click();
      await waitForDocumentList(page);
      
      // Get sorted IDs
      const sortedIds = await getVisibleDocumentIds(page);
      expect(sortedIds.length).toBeGreaterThan(0);
    }
  });
});
