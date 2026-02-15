/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Validation Service - Client-side validation for entity data.
 * Provides validation methods before API calls to reduce server load
 * and provide immediate feedback to users.
 */

import type { ValidationResult, ValidationError } from '../../common';

/**
 * Entity attributes interface matching server types
 */
interface EntityAttributesForValidation {
  name?: string;
  title?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'archived';
  priority?: number;
  tags?: string[];
  customFields?: Record<string, unknown>;
}

/**
 * Validation rules for entity fields
 */
const VALIDATION_RULES = {
  title: {
    required: true,
    minLength: 1,
    maxLength: 255,
    pattern: /^[\w\s\-.,!?()]+$/,
  },
  name: {
    required: true,
    minLength: 1,
    maxLength: 255,
    pattern: /^[\w\s\-.,!?()]+$/,
  },
  description: {
    required: false,
    maxLength: 5000,
  },
  status: {
    required: false,
    allowedValues: ['active', 'inactive', 'archived'] as const,
  },
  priority: {
    required: false,
    min: 0,
    max: 1000,
  },
  tags: {
    required: false,
    maxItems: 20,
    itemMaxLength: 50,
  },
} as const;

/**
 * Field display names for error messages
 */
const FIELD_NAMES: Record<string, string> = {
  title: 'Title',
  name: 'Name',
  description: 'Description',
  status: 'Status',
  priority: 'Priority',
  tags: 'Tags',
};

/**
 * Creates a validation error object
 * @param field - The field name
 * @param message - The error message
 * @param code - The error code
 * @returns ValidationError object
 */
function createError(field: string, message: string, code: string): ValidationError {
  return { field, message, code };
}

/**
 * Validates a title field
 * @param title - The title value to validate
 * @returns Array of validation errors
 */
function validateTitle(title: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  const fieldName = FIELD_NAMES['title'];

  if (title === undefined || title === null || title === '') {
    errors.push(createError('title', `${fieldName} is required`, 'REQUIRED'));
    return errors;
  }

  if (typeof title !== 'string') {
    errors.push(createError('title', `${fieldName} must be a string`, 'INVALID_TYPE'));
    return errors;
  }

  const trimmedTitle = title.trim();
  
  if (trimmedTitle.length < VALIDATION_RULES.title.minLength) {
    errors.push(createError('title', `${fieldName} must be at least ${VALIDATION_RULES.title.minLength} character(s)`, 'MIN_LENGTH'));
  }

  if (trimmedTitle.length > VALIDATION_RULES.title.maxLength) {
    errors.push(createError('title', `${fieldName} must be at most ${VALIDATION_RULES.title.maxLength} characters`, 'MAX_LENGTH'));
  }

  if (!VALIDATION_RULES.title.pattern.test(trimmedTitle)) {
    errors.push(createError('title', `${fieldName} contains invalid characters`, 'INVALID_FORMAT'));
  }

  return errors;
}

/**
 * Validates a name field (alias for title in some contexts)
 * @param name - The name value to validate
 * @returns Array of validation errors
 */
function validateName(name: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  const fieldName = FIELD_NAMES['name'];

  if (name === undefined || name === null || name === '') {
    errors.push(createError('name', `${fieldName} is required`, 'REQUIRED'));
    return errors;
  }

  if (typeof name !== 'string') {
    errors.push(createError('name', `${fieldName} must be a string`, 'INVALID_TYPE'));
    return errors;
  }

  const trimmedName = name.trim();
  
  if (trimmedName.length < VALIDATION_RULES.name.minLength) {
    errors.push(createError('name', `${fieldName} must be at least ${VALIDATION_RULES.name.minLength} character(s)`, 'MIN_LENGTH'));
  }

  if (trimmedName.length > VALIDATION_RULES.name.maxLength) {
    errors.push(createError('name', `${fieldName} must be at most ${VALIDATION_RULES.name.maxLength} characters`, 'MAX_LENGTH'));
  }

  if (!VALIDATION_RULES.name.pattern.test(trimmedName)) {
    errors.push(createError('name', `${fieldName} contains invalid characters`, 'INVALID_FORMAT'));
  }

  return errors;
}

/**
 * Validates a description field
 * @param description - The description value to validate
 * @returns Array of validation errors
 */
function validateDescription(description: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (description === undefined || description === null) {
    return errors; // Optional field
  }

  if (typeof description !== 'string') {
    errors.push(createError('description', `${FIELD_NAMES['description']} must be a string`, 'INVALID_TYPE'));
    return errors;
  }

  if (description.length > VALIDATION_RULES.description.maxLength) {
    errors.push(createError('description', `${FIELD_NAMES['description']} must be at most ${VALIDATION_RULES.description.maxLength} characters`, 'MAX_LENGTH'));
  }

  return errors;
}

/**
 * Validates a status field
 * @param status - The status value to validate
 * @returns Array of validation errors
 */
