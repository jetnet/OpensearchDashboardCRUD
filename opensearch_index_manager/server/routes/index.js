"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const indices_routes_1 = require("./indices_routes");
const document_routes_1 = require("./document_routes");
const search_routes_1 = require("./search_routes");
function registerRoutes(router) {
  (0, indices_routes_1.registerIndicesRoutes)(router);
  (0, document_routes_1.registerDocumentRoutes)(router);
  (0, search_routes_1.registerSearchRoutes)(router);
}
