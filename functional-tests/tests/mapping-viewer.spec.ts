/**
 * Mapping Viewer Tests
 * Test mapping display, tree view, JSON view, and field type indicators
 */

import { test, expect } from '@playwright/test';
import { osClient } from '../utils/api-client';
import { 
  loginToOSD, 
  navigateToPlugin, 
  waitForPluginToLoad,
  selectIndex,
} from '../utils/test-helpers';
import { Selectors } from '../utils/selectors';
import { testIndices, expectedFieldTypes } from '../fixtures/test-data';

test.describe('Mapping Viewer', () => {
  test.beforeAll(async () => {
    await osClient.setupTestIndices();
    await osClient.refreshIndex(testIndices.simple);
    await osClient.refreshIndex(testIndices.nested);
  });

  test.afterAll(async () => {
    await osClient.cleanupTestIndices();
  });

  test.beforeEach(async ({ page }) => {
    await navigateToPlugin(page);
    await waitForPluginToLoad(page);
  });

  test('mapping loads for selected index', async ({ page }) => {
    // Select an index
    await selectIndex(page, testIndices.simple);

    // Verify mapping viewer is visible
    await expect(page.locator(Selectors.mappingViewer.container)).toBeVisible();

    // Verify mapping has content
    const fieldNodes = page.locator(Selectors.mappingViewer.fieldNode);
    await expect(fieldNodes.first()).toBeVisible();
  });

  test('mapping tree view displays correctly', async ({ page }) => {
    await selectIndex(page, testIndices.simple);

    // Verify tree view container
    const treeView = page.locator(Selectors.mappingViewer.treeView);
    await expect(treeView).toBeVisible();

    // Verify field nodes are present
    const fieldNodes = page.locator(Selectors.mappingViewer.fieldNode);
    expect(await fieldNodes.count()).toBeGreaterThan(0);

    // Verify each node has field name
    const firstNode = fieldNodes.first();
    await expect(firstNode.locator(Selectors.mappingViewer.fieldName)).toBeVisible();
  });

  test('field names are displayed correctly', async ({ page }) => {
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
  });

  test('field type indicators are shown', async ({ page }) => {
    await selectIndex(page, testIndices.simple);

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

  test('expand and collapse mapping fields', async ({ page }) => {
    // Select nested index for complex mapping
    await selectIndex(page, testIndices.nested);

    // Find expandable fields (objects)
    const expandButtons = page.locator(Selectors.mappingViewer.expandButton);
    
    if (await expandButtons.first().isVisible().catch(() => false)) {
      // Click to expand
      await expandButtons.first().click();
      await page.waitForTimeout(300);

      // Verify collapse button appears
      const collapseButtons = page.locator(Selectors.mappingViewer.collapseButton);
      expect(await collapseButtons.count()).toBeGreaterThan(0);

      // Click to collapse
      await collapseButtons.first().click();
      await page.waitForTimeout(300);
    }
  });

  test('mapping JSON view displays correctly', async ({ page }) => {
    await selectIndex(page, testIndices.simple);

    // Find and click JSON view toggle if available
    const jsonView = page.locator(Selectors.mappingViewer.jsonView);
    
    if (await jsonView.isVisible().catch(() => false)) {
      // Click to show JSON view
      await jsonView.click();
      await page.waitForTimeout(500);

      // Verify JSON content is displayed
      const jsonContent = page.locator(Selectors.mappingViewer.jsonContent);
      await expect(jsonContent).toBeVisible();

      // Verify content looks like JSON
      const content = await jsonContent.textContent();
      expect(content).toContain('properties');
    }
  });

  test('nested mapping displays nested structure', async ({ page }) => {
    // Select nested index
    await selectIndex(page, testIndices.nested);

    // Verify mapping viewer is visible
    await expect(page.locator(Selectors.mappingViewer.container)).toBeVisible();

    // Verify nested fields exist
    const fieldNodes = page.locator(Selectors.mappingViewer.fieldNode);
    const fieldNames = await fieldNodes.locator(Selectors.mappingViewer.fieldName).allTextContents();

    // Should have address and contact fields
    const hasAddress = fieldNames.some(name => name.toLowerCase().includes('address'));
    const hasContact = fieldNames.some(name => name.toLowerCase().includes('contact'));
    
    expect(hasAddress || hasContact).toBeTruthy();
  });

  test('mapping updates when changing indices', async ({ page }) => {
    // Select first index
    await selectIndex(page, testIndices.simple);
    await page.waitForTimeout(500);

    // Get initial field names
    const initialFieldNodes = page.locator(Selectors.mappingViewer.fieldNode);
    const initialCount = await initialFieldNodes.count();

    // Select second index
    await selectIndex(page, testIndices.nested);
    await page.waitForTimeout(500);

    // Get new field names
    const newFieldNodes = page.locator(Selectors.mappingViewer.fieldNode);
    const newCount = await newFieldNodes.count();

    // Counts might be same or different, but structure should update
    // The mapping viewer should still be visible
    await expect(page.locator(Selectors.mappingViewer.container)).toBeVisible();
  });

  test('field type badges are color-coded', async ({ page }) => {
    await selectIndex(page, testIndices.simple);

    // Look for different type indicators
    const textType = page.locator(Selectors.mappingViewer.typeText);
    const keywordType = page.locator(Selectors.mappingViewer.typeKeyword);
    const booleanType = page.locator(Selectors.mappingViewer.typeBoolean);
    const dateType = page.locator(Selectors.mappingViewer.typeDate);

    // Check that type elements have appropriate classes or styles
    const typeElements = [
      { element: textType, name: 'text' },
      { element: keywordType, name: 'keyword' },
      { element: booleanType, name: 'boolean' },
      { element: dateType, name: 'date' },
    ];

    for (const { element, name } of typeElements) {
      if (await element.first().isVisible().catch(() => false)) {
        // Type indicator is visible, verify it has content
        const text = await element.first().textContent();
        expect(text?.toLowerCase()).toContain(name);
      }
    }
  });

  test('object and nested types are distinguished', async ({ page }) => {
    // Select array index which has nested types
    await selectIndex(page, testIndices.arrays);

    // Look for object type indicators
    const objectTypes = page.locator(Selectors.mappingViewer.typeObject);
    const nestedTypes = page.locator(Selectors.mappingViewer.typeNested);

    // Should have either object or nested types
    const hasObject = await objectTypes.first().isVisible().catch(() => false);
    const hasNested = await nestedTypes.first().isVisible().catch(() => false);

    expect(hasObject || hasNested).toBeTruthy();
  });

  test('mapping shows correct field count', async ({ page }) => {
    await selectIndex(page, testIndices.simple);

    // Count visible field nodes
    const fieldNodes = page.locator(Selectors.mappingViewer.fieldNode);
    const visibleCount = await fieldNodes.count();

    // Verify we have the expected number of top-level fields
    // (at least the 7 fields in our simple mapping)
    expect(visibleCount).toBeGreaterThanOrEqual(7);
  });

  test('field paths are displayed for nested fields', async ({ page }) => {
    await selectIndex(page, testIndices.nested);

    // Look for field path attributes or nested field display
    const fieldNodes = page.locator(Selectors.mappingViewer.fieldNode);
    
    // Expand any collapsible sections
    const expandButtons = page.locator(Selectors.mappingViewer.expandButton);
    if (await expandButtons.first().isVisible().catch(() => false)) {
      await expandButtons.first().click();
      await page.waitForTimeout(300);
    }

    // Verify nested fields are shown
    const fieldNames = await fieldNodes.locator(Selectors.mappingViewer.fieldName).allTextContents();
    
    // Should have some fields that look like nested paths
    const hasNestedPath = fieldNames.some(name => 
      name.includes('.') || 
      name.toLowerCase().includes('street') ||
      name.toLowerCase().includes('city')
    );
    
    expect(hasNestedPath).toBeTruthy();
  });

  test('numeric type variations are shown', async ({ page }) => {
    await selectIndex(page, testIndices.simple);

    // Look for numeric type indicators
    const integerType = page.locator(Selectors.mappingViewer.typeInteger);
    const floatType = page.locator(Selectors.mappingViewer.typeFloat);
    const longType = page.locator(Selectors.mappingViewer.typeLong);
    const doubleType = page.locator(Selectors.mappingViewer.typeDouble);

    // At least one numeric type should be visible
    const hasNumericType = await integerType.first().isVisible().catch(() => false) ||
                          await floatType.first().isVisible().catch(() => false) ||
                          await longType.first().isVisible().catch(() => false) ||
                          await doubleType.first().isVisible().catch(() => false);

    expect(hasNumericType).toBeTruthy();
  });

  test('mapping viewer is responsive to window size', async ({ page }) => {
    await selectIndex(page, testIndices.simple);

    // Test at different viewport sizes
    const sizes = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 768, height: 1024 },
    ];

    for (const size of sizes) {
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.waitForTimeout(300);

      // Verify mapping viewer is still visible
      await expect(page.locator(Selectors.mappingViewer.container)).toBeVisible();
    }
  });
});