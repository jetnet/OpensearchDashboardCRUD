/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Validation service for input validation and sanitization.
 * Provides methods to validate entities, filters, sort, and pagination.
 */

import type {
  ValidationResult,
  Filter,
  Sort,
  Pagination,
  CreateEntityRequest,
  UpdateEntityRequest,
  CrudPluginConfig,
} from '../types';
import { FilterOperator, ValidationError } from '../../common';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Logger = any;

/**
 * Valid entity status values
 */
const VALID_STATUSES = ['active', 'inactive', 'archived'] as const;

/**
 * Valid filter operators
 */
const VALID_OPERATORS: FilterOperator[] = [
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
  'contains',
  'startsWith',
  'endsWith',
  'in',
  'notIn',
  'between',
  'exists',
  'notExists',
];

/**
 * Valid sortable fields
 */
const SORTABLE_FIELDS = [
  'id',
  'title',
  'status',
  'priority',
  'createdAt',
  'updatedAt',
  'createdBy',
] as const;

/**
 * Valid filterable fields
 */
const FILTERABLE_FIELDS = [
  'id',
  'title',
  'description',
  'status',
  'priority',
  'tags',
  'createdAt',
  'updatedAt',
  'createdBy',
] as const;

/**
 * Validation service implementation.
 */
export class ValidationService {
  private readonly logger: Logger;
  private readonly config: CrudPluginConfig;

  constructor(config: CrudPluginConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
  }

