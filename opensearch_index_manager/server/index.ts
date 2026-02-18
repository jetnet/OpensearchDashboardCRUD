import { PluginInitializerContext } from "opensearch-dashboards/server";
import { OpenSearchIndexManagerServerPlugin } from "./plugin";
import { ConfigType } from "./config";

export function plugin(
  initializerContext: PluginInitializerContext<ConfigType>
) {
  return new OpenSearchIndexManagerServerPlugin(initializerContext);
}

export { OpenSearchIndexManagerServerPlugin };
