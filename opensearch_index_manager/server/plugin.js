"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenSearchIndexManagerServerPlugin = void 0;
const routes_1 = require("./routes");
class OpenSearchIndexManagerServerPlugin {
  constructor(initializerContext) {
    this.logger = initializerContext.logger.get();
  }
  setup(core) {
    this.logger.debug("OpenSearchIndexManagerServerPlugin: Setup");
    const router = core.http.createRouter();
    // Register all API routes
    (0, routes_1.registerRoutes)(router);
    return {};
  }
  start(core) {
    this.logger.debug("OpenSearchIndexManagerServerPlugin: Start");
    return {};
  }
  stop() {
    this.logger.debug("OpenSearchIndexManagerServerPlugin: Stop");
  }
}
exports.OpenSearchIndexManagerServerPlugin = OpenSearchIndexManagerServerPlugin;
