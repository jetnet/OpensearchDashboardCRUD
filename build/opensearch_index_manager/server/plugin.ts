import { PluginInitializerContext, CoreSetup, CoreStart, Plugin, Logger } from 'opensearch-dashboards/server';
import { ConfigType } from '../config';
import { registerRoutes } from './routes';

export class OpenSearchIndexManagerServerPlugin implements Plugin<void, void> {
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext<ConfigType>) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup) {
    this.logger.debug('OpenSearchIndexManagerServerPlugin: Setup');

    const router = core.http.createRouter();
    
    // Register all API routes
    registerRoutes(router);

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('OpenSearchIndexManagerServerPlugin: Start');
    return {};
  }

  public stop() {
    this.logger.debug('OpenSearchIndexManagerServerPlugin: Stop');
  }
}
