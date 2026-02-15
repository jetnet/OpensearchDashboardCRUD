/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Entity Service - Frontend API client for CRUD operations.
 * Provides methods for entity management through HTTP calls to the backend API.
 */

import { API_BASE_PATH } from '../../common';
import type {
  Entity,
  CreateEntityRequest,
  UpdateEntityRequest,
  ListQueryParams,
} from '../types';
import type {
  SearchResult,
  BulkResultItem,
  BulkFailureItem,
} from '../../server/types';

/**
 * HTTP client interface for making API requests
 */
interface HttpClient {
  get<T>(path: string, options?: { query?: Record<string, unknown> }): Promise<T>;
  post<T>(path: string, options?: { body?: string; query?: Record<string, unknown> }): Promise<T>;
  put<T>(path: string, options?: { body?: string; query?: Record<string, unknown> }): Promise<T>;
  delete<T>(path: string, options?: { body?: string; query?: Record<string, unknown> }): Promise<T>;
}

/**
 * Search parameters for entity listing
 */
export interface SearchParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  filters?: string;
}

/**
 * Bulk create result interface
 */
export interface BulkCreateResult {
  success: boolean;
  created: Array<{ id: string; status: string }>;
  failed: Array<{ index: number; error: string }>;
  totalCreated: number;
  totalFailed: number;
}

/**
 * Bulk update result interface
 */
export interface BulkUpdateResult {
  success: boolean;
  updated: Array<{ id: string; status: string }>;
  failed: Array<{ index: number; error: string }>;
  totalUpdated: number;
  totalFailed: number;
}

/**
 * Bulk delete result interface
 */
export interface BulkDeleteResult {
  success: boolean;
  deleted: string[];
  failed: Array<{ id: string; error: string }>;
  totalDeleted: number;
  totalFailed: number;
}

/**
 * Bulk update input interface
 */
export interface BulkUpdateInput {
  id: string;
  attributes: Partial<CreateEntityRequest>;
}

/**
 * Entity Service class for managing CRUD operations
 */
export class EntityService {
  private readonly http: HttpClient;

  /**
   * Creates an instance of EntityService
   * @param http - HTTP client for making API requests
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Fetches a paginated list of entities with optional filtering and sorting
   * @param params - Search parameters including pagination, filters, and sort
   * @returns Promise resolving to search results
   */
  async fetchEntities(params: SearchParams = {}): Promise<SearchResult> {
    const queryParams: Record<string, unknown> = {};
    
    if ('page' in params && params.page !== undefined) {
      queryParams['page'] = params.page;
    }
    if ('pageSize' in params && params.pageSize !== undefined) {
      queryParams['pageSize'] = params.pageSize;
    }
    if ('sort' in params && params.sort) {
      queryParams['sort'] = params.sort;
    }
    if ('filters' in params && params.filters) {
      queryParams['filters'] = params.filters;
    }

    return this.http.get<SearchResult>(`${API_BASE_PATH}/entities`, {
      query: queryParams,
    });
  }

  /**
   * Fetches a single entity by ID
   * @param id - The entity ID
   * @returns Promise resolving to the entity
   * @throws Error if entity not found
   */
  async fetchEntity(id: string): Promise<Entity> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid entity ID');
    }
    
    return this.http.get<Entity>(`${API_BASE_PATH}/entities/${encodeURIComponent(id)}`);
  }

  /**
   * Creates a new entity
   * @param entity - The entity data to create
   * @returns Promise resolving to the created entity
   */
  async createEntity(entity: CreateEntityRequest): Promise<Entity> {
    if (!entity || typeof entity !== 'object') {
      throw new Error('Invalid entity data');
    }

    return this.http.post<Entity>(`${API_BASE_PATH}/entities`, {
      body: JSON.stringify(entity),
    });
  }

  /**
   * Updates an existing entity
   * @param id - The entity ID to update
   * @param updates - Partial entity data to update
   * @returns Promise resolving to the updated entity
   */
  async updateEntity(id: string, updates: UpdateEntityRequest): Promise<Entity> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid entity ID');
    }
    if (!updates || typeof updates !== 'object') {
      throw new Error('Invalid update data');
    }

    return this.http.put<Entity>(`${API_BASE_PATH}/entities/${encodeURIComponent(id)}`, {
      body: JSON.stringify(updates),
    });
  }

  /**
   * Deletes an entity by ID
   * @param id - The entity ID to delete
   * @returns Promise resolving when deletion is complete
   */
  async deleteEntity(id: string): Promise<void> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid entity ID');
    }

    await this.http.delete<void>(`${API_BASE_PATH}/entities/${encodeURIComponent(id)}`);
  }

  /**
   * Creates multiple entities in bulk
   * @param entities - Array of entity data to create
   * @returns Promise resolving to bulk create result
   */
  async bulkCreate(entities: CreateEntityRequest[]): Promise<BulkCreateResult> {
    if (!Array.isArray(entities) || entities.length === 0) {
      throw new Error('Entities must be a non-empty array');
    }

    return this.http.post<BulkCreateResult>(`${API_BASE_PATH}/entities/bulk/create`, {
      body: JSON.stringify({ entities }),
    });
  }

  /**
   * Updates multiple entities in bulk
   * @param updates - Array of entity updates with IDs
   * @returns Promise resolving to bulk update result
   */
  async bulkUpdate(updates: BulkUpdateInput[]): Promise<BulkUpdateResult> {
    if (!Array.isArray(updates) || updates.length === 0) {
      throw new Error('Updates must be a non-empty array');
    }

    return this.http.put<BulkUpdateResult>(`${API_BASE_PATH}/entities/bulk/update`, {
      body: JSON.stringify({ updates }),
    });
  }

  /**
   * Deletes multiple entities in bulk
   * @param ids - Array of entity IDs to delete
   * @returns Promise resolving to bulk delete result
   */
  async bulkDelete(ids: string[]): Promise<BulkDeleteResult> {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error('IDs must be a non-empty array');
    }

    return this.http.delete<BulkDeleteResult>(`${API_BASE_PATH}/entities/bulk/delete`, {
      body: JSON.stringify({ ids }),
    });
  }
}

/**
 * Factory function to create an EntityService instance
 * @param http - HTTP client for API requests
 * @returns EntityService instance
 */
export function createEntityService(http: HttpClient): EntityService {
  return new EntityService(http);
}

export default EntityService;
