/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Unit tests for ValidationService (server-side)
 */

import { ValidationService } from '../../../server/services/validation_service';
import type { CrudPluginConfig } from '../../../server/types';

describe('ValidationService', () => {
  let service: ValidationService;
  let mockConfig: CrudPluginConfig;
  let mockLogger: { warn: jest.Mock; error: jest.Mock };

  beforeEach(() => {
    mockConfig = {
      index: {
        name: 'test-entities',
      },
      pagination: {
        defaultPageSize: 25,
        maxPageSize: 100,
      },
      filtering: {
        maxFilters: 10,
      },
      sorting: {
        maxSortFields: 5,
      },
      bulk: {
        maxBulkSize: 100,
      },
    };

    mockLogger = {
      warn: jest.fn(),
      error: jest.fn(),
    };

    service = new ValidationService(mockConfig, mockLogger as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateEntity', () => {
    describe('create entity validation', () => {
      it('should validate a valid entity', () => {
        const entity = {
          title: 'Test Entity',
          description: 'Test description',
          status: 'active',
          priority: 5,
          tags: ['tag1', 'tag2'],
        };

        const result = service.validateEntity(entity, false);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should require title for create', () => {
        const entity = {
          description: 'Test description',
        };

        const result = service.validateEntity(entity, false);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'title',
            code: 'REQUIRED',
          })
        );
      });

      it('should reject empty title', () => {
        const entity = {
          title: '   ',
        };

        const result = service.validateEntity(entity, false);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'title',
            code: 'EMPTY_VALUE',
          })
        );
      });

      it('should reject title exceeding max length', () => {
        const entity = {
          title: 'a'.repeat(256),
        };

        const result = service.validateEntity(entity, false);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'title',
            code: 'MAX_LENGTH',
          })
        );
      });

      it('should reject invalid status', () => {
        const entity = {
          title: 'Test',
          status: 'invalid-status',
        };

        const result = service.validateEntity(entity, false);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'status',
            code: 'INVALID_VALUE',
          })
        );
      });

      it('should accept all valid statuses', () => {
        const statuses = ['active', 'inactive', 'archived'];

        statuses.forEach((status) => {
          const entity = { title: 'Test', status };
          const result = service.validateEntity(entity, false);
          expect(result.isValid).toBe(true);
        });
      });

      it('should reject non-integer priority', () => {
        const entity = {
          title: 'Test',
          priority: 3.5,
        };

        const result = service.validateEntity(entity, false);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'priority',
            code: 'INVALID_VALUE',
          })
        );
      });

      it('should reject priority out of range', () => {
        const entity = {
          title: 'Test',
          priority: 1001,
        };

        const result = service.validateEntity(entity, false);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'priority',
            code: 'OUT_OF_RANGE',
          })
        );
      });

      it('should reject non-string tags', () => {
        const entity = {
          title: 'Test',
          tags: ['valid', 123, 'also-valid'],
        };

        const result = service.validateEntity(entity, false);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'tags[1]',
            code: 'INVALID_TYPE',
          })
        );
      });

      it('should reject too many tags', () => {
        const entity = {
          title: 'Test',
          tags: Array(21).fill('tag'),
        };

        const result = service.validateEntity(entity, false);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'tags',
            code: 'MAX_ITEMS',
          })
        );
      });

      it('should reject non-object entity', () => {
        const result = service.validateEntity(null, false);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            code: 'INVALID_TYPE',
          })
        );
      });
    });

    describe('update entity validation', () => {
      it('should validate update with partial data', () => {
        const entity = {
          title: 'Updated Title',
        };

        const result = service.validateEntity(entity, true);

        expect(result.isValid).toBe(true);
      });

      it('should allow empty update object', () => {
        const result = service.validateEntity({}, true);

        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('validateFilters', () => {
    it('should validate empty filters', () => {
      const result = service.validateFilters([]);

      expect(result.isValid).toBe(true);
    });

    it('should validate undefined filters', () => {
      const result = service.validateFilters(undefined);

      expect(result.isValid).toBe(true);
    });

    it('should validate valid filters', () => {
      const filters = [
        { field: 'status', operator: 'eq', value: 'active' },
        { field: 'priority', operator: 'gt', value: 5 },
      ];

      const result = service.validateFilters(filters);

      expect(result.isValid).toBe(true);
    });

    it('should reject non-array filters', () => {
      const result = service.validateFilters({});

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'filters',
          code: 'INVALID_TYPE',
        })
      );
    });

    it('should reject too many filters', () => {
      const filters = Array(11).fill({
        field: 'status',
        operator: 'eq',
        value: 'active',
      });

      const result = service.validateFilters(filters);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'filters',
          code: 'MAX_FILTERS',
        })
      );
    });

    it('should reject invalid filter field', () => {
      const filters = [
        { field: 'invalidField', operator: 'eq', value: 'test' },
      ];

      const result = service.validateFilters(filters);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'filters[0].field',
          code: 'INVALID_VALUE',
        })
      );
    });

    it('should reject invalid operator', () => {
      const filters = [
        { field: 'status', operator: 'invalidOp', value: 'test' },
      ];

      const result = service.validateFilters(filters);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'filters[0].operator',
          code: 'INVALID_VALUE',
        })
      );
    });

    it('should require value for non-exists operators', () => {
      const filters = [
        { field: 'status', operator: 'eq' },
      ];

      const result = service.validateFilters(filters);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'filters[0].value',
          code: 'REQUIRED',
        })
      );
    });

    it('should allow exists operator without value', () => {
      const filters = [
        { field: 'status', operator: 'exists' },
      ];

      const result = service.validateFilters(filters);

      expect(result.isValid).toBe(true);
    });

    it('should require array for "in" operator', () => {
      const filters = [
        { field: 'status', operator: 'in', value: 'active' },
      ];

      const result = service.validateFilters(filters);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'filters[0].value',
          code: 'INVALID_TYPE',
        })
      );
    });

    it('should require exactly 2 values for "between" operator', () => {
      const filters = [
        { field: 'priority', operator: 'between', value: [1, 2, 3] },
      ];

      const result = service.validateFilters(filters);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'filters[0].value',
          code: 'INVALID_VALUE',
        })
      );
    });
  });

  describe('validateSort', () => {
    it('should validate empty sort', () => {
      const result = service.validateSort([]);

      expect(result.isValid).toBe(true);
    });

    it('should validate undefined sort', () => {
      const result = service.validateSort(undefined);

      expect(result.isValid).toBe(true);
    });

    it('should validate valid sort', () => {
      const sort = [
        { field: 'createdAt', direction: 'desc' as const },
        { field: 'title', direction: 'asc' as const },
      ];

      const result = service.validateSort(sort);

      expect(result.isValid).toBe(true);
    });

    it('should reject non-array sort', () => {
      const result = service.validateSort({});

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'sort',
          code: 'INVALID_TYPE',
        })
      );
    });

    it('should reject too many sort fields', () => {
      const sort = Array(6).fill({
        field: 'createdAt',
        direction: 'desc',
      });

      const result = service.validateSort(sort);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'sort',
          code: 'MAX_SORT_FIELDS',
        })
      );
    });

    it('should reject invalid sort field', () => {
      const sort = [{ field: 'invalidField', direction: 'asc' as const }];

      const result = service.validateSort(sort);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'sort[0].field',
          code: 'INVALID_VALUE',
        })
      );
    });

    it('should reject invalid direction', () => {
      const sort = [{ field: 'createdAt', direction: 'invalid' }];

      const result = service.validateSort(sort);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'sort[0].direction',
          code: 'INVALID_VALUE',
        })
      );
    });
  });

  describe('validatePagination', () => {
    it('should validate empty pagination', () => {
      const result = service.validatePagination({});

      expect(result.isValid).toBe(true);
    });

    it('should validate valid pagination', () => {
      const pagination = { page: 2, pageSize: 50 };

      const result = service.validatePagination(pagination);

      expect(result.isValid).toBe(true);
    });

    it('should reject page less than 1', () => {
      const pagination = { page: 0 };

      const result = service.validatePagination(pagination);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'page',
          code: 'OUT_OF_RANGE',
        })
      );
    });

    it('should reject pageSize exceeding max', () => {
      const pagination = { pageSize: 101 };

      const result = service.validatePagination(pagination);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'pageSize',
          code: 'OUT_OF_RANGE',
        })
      );
    });

    it('should reject non-integer page', () => {
      const pagination = { page: 1.5 };

      const result = service.validatePagination(pagination);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'page',
          code: 'INVALID_VALUE',
        })
      );
    });
  });

  describe('validateId', () => {
    it('should validate valid ID', () => {
      const result = service.validateId('valid-id-123');

      expect(result.isValid).toBe(true);
    });

    it('should reject undefined ID', () => {
      const result = service.validateId(undefined);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'id',
          code: 'REQUIRED',
        })
      );
    });

    it('should reject empty ID', () => {
      const result = service.validateId('   ');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'id',
          code: 'EMPTY_VALUE',
        })
      );
    });

    it('should reject ID exceeding max length', () => {
      const result = service.validateId('a'.repeat(101));

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'id',
          code: 'MAX_LENGTH',
        })
      );
    });
  });

  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      const result = service.sanitizeInput('  test  ');

      expect(result).toBe('test');
    });

    it('should remove null bytes', () => {
      const result = service.sanitizeInput('test\0value');

      expect(result).toBe('testvalue');
    });

    it('should return empty string for non-string input', () => {
      const result = service.sanitizeInput(null as any);

      expect(result).toBe('');
    });
  });

  describe('validateBulkCreate', () => {
    it('should validate valid bulk create', () => {
      const entities = [
        { title: 'Entity 1' },
        { title: 'Entity 2' },
      ];

      const result = service.validateBulkCreate(entities);

      expect(result.isValid).toBe(true);
    });

    it('should reject non-array', () => {
      const result = service.validateBulkCreate({});

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'entities',
          code: 'INVALID_TYPE',
        })
      );
    });

    it('should reject empty array', () => {
      const result = service.validateBulkCreate([]);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'entities',
          code: 'EMPTY_ARRAY',
        })
      );
    });

    it('should reject too many entities', () => {
      const entities = Array(101).fill({ title: 'Test' });

      const result = service.validateBulkCreate(entities);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'entities',
          code: 'MAX_BULK_SIZE',
        })
      );
    });

    it('should include entity validation errors with correct path', () => {
      const entities = [
        { title: 'Valid' },
        { title: '' }, // Invalid
      ];

      const result = service.validateBulkCreate(entities);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'entities[1].title',
          code: 'EMPTY_VALUE',
        })
      );
    });
  });

  describe('validateBulkUpdate', () => {
    it('should validate valid bulk update', () => {
      const updates = [
        { id: 'id-1', attributes: { title: 'Updated 1' } },
        { id: 'id-2', attributes: { status: 'inactive' } },
      ];

      const result = service.validateBulkUpdate(updates);

      expect(result.isValid).toBe(true);
    });

    it('should reject updates without id', () => {
      const updates = [
        { attributes: { title: 'Updated' } },
      ];

      const result = service.validateBulkUpdate(updates);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'updates[0].id',
          code: 'REQUIRED',
        })
      );
    });

    it('should reject updates without attributes', () => {
      const updates = [
        { id: 'valid-id' },
      ];

      const result = service.validateBulkUpdate(updates);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'updates[0].attributes',
          code: 'REQUIRED',
        })
      );
    });
  });

  describe('validateBulkDelete', () => {
    it('should validate valid bulk delete', () => {
      const ids = ['id-1', 'id-2', 'id-3'];

      const result = service.validateBulkDelete(ids);

      expect(result.isValid).toBe(true);
    });

    it('should reject non-array', () => {
      const result = service.validateBulkDelete('id-1');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'ids',
          code: 'INVALID_TYPE',
        })
      );
    });

    it('should reject empty array', () => {
      const result = service.validateBulkDelete([]);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'ids',
          code: 'EMPTY_ARRAY',
        })
      );
    });

    it('should reject empty string IDs', () => {
      const ids = ['valid-id', '', 'another-valid'];

      const result = service.validateBulkDelete(ids);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'ids[1]',
          code: 'INVALID_VALUE',
        })
      );
    });
  });
});
