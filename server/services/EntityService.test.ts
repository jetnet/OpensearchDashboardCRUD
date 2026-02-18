import { EntityService } from './EntityService';
import { OpenSearchClient } from 'opensearch-dashboards/server';

// Mock the EntityService module to use the mock OpenSearchClient
jest.mock('./EntityService', () => {
  const { EntityService } = jest.requireActual('./EntityService');
  return {
    EntityService: class extends EntityService {
      constructor(client: OpenSearchClient) {
        super(client as any);
      }
    },
  };
});

const mockClient = {
  indices: {
    exists: jest.fn(),
    create: jest.fn(),
  },
  index: jest.fn(),
  search: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('EntityService', () => {
  let service: EntityService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EntityService(mockClient as unknown as OpenSearchClient);
  });

  it('should create an entity', async () => {
    const entity = {
      name: 'Test Entity',
      description: 'Test Description',
      type: 'Test Type',
    };

    mockClient.indices.exists.mockResolvedValue({ body: true });
    mockClient.index.mockResolvedValue({ body: { _id: '123' } });

    const result = await service.createEntity(entity);

    expect(mockClient.indices.exists).toHaveBeenCalledWith({ index: '.osd-crud-entities' });
    expect(mockClient.index).toHaveBeenCalledWith(expect.objectContaining({
      index: '.osd-crud-entities',
      body: expect.objectContaining({
        name: 'Test Entity',
        description: 'Test Description',
        type: 'Test Type',
      }),
    }));
    expect(result).toEqual(expect.objectContaining({
      id: '123',
      name: 'Test Entity',
    }));
  });

  it('should create index if it does not exist', async () => {
    const entity = {
      name: 'Test Entity',
      description: 'Test Description',
      type: 'Test Type',
    };

    mockClient.indices.exists.mockResolvedValue({ body: false });
    mockClient.indices.create.mockResolvedValue({});
    mockClient.index.mockResolvedValue({ body: { _id: '123' } });

    await service.createEntity(entity);

    expect(mockClient.indices.create).toHaveBeenCalledWith(expect.objectContaining({
      index: '.osd-crud-entities',
    }));
  });

  it('should get entities', async () => {
    mockClient.indices.exists.mockResolvedValue({ body: true });
    mockClient.search.mockResolvedValue({
      body: {
        hits: {
          hits: [
            {
              _id: '1',
              _source: { name: 'Entity 1' },
            },
            {
              _id: '2',
              _source: { name: 'Entity 2' },
            },
          ],
        },
      },
    });

    const results = await service.getEntities();

    expect(results).toHaveLength(2);
    expect(results[0]).toEqual(expect.objectContaining({ id: '1', name: 'Entity 1' }));
    expect(results[1]).toEqual(expect.objectContaining({ id: '2', name: 'Entity 2' }));
  });
});
