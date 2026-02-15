/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Common module containing shared types, constants, and utilities
 * used by both server and public plugin code.
 */

// Shared constants
export const PLUGIN_ID = 'opensearchCrudPlugin';
export const PLUGIN_NAME = 'OpenSearch CRUD Plugin';
export const API_BASE_PATH = '/api/crud';

// Index configuration
export const DEFAULT_INDEX_NAME = '.crud_entities';
export const DEFAULT_INDEX_SHARDS = 1;
export const DEFAULT_INDEX_REPLICAS = 0;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 500;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

// Filtering defaults
export const MAX_FILTERS = 10;
export const FILTER_DEBOUNCE_MS = 300;

// Sorting defaults
export const MAX_SORT_FIELDS = 3;

// Bulk operation defaults
export const MAX_BULK_SIZE = 100;

// Entity status enum
export enum EntityStatus {
  Active = 'active',
  Inactive = 'inactive',
  Archived = 'archived',
}

// Filter operator types
export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'in'
  | 'notIn'
  | 'between'
  | 'exists'
  | 'notExists';

// Filter value type
export type FilterValue = string | number | boolean | Date | ReadonlyArray<string | number | Date>;

// Active filter interface
export interface ActiveFilter {
  id: string;
  field: string;
  operator: FilterOperator;
  value: FilterValue;
}

// Sort field interface
export interface SortField {
  field: string;
  direction: 'asc' | 'desc';
  priority: number;
}

// Pagination state interface
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

// Validation error interface
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Paginated result interface
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Bulk result interface
export interface BulkResult<T> {
  success: boolean;
  items: Array<{ id: string; status: string; data?: T | undefined }>;
  failures: Array<{ index?: number; id?: string; error: string }>;
  totalProcessed: number;
  totalSuccess: number;
  totalFailed: number;
}

// Bulk delete result interface
export interface BulkDeleteResult {
  success: boolean;
  deleted: string[];
  failed: Array<{ id: string; error: string }>;
  totalDeleted: number;
  totalFailed: number;
}

// API Error interface
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode: number;
}

// Error codes enum
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  BULK_PARTIAL_FAILURE = 'BULK_PARTIAL_FAILURE',
}