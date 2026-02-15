/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Server-side type definitions for the CRUD plugin.
 */

import type {
  CoreSetup,
  CoreStart,
  Plugin,
  PluginInitializerContext,
  Logger,
  OpenSearchClient,
} from 'opensearch-dashboards/server';
import type { DataPluginSetup } from 'src/plugins/data/server';
import type { NavigationPluginSetup } from 'src/plugins/navigation/server';
import type {
  ActiveFilter,
  SortField,
  ValidationResult,
  BulkResult,
  BulkDeleteResult,
  PaginatedResult,
  FilterOperator,
  FilterValue,
} from '../../common';

// Re-export common types for convenience
export {
  ActiveFilter,
  SortField,
  ValidationResult,
  BulkResult,
  BulkDeleteResult,
  PaginatedResult,
  FilterOperator,
  FilterValue,
};

// ============================================================================
// Entity Types
// ============================================================================

/**
 * Entity attributes interface - the main data fields for an entity
 */
export interface EntityAttributes {
  title: string;
  description?: string;
  status: 'active' | 'inactive' | 'archived';
  priority?: number;
  tags?: string[];
  createdBy?: string;
}

/**
 * Full entity interface including metadata
 */
export interface Entity {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'inactive' | 'archived';
  priority?: number;
  tags?: string[];
  createdAt: string; // ISO8601 date string
  updatedAt: string; // ISO8601 date string
  createdBy: string;
}

/**
 * Create entity request interface
 */
export interface CreateEntityRequest {
  title: string;
  description?: string;
  status?: 'active' | 'inactive' | 'archived';
  priority?: number;
  tags?: string[];
}

/**
 * Update entity request interface
 */
export interface UpdateEntityRequest {
  title?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'archived';
  priority?: number;
  tags?: string[];
}

// ============================================================================
// Search and Query Types
// ============================================================================

/**
 * Filter interface for search queries
 */
export interface Filter {
  field: string;
  operator: FilterOperator;
  value: FilterValue;
}

/**
 * Sort interface for search queries
 */
