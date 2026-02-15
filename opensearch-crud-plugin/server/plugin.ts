/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  CoreSetup,
  CoreStart,
  Plugin,
  PluginInitializerContext,
  Logger,
} from 'opensearch-dashboards/server';
import type {
  CrudPluginConfig,
  CrudPluginServerSetup,
  CrudPluginServerSetupDeps,
  CrudPluginServerStart,
  CrudPluginServerStartDeps,
  EntityService,
} from './types';
import { registerRoutes } from './routes';

/**
 * Server-side plugin class for the OpenSearch CRUD Plugin.
 * Implements the OpenSearchDashboardsPlugin interface.
 */
export class CrudPluginServer
  implements
    Plugin<
      CrudPluginServerSetup,
      CrudPluginServerStart,
      CrudPluginServerSetupDeps,
      CrudPluginServerStartDeps
    >
{
  private readonly logger: Logger;
  private readonly config: CrudPluginConfig;
  private entityService?: EntityService;

  constructor(private readonly initializerContext: PluginInitializerContext<CrudPluginConfig>) {
    this.logger = initializerContext.logger.get();
    this.config = initializerContext.config.get();
  }

  /**
   * Setup method called during the setup phase of the plugin lifecycle.
   * Registers routes and initializes services.
   *
   * @param core - Core setup utilities
   * @param deps - Plugin setup dependencies
   * @returns Server setup interface
   */
  public async setup(
    core: CoreSetup<CrudPluginServerStartDeps, CrudPluginServerStart>,
    deps: CrudPluginServerSetupDeps
  ): Promise<CrudPluginServerSetup> {
    this.logger.info('Setting up OpenSearch CRUD Plugin (server)');

    // Register HTTP routes
    const router = core.http.createRouter();
    registerRoutes(router, {
      logger: this.logger,
      config: this.config,
    });

    this.logger.info('Routes registered successfully');

    return {
      logger: this.logger,
      config: this.config,
    };
  }

  /**
   * Start method called during the start phase of the plugin lifecycle.
   * Initializes services and makes them available to other plugins.
   *
   * @param core - Core start utilities
   * @param deps - Plugin start dependencies
   * @returns Server start interface
   */
  public start(
    core: CoreStart,
    deps: CrudPluginServerStartDeps
  ): CrudPluginServerStart {
    this.logger.info('Starting OpenSearch CRUD Plugin (server)');

    // Initialize entity service with OpenSearch client
    // This will be implemented in the full CRUD logic phase
    const getEntityService = (): EntityService => {
      if (!this.entityService) {
        throw new Error('Entity service not initialized');
      }
      return this.entityService;
    };

    return {
      getEntityService,
    };
  }

  /**
   * Stop method called during the stop phase of the plugin lifecycle.
   * Cleans up resources and connections.
   */
  public stop(): void {
    this.logger.info('Stopping OpenSearch CRUD Plugin (server)');
    // Cleanup will be implemented when full CRUD logic is added
    this.entityService = undefined;
  }
}