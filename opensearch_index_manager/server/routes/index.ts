import { IRouter } from "opensearch-dashboards/server";
import { registerIndicesRoutes } from "./indices_routes";
import { registerDocumentRoutes } from "./document_routes";
import { registerSearchRoutes } from "./search_routes";

export function registerRoutes(router: IRouter) {
  // Health check endpoint for CI/CD and monitoring
  router.get(
    { path: "/api/opensearch_index_manager/health", validate: {} },
    async (context, request, response) => {
      return response.ok({ body: { status: "ok" } });
    }
  );

  registerIndicesRoutes(router);
  registerDocumentRoutes(router);
  registerSearchRoutes(router);
}
