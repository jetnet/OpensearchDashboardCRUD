import { IRouter, IScopedClusterClient } from "opensearch-dashboards/server";

// Server-side plugin context
export interface ServerPluginContext {
  router: IRouter;
}

// Request handler context extension
export interface RequestHandlerContext {
  core: {
    opensearch: {
      client: IScopedClusterClient;
    };
  };
}

// Route handler return types
export type IndexListResponse = Array<{
  index: string;
  health: string;
  status: string;
  "docs.count": string;
  "store.size": string;
}>;
