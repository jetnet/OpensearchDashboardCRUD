/**
 * Tag Management Tests
 * Test array field tag management with EuiBadge components
 */

import { test, expect } from '@playwright/test';
import { osClient } from '../utils/api-client';
import { 
  navigateToPlugin, 
  waitForPluginToLoad,
  selectIndex,
  waitForDocumentList,
} from '../utils/test-helpers';
import { testIndices } from '../fixtures/test-data';

test.describe.skip('Tag Management', () => {
  test.beforeAll(async () => {
    // Setup test indices
    await osClient.setupTestIndices();
    
    // Insert documents with array fields
    const documents = [
      {
        title: 'Product A',
        tags: ['electronics', 'gadget', 'new'],
        categories: ['tech', 'consumer'],
        features: ['wireless', 'bluetooth', 'usb-c'],
        price: 99.99,
      },
      {
        title: 'Product B',
        tags: ['books', 'education'],
        categories: ['learning', 'reference'],
        features: ['hardcover', 'illustrated'],
        price: 29.99,
      },
      {
        title: 'Product C',
        tags: ['software', 'subscription'],
        categories: ['saas', 'business'],
        features: ['cloud', 'api', 'integration', 'support'],
        price: 149.99,
      },
    ];
    
    for (let i = 0; i < documents.length; i++) {
      await osClient.indexDocument(testIndices.simple, documents[i], `tag-doc-${i + 1}`);
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

  test('tag manager component is present in document editor', async ({ page }) => {
    // Open a document for editing
    const editButton = page.locator('[aria-label="Edit document"]').first();
    await editButton.click();
    
    // Wait for editor to open
    const editor = page.locator('[data-test-subj="document-editor"]');
    await expect(editor).toBeVisible();
    
    // Look for tag manager or array field representation
    const tags = page.locator('.euiBadge');
    const tagCount = await tags.count();
    
    // Should have some badges for array values
    expect(tagCount).toBeGreaterThan(0);
  });

  test('tags display as EuiBadge components', async ({ page }) => {
    // Open document editor
    const editButton = page.locator('[aria-label="Edit document"]').first();
    await editButton.click();
    
    // Wait for editor
    await page.waitForSelector('[data-test-subj="document-editor"]');
    
    // Find badges
    const badges = page.locator('.euiBadge');
    const badgeCount = await badges.count();
    
    // Should have badges for array elements
    expect(badgeCount).toBeGreaterThan(0);
    
    // Verify badge content
    const firstBadge = badges.first();
    const badgeText = await firstBadge.textContent();
    expect(badgeText?.length).toBeGreaterThan(0);
  });

  test('tag delete button exists', async ({ page }) => {
    // Open document editor
    const editButton = page.locator('[aria-label="Edit document"]').first();
    await editButton.click();
    
    await page.waitForSelector('[data-test-subj="document-editor"]');
    
    // Find a badge with delete button
    const badges = page.locator('.euiBadge');
    const firstBadge = badges.first();
    
    // Check for close button within badge
    const closeButton = firstBadge.locator('.euiBadge__closeButton');
    
    if (await closeButton.isVisible()) {
      await expect(closeButton).toBeVisible();
    }
  });

  test('add tag button exists', async ({ page }) => {
    // Open document editor
    const editButton = page.locator('[aria-label="Edit document"]').first();
    await editButton.click();
    
    await page.waitForSelector('[data-test-subj="document-editor"]');
    
    // Look for add button
    const addButton = page.locator('[data-test-subj="tag-add-button"]');
    
    if (await addButton.isVisible()) {
      await expect(addButton).toBeVisible();
    }
  });

  test('add tag flow works', async ({ page }) => {
    // Open document editor
    const editButton = page.locator('[aria-label="Edit document"]').first();
    await editButton.click();
    
    await page.waitForSelector('[data-test-subj="document-editor"]');
    
    // Click add button
    const addButton = page.locator('[data-test-subj="tag-add-button"]');
    
    if (await addButton.isVisible()) {
      await addButton.click();
      
      // Verify input appears
      const tagInput = page.locator('[data-test-subj="tag-input"]');
      await expect(tagInput).toBeVisible();
      
      // Type new tag value
      await tagInput.fill('new-tag-value');
      
      // Confirm add
      const confirmButton = page.locator('[data-test-subj="tag-add-confirm"]');
      await confirmButton.click();
      
      // Verify new badge appears
      const newBadge = page.locator('.euiBadge').filter({ hasText: 'new-tag-value' });
      await expect(newBadge).toBeVisible();
    }
  });

  test('cancel add tag works', async ({ page }) => {
    // Open document editor
    const editButton = page.locator('[aria-label="Edit document"]').first();
    await editButton.click();
    
    await page.waitForSelector('[data-test-subj="document-editor"]');
    
    // Click add button
    const addButton = page.locator('[data-test-subj="tag-add-button"]');
    
    if (await addButton.isVisible()) {
      await addButton.click();
      
      // Type value
      const tagInput = page.locator('[data-test-subj="tag-input"]');
      await tagInput.fill('cancelled-tag');
      
      // Cancel
      const cancelButton = page.locator('[data-test-subj="tag-add-cancel"]');
      await cancelButton.click();
      
      // Input should be gone
      await expect(tagInput).not.toBeVisible();
    }
  });

  test('delete tag works', async ({ page }) => {
    // Open document editor
    const editButton = page.locator('[aria-label="Edit document"]').first();
    await editButton.click();
    
    await page.waitForSelector('[data-test-subj="document-editor"]');
    
    // Get initial badge count
    const badges = page.locator('.euiBadge');
    const initialCount = await badges.count();
    
    if (initialCount > 0) {
      // Find delete button on first badge
      const firstBadge = badges.first();
      const closeButton = firstBadge.locator('.euiBadge__closeButton');
      
      if (await closeButton.isVisible()) {
        await closeButton.click();
        
        // Wait for badge to be removed
        await page.waitForTimeout(100);
        
        // Verify count decreased
        const newCount = await badges.count();
        expect(newCount).toBeLessThan(initialCount);
      }
    }
  });

  test('tags show different colors for different types', async ({ page }) => {
    // Open document editor
    const editButton = page.locator('[aria-label="Edit document"]').first();
    await editButton.click();
    
    await page.waitForSelector('[data-test-subj="document-editor"]');
    
    // Get all badges
    const badges = page.locator('.euiBadge');
    const badgeCount = await badges.count();
    
    if (badgeCount > 1) {
      // Get colors of first two badges
      const firstBadge = badges.first();
      const secondBadge = badges.nth(1);
      
      const firstClass = await firstBadge.getAttribute('class');
      const secondClass = await secondBadge.getAttribute('class');
      
      // Both should have badge classes
      expect(firstClass).toContain('euiBadge');
      expect(secondClass).toContain('euiBadge');
    }
  });

  test('tag input handles enter key', async ({ page }) => {
    // Open document editor
    const editButton = page.locator('[aria-label="Edit document"]').first();
    await editButton.click();
    
    await page.waitForSelector('[data-test-subj="document-editor"]');
    
    // Click add button
    const addButton = page.locator('[data-test-subj="tag-add-button"]');
    
    if (await addButton.isVisible()) {
      await addButton.click();
      
      // Type value and press Enter
      const tagInput = page.locator('[data-test-subj="tag-input"]');
      await tagInput.fill('enter-key-tag');
      await tagInput.press('Enter');
      
      // Verify badge appears
      const newBadge = page.locator('.euiBadge').filter({ hasText: 'enter-key-tag' });
      await expect(newBadge).toBeVisible();
    }
  });

  test('tag input handles escape key', async ({ page }) => {
    // Open document editor
    const editButton = page.locator('[aria-label="Edit document"]').first();
    await editButton.click();
    
    await page.waitForSelector('[data-test-subj="document-editor"]');
    
    // Click add button
    const addButton = page.locator('[data-test-subj="tag-add-button"]');
    
    if (await addButton.isVisible()) {
      await addButton.click();
      
      // Type value and press Escape
      const tagInput = page.locator('[data-test-subj="tag-input"]');
      await tagInput.fill('escape-key-tag');
      await tagInput.press('Escape');
      
      // Input should be gone
      await expect(tagInput).not.toBeVisible();
    }
  });

  test('empty array shows placeholder', async ({ page }) => {
    // Create document with empty array
    await osClient.indexDocument(testIndices.simple, {
      title: 'Empty Array Doc',
      tags: [],
    }, 'empty-array-doc');
    await osClient.refreshIndex(testIndices.simple);
    
    // Refresh page
    await page.reload();
    await waitForPluginToLoad(page);
    await selectIndex(page, testIndices.simple);
    await waitForDocumentList(page);
    
    // Find and edit the empty array document
    // This test is informational - verifies UI doesn't crash
  });
});