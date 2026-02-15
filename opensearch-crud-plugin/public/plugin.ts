/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { CoreSetup, CoreStart, Plugin, PluginInitializerContext } from 'opensearch-dashboards/public';
import type {
  CrudPluginSetup,
  CrudPluginSetupDeps,
  CrudPluginStart,
  CrudPluginStartDeps,
  EntityService,
  ValidationService,
} from './types';
import { API_BASE_PATH } from '../common';

/**
 * Client-side plugin class for the OpenSearch CRUD Plugin.
 * Implements the OpenSearchDashboardsPlugin interface.
 */
export class CrudPluginClient
  implements Plugin<CrudPluginSetup, CrudPluginStart, CrudPluginSetupDeps, CrudPluginStartDeps>
{
  private readonly logger: {
    debug: (message: string) => void;
    info: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
  };

  constructor(private readonly initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  /**
   * Setup method called during the setup phase of the plugin lifecycle.
   * Registers the application and initializes services.
   *
   * @param core - Core setup utilities
   * @param deps - Plugin setup dependencies
   * @returns Client setup interface
   */
  public async setup(
    core: CoreSetup<CrudPluginStartDeps, CrudPluginStart>,
    deps: CrudPluginSetupDeps
  ): Promise<CrudPluginSetup> {
    this.logger.info('Setting up OpenSearch CRUD Plugin (client)');

    // Register the CRUD application
    core.application.register({
      id: 'opensearchCrudPlugin',
      title: 'CRUD Plugin',
      category: {
        id: 'opensearch',
        label: 'OpenSearch Plugins',
        order: 2000,
      },
      description: 'A feature-rich CRUD plugin for entity management',
      icon: 'indexManagementApp',
      async mount(params) {
        const { renderApp } = await import('./applications/crud/main');
        return renderApp(params);
      },
    });

    this.logger.info('Application registered successfully');

    return {
      logger: this.logger,
    };
  }

  /**
   * Start method called during the start phase of the plugin lifecycle.
   * Exposes services to other plugins and components.
   *
   * @param core - Core start utilities
   * @param deps - Plugin start dependencies
   * @returns Client start interface
   */
  public start(
    core: CoreStart,
    deps: CrudPluginStartDeps
  ): CrudPluginStart {
    this.logger.info('Starting OpenSearch CRUD Plugin (client)');

    // Create entity service with HTTP client
    const entityService: EntityService = {
      createEntity: async (data) => {
        const response = await core.http.post(`${API_BASE_PATH}/entities`, {
          body: JSON.stringify(data),
        });
        return response as import('./types').Entity;
      },
      getEntity: async (id) => {
        const response = await core.http.get(`${API_BASE_PATH}/entities/${id}`);
        return response as import('./types').Entity;
      },
      listEntities: async (params) => {
        const response = await core.http.get(`${API_BASE_PATH}/entities`, {
          query: params,
        });
        return response as {
          entities: import('./types').Entity[];
          total: number;
          page: number;
          pageSize: number;
          hasMore: boolean;
        };
      },
      updateEntity: async (id, data) => {
        const response = await core.http.put(`${API_BASE_PATH}/entities/${id}`, {
          body: JSON.stringify(data),
        });
        return response as import('./types').Entity;
      },
      deleteEntity: async (id) => {
        await core.http.delete(`${API_BASE_PATH}/entities/${id}`);
      },
      bulkCreate: async (entities) => {
        const response = await core.http.post(`${API_BASE_PATH}/entities/bulk/create`, {
          body: JSON.stringify({ entities }),
        });
        return response as {
          success: boolean;
          created: Array<{ id: string; status: string }>;
          failed: Array<{ index: number; error: string }>;
          totalCreated: number;
          totalFailed: number;
        };
      },
      bulkUpdate: async (updates) => {
        const response = await core.http.put(`${API_BASE_PATH}/entities/bulk/update`, {
          body: JSON.stringify({ updates }),
        });
        return response as {
          success: boolean;
          updated: Array<{ id: string; status: string }>;
          failed: Array<{ index: number; error: string }>;
          totalUpdated: number;
          totalFailed: number;
        };
      },
      bulkDelete: async (ids) => {
        const response = await core.http.delete(`${API_BASE_PATH}/entities/bulk/delete`, {
          body: JSON.stringify({ ids }),
        });
        return response as {
          success: boolean;
          deleted: string[];
          failed: Array<{ id: string; error: string }>;
          totalDeleted: number;
          totalFailed: number;
        };
      },
    };

    // Create validation service
    const validationService: ValidationService = {
      validateEntity: async (data) => {
        const response = await core.http.post(`${API_BASE_PATH}/validate`, {
          body: JSON.stringify(data),
        });
        return response as {
          isValid: boolean;
          errors: Array<{ field: string; message: string; code: string }>;
        };
      },
      validateBulk: async (entities) => {
        const response = await core.http.post(`${API_BASE_PATH}/validate/bulk`, {
          body: JSON.stringify({ entities }),
        });
        return response as Array<{
          isValid: boolean;
          errors: Array<{ field: string; message: string; code: string }>;
        }>;
      },
    };

    return {
      entityService,
      validationService,
    };
  }

  /**
   * Stop method called during the stop phase of the plugin lifecycle.
   * Cleans up resources.
   */
  public stop(): void {
    this.logger.info('Stopping OpenSearch CRUD Plugin (client)');
    // Cleanup will be implemented when full CRUD logic is added
  }
}