  /**
   * Validate an entity for creation or update.
   * @param entity - Entity data to validate
   * @param isUpdate - Whether this is an update operation
   * @returns Validation result with errors if any
   */
  public validateEntity(entity: unknown, isUpdate: boolean = false): ValidationResult {
    const errors: ValidationError[] = [];

    if (!entity || typeof entity !== 'object') {
      return {
        isValid: false,
        errors: [{ field: '', message: 'Entity must be a non-null object', code: 'INVALID_TYPE' }],
      };
    }

    const data = entity as Record<string, unknown>;

    // Validate title (required for create, optional for update)
    const title = data['title'];
    if (!isUpdate || title !== undefined) {
      if (!isUpdate && (title === undefined || title === null)) {
        errors.push({
          field: 'title',
          message: 'Title is required',
          code: 'REQUIRED',
        });
      } else if (title !== undefined && title !== null) {
        if (typeof title !== 'string') {
          errors.push({
            field: 'title',
            message: 'Title must be a string',
            code: 'INVALID_TYPE',
          });
        } else if (title.trim().length === 0) {
          errors.push({
            field: 'title',
            message: 'Title cannot be empty',
            code: 'EMPTY_VALUE',
          });
        } else if (title.length > 255) {
          errors.push({
            field: 'title',
            message: 'Title cannot exceed 255 characters',
            code: 'MAX_LENGTH',
          });
        }
      }
    }

    // Validate description (optional)
    const description = data['description'];
    if (description !== undefined && description !== null) {
      if (typeof description !== 'string') {
        errors.push({
          field: 'description',
          message: 'Description must be a string',
          code: 'INVALID_TYPE',
        });
      } else if (description.length > 5000) {
        errors.push({
          field: 'description',
          message: 'Description cannot exceed 5000 characters',
          code: 'MAX_LENGTH',
        });
      }
    }

    // Validate status
    const status = data['status'];
    if (status !== undefined && status !== null) {
      if (typeof status !== 'string' || !VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
        errors.push({
          field: 'status',
          message: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
          code: 'INVALID_VALUE',
        });
      }
    }

    // Validate priority
    const priority = data['priority'];
    if (priority !== undefined && priority !== null) {
      if (typeof priority !== 'number') {
        errors.push({
          field: 'priority',
          message: 'Priority must be a number',
          code: 'INVALID_TYPE',
        });
      } else if (!Number.isInteger(priority)) {
        errors.push({
          field: 'priority',
          message: 'Priority must be an integer',
          code: 'INVALID_VALUE',
        });
      } else if (priority < 0 || priority > 1000) {
        errors.push({
          field: 'priority',
          message: 'Priority must be between 0 and 1000',
          code: 'OUT_OF_RANGE',
        });
      }
    }

    // Validate tags
    const tags = data['tags'];
    if (tags !== undefined && tags !== null) {
      if (!Array.isArray(tags)) {
        errors.push({
          field: 'tags',
          message: 'Tags must be an array',
          code: 'INVALID_TYPE',
        });
      } else {
        for (let i = 0; i < tags.length; i++) {
          const tag = tags[i];
          if (typeof tag !== 'string') {
            errors.push({
              field: `tags[${i}]`,
              message: 'Each tag must be a string',
              code: 'INVALID_TYPE',
            });
          } else if (tag.length > 50) {
            errors.push({
              field: `tags[${i}]`,
              message: 'Each tag cannot exceed 50 characters',
              code: 'MAX_LENGTH',
            });
          }
        }
        if (tags.length > 20) {
          errors.push({
            field: 'tags',
            message: 'Cannot have more than 20 tags',
            code: 'MAX_ITEMS',
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate filters array.
   * @param filters - Filters to validate
   * @returns Validation result with errors if any
   */
  public validateFilters(filters: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    if (filters === undefined || filters === null) {
      return { isValid: true, errors: [] };
    }

    if (!Array.isArray(filters)) {
      return {
        isValid: false,
        errors: [{ field: 'filters', message: 'Filters must be an array', code: 'INVALID_TYPE' }],
      };
    }

    if (filters.length > this.config.filtering.maxFilters) {
      errors.push({
        field: 'filters',
        message: `Cannot have more than ${this.config.filtering.maxFilters} filters`,
        code: 'MAX_FILTERS',
      });
    }

    filters.forEach((filter, index) => {
      const filterErrors = this.validateSingleFilter(filter);
      filterErrors.forEach((error) => {
        errors.push({
          ...error,
          field: `filters[${index}].${error.field}`,
        });
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate a single filter object.
   * @param filter - Filter to validate
   * @returns Array of validation errors
   */
  private validateSingleFilter(filter: unknown): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!filter || typeof filter !== 'object') {
      return [{ field: '', message: 'Filter must be a non-null object', code: 'INVALID_TYPE' }];
    }

    const f = filter as Record<string, unknown>;

    // Validate field
    const field = f['field'];
    if (field === undefined || field === null) {
      errors.push({ field: 'field', message: 'Field is required', code: 'REQUIRED' });
    } else if (typeof field !== 'string') {
      errors.push({ field: 'field', message: 'Field must be a string', code: 'INVALID_TYPE' });
    } else if (!FILTERABLE_FIELDS.includes(field as typeof FILTERABLE_FIELDS[number])) {
      errors.push({
        field: 'field',
        message: `Field must be one of: ${FILTERABLE_FIELDS.join(', ')}`,
        code: 'INVALID_VALUE',
      });
    }

    // Validate operator
    const operator = f['operator'];
    if (operator === undefined || operator === null) {
      errors.push({ field: 'operator', message: 'Operator is required', code: 'REQUIRED' });
    } else if (typeof operator !== 'string') {
      errors.push({ field: 'operator', message: 'Operator must be a string', code: 'INVALID_TYPE' });
    } else if (!VALID_OPERATORS.includes(operator as FilterOperator)) {
      errors.push({
        field: 'operator',
        message: `Operator must be one of: ${VALID_OPERATORS.join(', ')}`,
        code: 'INVALID_VALUE',
      });
    }

    // Validate value (required for most operators)
    const value = f['value'];
    const operatorStr = operator as string;
    if (!['exists', 'notExists'].includes(operatorStr)) {
      if (value === undefined || value === null) {
        errors.push({ field: 'value', message: 'Value is required for this operator', code: 'REQUIRED' });
      }
    }

    // Validate value type based on operator
    if (value !== undefined && value !== null) {
      if (['in', 'notIn', 'between'].includes(operatorStr)) {
        if (!Array.isArray(value)) {
          errors.push({
            field: 'value',
            message: `Value must be an array for ${operatorStr} operator`,
            code: 'INVALID_TYPE',
          });
        } else if (operatorStr === 'between' && value.length !== 2) {
          errors.push({
            field: 'value',
            message: 'Value must have exactly 2 elements for between operator',
            code: 'INVALID_VALUE',
          });
        }
      }
    }

    return errors;
  }

  /**
   * Validate sort array.
   * @param sort - Sort fields to validate
   * @returns Validation result with errors if any
   */
  public validateSort(sort: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    if (sort === undefined || sort === null) {
      return { isValid: true, errors: [] };
    }

    if (!Array.isArray(sort)) {
      return {
        isValid: false,
        errors: [{ field: 'sort', message: 'Sort must be an array', code: 'INVALID_TYPE' }],
      };
    }

    if (sort.length > this.config.sorting.maxSortFields) {
      errors.push({
        field: 'sort',
        message: `Cannot sort by more than ${this.config.sorting.maxSortFields} fields`,
        code: 'MAX_SORT_FIELDS',
      });
    }

    sort.forEach((sortField, index) => {
      const sortErrors = this.validateSingleSort(sortField);
      sortErrors.forEach((error) => {
        errors.push({
          ...error,
          field: `sort[${index}].${error.field}`,
        });
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate a single sort object.
   * @param sortField - Sort field to validate
   * @returns Array of validation errors
   */
  private validateSingleSort(sortField: unknown): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!sortField || typeof sortField !== 'object') {
      return [{ field: '', message: 'Sort must be a non-null object', code: 'INVALID_TYPE' }];
    }

    const s = sortField as Record<string, unknown>;

    // Validate field
    const field = s['field'];
    if (field === undefined || field === null) {
      errors.push({ field: 'field', message: 'Field is required', code: 'REQUIRED' });
    } else if (typeof field !== 'string') {
      errors.push({ field: 'field', message: 'Field must be a string', code: 'INVALID_TYPE' });
    } else if (!SORTABLE_FIELDS.includes(field as typeof SORTABLE_FIELDS[number])) {
      errors.push({
        field: 'field',
        message: `Field must be one of: ${SORTABLE_FIELDS.join(', ')}`,
        code: 'INVALID_VALUE',
      });
    }

    // Validate direction
    const direction = s['direction'];
    if (direction === undefined || direction === null) {
      errors.push({ field: 'direction', message: 'Direction is required', code: 'REQUIRED' });
    } else if (typeof direction !== 'string') {
      errors.push({ field: 'direction', message: 'Direction must be a string', code: 'INVALID_TYPE' });
    } else if (!['asc', 'desc'].includes(direction as string)) {
      errors.push({
        field: 'direction',
        message: 'Direction must be either "asc" or "desc"',
        code: 'INVALID_VALUE',
      });
    }

    return errors;
  }

  /**
   * Validate pagination parameters.
   * @param pagination - Pagination parameters to validate
   * @returns Validation result with errors if any
   */
  public validatePagination(pagination: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    if (pagination === undefined || pagination === null) {
      return { isValid: true, errors: [] };
    }

    if (typeof pagination !== 'object') {
      return {
        isValid: false,
        errors: [{ field: 'pagination', message: 'Pagination must be an object', code: 'INVALID_TYPE' }],
      };
    }

    const p = pagination as Record<string, unknown>;

    // Validate page
    const page = p['page'];
    if (page !== undefined) {
      if (typeof page !== 'number') {
        errors.push({ field: 'page', message: 'Page must be a number', code: 'INVALID_TYPE' });
      } else if (!Number.isInteger(page)) {
        errors.push({ field: 'page', message: 'Page must be an integer', code: 'INVALID_VALUE' });
      } else if (page < 1) {
        errors.push({ field: 'page', message: 'Page must be at least 1', code: 'OUT_OF_RANGE' });
      }
    }

    // Validate pageSize
    const pageSize = p['pageSize'];
    if (pageSize !== undefined) {
      if (typeof pageSize !== 'number') {
        errors.push({ field: 'pageSize', message: 'PageSize must be a number', code: 'INVALID_TYPE' });
      } else if (!Number.isInteger(pageSize)) {
        errors.push({ field: 'pageSize', message: 'PageSize must be an integer', code: 'INVALID_VALUE' });
      } else if (pageSize < 1) {
        errors.push({ field: 'pageSize', message: 'PageSize must be at least 1', code: 'OUT_OF_RANGE' });
      } else if (pageSize > this.config.pagination.maxPageSize) {
        errors.push({
          field: 'pageSize',
          message: `PageSize cannot exceed ${this.config.pagination.maxPageSize}`,
          code: 'OUT_OF_RANGE',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitize a string input by removing/escaping dangerous characters.
   * @param input - String to sanitize
   * @returns Sanitized string
   */
  public sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    // Trim whitespace
    let sanitized = input.trim();

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Escape HTML entities to prevent XSS
    sanitized = sanitized
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#x27;');

    return sanitized;
  }

  /**
   * Validate a create entity request.
   * @param entity - Entity to validate
   * @returns Validation result
   */
  public validateCreateEntity(entity: unknown): ValidationResult {
    return this.validateEntity(entity, false);
  }

  /**
   * Validate an update entity request.
   * @param entity - Entity to validate
   * @returns Validation result
   */
  public validateUpdateEntity(entity: unknown): ValidationResult {
    return this.validateEntity(entity, true);
  }

  /**
   * Validate an entity ID.
   * @param id - ID to validate
   * @returns Validation result
   */
  public validateId(id: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    if (id === undefined || id === null) {
      errors.push({ field: 'id', message: 'ID is required', code: 'REQUIRED' });
    } else if (typeof id !== 'string') {
      errors.push({ field: 'id', message: 'ID must be a string', code: 'INVALID_TYPE' });
    } else if (id.trim().length === 0) {
      errors.push({ field: 'id', message: 'ID cannot be empty', code: 'EMPTY_VALUE' });
    } else if (id.length > 100) {
      errors.push({ field: 'id', message: 'ID cannot exceed 100 characters', code: 'MAX_LENGTH' });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate bulk create request.
   * @param entities - Entities to validate
   * @returns Validation result
   */
  public validateBulkCreate(entities: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    if (!Array.isArray(entities)) {
      return {
        isValid: false,
        errors: [{ field: 'entities', message: 'Entities must be an array', code: 'INVALID_TYPE' }],
      };
    }

    if (entities.length === 0) {
      errors.push({ field: 'entities', message: 'Entities array cannot be empty', code: 'EMPTY_ARRAY' });
    }

    if (entities.length > this.config.bulk.maxBulkSize) {
      errors.push({
        field: 'entities',
        message: `Cannot create more than ${this.config.bulk.maxBulkSize} entities at once`,
        code: 'MAX_BULK_SIZE',
      });
    }

    entities.forEach((entity, index) => {
      const result = this.validateCreateEntity(entity);
      result.errors.forEach((error) => {
        errors.push({
          ...error,
          field: `entities[${index}].${error.field}`,
        });
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate bulk update request.
   * @param updates - Updates to validate
   * @returns Validation result
   */
  public validateBulkUpdate(updates: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    if (!Array.isArray(updates)) {
      return {
        isValid: false,
        errors: [{ field: 'updates', message: 'Updates must be an array', code: 'INVALID_TYPE' }],
      };
    }

    if (updates.length === 0) {
      errors.push({ field: 'updates', message: 'Updates array cannot be empty', code: 'EMPTY_ARRAY' });
    }

    if (updates.length > this.config.bulk.maxBulkSize) {
      errors.push({
        field: 'updates',
        message: `Cannot update more than ${this.config.bulk.maxBulkSize} entities at once`,
        code: 'MAX_BULK_SIZE',
      });
    }

    updates.forEach((update, index) => {
      if (!update || typeof update !== 'object') {
        errors.push({
          field: `updates[${index}]`,
          message: 'Update must be a non-null object',
          code: 'INVALID_TYPE',
        });
        return;
      }

      const u = update as Record<string, unknown>;

      // Validate ID
      const idResult = this.validateId(u['id']);
      idResult.errors.forEach((error) => {
        errors.push({
          ...error,
          field: `updates[${index}].${error.field}`,
        });
      });

      // Validate attributes
      const attributes = u['attributes'];
      if (attributes !== undefined) {
        const attrResult = this.validateUpdateEntity(attributes);
        attrResult.errors.forEach((error) => {
          errors.push({
            ...error,
            field: `updates[${index}].attributes.${error.field}`,
          });
        });
      } else if (idResult.isValid) {
        errors.push({
          field: `updates[${index}].attributes`,
          message: 'Attributes are required',
          code: 'REQUIRED',
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate bulk delete request.
   * @param ids - IDs to validate
   * @returns Validation result
   */
  public validateBulkDelete(ids: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    if (!Array.isArray(ids)) {
      return {
        isValid: false,
        errors: [{ field: 'ids', message: 'IDs must be an array', code: 'INVALID_TYPE' }],
      };
    }

    if (ids.length === 0) {
      errors.push({ field: 'ids', message: 'IDs array cannot be empty', code: 'EMPTY_ARRAY' });
    }

    if (ids.length > this.config.bulk.maxBulkSize) {
      errors.push({
        field: 'ids',
        message: `Cannot delete more than ${this.config.bulk.maxBulkSize} entities at once`,
        code: 'MAX_BULK_SIZE',
      });
    }

    ids.forEach((id, index) => {
      if (typeof id !== 'string' || id.trim().length === 0) {
        errors.push({
          field: `ids[${index}]`,
          message: 'Each ID must be a non-empty string',
          code: 'INVALID_VALUE',
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default ValidationService;