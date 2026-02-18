import { CoreStart, HttpFetchOptions } from "opensearch-dashboards/public";

export class HttpService {
  constructor(private http: CoreStart["http"]) {}

  async get<T>(path: string, options?: HttpFetchOptions): Promise<T> {
    return this.http.get<T>(path, options);
  }

  async post<T>(
    path: string,
    body: any,
    options?: HttpFetchOptions
  ): Promise<T> {
    return this.http.post<T>(path, { body: JSON.stringify(body), ...options });
  }

  async put<T>(
    path: string,
    body: any,
    options?: HttpFetchOptions
  ): Promise<T> {
    return this.http.put<T>(path, { body: JSON.stringify(body), ...options });
  }

  async delete<T>(path: string, options?: HttpFetchOptions): Promise<T> {
    return this.http.delete<T>(path, options);
  }
}
