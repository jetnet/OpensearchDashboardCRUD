/**
 * Direct OpenSearch API client for test setup
 * Provides methods to create/delete indices and manage test documents
 */

export interface OpenSearchConfig {
  host: string;
  port: number;
  protocol: 'http' | 'https';
  username?: string;
  password?: string;
}

export interface IndexMapping {
  properties: Record<string, {
    type?: string;
    properties?: Record<string, unknown>;
    fields?: Record<string, unknown>;
  }>;
}

export interface IndexSettings {
  number_of_shards?: number;
  number_of_replicas?: number;
  [key: string]: unknown;
}

export class OpenSearchAPIClient {
  private config: OpenSearchConfig;
  private baseUrl: string;

  constructor(config: Partial<OpenSearchConfig> = {}) {
    this.config = {
      host: process.env.OS_HOST || 'localhost',
      port: parseInt(process.env.OS_PORT || '9200'),
      protocol: (process.env.OS_PROTOCOL as 'http' | 'https') || 'http',
      username: process.env.OS_USERNAME,
      password: process.env.OS_PASSWORD,
      ...config,
    };
    this.baseUrl = `${this.config.protocol}://${this.config.host}:${this.config.port}`;
  }

  /**
   * Make an HTTP request to OpenSearch
   */
  private async request(
    path: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
      body?: unknown;
      headers?: Record<string, string>;
    } = {}
  ): Promise<{ ok: boolean; status: number; data: unknown }> {
    const { method = 'GET', body, headers = {} } = options;
    const url = `${this.baseUrl}${path}`;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add authentication if provided
    if (this.config.username && this.config.password) {
      const auth = Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64');
      requestHeaders['Authorization'] = `Basic ${auth}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });

      let data: unknown;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      return {
        ok: response.ok,
        status: response.status,
        data,
      };
    } catch (error) {
      console.error(`Request failed: ${method} ${url}`, error);
      throw error;
    }
  }

  /**
   * Check if OpenSearch is available
   */
  async health(): Promise<boolean> {
    try {
      const response = await this.request('/_cluster/health');
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Wait for OpenSearch to be ready
   */
  async waitForReady(timeoutMs: number = 60000, intervalMs: number = 2000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      if (await this.health()) {
        return;
      }
      await this.sleep(intervalMs);
    }
    
    throw new Error(`OpenSearch did not become ready within ${timeoutMs}ms`);
  }

  /**
   * Get all indices
   */
  async getIndices(): Promise<string[]> {
    const response = await this.request('/_cat/indices?format=json');
    if (!response.ok) {
      throw new Error('Failed to get indices');
    }
    const indices = response.data as Array<{ index: string }>;
    return indices.map(i => i.index).filter(name => !name.startsWith('.'));
  }

  /**
   * Check if an index exists
   */
  async indexExists(indexName: string): Promise<boolean> {
    const response = await this.request(`/${indexName}`, { method: 'HEAD' });
    return response.status === 200;
  }

  /**
   * Create an index with optional mapping and settings
   */
  async createIndex(
    indexName: string,
    mapping?: IndexMapping,
    settings?: IndexSettings
  ): Promise<void> {
    const body: Record<string, unknown> = {};
    
    if (settings) {
      body.settings = { index: settings };
    }
    
    if (mapping) {
      body.mappings = mapping;
    }

    const response = await this.request(`/${indexName}`, {
      method: 'PUT',
      body,
    });

    if (!response.ok && response.status !== 400) { // 400 might mean index already exists
      throw new Error(`Failed to create index ${indexName}: ${JSON.stringify(response.data)}`);
    }
  }

  /**
   * Delete an index
   */
  async deleteIndex(indexName: string): Promise<void> {
    const response = await this.request(`/${indexName}`, {
      method: 'DELETE',
    });

    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to delete index ${indexName}: ${JSON.stringify(response.data)}`);
    }
  }

  /**
   * Get index mapping
   */
  async getMapping(indexName: string): Promise<IndexMapping> {
    const response = await this.request(`/${indexName}/_mapping`);
    if (!response.ok) {
      throw new Error(`Failed to get mapping for ${indexName}`);
    }
    const data = response.data as Record<string, { mappings: IndexMapping }>;
    return data[indexName]?.mappings || { properties: {} };
  }

  /**
   * Update index mapping
   */
  async putMapping(indexName: string, mapping: IndexMapping): Promise<void> {
    const response = await this.request(`/${indexName}/_mapping`, {
      method: 'PUT',
      body: mapping,
    });

    if (!response.ok) {
      throw new Error(`Failed to update mapping for ${indexName}: ${JSON.stringify(response.data)}`);
    }
  }

  /**
   * Index a document
   */
  async indexDocument(
    indexName: string,
    document: Record<string, unknown>,
    id?: string
  ): Promise<{ _id: string; result: string }> {
    const path = id 
      ? `/${indexName}/_doc/${id}` 
      : `/${indexName}/_doc`;
    
    const response = await this.request(path, {
      method: 'POST',
      body: document,
    });

    if (!response.ok) {
      throw new Error(`Failed to index document: ${JSON.stringify(response.data)}`);
    }

    const data = response.data as { _id: string; result: string };
    return { _id: data._id, result: data.result };
  }

  /**
   * Get a document by ID
   */
  async getDocument(indexName: string, id: string): Promise<Record<string, unknown> | null> {
    const response = await this.request(`/${indexName}/_doc/${id}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`Failed to get document ${id}: ${JSON.stringify(response.data)}`);
    }

    const data = response.data as { _source?: Record<string, unknown>; found: boolean };
    return data.found ? data._source || null : null;
  }

  /**
   * Update a document
   */
  async updateDocument(
    indexName: string,
    id: string,
    document: Record<string, unknown>
  ): Promise<void> {
    const response = await this.request(`/${indexName}/_doc/${id}`, {
      method: 'PUT',
      body: document,
    });

    if (!response.ok) {
      throw new Error(`Failed to update document ${id}: ${JSON.stringify(response.data)}`);
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(indexName: string, id: string): Promise<boolean> {
    const response = await this.request(`/${indexName}/_doc/${id}`, {
      method: 'DELETE',
    });

    return response.ok;
  }

  /**
   * Search documents
   */
  async search(
    indexName: string,
    query: Record<string, unknown> = { query: { match_all: {} } }
  ): Promise<{ hits: Array<{ _id: string; _source: Record<string, unknown> }>; total: number }> {
    const response = await this.request(`/${indexName}/_search`, {
      method: 'POST',
      body: query,
    });

    if (!response.ok) {
      throw new Error(`Failed to search: ${JSON.stringify(response.data)}`);
    }

    const data = response.data as {
      hits: {
        hits: Array<{ _id: string; _source: Record<string, unknown> }>;
        total: { value: number } | number;
      };
    };

    const total = typeof data.hits.total === 'object' ? data.hits.total.value : data.hits.total;
    
    return {
      hits: data.hits.hits,
      total,
    };
  }

  /**
   * Bulk index documents
   */
  async bulkIndex(
    indexName: string,
    documents: Array<{ id?: string; doc: Record<string, unknown> }>
  ): Promise<void> {
    const body = documents.flatMap(({ id, doc }) => [
      { index: { _index: indexName, _id: id } },
      doc,
    ]);

    const response = await this.request('/_bulk', {
      method: 'POST',
      body: body.map(line => JSON.stringify(line)).join('\n') + '\n',
      headers: { 'Content-Type': 'application/x-ndjson' },
    });

    if (!response.ok) {
      throw new Error(`Bulk index failed: ${JSON.stringify(response.data)}`);
    }
  }

  /**
   * Refresh an index
   */
  async refreshIndex(indexName: string): Promise<void> {
    await this.request(`/${indexName}/_refresh`, { method: 'POST' });
  }

  /**
   * Get document count for an index
   */
  async getDocumentCount(indexName: string): Promise<number> {
    const response = await this.request(`/${indexName}/_count`);
    if (!response.ok) {
      throw new Error(`Failed to get count for ${indexName}`);
    }
    const data = response.data as { count: number };
    return data.count;
  }

  /**
   * Delete all documents from an index (keeps the index)
   */
  async clearIndex(indexName: string): Promise<void> {
    const response = await this.request(`/${indexName}/_delete_by_query`, {
      method: 'POST',
      body: {
        query: { match_all: {} },
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to clear index ${indexName}`);
    }
  }

  /**
   * Create test indices with sample data
   */
  async setupTestIndices(): Promise<void> {
    // Simple index with basic field types
    await this.createIndex('test-simple', {
      properties: {
        title: { type: 'text' },
        description: { type: 'text' },
        count: { type: 'integer' },
        price: { type: 'float' },
        isActive: { type: 'boolean' },
        createdAt: { type: 'date' },
        category: { type: 'keyword' },
      },
    });

    // Index with nested objects
    await this.createIndex('test-nested', {
      properties: {
        name: { type: 'text' },
        address: {
          properties: {
            street: { type: 'text' },
            city: { type: 'keyword' },
            country: { type: 'keyword' },
            zipCode: { type: 'keyword' },
            coordinates: {
              properties: {
                lat: { type: 'float' },
                lon: { type: 'float' },
              },
            },
          },
        },
        contact: {
          properties: {
            email: { type: 'keyword' },
            phone: { type: 'keyword' },
          },
        },
      },
    });

    // Index with arrays
    await this.createIndex('test-arrays', {
      properties: {
        product: { type: 'text' },
        tags: { type: 'keyword' },
        ratings: { type: 'integer' },
        variations: {
          type: 'nested',
          properties: {
            size: { type: 'keyword' },
            color: { type: 'keyword' },
            price: { type: 'float' },
          },
        },
        reviews: {
          type: 'nested',
          properties: {
            author: { type: 'text' },
            rating: { type: 'integer' },
            comment: { type: 'text' },
          },
        },
      },
    });

    // Empty index for testing
    await this.createIndex('test-empty', {
      properties: {
        field1: { type: 'text' },
        field2: { type: 'keyword' },
      },
    });
  }

  /**
   * Clean up all test indices
   */
  async cleanupTestIndices(): Promise<void> {
    const indices = ['test-simple', 'test-nested', 'test-arrays', 'test-empty'];
    
    for (const index of indices) {
      try {
        await this.deleteIndex(index);
      } catch (error) {
        // Ignore errors during cleanup
        console.log(`Note: Failed to delete index ${index}: ${error}`);
      }
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const osClient = new OpenSearchAPIClient();

export default OpenSearchAPIClient;