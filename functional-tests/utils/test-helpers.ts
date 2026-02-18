/**
 * Test helpers for OpenSearch Index Manager functional tests
 */

import { Page, expect, Locator } from '@playwright/test';
import { Selectors } from './selectors';
import { osClient } from './api-client';

export interface Document {
  id?: string;
  [key: string]: unknown;
}

export interface FieldValue {
  type: 'text' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  value: unknown;
}

/**
 * Login to OpenSearch Dashboards
 */
export async function loginToOSD(page: Page, credentials?: { username: string; password: string }): Promise<void> {
  // Check if we're already logged in
  if (await page.locator(Selectors.plugin.appContainer).isVisible().catch(() => false)) {
    return;
  }

  // Check if login form is present
  const loginForm = page.locator(Selectors.osd.loginForm);
  if (await loginForm.isVisible().catch(() => false)) {
    const username = credentials?.username || process.env.OSD_USERNAME || 'admin';
    const password = credentials?.password || process.env.OSD_PASSWORD || 'admin';

    await page.fill(Selectors.osd.usernameInput, username);
    await page.fill(Selectors.osd.passwordInput, password);
    await page.click(Selectors.osd.loginButton);

    // Wait for navigation after login
    await page.waitForLoadState('networkidle');
  }
}

/**
 * Navigate to the plugin
 */
export async function navigateToPlugin(page: Page): Promise<void> {
  // First try direct navigation
  await page.goto('/app/opensearch_index_manager');
  
  // Wait for plugin to load
  await waitForPluginToLoad(page);
}

/**
 * Wait for the plugin to fully load
 */
export async function waitForPluginToLoad(page: Page, timeout: number = 30000): Promise<void> {
  // Wait for the app container
  await page.waitForSelector(Selectors.plugin.appContainer, { 
    state: 'visible', 
    timeout 
  });

  // Wait for loading indicator to disappear
  const loadingIndicator = page.locator(Selectors.plugin.loadingIndicator);
  try {
    await loadingIndicator.waitFor({ state: 'hidden', timeout: 10000 });
  } catch {
    // Loading indicator might not be present
  }

  // Verify page title or main content is visible
  await expect(page.locator(Selectors.plugin.pageTitle).or(
    page.locator(Selectors.indexSelector.container)
  )).toBeVisible();
}

/**
 * Select an index from the dropdown
 */
export async function selectIndex(page: Page, indexName: string): Promise<void> {
  const indexSelector = page.locator(Selectors.indexSelector.container);
  
  // Click on dropdown to open it
  const dropdownButton = indexSelector.locator(Selectors.indexSelector.dropdownButton).first();
  await dropdownButton.click();

  // Wait for dropdown options to appear
  await page.waitForSelector(Selectors.osd.comboBoxOptions, { state: 'visible' });

  // Search for the index if search input is available
  const searchInput = page.locator(Selectors.indexSelector.searchInput);
  if (await searchInput.isVisible().catch(() => false)) {
    await searchInput.fill(indexName);
    await page.waitForTimeout(300);
  }

  // Find and click on the index option
  const option = page.locator(Selectors.indexSelector.option).filter({ hasText: indexName }).first();
  
  // If option not found by text, try using contains
  if (!(await option.isVisible().catch(() => false))) {
    const optionText = page.locator(Selectors.indexSelector.optionText).filter({ hasText: indexName }).first();
    await optionText.click();
  } else {
    await option.click();
  }

  // Wait for selection to complete
  await page.waitForTimeout(500);
  
  // Verify the index is selected
  const selectedValue = page.locator(Selectors.indexSelector.selectedValue);
  await expect(selectedValue).toContainText(indexName, { timeout: 5000 });

  // Wait for document list to load
  await page.waitForLoadState('networkidle');
}

/**
 * Refresh the indices list
 */
export async function refreshIndices(page: Page): Promise<void> {
  const refreshButton = page.locator(Selectors.indexSelector.refreshButton);
  await refreshButton.click();
  
  // Wait for refresh to complete
  await page.waitForTimeout(1000);
  await page.waitForLoadState('networkidle');
}

/**
 * Get the currently selected index
 */
export async function getSelectedIndex(page: Page): Promise<string | null> {
  const selectedValue = page.locator(Selectors.indexSelector.selectedValue);
  if (await selectedValue.isVisible().catch(() => false)) {
    return selectedValue.textContent();
  }
  return null;
}

/**
 * Create a new document using the UI
 */
