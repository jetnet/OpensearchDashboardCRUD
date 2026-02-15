/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Unit tests for EntityService (frontend)
 */

import { EntityService, createEntityService } from '../../../public/services/entity_service';
import type { Entity, CreateEntityRequest, UpdateEntityRequest } from '../../../public/types';

describe('EntityService', () => {
  let service: EntityService;
  let mockHttp: {
    get: jest.Mock;
    post: jest.Mock;
    put: jest.Mock;
    delete: jest.Mock;
  };

  const mockEntity: Entity = {
    id: 'test-id-123',
    title: 'Test Entity',
    description: 'Test description',
    status: 'active',
    priority: 5,
    tags: ['tag1', 'tag2'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdBy: 'test-user',
  };

  beforeEach(() => {
    mockHttp = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };

    service = new EntityService(mockHttp as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchEntities', () => {
    it('should fetch entities with default parameters', async () => {
      const mockResult = {
        entities: [mockEntity],
        total: 1,
        page: 1,
        pageSize: 25,
        hasMore: false,
      };

      mockHttp.get.mockResolvedValue(mockResult);

      const result = await service.fetchEntities();

      expect(mockHttp.get).toHaveBeenCalledWith('/api/crud-plugin/entities', {
        query: {},
      });
      expect(result).toEqual(mockResult);
    });

    it('should fetch entities with pagination parameters', async () => {
      const mockResult = {
        entities: [mockEntity],
        total: 100,
        page: 2,
        pageSize: 10,
        hasMore: true,
      };

      mockHttp.get.mockResolvedValue(mockResult);

      const result = await service.fetchEntities({ page: 2, pageSize: 10 });

      expect(mockHttp.get).toHaveBeenCalledWith('/api/crud-plugin/entities', {
        query: { page: 2, pageSize: 10 },
      });
      expect(result).toEqual(mockResult);
    });

    it('should fetch entities with filters and sort', async () => {
      const mockResult = {
        entities: [mockEntity],
        total: 1,
        page: 1,
        pageSize: 25,
        hasMore: false,
      };

      mockHttp.get.mockResolvedValue(mockResult);

      const result = await service.fetchEntities({
        filters: JSON.stringify([{ field: 'status', operator: 'eq', value: 'active' }]),
        sort: JSON.stringify([{ field: 'createdAt', direction: 'desc' }]),
      });

      expect(mockHttp.get).toHaveBeenCalledWith('/api/crud-plugin/entities', {
        query: {
          filters: JSON.stringify([{ field: 'status', operator: 'eq', value: 'active' }]),
          sort: JSON.stringify([{ field: 'createdAt', direction: 'desc' }]),
        },
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('fetchEntity', () => {
    it('should fetch a single entity by ID', async () => {
      mockHttp.get.mockResolvedValue(mockEntity);

      const result = await service.fetchEntity('test-id-123');

      expect(mockHttp.get).toHaveBeenCalledWith('/api/crud-plugin/entities/test-id-123');
      expect(result).toEqual(mockEntity);
    });

    it('should encode entity ID in URL', async () => {
      mockHttp.get.mockResolvedValue(mockEntity);

      await service.fetchEntity('test/id/with/slashes');

      expect(mockHttp.get).toHaveBeenCalledWith('/api/crud-plugin/entities/test%2Fid%2Fwith%2Fslashes');
    });

    it('should throw error for invalid ID', async () => {
      await expect(service.fetchEntity('')).rejects.toThrow('Invalid entity ID');
      await expect(service.fetchEntity(null as any)).rejects.toThrow('Invalid entity ID');
      await expect(service.fetchEntity(undefined as any)).rejects.toThrow('Invalid entity ID');
    });
  });

  describe('createEntity', () => {
    it('should create a new entity', async () => {
      const newEntity: CreateEntityRequest = {
        title: 'New Entity',
        description: 'New description',
        status: 'active',
        priority: 1,
        tags: ['new'],
      };

      mockHttp.post.mockResolvedValue(mockEntity);

      const result = await service.createEntity(newEntity);

      expect(mockHttp.post).toHaveBeenCalledWith('/api/crud-plugin/entities', {
        body: JSON.stringify(newEntity),
      });
      expect(result).toEqual(mockEntity);
    });

    it('should throw error for invalid entity data', async () => {
      await expect(service.createEntity(null as any)).rejects.toThrow('Invalid entity data');
      await expect(service.createEntity(undefined as any)).rejects.toThrow('Invalid entity data');
      await expect(service.createEntity('invalid' as any)).rejects.toThrow('Invalid entity data');
    });
  });

  describe('updateEntity', () => {
    it('should update an existing entity', async () => {
      const updates: UpdateEntityRequest = {
        title: 'Updated Title',
        status: 'inactive',
      };

      const updatedEntity = { ...mockEntity, ...updates };

      mockHttp.put.mockResolvedValue(updatedEntity);

      const result = await service.updateEntity('test-id-123', updates);

      expect(mockHttp.put).toHaveBeenCalledWith('/api/crud-plugin/entities/test-id-123', {
        body: JSON.stringify(updates),
      });
      expect(result).toEqual(updatedEntity);
    });

    it('should encode entity ID in URL', async () => {
      mockHttp.put.mockResolvedValue(mockEntity);

      await service.updateEntity('test/id/special', { title: 'Test' });

      expect(mockHttp.put).toHaveBeenCalledWith('/api/crud-plugin/entities/test%2Fid%2Fspecial', {
        body: JSON.stringify({ title: 'Test' }),
      });
    });

    it('should throw error for invalid ID', async () => {
      await expect(service.updateEntity('', { title: 'Test' })).rejects.toThrow('Invalid entity ID');
      await expect(service.updateEntity(null as any, { title: 'Test' })).rejects.toThrow('Invalid entity ID');
    });

    it('should throw error for invalid update data', async () => {
      await expect(service.updateEntity('test-id', null as any)).rejects.toThrow('Invalid update data');
      await expect(service.updateEntity('test-id', undefined as any)).rejects.toThrow('Invalid update data');
    });
  });

  describe('deleteEntity', () => {
    it('should delete an entity by ID', async () => {
      mockHttp.delete.mockResolvedValue(undefined);

      await service.deleteEntity('test-id-123');

      expect(mockHttp.delete).toHaveBeenCalledWith('/api/crud-plugin/entities/test-id-123');
    });

    it('should encode entity ID in URL', async () => {
      mockHttp.delete.mockResolvedValue(undefined);

      await service.deleteEntity('test/id/special');

      expect(mockHttp.delete).toHaveBeenCalledWith('/api/crud-plugin/entities/test%2Fid%2Fspecial');
    });

    it('should throw error for invalid ID', async () => {
      await expect(service.deleteEntity('')).rejects.toThrow('Invalid entity ID');
      await expect(service.deleteEntity(null as any)).rejects.toThrow('Invalid entity ID');
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple entities in bulk', async () => {
      const entities: CreateEntityRequest[] = [
        { title: 'Entity 1', status: 'active' },
        { title: 'Entity 2', status: 'inactive' },
      ];

      const mockResult = {
        success: true,
        created: [
          { id: 'id-1', status: 'created' },
          { id: 'id-2', status: 'created' },
        ],
        failed: [],
        totalCreated: 2,
        totalFailed: 0,
      };

      mockHttp.post.mockResolvedValue(mockResult);

      const result = await service.bulkCreate(entities);

      expect(mockHttp.post).toHaveBeenCalledWith('/api/crud-plugin/entities/bulk/create', {
        body: JSON.stringify({ entities }),
      });
      expect(result).toEqual(mockResult);
    });

    it('should throw error for empty array', async () => {
      await expect(service.bulkCreate([])).rejects.toThrow('Entities must be a non-empty array');
    });

    it('should throw error for non-array input', async () => {
      await expect(service.bulkCreate(null as any)).rejects.toThrow('Entities must be a non-empty array');
      await expect(service.bulkCreate({} as any)).rejects.toThrow('Entities must be a non-empty array');
    });
  });

  describe('bulkUpdate', () => {
    it('should update multiple entities in bulk', async () => {
      const updates = [
        { id: 'id-1', attributes: { title: 'Updated 1' } },
        { id: 'id-2', attributes: { status: 'inactive' as const } },
      ];

      const mockResult = {
        success: true,
        updated: [
          { id: 'id-1', status: 'updated' },
          { id: 'id-2', status: 'updated' },
        ],
        failed: [],
        totalUpdated: 2,
        totalFailed: 0,
      };

      mockHttp.put.mockResolvedValue(mockResult);

      const result = await service.bulkUpdate(updates);

      expect(mockHttp.put).toHaveBeenCalledWith('/api/crud-plugin/entities/bulk/update', {
        body: JSON.stringify({ updates }),
      });
      expect(result).toEqual(mockResult);
    });

    it('should throw error for empty array', async () => {
      await expect(service.bulkUpdate([])).rejects.toThrow('Updates must be a non-empty array');
    });

    it('should throw error for non-array input', async () => {
      await expect(service.bulkUpdate(null as any)).rejects.toThrow('Updates must be a non-empty array');
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple entities in bulk', async () => {
      const ids = ['id-1', 'id-2', 'id-3'];

      const mockResult = {
        success: true,
        deleted: ids,
        failed: [],
        totalDeleted: 3,
        totalFailed: 0,
      };

      mockHttp.delete.mockResolvedValue(mockResult);

      const result = await service.bulkDelete(ids);

      expect(mockHttp.delete).toHaveBeenCalledWith('/api/crud-plugin/entities/bulk/delete', {
        body: JSON.stringify({ ids }),
      });
      expect(result).toEqual(mockResult);
    });

    it('should throw error for empty array', async () => {
      await expect(service.bulkDelete([])).rejects.toThrow('IDs must be a non-empty array');
    });

    it('should throw error for non-array input', async () => {
      await expect(service.bulkDelete(null as any)).rejects.toThrow('IDs must be a non-empty array');
    });
  });

  describe('createEntityService factory', () => {
    it('should create an EntityService instance', () => {
      const serviceInstance = createEntityService(mockHttp as any);

      expect(serviceInstance).toBeInstanceOf(EntityService);
    });
  });
});
