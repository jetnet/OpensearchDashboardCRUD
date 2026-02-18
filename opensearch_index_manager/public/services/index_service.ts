import { HttpService } from './http_service';
import { IndexInfo, IndexMapping } from '../../common/types';

export class IndexService {
  constructor(private http: HttpService) {}

  async getIndices(pattern?: string): Promise<IndexInfo[]> {
    return this.http.get('/api/opensearch_index_manager/indices', {
      query: { pattern },
    });
  }

  async getMapping(index: string): Promise<IndexMapping> {
    return this.http.get(`/api/opensearch_index_manager/indices/${index}/mapping`);
  }

  async getSettings(index: string): Promise<Record<string, any>> {
    return this.http.get(`/api/opensearch_index_manager/indices/${index}/settings`);
  }
}
