"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenSearchIndexManagerServerPlugin = exports.config = void 0;
exports.plugin = plugin;
const plugin_1 = require("./plugin");
Object.defineProperty(exports, "OpenSearchIndexManagerServerPlugin", {
  enumerable: true,
  get: function () {
    return plugin_1.OpenSearchIndexManagerServerPlugin;
  },
});
const config_1 = require("../config");
exports.config = {
  schema: config_1.configSchema,
};
function plugin(initializerContext) {
  return new plugin_1.OpenSearchIndexManagerServerPlugin(initializerContext);
}
