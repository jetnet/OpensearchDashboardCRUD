/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Public services module.
 * Exports all frontend services used by the CRUD plugin.
 */

// Entity Service - API client for CRUD operations
export {
  EntityService,
  createEntityService,
  type SearchParams,
  type BulkCreateResult,
  type BulkUpdateResult,
  type BulkDeleteResult,
  type BulkUpdateInput,
} from './entity_service';

// Validation Service - Client-side validation
export {
  ValidationService,
  createValidationService,
} from './validation_service';

// Re-export types for convenience
export type { ValidationResult, ValidationError } from '../../common';
