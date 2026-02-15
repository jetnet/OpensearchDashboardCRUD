/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Unit tests for OpenSearchService
 */

import { OpenSearchService } from '../../../server/services/opensearch_service';
import type { Entity, CreateEntityRequest, SearchParams, Filter, Sort, Pagination } from '../../../server/types';

// Mock the crypto API
const mockRandomUUID = jest.fn();
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: mockRandomUUID,
  },
});

describe('OpenSearchService', () => {
  let service: OpenSearchService;
  let mockClient: {
    indices: {
      exists: jest.Mock;
      create: jest.Mock;
    };
    index: jest.Mock;
    get: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    search: jest.Mock;
    bulk: jest.Mock;
  };
  let mockLogger: {
    info: jest.Mock;
    debug: jest.Mock;
    error: jest.Mock;
    warn: jest.Mock;
  };
  let mockConfig: { index: { name: string } };

  beforeEach(() => {
    mockClient = {
      indices: {
        exists: jest.fn(),
        create: jest.fn(),
      },
      index: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      search: jest.fn(),
      bulk: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    mockConfig = {
      index: {
        name: 'test-entities',
      },
    };

    service = new OpenSearchService(mockClient as any, mockConfig as any, mockLogger as any);
    mockRandomUUID.mockReturnValue('test-uuid-1234');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ensureIndexExists', () => {
    it('should create index if it does not exist', async () => {
      mockClient.indices.exists.mockResolvedValue({ body: false });
      mockClient.indices.create.mockResolvedValue({});

      await service.ensureIndexExists();

      expect(mockClient.indices.exists).toHaveBeenCalledWith({
        index: 'test-entities',
      });
      expect(mockClient.indices.create).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Creating index: test-entities');
    });

    it('should not create index if it already exists', async () => {
      mockClient.indices.exists.mockResolvedValue({ body: true });

      await service.ensureIndexExists();

      expect(mockClient.indices.exists).toHaveBeenCalledWith({
        index: 'test-entities',
      });
      expect(mockClient.indices.create).not.toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith('Index test-entities already exists');
    });

    it('should throw error if index creation fails', async () => {
      mockClient.indices.exists.mockResolvedValue({ body: false });
      mockClient.indices.create.mockRejectedValue(new Error('Creation failed'));

      await expect(service.ensureIndexExists()).rejects.toThrow('Creation failed');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('indexEntity', () => {
    it('should index a new entity with generated ID', async () => {
      const entity: CreateEntityRequest = {
        title: 'Test Entity',
        description: 'Test description',
        status: 'active',
        priority: 1,
        tags: ['tag1', 'tag2'],
      };

      mockClient.index.mockResolvedValue({});

      const result = await service.indexEntity(entity, 'test-user');

      expect(result).toMatchObject({
        id: 'test-uuid-1234',
        title: 'Test Entity',
        description: 'Test description',
        status: 'active',
        priority: 1,
        tags: ['tag1', 'tag2'],
        createdBy: 'test-user',
      });
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(mockClient.index).toHaveBeenCalledWith({
        index: 'test-entities',
        id: 'test-uuid-1234',
        body: result,
        refresh: true,
      });
    });

    it('should index entity with minimal required fields', async () => {
      const entity: CreateEntityRequest = {
        title: 'Minimal Entity',
      };

      mockClient.index.mockResolvedValue({});

      const result = await service.indexEntity(entity, 'test-user');

      expect(result).toMatchObject({
        id: 'test-uuid-1234',
        title: 'Minimal Entity',
        status: 'active',
        createdBy: 'test-user',
      });
    });

    it('should throw error if indexing fails', async () => {
      const entity: CreateEntityRequest = { title: 'Test' };
      mockClient.index.mockRejectedValue(new Error('Index failed'));

      await expect(service.indexEntity(entity, 'test-user')).rejects.toThrow('Index failed');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getEntity', () => {
    it('should return entity when found', async () => {
      const mockEntity: Entity = {
        id: 'test-id',
        title: 'Test Entity',
        status: 'active',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        createdBy: 'test-user',
      };

      mockClient.get.mockResolvedValue({
        body: {
          found: true,
          _source: mockEntity,
        },
      });

      const result = await service.getEntity('test-id');

      expect(result).toEqual(mockEntity);
      expect(mockClient.get).toHaveBeenCalledWith({
        index: 'test-entities',
        id: 'test-id',
      });
    });

    it('should return null when entity not found', async () => {
      const error = new Error('Not found') as any;
      error.statusCode = 404;
      mockClient.get.mockRejectedValue(error);

      const result = await service.getEntity('non-existent-id');

      expect(result).toBeNull();
    });

    it('should throw error for other failures', async () => {
      const error = new Error('Server error') as any;
      error.statusCode = 500;
      mockClient.get.mockRejectedValue(error);

      await expect(service.getEntity('test-id')).rejects.toThrow('Server error');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('updateEntity', () => {
    const existingEntity: Entity = {
      id: 'test-id',
      title: 'Existing Entity',
      description: 'Original description',
      status: 'active',
      priority: 1,
      tags: ['tag1'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdBy: 'original-user',
    };

    it('should update entity successfully', async () => {
      mockClient.get.mockResolvedValue({
        body: { found: true, _source: existingEntity },
      });
      mockClient.update.mockResolvedValue({});

      const updates = {
        title: 'Updated Title',
        status: 'inactive' as const,
      };

      const result = await service.updateEntity('test-id', updates, 'updater-user');

      expect(result).toMatchObject({
        id: 'test-id',
        title: 'Updated Title',
        status: 'inactive',
        description: 'Original description',
        priority: 1,
        tags: ['tag1'],
        createdBy: 'original-user',
      });
      expect(result?.updatedAt).toBeDefined();
    });

    it('should return null if entity not found', async () => {
      const error = new Error('Not found') as any;
      error.statusCode = 404;
      mockClient.get.mockRejectedValue(error);

      const result = await service.updateEntity('non-existent-id', { title: 'New' }, 'user');

      expect(result).toBeNull();
    });

    it('should throw error if update fails', async () => {
      mockClient.get.mockResolvedValue({
        body: { found: true, _source: existingEntity },
      });
      mockClient.update.mockRejectedValue(new Error('Update failed'));

      await expect(
        service.updateEntity('test-id', { title: 'New' }, 'user')
      ).rejects.toThrow('Update failed');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('deleteEntity', () => {
    it('should delete entity successfully', async () => {
      mockClient.delete.mockResolvedValue({
        body: { result: 'deleted' },
      });

      const result = await service.deleteEntity('test-id');

      expect(result).toBe(true);
      expect(mockClient.delete).toHaveBeenCalledWith({
        index: 'test-entities',
        id: 'test-id',
        refresh: true,
      });
    });

    it('should return false if entity not found', async () => {
      const error = new Error('Not found') as any;
      error.statusCode = 404;
      mockClient.delete.mockRejectedValue(error);

      const result = await service.deleteEntity('non-existent-id');

      expect(result).toBe(false);
    });

    it('should throw error for other failures', async () => {
      const error = new Error('Server error') as any;
      error.statusCode = 500;
      mockClient.delete.mockRejectedValue(error);

      await expect(service.deleteEntity('test-id')).rejects.toThrow('Server error');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('searchEntities', () => {
    const mockEntities: Entity[] = [
      {
        id: '1',
        title: 'Entity 1',
        status: 'active',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        createdBy: 'user1',
      },
      {
        id: '2',
        title: 'Entity 2',
        status: 'inactive',
        createdAt: '2024-01-02T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
        createdBy: 'user2',
      },
    ];

    it('should search entities with pagination', async () => {
      mockClient.search.mockResolvedValue({
        body: {
          hits: {
            total: { value: 25 },
            hits: mockEntities.map((e) => ({ _source: e })),
          },
        },
      });

      const params: SearchParams = {
        filters: [],
        sort: [],
        pagination: { page: 1, pageSize: 10 },
      };

      const result = await service.searchEntities(params);

      expect(result.entities).toHaveLength(2);
      expect(result.total).toBe(25);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.hasMore).toBe(true);
    });

    it('should apply filters in search', async () => {
      mockClient.search.mockResolvedValue({
        body: {
          hits: {
            total: { value: 1 },
            hits: [{ _source: mockEntities[0] }],
          },
        },
      });

      const filters: Filter[] = [
        { field: 'status', operator: 'eq', value: 'active' },
      ];

      const params: SearchParams = {
        filters,
        sort: [],
        pagination: { page: 1, pageSize: 10 },
      };

      const result = await service.searchEntities(params);

      expect(result.entities).toHaveLength(1);
      expect(mockClient.search).toHaveBeenCalledWith(
        expect.objectContaining({
          index: 'test-entities',
          track_total_hits: true,
        })
      );
    });

    it('should apply sorting in search', async () => {
      mockClient.search.mockResolvedValue({
        body: {
          hits: {
            total: { value: 2 },
            hits: mockEntities.map((e) => ({ _source: e })),
          },
        },
      });

      const sort: Sort[] = [
        { field: 'createdAt', direction: 'desc' as const },
      ];

      const params: SearchParams = {
        filters: [],
        sort,
        pagination: { page: 1, pageSize: 10 },
      };

      await service.searchEntities(params);

      expect(mockClient.search).toHaveBeenCalled();
    });

    it('should throw error if search fails', async () => {
      mockClient.search.mockRejectedValue(new Error('Search failed'));

      const params: SearchParams = {
        filters: [],
        sort: [],
        pagination: { page: 1, pageSize: 10 },
      };

      await expect(service.searchEntities(params)).rejects.toThrow('Search failed');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('bulkIndex', () => {
    it('should bulk index multiple entities', async () => {
      const entities: CreateEntityRequest[] = [
        { title: 'Entity 1', status: 'active' },
        { title: 'Entity 2', status: 'inactive' },
      ];

      mockClient.bulk.mockResolvedValue({
        body: {
          items: [
            { index: { _id: 'id1', status: 201 } },
            { index: { _id: 'id2', status: 201 } },
          ],
        },
      });

      const result = await service.bulkIndex(entities, 'test-user');

      expect(result.success).toBe(true);
      expect(result.totalProcessed).toBe(2);
      expect(result.totalSuccess).toBe(2);
      expect(result.totalFailed).toBe(0);
    });

    it('should return empty result for empty input', async () => {
      const result = await service.bulkIndex([], 'test-user');

      expect(result.success).toBe(true);
      expect(result.totalProcessed).toBe(0);
      expect(mockClient.bulk).not.toHaveBeenCalled();
    });

    it('should handle partial failures in bulk index', async () => {
      const entities: CreateEntityRequest[] = [
        { title: 'Entity 1' },
        { title: 'Entity 2' },
      ];

      mockClient.bulk.mockResolvedValue({
        body: {
          items: [
            { index: { _id: 'id1', status: 201 } },
            { index: { _id: 'id2', status: 400, error: { reason: 'Bad request' } } },
          ],
        },
      });

      const result = await service.bulkIndex(entities, 'test-user');

      expect(result.success).toBe(false);
      expect(result.totalSuccess).toBe(1);
      expect(result.totalFailed).toBe(1);
      expect(result.failures).toHaveLength(1);
    });
  });

  describe('bulkDelete', () => {
    it('should bulk delete multiple entities', async () => {
      mockClient.bulk.mockResolvedValue({
        body: {
          items: [
            { delete: { _id: 'id1', result: 'deleted' } },
            { delete: { _id: 'id2', result: 'deleted' } },
          ],
        },
      });

      const result = await service.bulkDelete(['id1', 'id2']);

      expect(result.success).toBe(true);
      expect(result.totalDeleted).toBe(2);
      expect(result.totalFailed).toBe(0);
      expect(result.deleted).toEqual(['id1', 'id2']);
    });

    it('should return empty result for empty input', async () => {
      const result = await service.bulkDelete([]);

      expect(result.success).toBe(true);
      expect(result.totalDeleted).toBe(0);
      expect(mockClient.bulk).not.toHaveBeenCalled();
    });

    it('should handle not found entities in bulk delete', async () => {
      mockClient.bulk.mockResolvedValue({
        body: {
          items: [
            { delete: { _id: 'id1', result: 'deleted' } },
            { delete: { _id: 'id2', result: 'not_found' } },
          ],
        },
      });

      const result = await service.bulkDelete(['id1', 'id2']);

      expect(result.success).toBe(true);
      expect(result.totalDeleted).toBe(1);
      expect(result.totalFailed).toBe(1);
      expect(result.failed).toContainEqual({ id: 'id2', error: 'Entity not found' });
    });
  });

  describe('buildQuery', () => {
    it('should build query with match_all when no filters', () => {
      const pagination: Pagination = { page: 1, pageSize: 10 };
      const query = service.buildQuery([], [], pagination);

      expect(query).toMatchObject({
        query: { match_all: {} },
        from: 0,
        size: 10,
      });
    });

    it('should build query with filters', () => {
      const filters: Filter[] = [
        { field: 'status', operator: 'eq', value: 'active' },
      ];
      const pagination: Pagination = { page: 1, pageSize: 10 };

      const query = service.buildQuery(filters, [], pagination);

      expect(query).toMatchObject({
        query: {
          bool: {
            must: [{ term: { status: 'active' } }],
          },
        },
        from: 0,
        size: 10,
      });
    });

    it('should build query with sorting', () => {
      const sort: Sort[] = [{ field: 'createdAt', direction: 'desc' as const }];
      const pagination: Pagination = { page: 2, pageSize: 20 };

      const query = service.buildQuery([], sort, pagination);

      expect(query).toMatchObject({
        query: { match_all: {} },
        from: 20,
        size: 20,
        sort: [{ createdAt: { order: 'desc' } }],
      });
    });

    it('should calculate correct offset for pagination', () => {
      const pagination: Pagination = { page: 3, pageSize: 25 };
      const query = service.buildQuery([], [], pagination);

      expect(query).toMatchObject({
        from: 50, // (3-1) * 25
        size: 25,
      });
    });
  });
});