function validateStatus(status: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (status === undefined || status === null) {
    return errors; // Optional field with default
  }

  if (typeof status !== 'string') {
    errors.push(createError('status', `${FIELD_NAMES['status']} must be a string`, 'INVALID_TYPE'));
    return errors;
  }

  if (!VALIDATION_RULES.status.allowedValues.includes(status as 'active' | 'inactive' | 'archived')) {
    errors.push(createError('status', `${FIELD_NAMES['status']} must be one of: ${VALIDATION_RULES.status.allowedValues.join(', ')}`, 'INVALID_VALUE'));
  }

  return errors;
}

/**
 * Validates a priority field
 * @param priority - The priority value to validate
 * @returns Array of validation errors
 */
function validatePriority(priority: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (priority === undefined || priority === null) {
    return errors; // Optional field
  }

  if (typeof priority !== 'number') {
    errors.push(createError('priority', `${FIELD_NAMES['priority']} must be a number`, 'INVALID_TYPE'));
    return errors;
  }

  if (!Number.isInteger(priority)) {
    errors.push(createError('priority', `${FIELD_NAMES['priority']} must be an integer`, 'INVALID_FORMAT'));
    return errors;
  }

  if (priority < VALIDATION_RULES.priority.min || priority > VALIDATION_RULES.priority.max) {
    errors.push(createError('priority', `${FIELD_NAMES['priority']} must be between ${VALIDATION_RULES.priority.min} and ${VALIDATION_RULES.priority.max}`, 'OUT_OF_RANGE'));
  }

  return errors;
}

/**
 * Validates a tags field
 * @param tags - The tags value to validate
 * @returns Array of validation errors
 */
function validateTags(tags: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (tags === undefined || tags === null) {
    return errors; // Optional field
  }

  if (!Array.isArray(tags)) {
    errors.push(createError('tags', `${FIELD_NAMES['tags']} must be an array`, 'INVALID_TYPE'));
    return errors;
  }

  if (tags.length > VALIDATION_RULES.tags.maxItems) {
    errors.push(createError('tags', `${FIELD_NAMES['tags']} cannot have more than ${VALIDATION_RULES.tags.maxItems} items`, 'MAX_ITEMS'));
  }

  tags.forEach((tag, index) => {
    if (typeof tag !== 'string') {
      errors.push(createError('tags', `Tag at index ${index} must be a string`, 'INVALID_TYPE'));
    } else if (tag.length > VALIDATION_RULES.tags.itemMaxLength) {
      errors.push(createError('tags', `Tag at index ${index} exceeds maximum length of ${VALIDATION_RULES.tags.itemMaxLength}`, 'MAX_LENGTH'));
    }
  });

  return errors;
}

/**
 * Validation Service class for client-side validation
 */
