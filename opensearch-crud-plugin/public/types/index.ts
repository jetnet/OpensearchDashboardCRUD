/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Public (frontend) type definitions for the CRUD plugin.
 */

import type { CoreSetup, CoreStart, Plugin } from 'opensearch-dashboards/public';
import type { DataPluginSetup, DataPluginStart } from 'src/plugins/data/public';
import type { NavigationPluginStart } from 'src/plugins/navigation/public';

// Entity attributes interface
export interface EntityAttributes {
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'archived';
  tags?: string[];
  customFields?: Record<string, unknown>;
}

// Full entity interface
export interface Entity {
  id: string;
  version: number;
  attributes: EntityAttributes;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

// Create entity request interface
export interface CreateEntityRequest {
  attributes: Omit<EntityAttributes, 'id'>;
}

// Update entity request interface
export interface UpdateEntityRequest {
  attributes: Partial<EntityAttributes>;
  version?: number;
}

// List query parameters interface
export interface ListQueryParams {
  page: number;
  pageSize: number;
  sort: string;
  filters: string;
}

// Plugin setup dependencies
export interface CrudPluginSetupDeps {
  data: DataPluginSetup;
}

// Plugin start dependencies
export interface CrudPluginStartDeps {
  data: DataPluginStart;
  navigation: NavigationPluginStart;
}

// Plugin setup return type
export interface CrudPluginSetup {
  logger: {
    debug: (message: string) => void;
    info: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
  };
}

// Plugin start return type
export interface CrudPluginStart {
  entityService: EntityService;
  validationService: ValidationService;
}

// Entity service interface for frontend
export interface EntityService {
  createEntity(data: CreateEntityRequest): Promise<Entity>;
  getEntity(id: string): Promise<Entity>;
  listEntities(params: ListQueryParams): Promise<{
    entities: Entity[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  }>;
  updateEntity(id: string, data: UpdateEntityRequest): Promise<Entity>;
  deleteEntity(id: string): Promise<void>;
  bulkCreate(entities: CreateEntityRequest[]): Promise<{
    success: boolean;
    created: Array<{ id: string; status: string }>;
    failed: Array<{ index: number; error: string }>;
    totalCreated: number;
    totalFailed: number;
  }>;
  bulkUpdate(updates: Array<{ id: string; attributes: Partial<EntityAttributes> }>): Promise<{
    success: boolean;
    updated: Array<{ id: string; status: string }>;
    failed: Array<{ index: number; error: string }>;
    totalUpdated: number;
    totalFailed: number;
  }>;
  bulkDelete(ids: string[]): Promise<{
    success: boolean;
    deleted: string[];
    failed: Array<{ id: string; error: string }>;
    totalDeleted: number;
    totalFailed: number;
  }>;
}

// Validation service interface for frontend
export interface ValidationService {
  validateEntity(data: CreateEntityRequest | UpdateEntityRequest): Promise<{
    isValid: boolean;
    errors: Array<{ field: string; message: string; code: string }>;
  }>;
  validateBulk(entities: CreateEntityRequest[]): Promise<Array<{
    isValid: boolean;
    errors: Array<{ field: string; message: string; code: string }>;
  }>>;
}

// Entity list state interface
export interface EntityListState {
  entities: Entity[];
  selectedIds: Set<string>;
  totalCount: number;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  filters: Array<{
    id: string;
    field: string;
    operator: string;
    value: unknown;
  }>;
  sorting: Array<{
    field: string;
    direction: 'asc' | 'desc';
    priority: number;
  }>;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    statusCode: number;
  } | null;
  validationErrors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

// Toast notification type
export interface ToastNotification {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  duration?: number;
}