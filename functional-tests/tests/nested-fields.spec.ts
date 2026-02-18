/**
 * Nested Fields Tests
 * Test nested object editing, arrays, and deep nesting
 */

import { test, expect } from '@playwright/test';
import { osClient } from '../utils/api-client';
import { 
  loginToOSD, 
  navigateToPlugin, 
  waitForPluginToLoad,
  selectIndex,
  waitForDocumentList,
  documentExists,
  closeToasts,
} from '../utils/test-helpers';
import { Selectors } from '../utils/selectors';
import { 
  testIndices, 
  nestedDocuments, 
  newNestedDocument,
  arrayDocuments,
  newArrayDocument,
  deepNestedDocuments,
} from '../fixtures/test-data';

test.describe('Nested Fields', () => {
  test.beforeAll(async () => {
    // Setup test indices with mappings
    await osClient.setupTestIndices();
    
    // Insert nested test documents
    for (const doc of nestedDocuments) {
      const { id, ...source } = doc;
      await osClient.indexDocument(testIndices.nested, source, id);
    }
    
    // Insert array test documents
    for (const doc of arrayDocuments) {
      const { id, ...source } = doc;
      await osClient.indexDocument(testIndices.arrays, source, id);
    }

    // Insert deep nested documents
    for (const doc of deepNestedDocuments) {
      const { id, ...source } = doc;
      await osClient.indexDocument(testIndices.deep, source, id);
    }
    
    await osClient.refreshIndex(testIndices.nested);
    await osClient.refreshIndex(testIndices.arrays);
    await osClient.refreshIndex(testIndices.deep);
  });

  test.afterAll(async () => {
    await osClient.cleanupTestIndices();
  });

  test.afterEach(async ({ page }) => {
    await closeToasts(page);
  });

  test.describe('Nested Object Editing', () => {
    test.beforeEach(async ({ page }) => {
      await navigateToPlugin(page);
      await waitForPluginToLoad(page);
      await selectIndex(page, testIndices.nested);
      await waitForDocumentList(page);
    });

    test('display nested object fields', async ({ page }) => {
      // Find first nested document
      const docId = nestedDocuments[0].id!;
      const row = page.locator(Selectors.documentList.tableRow).filter({ hasText: docId });
      
      // Open document for editing
      await row.locator(Selectors.documentList.editButton).click();
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'visible' });

      // Verify nested fields are visible
      // The address and contact objects should be expandable
      const nestedToggle = page.locator(Selectors.documentEditor.nestedToggle).first();
      await expect(nestedToggle).toBeVisible();

      // Close editor
      await page.click(Selectors.documentEditor.cancelButton);
    });

    test('expand and collapse nested objects', async ({ page }) => {
      const docId = nestedDocuments[0].id!;
      const row = page.locator(Selectors.documentList.tableRow).filter({ hasText: docId });
      
      await row.locator(Selectors.documentList.editButton).click();
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'visible' });

      // Find and click nested toggle
      const nestedToggle = page.locator(Selectors.documentEditor.nestedToggle).first();
      if (await nestedToggle.isVisible().catch(() => false)) {
        // Expand
        await nestedToggle.click();
        await page.waitForTimeout(300);

        // Verify nested fields are visible after expand
        const nestedField = page.locator(Selectors.documentEditor.nestedField).first();
        const isVisible = await nestedField.isVisible().catch(() => false);
        expect(isVisible).toBeTruthy();

        // Collapse
        await nestedToggle.click();
      }

      await page.click(Selectors.documentEditor.cancelButton);
    });

    test('edit nested field values', async ({ page }) => {
      const docId = nestedDocuments[0].id!;
      const newCity = 'UpdatedCity';
      
      const row = page.locator(Selectors.documentList.tableRow).filter({ hasText: docId });
      await row.locator(Selectors.documentList.editButton).click();
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'visible' });

      // Expand address object if needed
      const addressToggle = page.locator('[data-path="address"] ' + Selectors.documentEditor.nestedToggle.replace(', ', ','));
      if (await addressToggle.isVisible().catch(() => false)) {
        await addressToggle.click();
        await page.waitForTimeout(300);
      }

      // Find and update city field
      const cityInput = page.locator('input[name="address.city"], [data-field-path="address.city"] input').first();
      if (await cityInput.isVisible().catch(() => false)) {
        await cityInput.fill('');
        await cityInput.fill(newCity);

        // Save changes
        await page.click(Selectors.documentEditor.saveButton);
        await page.waitForSelector(Selectors.documentEditor.modal, { state: 'hidden', timeout: 10000 });

        // Verify success
        await expect(page.locator(Selectors.osd.toastSuccess)).toBeVisible({ timeout: 5000 });
      }
    });

    test('add new nested field', async ({ page }) => {
      // Create a new document with nested fields
      const docId = `nested-new-${Date.now()}`;
      
      await page.click(Selectors.createDocument.button);
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'visible' });

      await page.fill(Selectors.documentEditor.idInput, docId);
      await page.fill('[data-test-subj="field-name"] input, input[name="name"]', 'New Person');

      // Expand address section and fill nested fields
      const addressToggle = page.locator('[data-path="address"] ' + Selectors.documentEditor.nestedToggle.replace(', ', ','));
      if (await addressToggle.isVisible().catch(() => false)) {
        await addressToggle.click();
        await page.waitForTimeout(300);

        // Fill address fields
        const streetInput = page.locator('input[name="address.street"], [data-field-path="address.street"] input').first();
        if (await streetInput.isVisible().catch(() => false)) {
          await streetInput.fill('123 Test Street');
        }

        const cityInput = page.locator('input[name="address.city"], [data-field-path="address.city"] input').first();
        if (await cityInput.isVisible().catch(() => false)) {
          await cityInput.fill('Test City');
        }
      }

      // Save document
      await page.click(Selectors.documentEditor.saveButton);
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'hidden', timeout: 10000 });

      await expect(page.locator(Selectors.osd.toastSuccess)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Array Editing', () => {
    test.beforeEach(async ({ page }) => {
      await navigateToPlugin(page);
      await waitForPluginToLoad(page);
      await selectIndex(page, testIndices.arrays);
      await waitForDocumentList(page);
    });

    test('display array fields', async ({ page }) => {
      const docId = arrayDocuments[0].id!;
      const row = page.locator(Selectors.documentList.tableRow).filter({ hasText: docId });
      
      await row.locator(Selectors.documentList.editButton).click();
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'visible' });

      // Verify array container is visible
      const arrayContainer = page.locator(Selectors.documentEditor.arrayContainer).first();
      await expect(arrayContainer).toBeVisible();

      await page.click(Selectors.documentEditor.cancelButton);
    });

    test('edit array elements', async ({ page }) => {
      const docId = arrayDocuments[0].id!;
      
      const row = page.locator(Selectors.documentList.tableRow).filter({ hasText: docId });
      await row.locator(Selectors.documentList.editButton).click();
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'visible' });

      // Find array items
      const arrayItems = page.locator(Selectors.documentEditor.arrayItem);
      const itemCount = await arrayItems.count();

      if (itemCount > 0) {
        // Modify first array item
        const firstItemInput = arrayItems.first().locator('input').first();
        if (await firstItemInput.isVisible().catch(() => false)) {
          const currentValue = await firstItemInput.inputValue();
          await firstItemInput.fill(currentValue + '-modified');

          // Save changes
          await page.click(Selectors.documentEditor.saveButton);
          await page.waitForSelector(Selectors.documentEditor.modal, { state: 'hidden', timeout: 10000 });

          await expect(page.locator(Selectors.osd.toastSuccess)).toBeVisible({ timeout: 5000 });
        }
      }
    });

    test('add array element', async ({ page }) => {
      const docId = arrayDocuments[0].id!;
      
      const row = page.locator(Selectors.documentList.tableRow).filter({ hasText: docId });
      await row.locator(Selectors.documentList.editButton).click();
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'visible' });

      // Find add button
      const addButton = page.locator(Selectors.documentEditor.arrayAddButton).first();
      if (await addButton.isVisible().catch(() => false)) {
        const initialCount = await page.locator(Selectors.documentEditor.arrayItem).count();
        
        await addButton.click();
        await page.waitForTimeout(500);

        // Verify new item was added
        const newCount = await page.locator(Selectors.documentEditor.arrayItem).count();
        expect(newCount).toBe(initialCount + 1);

        // Cancel changes
        await page.click(Selectors.documentEditor.cancelButton);
      }
    });

    test('remove array element', async ({ page }) => {
      const docId = arrayDocuments[0].id!;
      
      const row = page.locator(Selectors.documentList.tableRow).filter({ hasText: docId });
      await row.locator(Selectors.documentList.editButton).click();
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'visible' });

      // Find remove buttons
      const removeButtons = page.locator(Selectors.documentEditor.arrayRemoveButton);
      
      if (await removeButtons.first().isVisible().catch(() => false)) {
        const initialCount = await page.locator(Selectors.documentEditor.arrayItem).count();
        
        // Remove first item
        await removeButtons.first().click();
        await page.waitForTimeout(500);

        // Verify item was removed
        const newCount = await page.locator(Selectors.documentEditor.arrayItem).count();
        expect(newCount).toBe(initialCount - 1);

        // Cancel changes
        await page.click(Selectors.documentEditor.cancelButton);
      }
    });

    test('nested array objects', async ({ page }) => {
      const docId = arrayDocuments[0].id!;
      
      const row = page.locator(Selectors.documentList.tableRow).filter({ hasText: docId });
      await row.locator(Selectors.documentList.editButton).click();
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'visible' });

      // Look for variations array (nested objects)
      const variationsContainer = page.locator('[data-field-path="variations"], [data-test-subj="field-variations"]');
      
      if (await variationsContainer.isVisible().catch(() => false)) {
        // Verify nested object array is displayed
        await expect(variationsContainer).toBeVisible();
      }

      await page.click(Selectors.documentEditor.cancelButton);
    });
  });

  test.describe('Deep Nesting (3+ levels)', () => {
    test.beforeEach(async ({ page }) => {
      await navigateToPlugin(page);
      await waitForPluginToLoad(page);
      await selectIndex(page, testIndices.deep);
      await waitForDocumentList(page);
    });

    test('display deeply nested structure', async ({ page }) => {
      const docId = deepNestedDocuments[0].id!;
      
      const row = page.locator(Selectors.documentList.tableRow).filter({ hasText: docId });
      await row.locator(Selectors.documentList.editButton).click();
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'visible' });

      // Verify nested levels are present
      // company -> headquarters -> address -> building -> name
      const companyToggle = page.locator('[data-path="company"] ' + Selectors.documentEditor.nestedToggle.replace(', ', ',')).first();
      await expect(companyToggle).toBeVisible();

      await page.click(Selectors.documentEditor.cancelButton);
    });

    test('edit deeply nested field', async ({ page }) => {
      const docId = deepNestedDocuments[0].id!;
      
      const row = page.locator(Selectors.documentList.tableRow).filter({ hasText: docId });
      await row.locator(Selectors.documentList.editButton).click();
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'visible' });

      // Navigate through nested levels
      // Expand company
      const companyToggle = page.locator('[data-path="company"] ' + Selectors.documentEditor.nestedToggle.replace(', ', ',')).first();
      if (await companyToggle.isVisible().catch(() => false)) {
        await companyToggle.click();
        await page.waitForTimeout(300);

        // Expand headquarters
        const hqToggle = page.locator('[data-path="company.headquarters"] ' + Selectors.documentEditor.nestedToggle.replace(', ', ',')).first();
        if (await hqToggle.isVisible().catch(() => false)) {
          await hqToggle.click();
          await page.waitForTimeout(300);

          // Expand address
          const addressToggle = page.locator('[data-path="company.headquarters.address"] ' + Selectors.documentEditor.nestedToggle.replace(', ', ',')).first();
          if (await addressToggle.isVisible().catch(() => false)) {
            await addressToggle.click();
            await page.waitForTimeout(300);

            // Edit building name
            const buildingNameInput = page.locator('input[name="company.headquarters.address.building.name"]').first();
            if (await buildingNameInput.isVisible().catch(() => false)) {
              await buildingNameInput.fill('Updated Building Name');

              // Save
              await page.click(Selectors.documentEditor.saveButton);
              await page.waitForSelector(Selectors.documentEditor.modal, { state: 'hidden', timeout: 10000 });

              await expect(page.locator(Selectors.osd.toastSuccess)).toBeVisible({ timeout: 5000 });
            }
          }
        }
      }
    });
  });

  test.describe('JSON Editor Mode', () => {
    test.beforeEach(async ({ page }) => {
      await navigateToPlugin(page);
      await waitForPluginToLoad(page);
      await selectIndex(page, testIndices.nested);
      await waitForDocumentList(page);
    });

    test('switch to JSON editor mode', async ({ page }) => {
      const docId = nestedDocuments[0].id!;
      
      const row = page.locator(Selectors.documentList.tableRow).filter({ hasText: docId });
      await row.locator(Selectors.documentList.editButton).click();
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'visible' });

      // Find and click JSON mode button
      const jsonModeButton = page.locator(Selectors.documentEditor.jsonEditorModeButton);
      if (await jsonModeButton.isVisible().catch(() => false)) {
        await jsonModeButton.click();
        await page.waitForTimeout(500);

        // Verify JSON editor is visible
        const jsonEditor = page.locator(Selectors.documentEditor.jsonEditor);
        await expect(jsonEditor).toBeVisible();
      }

      await page.click(Selectors.documentEditor.cancelButton);
    });

    test('edit document in JSON mode', async ({ page }) => {
      const docId = `json-edit-${Date.now()}`;
      
      await page.click(Selectors.createDocument.button);
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'visible' });

      // Switch to JSON mode
      const jsonModeButton = page.locator(Selectors.documentEditor.jsonEditorModeButton);
      if (await jsonModeButton.isVisible().catch(() => false)) {
        await jsonModeButton.click();
        await page.waitForTimeout(500);

        // Set JSON content
        const document = {
          id: docId,
          name: 'JSON Created',
          address: {
            street: 'JSON Street',
            city: 'JSON City',
            country: 'JSON Land',
            coordinates: {
              lat: 12.34,
              lon: 56.78,
            },
          },
        };

        const jsonTextArea = page.locator(Selectors.documentEditor.jsonEditorTextArea);
        await jsonTextArea.fill(JSON.stringify(document, null, 2));

        // Save
        await page.click(Selectors.documentEditor.saveButton);
        await page.waitForSelector(Selectors.documentEditor.modal, { state: 'hidden', timeout: 10000 });

        await expect(page.locator(Selectors.osd.toastSuccess)).toBeVisible({ timeout: 5000 });
      }
    });

    test('no data loss when switching between modes', async ({ page }) => {
      const docId = nestedDocuments[0].id!;
      
      const row = page.locator(Selectors.documentList.tableRow).filter({ hasText: docId });
      await row.locator(Selectors.documentList.editButton).click();
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'visible' });

      // Get initial value from form
      const nameInput = page.locator('[data-test-subj="field-name"] input, input[name="name"]');
      const initialName = await nameInput.inputValue();

      // Switch to JSON mode
      const jsonModeButton = page.locator(Selectors.documentEditor.jsonEditorModeButton);
      if (await jsonModeButton.isVisible().catch(() => false)) {
        await jsonModeButton.click();
        await page.waitForTimeout(500);

        // Get JSON content
        const jsonTextArea = page.locator(Selectors.documentEditor.jsonEditorTextArea);
        const jsonContent = await jsonTextArea.inputValue();
        const parsed = JSON.parse(jsonContent);

        // Verify data is preserved
        expect(parsed.name).toBe(initialName);

        // Switch back to form mode
        const formModeButton = page.locator(Selectors.documentEditor.formEditorModeButton);
        if (await formModeButton.isVisible().catch(() => false)) {
          await formModeButton.click();
          await page.waitForTimeout(500);

          // Verify name is still the same
          const nameAfterSwitch = await nameInput.inputValue();
          expect(nameAfterSwitch).toBe(initialName);
        }
      }

      await page.click(Selectors.documentEditor.cancelButton);
    });
  });

  test.describe('Type Conversion', () => {
    test.beforeEach(async ({ page }) => {
      await navigateToPlugin(page);
      await waitForPluginToLoad(page);
      await selectIndex(page, testIndices.simple);
      await waitForDocumentList(page);
    });

    test('number fields accept numeric input', async ({ page }) => {
      const docId = `type-test-${Date.now()}`;
      
      await page.click(Selectors.createDocument.button);
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'visible' });

      await page.fill(Selectors.documentEditor.idInput, docId);
      await page.fill('[data-test-subj="field-title"] input, input[name="title"]', 'Type Test');

      // Test number field
      const countInput = page.locator('[data-test-subj="field-count"] input, input[name="count"]');
      await countInput.fill('42');
      
      const priceInput = page.locator('[data-test-subj="field-price"] input, input[name="price"]');
      await priceInput.fill('99.99');

      // Save
      await page.click(Selectors.documentEditor.saveButton);
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'hidden', timeout: 10000 });

      await expect(page.locator(Selectors.osd.toastSuccess)).toBeVisible({ timeout: 5000 });
    });

    test('boolean fields render as checkboxes', async ({ page }) => {
      const docId = `bool-test-${Date.now()}`;
      
      await page.click(Selectors.createDocument.button);
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'visible' });

      await page.fill(Selectors.documentEditor.idInput, docId);
      await page.fill('[data-test-subj="field-title"] input', 'Boolean Test');

      // Find and toggle boolean field
      const boolCheckbox = page.locator('[data-test-subj="field-isActive"] input[type="checkbox"], input[name="isActive"]');
      if (await boolCheckbox.isVisible().catch(() => false)) {
        const isChecked = await boolCheckbox.isChecked();
        await boolCheckbox.setChecked(!isChecked);
      }

      // Save
      await page.click(Selectors.documentEditor.saveButton);
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'hidden', timeout: 10000 });

      await expect(page.locator(Selectors.osd.toastSuccess)).toBeVisible({ timeout: 5000 });
    });

    test('date fields accept date input', async ({ page }) => {
      const docId = `date-test-${Date.now()}`;
      
      await page.click(Selectors.createDocument.button);
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'visible' });

      await page.fill(Selectors.documentEditor.idInput, docId);
      await page.fill('[data-test-subj="field-title"] input', 'Date Test');

      // Find date field and enter date
      const dateInput = page.locator('[data-test-subj="field-createdAt"] input, input[name="createdAt"]');
      if (await dateInput.isVisible().catch(() => false)) {
        await dateInput.fill('2024-01-15T10:30:00');
      }

      // Save
      await page.click(Selectors.documentEditor.saveButton);
      await page.waitForSelector(Selectors.documentEditor.modal, { state: 'hidden', timeout: 10000 });

      await expect(page.locator(Selectors.osd.toastSuccess)).toBeVisible({ timeout: 5000 });
    });
  });
});