export class ValidationService {
  /**
   * Validates an entity object for creation
   * @param entity - The entity data to validate
   * @returns ValidationResult with isValid flag and errors array
   */
  validateEntity(entity: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    if (!entity || typeof entity !== 'object') {
      return {
        isValid: false,
        errors: [createError('entity', 'Entity must be a non-null object', 'INVALID_TYPE')],
      };
    }

    const entityObj = entity as Record<string, unknown>;
    
    // Validate attributes if present (nested format)
    if ('attributes' in entityObj && entityObj['attributes']) {
      const attributes = entityObj['attributes'] as EntityAttributesForValidation;
      const attributeErrors = this.validateAttributes(attributes);
      errors.push(...attributeErrors);
    } else {
      // Validate fields directly on entity object (flat format)
      // Support both 'title' and 'name' fields
      if ('title' in entityObj) {
        errors.push(...validateTitle(entityObj['title']));
      } else if ('name' in entityObj) {
        errors.push(...validateName(entityObj['name']));
      } else {
        errors.push(createError('title', 'Title or name is required', 'REQUIRED'));
      }
      
      if ('description' in entityObj) {
        errors.push(...validateDescription(entityObj['description']));
      }
      if ('status' in entityObj) {
        errors.push(...validateStatus(entityObj['status']));
      }
      if ('priority' in entityObj) {
        errors.push(...validatePriority(entityObj['priority']));
      }
      if ('tags' in entityObj) {
        errors.push(...validateTags(entityObj['tags']));
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates entity attributes object
   * @param attributes - The attributes to validate
   * @returns Array of validation errors
   */
  private validateAttributes(attributes: EntityAttributesForValidation): ValidationError[] {
    const errors: ValidationError[] = [];

    // Support both 'title' and 'name' fields
    if (attributes.title !== undefined) {
      errors.push(...validateTitle(attributes.title));
    } else if (attributes.name !== undefined) {
      errors.push(...validateName(attributes.name));
    } else {
      errors.push(createError('title', 'Title or name is required', 'REQUIRED'));
    }
    
    if (attributes.description !== undefined) {
      errors.push(...validateDescription(attributes.description));
    }
    if (attributes.status !== undefined) {
      errors.push(...validateStatus(attributes.status));
    }
    if (attributes.priority !== undefined) {
      errors.push(...validatePriority(attributes.priority));
    }
    if (attributes.tags !== undefined) {
      errors.push(...validateTags(attributes.tags));
    }

    return errors;
  }

  /**
   * Validates a single field value
   * @param field - The field name to validate
   * @param value - The value to validate
   * @returns ValidationResult with isValid flag and errors array
   */
  validateField(field: string, value: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    switch (field) {
      case 'title':
        errors.push(...validateTitle(value));
        break;
      case 'name':
        errors.push(...validateName(value));
        break;
      case 'description':
        errors.push(...validateDescription(value));
        break;
      case 'status':
        errors.push(...validateStatus(value));
        break;
      case 'priority':
        errors.push(...validatePriority(value));
        break;
      case 'tags':
        errors.push(...validateTags(value));
        break;
      default:
        errors.push(createError(field, `Unknown field: ${field}`, 'UNKNOWN_FIELD'));
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates a create entity request
   * @param entity - The create entity request to validate
   * @returns ValidationResult with isValid flag and errors array
   */
  validateCreateEntity(entity: unknown): ValidationResult {
    return this.validateEntity(entity);
  }

  /**
   * Validates an update entity request
   * @param entity - The update entity request to validate
   * @returns ValidationResult with isValid flag and errors array
   */
  validateUpdateEntity(entity: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    if (!entity || typeof entity !== 'object') {
      return {
        isValid: false,
        errors: [createError('entity', 'Update data must be a non-null object', 'INVALID_TYPE')],
      };
    }

    const entityObj = entity as Record<string, unknown>;
    
    // For updates, all fields are optional but must be valid if provided
    if ('title' in entityObj) {
      errors.push(...validateTitle(entityObj['title']));
    }
    if ('name' in entityObj) {
      errors.push(...validateName(entityObj['name']));
    }
    if ('description' in entityObj) {
      errors.push(...validateDescription(entityObj['description']));
    }
    if ('status' in entityObj) {
      errors.push(...validateStatus(entityObj['status']));
    }
    if ('priority' in entityObj) {
      errors.push(...validatePriority(entityObj['priority']));
    }
    if ('tags' in entityObj) {
      errors.push(...validateTags(entityObj['tags']));
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates an entity ID
   * @param id - The ID to validate
   * @returns ValidationResult with isValid flag and errors array
   */
  validateId(id: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    if (id === undefined || id === null || id === '') {
      errors.push(createError('id', 'ID is required', 'REQUIRED'));
      return { isValid: false, errors };
    }

    if (typeof id !== 'string') {
      errors.push(createError('id', 'ID must be a string', 'INVALID_TYPE'));
      return { isValid: false, errors };
    }

    // Basic ID format validation (alphanumeric with hyphens and underscores)
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      errors.push(createError('id', 'ID contains invalid characters', 'INVALID_FORMAT'));
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates bulk create request
   * @param entities - Array of entities to validate
   * @returns ValidationResult with isValid flag and errors array
   */
  validateBulkCreate(entities: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    if (!Array.isArray(entities)) {
      return {
        isValid: false,
        errors: [createError('entities', 'Entities must be an array', 'INVALID_TYPE')],
      };
    }

    if (entities.length === 0) {
      return {
        isValid: false,
        errors: [createError('entities', 'Entities array cannot be empty', 'EMPTY_ARRAY')],
      };
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
   * Validates bulk update request
   * @param updates - Array of updates to validate
   * @returns ValidationResult with isValid flag and errors array
   */
  validateBulkUpdate(updates: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    if (!Array.isArray(updates)) {
      return {
        isValid: false,
        errors: [createError('updates', 'Updates must be an array', 'INVALID_TYPE')],
      };
    }

    if (updates.length === 0) {
      return {
        isValid: false,
        errors: [createError('updates', 'Updates array cannot be empty', 'EMPTY_ARRAY')],
      };
    }

    updates.forEach((update, index) => {
      if (!update || typeof update !== 'object') {
        errors.push(createError(`updates[${index}]`, 'Update item must be an object', 'INVALID_TYPE'));
        return;
      }

      const updateObj = update as Record<string, unknown>;
      
      // Validate ID
      const idResult = this.validateId(updateObj['id']);
      idResult.errors.forEach((error) => {
        errors.push({
          ...error,
          field: `updates[${index}].${error.field}`,
        });
      });

      // Validate attributes
      const attributesResult = this.validateUpdateEntity(updateObj['attributes'] || updateObj);
      attributesResult.errors.forEach((error) => {
        errors.push({
          ...error,
          field: `updates[${index}].${error.field}`,
        });
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates bulk delete request
   * @param ids - Array of IDs to validate
   * @returns ValidationResult with isValid flag and errors array
   */
  validateBulkDelete(ids: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    if (!Array.isArray(ids)) {
      return {
        isValid: false,
        errors: [createError('ids', 'IDs must be an array', 'INVALID_TYPE')],
      };
    }

    if (ids.length === 0) {
      return {
        isValid: false,
        errors: [createError('ids', 'IDs array cannot be empty', 'EMPTY_ARRAY')],
      };
    }

    ids.forEach((id, index) => {
      const result = this.validateId(id);
      result.errors.forEach((error) => {
        errors.push({
          ...error,
          field: `ids[${index}]`,
        });
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Factory function to create a ValidationService instance
 * @returns ValidationService instance
 */
export function createValidationService(): ValidationService {
  return new ValidationService();
}

export default ValidationService;
