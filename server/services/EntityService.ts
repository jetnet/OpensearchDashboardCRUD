import { OpenSearchClient } from 'opensearch-dashboards/server';
import { IEntity } from '../../common/types';

export class EntityService {
  private readonly INDEX = '.osd-crud-entities';

  constructor(private readonly client: OpenSearchClient) {}

  private async ensureIndex() {
    const indexExists = await this.client.indices.exists({ index: this.INDEX });
    if (!indexExists.body) {
      await this.client.indices.create({
        index: this.INDEX,
        body: {
          mappings: {
            properties: {
              name: { type: 'text' },
              description: { type: 'text' },
              type: { type: 'keyword' },
              created_at: { type: 'date' },
              updated_at: { type: 'date' },
            },
          },
        },
      });
    }
  }

  public async createEntity(entity: IEntity): Promise<IEntity> {
    await this.ensureIndex();
    const now = new Date().toISOString();
    const response = await this.client.index({
      index: this.INDEX,
      body: {
        ...entity,
        created_at: now,
        updated_at: now,
      },
      refresh: 'wait_for',
    });

    return {
      ...entity,
      id: response.body._id,
      created_at: now,
      updated_at: now,
    };
  }

  public async getEntities(): Promise<IEntity[]> {
    await this.ensureIndex();
    const response = await this.client.search({
      index: this.INDEX,
      body: {
        query: {
          match_all: {},
        },
      },
    });

    return response.body.hits.hits.map((hit: any) => ({
      id: hit._id,
      ...(hit._source as IEntity),
    }));
  }

  public async updateEntity(id: string, entity: Partial<IEntity>): Promise<void> {
    await this.ensureIndex();
    await this.client.update({
      index: this.INDEX,
      id,
      body: {
        doc: {
          ...entity,
          updated_at: new Date().toISOString(),
        },
      },
      refresh: 'wait_for',
    });
  }

  public async deleteEntity(id: string): Promise<void> {
    await this.ensureIndex();
    await this.client.delete({
      index: this.INDEX,
      id,
      refresh: 'wait_for',
    });
  }
}
