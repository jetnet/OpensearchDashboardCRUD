import { CoreSetup, CoreStart, Plugin, PluginInitializerContext } from 'opensearch-dashboards/server';
import { OsdCrudPluginSetup, OsdCrudPluginStart } from './types';
import { EntityService } from './services/EntityService';
import { defineRoutes } from './routes';

export class OsdCrudPlugin implements Plugin<OsdCrudPluginSetup, OsdCrudPluginStart> {
  constructor(initializerContext: PluginInitializerContext) {}

  public setup(core: CoreSetup): OsdCrudPluginSetup {
    const osClient = core.opensearch.client.asInternalUser;
    const entityService = new EntityService(osClient);

    const router = core.http.createRouter();
    defineRoutes(router, entityService);

    return {};
  }

  public start(core: CoreStart): OsdCrudPluginStart {
    return {};
  }

  public stop() {}
}
