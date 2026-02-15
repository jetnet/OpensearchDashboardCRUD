/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * OpenSearch service for CRUD operations against the OpenSearch cluster.
 * Provides methods for indexing, searching, updating, and deleting entities.
 */

import type {
  Entity,
  CreateEntityRequest,
  UpdateEntityRequest,
  SearchParams,
  SearchResult,
  Filter,
  Sort,
  Pagination,
  BulkResult,
  BulkDeleteResult,
  CrudPluginConfig,
} from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OpenSearchClient = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Logger = any;

/**
 * Filter operator to OpenSearch query mapping
 */
const filterOperatorMapping: Record<string, (field: string, value: unknown) => object> = {
  eq: (field, value) => ({ term: { [field]: value } }),
  neq: (field, value) => ({ bool: { must_not: [{ term: { [field]: value } }] } }),
  gt: (field, value) => ({ range: { [field]: { gt: value } } }),
  gte: (field, value) => ({ range: { [field]: { gte: value } } }),
  lt: (field, value) => ({ range: { [field]: { lt: value } } }),
  lte: (field, value) => ({ range: { [field]: { lte: value } } }),
  contains: (field, value) => ({ wildcard: { [field]: `*${escapeLucene(value as string)}*` } }),
  startsWith: (field, value) => ({ wildcard: { [field]: `${escapeLucene(value as string)}*` } }),
  endsWith: (field, value) => ({ wildcard: { [field]: `*${escapeLucene(value as string)}` } }),
  in: (field, value) => ({ terms: { [field]: value as unknown[] } }),
  notIn: (field, value) => ({ bool: { must_not: [{ terms: { [field]: value as unknown[] } }] } }),
  between: (field, value) => ({
    range: { [field]: { gte: (value as unknown[])[0], lte: (value as unknown[])[1] } },
  }),
  exists: (field) => ({ exists: { field } }),
  notExists: (field) => ({ bool: { must_not: [{ exists: { field } }] } }),
};

/**
 * Escape special Lucene characters in a string
 * @param value - String to escape
 * @returns Escaped string
 */
