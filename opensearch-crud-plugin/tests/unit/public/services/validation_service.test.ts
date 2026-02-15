/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Unit tests for ValidationService (frontend)
 */

import { ValidationService } from '../../../public/services/validation_service';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(() => {
    service = new ValidationService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateTitle', () => {
    it('should validate a valid title', () => {
      const result = service.validateTitle('Valid Title');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty title', () => {
      const result = service.validateTitle('');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'title',
          code: 'REQUIRED',
        })
      );
    });

    it('should reject whitespace-only title', () => {
      const result = service.validateTitle('   ');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'title',
          code: 'REQUIRED',
        })
      );
    });

    it('should reject title exceeding max length', () => {
      const result = service.validateTitle('a'.repeat(256));

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'title',
          code: 'MAX_LENGTH',
        })
      );
    });

    it('should accept title at max length', () => {
      const result = service.validateTitle('a'.repeat(255));

      expect(result.isValid).toBe(true);
    });
  });

  describe('validateDescription', () => {
    it('should validate a valid description', () => {
      const result = service.validateDescription('Valid description');

      expect(result.isValid).toBe(true);
    });

    it('should accept empty description (optional field)', () => {
      const result = service.validateDescription('');

      expect(result.isValid).toBe(true);
    });

    it('should accept undefined description', () => {
      const result = service.validateDescription(undefined);

      expect(result.isValid).toBe(true);
    });

    it('should reject description exceeding max length', () => {
      const result = service.validateDescription('a'.repeat(5001));

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'description',
          code: 'MAX_LENGTH',
        })
      );
    });
  });

  describe('validateStatus', () => {
    it('should validate valid statuses', () => {
      const validStatuses = ['active', 'inactive', 'archived'];

      validStatuses.forEach((status) => {
        const result = service.validateStatus(status);
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject invalid status', () => {
      const result = service.validateStatus('invalid');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'status',
          code: 'INVALID_VALUE',
        })
      );
    });

    it('should accept undefined status', () => {
      const result = service.validateStatus(undefined);

      expect(result.isValid).toBe(true);
    });
  });

  describe('validatePriority', () => {
    it('should validate valid priority', () => {
      const result = service.validatePriority(5);

      expect(result.isValid).toBe(true);
    });

    it('should accept zero priority', () => {
      const result = service.validatePriority(0);

      expect(result.isValid).toBe(true);
    });

    it('should accept maximum priority', () => {
      const result = service.validatePriority(1000);

      expect(result.isValid).toBe(true);
    });

    it('should reject negative priority', () => {
      const result = service.validatePriority(-1);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'priority',
          code: 'OUT_OF_RANGE',
        })
      );
    });

    it('should reject priority exceeding max', () => {
      const result = service.validatePriority(1001);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'priority',
          code: 'OUT_OF_RANGE',
        })
      );
    });

    it('should reject non-integer priority', () => {
      const result = service.validatePriority(5.5);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'priority',
          code: 'INVALID_VALUE',
        })
      );
    });

    it('should accept undefined priority', () => {
      const result = service.validatePriority(undefined);

      expect(result.isValid).toBe(true);
    });
  });

  describe('validateTags', () => {
    it('should validate valid tags', () => {
      const result = service.validateTags(['tag1', 'tag2', 'tag3']);

      expect(result.isValid).toBe(true);
    });

    it('should accept empty tags array', () => {
      const result = service.validateTags([]);

      expect(result.isValid).toBe(true);
    });

    it('should accept undefined tags', () => {
      const result = service.validateTags(undefined);

      expect(result.isValid).toBe(true);
    });

    it('should reject too many tags', () => {
      const result = service.validateTags(Array(21).fill('tag'));

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'tags',
          code: 'MAX_ITEMS',
        })
      );
    });

    it('should reject tag exceeding max length', () => {
      const result = service.validateTags(['a'.repeat(51)]);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'tags[0]',
          code: 'MAX_LENGTH',
        })
      );
    });

    it('should reject non-string tags', () => {
      const result = service.validateTags(['valid', 123 as any, 'also-valid']);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'tags[1]',
          code: 'INVALID_TYPE',
        })
      );
    });
  });

  describe('validateEntity', () => {
    it('should validate a complete valid entity', () => {
      const entity = {
        title: 'Test Entity',
        description: 'Test description',
        status: 'active',
        priority: 5,
        tags: ['tag1', 'tag2'],
      };

      const result = service.validateEntity(entity);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate minimal valid entity', () => {
      const entity = {
        title: 'Test Entity',
      };

      const result = service.validateEntity(entity);

      expect(result.isValid).toBe(true);
    });

    it('should collect multiple validation errors', () => {
      const entity = {
        title: '',
        status: 'invalid',
        priority: -1,
        tags: Array(25).fill('tag'),
      };

      const result = service.validateEntity(entity);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should reject non-object entity', () => {
      const result = service.validateEntity(null);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'INVALID_TYPE',
        })
      );
    });
  });

  describe('validateEntityForUpdate', () => {
    it('should validate partial updates', () => {
      const updates = {
        title: 'Updated Title',
      };

      const result = service.validateEntityForUpdate(updates);

      expect(result.isValid).toBe(true);
    });

    it('should allow empty update object', () => {
      const result = service.validateEntityForUpdate({});

      expect(result.isValid).toBe(true);
    });

    it('should still validate field constraints', () => {
      const updates = {
        priority: 1001,
      };

      const result = service.validateEntityForUpdate(updates);

      expect(result.isValid).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      const result = service.sanitizeInput('  test  ');

      expect(result).toBe('test');
    });

    it('should handle special characters safely', () => {
      const result = service.sanitizeInput('<script>alert("xss")</script>');

      // Should not throw and should return a string
      expect(typeof result).toBe('string');
    });
  });
});
