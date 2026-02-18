import { IRouter } from "opensearch-dashboards/server";
import { registerIndicesRoutes } from "./indices_routes";
import { registerDocumentRoutes } from "./document_routes";
import { registerSearchRoutes } from "./search_routes";

export function registerRoutes(router: IRouter) {
  registerIndicesRoutes(router);
  registerDocumentRoutes(router);
  registerSearchRoutes(router);
}