function escapeLucene(value: string): string {
  return value.replace(/[+\-&|!(){}\[\]^"~*?:\\]/g, '\\$&');
}

/**
 * Generate a unique ID for new entities
 * Uses crypto API for UUID generation
 * @returns UUID string
 */
function generateId(): string {
  // Use crypto.randomUUID if available, otherwise fallback to timestamp-based ID
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Create an entity object with proper defaults
 */
function createEntityObject(
  id: string,
  request: CreateEntityRequest,
  user: string,
  now: string
): Entity {
  // Start with required fields
  const entity: Entity = {
    id,
    title: request.title,
    status: request.status ?? 'active',
    createdAt: now,
    updatedAt: now,
    createdBy: user,
  };

  // Only add optional fields if they have defined values
  if (request.description !== undefined) {
    entity.description = request.description;
  }
  if (request.priority !== undefined) {
    entity.priority = request.priority;
  }
  if (request.tags !== undefined) {
    entity.tags = request.tags;
  }

  return entity;
}

/**
 * OpenSearch service implementation for entity CRUD operations.
 */
export class OpenSearchService {
  private readonly client: OpenSearchClient;
  private readonly indexName: string;
  private readonly logger: Logger;

  constructor(client: OpenSearchClient, config: CrudPluginConfig, logger: Logger) {
    this.client = client;
    this.indexName = config.index.name;
    this.logger = logger;
  }

  /**
   * Ensure the index exists with proper mappings.
   * Creates the index if it doesn't exist.
   */
  public async ensureIndexExists(): Promise<void> {
    try {
      const indexExists = await this.client.indices.exists({
        index: this.indexName,
      });

      if (!indexExists.body) {
        this.logger.info(`Creating index: ${this.indexName}`);
        await this.client.indices.create({
          index: this.indexName,
          body: {
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
          },
        });
        this.logger.info(`Index ${this.indexName} created successfully`);
      } else {
        this.logger.debug(`Index ${this.indexName} already exists`);
      }
    } catch (error) {
      this.logger.error(`Failed to ensure index exists: ${error}`);
      throw error;
    }
  }

  /**
   * Index a new entity in OpenSearch.
   * @param entity - Entity to index
   * @param user - User creating the entity
   * @returns The created entity with generated ID
   */
  public async indexEntity(entity: CreateEntityRequest, user: string): Promise<Entity> {
    const now = new Date().toISOString();
    const id = generateId();
    const newEntity = createEntityObject(id, entity, user, now);

    try {
      await this.client.index({
        index: this.indexName,
        id: newEntity.id,
        body: newEntity,
        refresh: true,
      });

      this.logger.debug(`Entity ${id} indexed successfully`);
      return newEntity;
    } catch (error) {
      this.logger.error(`Failed to index entity: ${error}`);
      throw error;
    }
  }

  /**
   * Get an entity by ID from OpenSearch.
   * @param id - Entity ID
   * @returns Entity or null if not found
   */
  public async getEntity(id: string): Promise<Entity | null> {
    try {
      const response = await this.client.get({
        index: this.indexName,
        id,
      });

      if (response.body.found) {
        return response.body._source as Entity;
      }
      return null;
    } catch (error: unknown) {
      const err = error as { statusCode?: number };
      if (err.statusCode === 404) {
        return null;
      }
      this.logger.error(`Failed to get entity ${id}: ${error}`);
      throw error;
    }
  }

  /**
   * Update an existing entity in OpenSearch.
   * @param id - Entity ID
   * @param updates - Partial entity updates
   * @param user - User performing the update
   * @returns Updated entity or null if not found
   */
  public async updateEntity(
    id: string,
    updates: UpdateEntityRequest,
    user: string
  ): Promise<Entity | null> {
    const existingEntity = await this.getEntity(id);
    if (!existingEntity) {
      return null;
    }

    const now = new Date().toISOString();
    
    // Build updated entity - start with required fields
    const updatedEntity: Entity = {
      id: existingEntity.id,
      title: updates.title ?? existingEntity.title,
      status: updates.status ?? existingEntity.status,
      createdAt: existingEntity.createdAt,
      createdBy: existingEntity.createdBy,
      updatedAt: now,
    };
    
    // Handle optional fields - only set if defined
    if (updates.tags !== undefined) {
      updatedEntity.tags = updates.tags;
    } else if (existingEntity.tags !== undefined) {
      updatedEntity.tags = existingEntity.tags;
    }

    if (updates.description !== undefined) {
      updatedEntity.description = updates.description;
    } else if (existingEntity.description !== undefined) {
      updatedEntity.description = existingEntity.description;
    }

    if (updates.priority !== undefined) {
      updatedEntity.priority = updates.priority;
    } else if (existingEntity.priority !== undefined) {
      updatedEntity.priority = existingEntity.priority;
    }

    try {
      await this.client.update({
        index: this.indexName,
        id,
        body: {
          doc: updatedEntity,
        },
        refresh: true,
      });

      this.logger.debug(`Entity ${id} updated successfully`);
      return updatedEntity;
    } catch (error) {
      this.logger.error(`Failed to update entity ${id}: ${error}`);
      throw error;
    }
  }

  /**
   * Delete an entity from OpenSearch.
   * @param id - Entity ID
   * @returns True if deleted, false if not found
   */
  public async deleteEntity(id: string): Promise<boolean> {
    try {
      const response = await this.client.delete({
        index: this.indexName,
        id,
        refresh: true,
      });

      const result = response.body.result === 'deleted';
      if (result) {
        this.logger.debug(`Entity ${id} deleted successfully`);
      }
      return result;
    } catch (error: unknown) {
      const err = error as { statusCode?: number };
      if (err.statusCode === 404) {
        return false;
      }
      this.logger.error(`Failed to delete entity ${id}: ${error}`);
      throw error;
    }
  }

  /**
   * Search for entities with filtering, sorting, and pagination.
   * @param params - Search parameters
   * @returns Search result with entities and pagination info
   */
  public async searchEntities(params: SearchParams): Promise<SearchResult> {
    const { filters, sort, pagination } = params;
    const { page, pageSize } = pagination;

    try {
      const query = this.buildQuery(filters, sort, pagination);

      const response = await this.client.search({
        index: this.indexName,
        body: query,
        track_total_hits: true,
      });

      const hits = response.body.hits;
      const total = typeof hits.total === 'number' ? hits.total : hits.total.value;
      const entities = hits.hits.map((hit: { _source: Entity }) => hit._source);

      const result: SearchResult = {
        entities,
        total,
        page,
        pageSize,
        hasMore: page * pageSize < total,
      };

      this.logger.debug(`Search returned ${entities.length} entities of ${total} total`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to search entities: ${error}`);
      throw error;
    }
  }

  /**
   * Bulk index multiple entities.
   * @param entities - Entities to index
   * @param user - User creating the entities
   * @returns Bulk operation result
   */
  public async bulkIndex(entities: CreateEntityRequest[], user: string): Promise<BulkResult<Entity>> {
    const result: BulkResult<Entity> = {
      success: true,
      items: [],
      failures: [],
      totalProcessed: entities.length,
      totalSuccess: 0,
      totalFailed: 0,
    };

    if (entities.length === 0) {
      return result;
    }

    const now = new Date().toISOString();
    const bulkBody: unknown[] = [];
    const createdEntities: Entity[] = [];

    entities.forEach((entity) => {
      const id = generateId();
      const newEntity = createEntityObject(id, entity, user, now);
      createdEntities.push(newEntity);
      bulkBody.push({ index: { _index: this.indexName, _id: id } });
      bulkBody.push(newEntity);
    });

    try {
      const response = await this.client.bulk({
        body: bulkBody,
        refresh: true,
      });

      const items = response.body.items as Array<{
        index: { _id: string; status: number; error?: { reason: string } };
      }>;

      items.forEach((item, index) => {
        const status = item.index.status;
        const createdId = item.index._id;

        if (status >= 200 && status < 300) {
          result.totalSuccess++;
          result.items.push({
            id: createdId,
            status: 'created',
            data: createdEntities[index],
          });
        } else {
          result.totalFailed++;
          result.success = false;
          result.failures.push({
            index,
            error: item.index.error?.reason ?? 'Unknown error',
          });
        }
      });

      this.logger.debug(`Bulk index: ${result.totalSuccess} succeeded, ${result.totalFailed} failed`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to bulk index entities: ${error}`);
      throw error;
    }
  }

  /**
   * Bulk delete multiple entities.
   * @param ids - Entity IDs to delete
   * @returns Bulk delete result
   */
  public async bulkDelete(ids: string[]): Promise<BulkDeleteResult> {
    const result: BulkDeleteResult = {
      success: true,
      deleted: [],
      failed: [],
      totalDeleted: 0,
      totalFailed: 0,
    };

    if (ids.length === 0) {
      return result;
    }

    const bulkBody: unknown[] = [];

    ids.forEach((id) => {
      bulkBody.push({ delete: { _index: this.indexName, _id: id } });
    });

    try {
      const response = await this.client.bulk({
        body: bulkBody,
        refresh: true,
      });

      const items = response.body.items as Array<{
        delete: { _id: string; status: number; result: string; error?: { reason: string } };
      }>;

      items.forEach((item, index) => {
        const deleteResult = item.delete;
        const id = ids[index];

        if (deleteResult.result === 'deleted') {
          result.totalDeleted++;
          if (id !== undefined) {
            result.deleted.push(id);
          }
        } else if (deleteResult.result === 'not_found') {
          result.totalFailed++;
          if (id !== undefined) {
            result.failed.push({ id, error: 'Entity not found' });
          }
        } else {
          result.totalFailed++;
          result.success = false;
          if (id !== undefined) {
            result.failed.push({
              id,
              error: deleteResult.error?.reason ?? 'Unknown error',
            });
          }
        }
      });

      if (result.totalFailed > 0) {
        result.success = result.totalDeleted > 0;
      }

      this.logger.debug(`Bulk delete: ${result.totalDeleted} deleted, ${result.totalFailed} failed`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to bulk delete entities: ${error}`);
      throw error;
    }
  }

  /**
   * Build an OpenSearch query from filters, sort, and pagination.
   * @param filters - Array of filters
   * @param sort - Array of sort fields
   * @param pagination - Pagination parameters
   * @returns OpenSearch query object
   */
  public buildQuery(filters: Filter[], sort: Sort[], pagination: Pagination): object {
    const { page, pageSize } = pagination;
    const from = (page - 1) * pageSize;

    // Build the query part
    let query: object;
    if (filters.length === 0) {
      query = { match_all: {} };
    } else {
      query = {
        bool: {
          must: filters.map((filter) => {
            const operatorFn = filterOperatorMapping[filter.operator];
            if (!operatorFn) {
              this.logger.warn(`Unknown filter operator: ${filter.operator}`);
              return { match_all: {} };
            }
            return operatorFn(filter.field, filter.value);
          }),
        },
      };
    }

    // Build the sort part
    const sortClause = sort.map((s) => ({
      [s.field]: { order: s.direction },
    }));

    return {
      query,
      from,
      size: pageSize,
      sort: sortClause.length > 0 ? sortClause : undefined,
    };
  }

  /**
   * Bulk update multiple entities.
   * @param updates - Array of update items with id and attributes
   * @param user - User performing the update
   * @returns Bulk operation result
   */
  public async bulkUpdate(
    updates: Array<{ id: string; attributes: UpdateEntityRequest }>,
    user: string
  ): Promise<BulkResult<Entity>> {
    const result: BulkResult<Entity> = {
      success: true,
      items: [],
      failures: [],
      totalProcessed: updates.length,
      totalSuccess: 0,
      totalFailed: 0,
    };

    if (updates.length === 0) {
      return result;
    }

    const now = new Date().toISOString();
    const bulkBody: unknown[] = [];
    const validUpdates: Array<{ index: number; update: { id: string; attributes: UpdateEntityRequest }; existing: Entity }> = [];

    // First, fetch all existing entities to validate they exist
    const existingEntities = await Promise.all(
      updates.map((update) => this.getEntity(update.id))
    );

    // Build bulk update operations only for existing entities
    updates.forEach((update, index) => {
      const existing = existingEntities[index];

      if (!existing) {
        result.totalFailed++;
        result.failures.push({
          index,
          error: `Entity not found: ${update.id}`,
        });
        return;
      }

      // Build updated entity - start with required fields
      const updatedEntity: Entity = {
        id: existing.id,
        title: update.attributes.title ?? existing.title,
        status: update.attributes.status ?? existing.status,
        createdAt: existing.createdAt,
        createdBy: existing.createdBy,
        updatedAt: now,
      };
      
      // Handle optional fields - only set if defined
      if (update.attributes.tags !== undefined) {
        updatedEntity.tags = update.attributes.tags;
      } else if (existing.tags !== undefined) {
        updatedEntity.tags = existing.tags;
      }

      if (update.attributes.description !== undefined) {
        updatedEntity.description = update.attributes.description;
      } else if (existing.description !== undefined) {
        updatedEntity.description = existing.description;
      }

      if (update.attributes.priority !== undefined) {
        updatedEntity.priority = update.attributes.priority;
      } else if (existing.priority !== undefined) {
        updatedEntity.priority = existing.priority;
      }

      validUpdates.push({ index, update, existing });
      bulkBody.push({ update: { _index: this.indexName, _id: update.id } });
      bulkBody.push({ doc: updatedEntity });
    });

    if (bulkBody.length === 0) {
      result.success = result.totalFailed === 0;
      return result;
    }

    try {
      const response = await this.client.bulk({
        body: bulkBody,
        refresh: true,
      });

      const items = response.body.items as Array<{
        update: { _id: string; status: number; error?: { reason: string } };
      }>;

      items.forEach((item, itemIndex) => {
        const validUpdate = validUpdates[itemIndex];
        if (!validUpdate) return;

        const { update, existing } = validUpdate;

        if (item.update.status >= 200 && item.update.status < 300) {
          result.totalSuccess++;
          const updatedEntity: Entity = {
            ...existing,
            ...update.attributes,
            updatedAt: now,
          };
          result.items.push({
            id: item.update._id,
            status: 'updated',
            data: updatedEntity,
          });
        } else {
          result.totalFailed++;
          result.success = false;
          result.failures.push({
            index: validUpdate.index,
            error: item.update.error?.reason ?? 'Unknown error',
          });
        }
      });

      this.logger.debug(`Bulk update: ${result.totalSuccess} succeeded, ${result.totalFailed} failed`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to bulk update entities: ${error}`);
      throw error;
    }
  }
}

export default OpenSearchService;