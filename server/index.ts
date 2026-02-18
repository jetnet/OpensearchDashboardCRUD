import { PluginInitializerContext } from 'opensearch-dashboards/server';
import { OsdCrudPlugin } from './plugin';

export function plugin(initializerContext: PluginInitializerContext) {
  return new OsdCrudPlugin(initializerContext);
}

export { OsdCrudPluginSetup, OsdCrudPluginStart } from './types';