export interface Sort {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Pagination interface for search queries
 */
export interface Pagination {
  page: number;
  pageSize: number;
}

/**
 * Search parameters interface
 */
export interface SearchParams {
  filters: Filter[];
  sort: Sort[];
  pagination: Pagination;
}

/**
 * Search result interface
 */
export interface SearchResult {
  entities: Entity[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// Bulk Operation Types
// ============================================================================

/**
 * Bulk create request interface
 */
export interface BulkCreateRequest {
  entities: CreateEntityRequest[];
}

/**
 * Bulk update item interface
 */
export interface BulkUpdateItem {
  id: string;
  attributes: UpdateEntityRequest;
}

/**
 * Bulk update request interface
 */
export interface BulkUpdateRequest {
  updates: BulkUpdateItem[];
}

/**
 * Bulk delete request interface
 */
export interface BulkDeleteRequest {
  ids: string[];
}

/**
 * Bulk operation result item
 */
export interface BulkResultItem {
  id: string;
  status: 'created' | 'updated' | 'deleted' | 'failed';
  data?: Entity;
  error?: string;
}

/**
 * Bulk operation failure item
 */
export interface BulkFailureItem {
  index?: number;
  id?: string;
  error: string;
}

// ============================================================================
// Route Types
// ============================================================================

/**
 * List query parameters interface
 */
export interface ListQueryParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  filters?: string;
}

// ============================================================================
// Plugin Configuration Types
// ============================================================================

/**
 * Plugin configuration interface
 */
export interface CrudPluginConfig {
  index: {
    name: string;
    numberOfShards: number;
    numberOfReplicas: number;
    refreshInterval: string;
  };
  pagination: {
    defaultPageSize: number;
    maxPageSize: number;
    pageSizeOptions: number[];
  };
  filtering: {
    maxFilters: number;
    enabledOperators: FilterOperator[];
    debounceMs: number;
  };
  sorting: {
    maxSortFields: number;
    defaultSortField?: string;
    defaultSortDirection: 'asc' | 'desc';
  };
  bulk: {
    maxBulkSize: number;
    enableBulkCreate: boolean;
    enableBulkUpdate: boolean;
    enableBulkDelete: boolean;
  };
  validation: {
    enableClientValidation: boolean;
    enableServerValidation: boolean;
    strictMode: boolean;
  };
  security: {
    enableAuditLog: boolean;
    rateLimit: {
      enabled: boolean;
      maxRequests: number;
      windowMs: number;
    };
  };
}

// ============================================================================
// Plugin Setup/Start Types
// ============================================================================

/**
 * Server setup dependencies
 */
export interface CrudPluginServerSetupDeps {
  data: DataPluginSetup;
  navigation: NavigationPluginSetup;
}

/**
 * Server start dependencies
 */
export interface CrudPluginServerStartDeps {
  data: unknown;
}

/**
 * Server setup return type
 */
export interface CrudPluginServerSetup {
  logger: Logger;
  config: CrudPluginConfig;
}

/**
 * Server start return type
 */
export interface CrudPluginServerStart {
  getEntityService: () => EntityService;
}

// ============================================================================
// Service Types
// ============================================================================

/**
 * Entity service interface
 */
export interface EntityService {
  create(entity: CreateEntityRequest, user: string): Promise<Entity>;
  getById(id: string): Promise<Entity | null>;
  list(params: ListQueryParams): Promise<SearchResult>;
  update(id: string, entity: UpdateEntityRequest, user: string): Promise<Entity | null>;
  delete(id: string): Promise<boolean>;
}

/**
 * OpenSearch service interface
 */
export interface OpenSearchService {
  ensureIndexExists(): Promise<void>;
  indexEntity(entity: CreateEntityRequest, user: string): Promise<Entity>;
  getEntity(id: string): Promise<Entity | null>;
  updateEntity(id: string, updates: UpdateEntityRequest, user: string): Promise<Entity | null>;
  deleteEntity(id: string): Promise<boolean>;
  searchEntities(params: SearchParams): Promise<SearchResult>;
  bulkIndex(entities: CreateEntityRequest[], user: string): Promise<BulkResult<Entity>>;
  bulkUpdate(updates: Array<{ id: string; attributes: UpdateEntityRequest }>, user: string): Promise<BulkResult<Entity>>;
  bulkDelete(ids: string[]): Promise<BulkDeleteResult>;
  buildQuery(filters: Filter[], sort: Sort[], pagination: Pagination): object;
}

/**
 * Validation service interface
 */
export interface ValidationService {
  validateEntity(entity: unknown, isUpdate?: boolean): ValidationResult;
  validateFilters(filters: unknown): ValidationResult;
  validateSort(sort: unknown): ValidationResult;
  validatePagination(pagination: unknown): ValidationResult;
  sanitizeInput(input: string): string;
  validateCreateEntity(entity: unknown): ValidationResult;
  validateUpdateEntity(entity: unknown): ValidationResult;
  validateId(id: unknown): ValidationResult;
  validateBulkCreate(entities: unknown): ValidationResult;
  validateBulkUpdate(updates: unknown): ValidationResult;
  validateBulkDelete(ids: unknown): ValidationResult;
}

// ============================================================================
// Route Handler Context Types
// ============================================================================

/**
 * Route handler context type
 */
export interface CrudRouteHandlerContext {
  crudPlugin: {
    logger: Logger;
    config: CrudPluginConfig;
    openSearchService: OpenSearchService;
    validationService: ValidationService;
  };
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * API Error interface
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode: number;
}

/**
 * Error codes enum
 */
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

// ============================================================================
// OpenSearch Index Mapping
// ============================================================================

/**
 * Index mapping configuration for entities
 */
export const ENTITY_INDEX_MAPPING = {
  mappings: {
    properties: {
      id: { type: 'keyword' },
      title: { type: 'text', fields: { keyword: { type: 'keyword' } } },
      description: { type: 'text' },
      status: { type: 'keyword' },
      priority: { type: 'integer' },
      tags: { type: 'keyword' },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' },
      createdBy: { type: 'keyword' },
    },
  },
  settings: {
    number_of_shards: 1,
    number_of_replicas: 0,
    refresh_interval: '1s',
  },
};