import { HttpService } from "./http_service";
import {
  Document,
  DocumentListResponse,
  SearchRequest,
  SearchResponse,
} from "../../common/types";

export class DocumentService {
  constructor(private http: HttpService) {}

  async getDocuments(
    index: string,
    options: { from?: number; size?: number; sort?: string }
  ): Promise<DocumentListResponse> {
    return this.http.get(
      `/api/opensearch_index_manager/indices/${index}/documents`,
      {
        query: options,
      }
    );
  }

  async getDocument(index: string, id: string): Promise<Document> {
    return this.http.get(
      `/api/opensearch_index_manager/indices/${index}/documents/${id}`
    );
  }

  async createDocument(
    index: string,
    document: Record<string, any>,
    id?: string
  ): Promise<Document> {
    return this.http.post(
      `/api/opensearch_index_manager/indices/${index}/documents`,
      {
        document,
        id,
      }
    );
  }

  async updateDocument(
    index: string,
    id: string,
    document: Record<string, any>
  ): Promise<Document> {
    return this.http.put(
      `/api/opensearch_index_manager/indices/${index}/documents/${id}`,
      {
        document,
      }
    );
  }

  async deleteDocument(index: string, id: string): Promise<void> {
    return this.http.delete(
      `/api/opensearch_index_manager/indices/${index}/documents/${id}`
    );
  }

  async search(index: string, request: SearchRequest): Promise<SearchResponse> {
    return this.http.post(
      `/api/opensearch_index_manager/indices/${index}/search`,
      request
    );
  }
}