export async function createDocument(page: Page, document: Document): Promise<string> {
  // Click create button
  const createButton = page.locator(Selectors.createDocument.button);
  await createButton.click();

  // Wait for editor to open
  await page.waitForSelector(Selectors.documentEditor.modal, { state: 'visible' });

  // Fill in document ID if provided
  if (document.id) {
    await page.fill(Selectors.documentEditor.idInput, document.id);
  }

  // Fill in fields
  for (const [key, value] of Object.entries(document)) {
    if (key === 'id') continue;
    await fillField(page, key, value);
  }

  // Save the document
  await page.click(Selectors.documentEditor.saveButton);

  // Wait for save to complete and editor to close
  await page.waitForSelector(Selectors.documentEditor.modal, { state: 'hidden', timeout: 10000 });

  // Wait for success toast
  await expect(page.locator(Selectors.osd.toastSuccess)).toBeVisible({ timeout: 5000 });

  // Return the document ID (either provided or generated)
  return document.id || 'generated-id';
}

/**
 * Delete a document using the UI
 */
export async function deleteDocument(page: Page, documentId: string): Promise<void> {
  // Find the document row
  const row = page.locator(Selectors.documentList.tableRow).filter({ hasText: documentId });
  
  // Click delete button
  const deleteButton = row.locator(Selectors.documentList.deleteButton);
  await deleteButton.click();

  // Confirm deletion
  await page.waitForSelector(Selectors.osd.confirmModal, { state: 'visible' });
  await page.click(Selectors.osd.confirmButton);

  // Wait for deletion to complete
  await page.waitForSelector(Selectors.osd.confirmModal, { state: 'hidden' });

  // Verify success toast
  await expect(page.locator(Selectors.osd.toastSuccess)).toBeVisible({ timeout: 5000 });

  // Verify document is removed from list
  await expect(row).not.toBeVisible();
}

/**
 * Edit a document
 */
export async function editDocument(
  page: Page, 
  documentId: string, 
  updates: Record<string, unknown>
): Promise<void> {
  // Find and click edit button for the document
  const row = page.locator(Selectors.documentList.tableRow).filter({ hasText: documentId });
  const editButton = row.locator(Selectors.documentList.editButton);
  await editButton.click();

  // Wait for editor to open
  await page.waitForSelector(Selectors.documentEditor.modal, { state: 'visible' });

  // Update fields
  for (const [key, value] of Object.entries(updates)) {
    await fillField(page, key, value);
  }

  // Save changes
  await page.click(Selectors.documentEditor.saveButton);

  // Wait for save to complete
  await page.waitForSelector(Selectors.documentEditor.modal, { state: 'hidden', timeout: 10000 });

  // Verify success toast
  await expect(page.locator(Selectors.osd.toastSuccess)).toBeVisible({ timeout: 5000 });
}

/**
 * Fill a field in the document editor
 */
export async function fillField(page: Page, fieldName: string, value: unknown): Promise<void> {
  const fieldSelector = `${Selectors.documentEditor.fieldInput}[name="${fieldName}"], [data-test-subj="field-${fieldName}"] input`;
  const field = page.locator(fieldSelector).first();

  if (await field.isVisible().catch(() => false)) {
    if (typeof value === 'string') {
      await field.fill(value);
    } else if (typeof value === 'number') {
      await field.fill(value.toString());
    } else if (typeof value === 'boolean') {
      const checkbox = page.locator(`${Selectors.documentEditor.fieldCheckbox}[name="${fieldName}"]`);
      const isChecked = await checkbox.isChecked().catch(() => false);
      if (isChecked !== value) {
        await checkbox.click();
      }
    }
  } else {
    // Handle nested objects
    if (typeof value === 'object' && value !== null) {
      await fillNestedField(page, fieldName, value);
    }
  }
}

/**
 * Fill a nested field value
 */
export async function fillNestedField(page: Page, path: string, value: unknown): Promise<void> {
  const keys = path.split('.');
  
  // Navigate through nested levels
  for (let i = 0; i < keys.length - 1; i++) {
    const toggle = page.locator(`${Selectors.documentEditor.nestedToggle}[data-path="${keys.slice(0, i + 1).join('.')}"]`);
    if (await toggle.isVisible().catch(() => false)) {
      await toggle.click();
      await page.waitForTimeout(200);
    }
  }

  // Fill the final field
  const finalKey = keys[keys.length - 1];
  const fieldSelector = `${Selectors.documentEditor.fieldInput}[name="${path}"], [data-field-path="${path}"] input`;
  const field = page.locator(fieldSelector).first();
  
  if (await field.isVisible().catch(() => false)) {
    if (typeof value === 'string' || typeof value === 'number') {
      await field.fill(String(value));
    }
  }
}

/**
 * Search for documents
 */
export async function searchDocuments(page: Page, query: string): Promise<void> {
  const searchBox = page.locator(Selectors.search.searchBox);
  await searchBox.fill(query);
  
  const searchButton = page.locator(Selectors.search.searchButton);
  await searchButton.click();

  // Wait for search results
  await page.waitForLoadState('networkidle');
}

/**
 * Clear the search
 */
export async function clearSearch(page: Page): Promise<void> {
  const clearButton = page.locator(Selectors.search.clearSearchButton);
  if (await clearButton.isVisible().catch(() => false)) {
    await clearButton.click();
    await page.waitForLoadState('networkidle');
  }
}

