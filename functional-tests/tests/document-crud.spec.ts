/**
 * Document CRUD Tests
 * Test create, read, update, and delete operations
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
  createDocument,
  deleteDocument,
  editDocument,
  documentExists,
  openJsonEditor,
  setDocumentJson,
  closeToasts,
  getVisibleDocumentIds,
} from '../utils/test-helpers';
import { Selectors } from '../utils/selectors';
import { testIndices, newSimpleDocument, simpleDocuments } from '../fixtures/test-data';

test.describe.skip('Document CRUD', () => {
  test.beforeAll(async () => {
    // Setup test indices
    await osClient.setupTestIndices();
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

  test.afterEach(async ({ page }) => {
    // Close any toasts
    await closeToasts(page);
  });

  test.describe.skip('Create Document', () => {
    test.skip('create document with simple fields', async ({ page }) => {
      const docId = `crud-test-${Date.now()}`;
      
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

      const exists = await documentExists(page, docId);
      expect(exists).toBeTruthy();
    });

    test.skip('create document with auto-generated ID', async ({ page }) => {
      // Click create button
      const createButton = page.locator(Selectors.createDocument.button);
      await createButton.click();

      // Wait for editor modal
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'visible' });

      // Fill in required fields only (no ID)
      await page.fill('[data-test-subj="field-title"] input, input[name="title"]', 'Auto ID Document');
      await page.fill('[data-test-subj="field-count"] input, input[name="count"]', '10');

      // Save document
      await page.click(Selectors.documentEditor.saveButton);

      // Wait for save to complete
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'hidden', timeout: 10000 });

      // Verify success toast
      await expect(page.locator(Selectors.osd.toastSuccess)).toBeVisible({ timeout: 5000 });
    });

    test.skip('create document using JSON editor', async ({ page }) => {
      const docId = `json-test-${Date.now()}`;
      
      // Click create button
      await page.click(Selectors.createDocument.button);
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'visible' });

      // Switch to JSON mode if available
      const jsonModeButton = page.locator(Selectors.documentEditor.jsonEditorModeButton);
      if (await jsonModeButton.isVisible().catch(() => false)) {
        await jsonModeButton.click();
        await page.waitForTimeout(500);

        // Set document JSON
        const document = {
          id: docId,
          title: 'JSON Created Document',
          description: 'Created via JSON editor',
          count: 99,
          price: 99.99,
          isActive: true,
          createdAt: new Date().toISOString(),
          category: 'test',
        };

        await setDocumentJson(page, document);
      } else {
        // Use form fields
        await page.fill(Selectors.documentEditor.idInput, docId);
        await page.fill('[data-test-subj="field-title"] input', 'JSON Created Document');
        await page.fill('[data-test-subj="field-count"] input', '99');
      }

      // Save document
      await page.click(Selectors.documentEditor.saveButton);
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'hidden', timeout: 10000 });

      // Verify success
      await expect(page.locator(Selectors.osd.toastSuccess)).toBeVisible({ timeout: 5000 });
    });

    test.skip('cancel create does not save document', async ({ page }) => {
      const docId = `cancel-test-${Date.now()}`;
      
      // Get current document count
      const initialIds = await getVisibleDocumentIds(page);

      // Click create button
      await page.click(Selectors.createDocument.button);
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'visible' });

      // Fill in some fields
      await page.fill(Selectors.documentEditor.idInput, docId);
      await page.fill('[data-test-subj="field-title"] input', 'Cancelled Document');

      // Click cancel
      await page.click(Selectors.documentEditor.cancelButton);

      // Verify modal closes
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'hidden' });

      // Verify document was not created
      await page.reload();
      await waitForPluginToLoad(page);
      await selectIndex(page, testIndices.simple);
      await waitForDocumentList(page);

      const exists = await documentExists(page, docId);
      expect(exists).toBeFalsy();
    });
  });

  test.describe.skip('Read Document', () => {
    test.beforeAll(async () => {
      // Insert test document for reading
      await osClient.indexDocument(testIndices.simple, simpleDocuments[0], simpleDocuments[0].id);
      await osClient.refreshIndex(testIndices.simple);
    });

    test.skip('view document displays correct fields', async ({ page }) => {
      const docId = simpleDocuments[0].id!;
      
      // Find the document row
      const row = page.locator(Selectors.documentList.tableRow).filter({ hasText: docId });
      
      // Verify document is visible in list
      await expect(row).toBeVisible();

      // Click view/edit button
      const viewButton = row.locator(Selectors.documentList.editButton);
      await viewButton.click();

      // Wait for editor to open
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'visible' });

      // Verify fields are displayed with correct values
      const idField = page.locator(Selectors.documentEditor.idInput);
      await expect(idField).toHaveValue(docId);

      // Close editor
      await page.click(Selectors.documentEditor.cancelButton);
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'hidden' });
    });
  });

  test.describe.skip('Update Document', () => {
    test.beforeAll(async () => {
      // Insert test document for updating
      const docToUpdate = {
        id: 'update-test-doc',
        title: 'Original Title',
        description: 'Original Description',
        count: 10,
        price: 19.99,
        isActive: true,
        createdAt: new Date().toISOString(),
        category: 'test',
      };
      await osClient.indexDocument(testIndices.simple, docToUpdate, docToUpdate.id);
      await osClient.refreshIndex(testIndices.simple);
    });

    test.skip('update document fields', async ({ page }) => {
      const docId = 'update-test-doc';
      const newTitle = 'Updated Title';
      
      // Find and click edit
      const row = page.locator(Selectors.documentList.tableRow).filter({ hasText: docId });
      await row.locator(Selectors.documentList.editButton).click();

      // Wait for editor
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'visible' });

      // Update title field
      const titleInput = page.locator('[data-test-subj="field-title"] input, input[name="title"]');
      await titleInput.fill('');
      await titleInput.fill(newTitle);

      // Save changes
      await page.click(Selectors.documentEditor.saveButton);
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'hidden', timeout: 10000 });

      // Verify success toast
      await expect(page.locator(Selectors.osd.toastSuccess)).toBeVisible({ timeout: 5000 });

      // Refresh and verify update
      await page.reload();
      await waitForPluginToLoad(page);
      await selectIndex(page, testIndices.simple);
      await waitForDocumentList(page);

      // Open document again to verify change
      const updatedRow = page.locator(Selectors.documentList.tableRow).filter({ hasText: docId });
      await updatedRow.locator(Selectors.documentList.editButton).click();
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'visible' });

      // Verify updated value
      const updatedTitleInput = page.locator('[data-test-subj="field-title"] input, input[name="title"]');
      await expect(updatedTitleInput).toHaveValue(newTitle);

      // Close editor
      await page.click(Selectors.documentEditor.cancelButton);
    });

    test.skip('cancel update does not save changes', async ({ page }) => {
      const docId = 'update-test-doc';
      
      // Get current title
      const row = page.locator(Selectors.documentList.tableRow).filter({ hasText: docId });
      await row.locator(Selectors.documentList.editButton).click();
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'visible' });

      const titleInput = page.locator('[data-test-subj="field-title"] input, input[name="title"]');
      const originalTitle = await titleInput.inputValue();

      // Make a change
      await titleInput.fill('This will be cancelled');

      // Cancel
      await page.click(Selectors.documentEditor.cancelButton);
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'hidden' });

      // Reopen and verify original value
      await page.reload();
      await waitForPluginToLoad(page);
      await selectIndex(page, testIndices.simple);
      await waitForDocumentList(page);

      const reopenedRow = page.locator(Selectors.documentList.tableRow).filter({ hasText: docId });
      await reopenedRow.locator(Selectors.documentList.editButton).click();
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'visible' });

      const revertedTitleInput = page.locator('[data-test-subj="field-title"] input, input[name="title"]');
      await expect(revertedTitleInput).toHaveValue(originalTitle);

      await page.click(Selectors.documentEditor.cancelButton);
    });
  });

  test.describe.skip('Delete Document', () => {
    test.beforeAll(async () => {
      // Insert test document for deletion
      const docToDelete = {
        id: 'delete-test-doc',
        title: 'Document to Delete',
        description: 'This document will be deleted',
        count: 5,
        price: 9.99,
        isActive: false,
        createdAt: new Date().toISOString(),
        category: 'test',
      };
      await osClient.indexDocument(testIndices.simple, docToDelete, docToDelete.id);
      await osClient.refreshIndex(testIndices.simple);
    });

    test.skip('delete document with confirmation', async ({ page }) => {
      const docId = 'delete-test-doc';
      
      // Verify document exists
      let exists = await documentExists(page, docId);
      expect(exists).toBeTruthy();

      // Find and click delete
      const row = page.locator(Selectors.documentList.tableRow).filter({ hasText: docId });
      await row.locator(Selectors.documentList.deleteButton).click();

      // Confirm deletion
      await page.waitForSelector(Selectors.osd.confirmModal, { state: 'visible' });
      await page.click(Selectors.osd.confirmButton);

      // Wait for deletion to complete
      await page.waitForSelector(Selectors.osd.confirmModal, { state: 'hidden' });

      // Verify success toast
      await expect(page.locator(Selectors.osd.toastSuccess)).toBeVisible({ timeout: 5000 });

      // Verify document is removed
      await page.reload();
      await waitForPluginToLoad(page);
      await selectIndex(page, testIndices.simple);
      await waitForDocumentList(page);

      exists = await documentExists(page, docId);
      expect(exists).toBeFalsy();
    });

    test.skip('cancel delete keeps document', async ({ page }) => {
      // Insert a document
      const docId = `keep-test-${Date.now()}`;
      await osClient.indexDocument(testIndices.simple, {
        title: 'Keep Me',
        count: 1,
        price: 1.00,
        isActive: true,
        createdAt: new Date().toISOString(),
        category: 'test',
      }, docId);
      await osClient.refreshIndex(testIndices.simple);

      // Refresh page to see new document
      await page.reload();
      await waitForPluginToLoad(page);
      await selectIndex(page, testIndices.simple);
      await waitForDocumentList(page);

      // Find and click delete
      const row = page.locator(Selectors.documentList.tableRow).filter({ hasText: docId });
      await row.locator(Selectors.documentList.deleteButton).click();

      // Cancel deletion
      await page.waitForSelector(Selectors.osd.confirmModal, { state: 'visible' });
      await page.click(Selectors.osd.cancelModalButton);

      // Wait for modal to close
      await page.waitForSelector(Selectors.osd.confirmModal, { state: 'hidden' });

      // Verify document still exists
      const exists = await documentExists(page, docId);
      expect(exists).toBeTruthy();
    });
  });
});
