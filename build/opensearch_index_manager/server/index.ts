import { PluginInitializerContext } from 'opensearch-dashboards/server';
import { OpenSearchIndexManagerServerPlugin } from './plugin';
import { configSchema, ConfigType } from '../config';

export const config = {
  schema: configSchema,
};

export function plugin(initializerContext: PluginInitializerContext<ConfigType>) {
  return new OpenSearchIndexManagerServerPlugin(initializerContext);
}

export { OpenSearchIndexManagerServerPlugin };