/**
 * Get the document count displayed in the UI
 */
export async function getDocumentCount(page: Page): Promise<number> {
  const countBadge = page.locator(Selectors.documentCount.badge);
  const text = await countBadge.textContent();
  const match = text?.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Wait for document list to load
 */
export async function waitForDocumentList(page: Page): Promise<void> {
  const loadingState = page.locator(Selectors.documentList.loadingState);
  try {
    await loadingState.waitFor({ state: 'hidden', timeout: 10000 });
  } catch {
    // Loading state might not be present
  }

  // Wait for either table rows or empty state
  await page.waitForSelector(
    `${Selectors.documentList.tableRow}, ${Selectors.documentList.emptyState}`,
    { state: 'visible' }
  );
}

/**
 * Check if a document exists in the list
 */
export async function documentExists(page: Page, documentId: string): Promise<boolean> {
  const row = page.locator(Selectors.documentList.tableRow).filter({ hasText: documentId });
  return await row.isVisible().catch(() => false);
}

/**
 * Open the JSON editor mode
 */
export async function openJsonEditor(page: Page): Promise<void> {
  const jsonModeButton = page.locator(Selectors.documentEditor.jsonEditorModeButton);
  await jsonModeButton.click();
  await page.waitForSelector(Selectors.documentEditor.jsonEditor, { state: 'visible' });
}

/**
 * Set document via JSON editor
 */
export async function setDocumentJson(page: Page, document: Record<string, unknown>): Promise<void> {
  const textarea = page.locator(Selectors.documentEditor.jsonEditorTextArea);
  await textarea.fill(JSON.stringify(document, null, 2));
}

/**
 * Close any toasts
 */
export async function closeToasts(page: Page): Promise<void> {
  const toasts = page.locator(Selectors.osd.toastCloseButton);
  const count = await toasts.count();
  for (let i = 0; i < count; i++) {
    await toasts.nth(i).click();
    await page.waitForTimeout(100);
  }
}

/**
 * Get all visible document IDs from the list
 */
export async function getVisibleDocumentIds(page: Page): Promise<string[]> {
  const rows = page.locator(Selectors.documentList.tableRow);
  const count = await rows.count();
  const ids: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const idCell = rows.nth(i).locator(Selectors.documentList.documentId);
    const id = await idCell.textContent();
    if (id) {
      ids.push(id.trim());
    }
  }
  
  return ids;
}

/**
 * Sort documents by a field
 */
export async function sortByField(page: Page, fieldName: string, order: 'asc' | 'desc' = 'asc'): Promise<void> {
  // Find the header cell for the field
  const header = page.locator(Selectors.documentList.tableHeader).filter({ hasText: fieldName });
  await header.click();
  
  // Click again to change sort order if needed
  if (order === 'desc') {
    await header.click();
  }
  
  await page.waitForLoadState('networkidle');
}

/**
 * Change page size in pagination
 */
export async function changePageSize(page: Page, size: number): Promise<void> {
  const pageSizeSelector = page.locator(Selectors.pagination.pageSizeSelector);
  await pageSizeSelector.click();
  
  const option = page.locator(Selectors.pagination.pageSizeOption).filter({ hasText: size.toString() });
  await option.click();
  
  await page.waitForLoadState('networkidle');
}

/**
 * Go to next page
 */
export async function goToNextPage(page: Page): Promise<void> {
  const nextButton = page.locator(Selectors.pagination.nextButton);
  await nextButton.click();
  await page.waitForLoadState('networkidle');
}

/**
 * Go to previous page
 */
export async function goToPreviousPage(page: Page): Promise<void> {
  const prevButton = page.locator(Selectors.pagination.previousButton);
  await prevButton.click();
  await page.waitForLoadState('networkidle');
}

/**
 * Setup test data using API client
 */
export async function setupTestData(indexName: string, documents: Document[]): Promise<void> {
  for (const doc of documents) {
    const { id, ...source } = doc;
    await osClient.indexDocument(indexName, source, id);
  }
  await osClient.refreshIndex(indexName);
}

/**
 * Cleanup test data
 */
export async function cleanupTestData(indexName: string): Promise<void> {
  await osClient.clearIndex(indexName);
  await osClient.refreshIndex(indexName);
}

export default {
  loginToOSD,
  navigateToPlugin,
  waitForPluginToLoad,
  selectIndex,
  refreshIndices,
  getSelectedIndex,
  createDocument,
  deleteDocument,
  editDocument,
  fillField,
  fillNestedField,
  searchDocuments,
  clearSearch,
  getDocumentCount,
  waitForDocumentList,
  documentExists,
  openJsonEditor,
  setDocumentJson,
  closeToasts,
  getVisibleDocumentIds,
  sortByField,
  changePageSize,
  goToNextPage,
  goToPreviousPage,
  setupTestData,
  cleanupTestData,
};