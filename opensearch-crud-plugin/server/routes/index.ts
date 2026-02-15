/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { IRouter, Logger } from 'opensearch-dashboards/server';
import type { CrudPluginConfig } from '../types';
import { API_BASE_PATH } from '../../common';

/**
 * Context passed to route handlers
 */
interface RouteContext {
  logger: Logger;
  config: CrudPluginConfig;
}

/**
 * Registers all HTTP routes for the CRUD plugin.
 *
 * @param router - OpenSearch Dashboards router instance
 * @param context - Route handler context with logger and config
 */
export function registerRoutes(router: IRouter, context: RouteContext): void {
  const { logger, config } = context;

  /**
   * GET /api/crud/entities
   * List entities with pagination, filtering, and sorting.
   */
  router.get(
    {
      path: `${API_BASE_PATH}/entities`,
      validate: {
        // Validation will be added in the full CRUD implementation
      },
    },
    async (routeContext, request, response) => {
      logger.debug('Handling GET /api/crud/entities request');
      
      // Placeholder response - full implementation will be added later
      return response.ok({
        body: {
          entities: [],
          total: 0,
          page: 1,
          pageSize: config.pagination.defaultPageSize,
          hasMore: false,
        },
      });
    }
  );

  /**
   * GET /api/crud/entities/:id
   * Get a single entity by ID.
   */
  router.get(
    {
      path: `${API_BASE_PATH}/entities/{id}`,
      validate: {
        // Validation will be added in the full CRUD implementation
      },
    },
    async (routeContext, request, response) => {
      logger.debug('Handling GET /api/crud/entities/:id request');
      
      // Placeholder response - full implementation will be added later
      return response.notFound({
        body: {
          error: {
            code: 'NOT_FOUND',
            message: 'Entity not found',
          },
        },
      });
    }
  );

  /**
   * POST /api/crud/entities
   * Create a new entity.
   */
  router.post(
    {
      path: `${API_BASE_PATH}/entities`,
      validate: {
        // Validation will be added in the full CRUD implementation
      },
    },
    async (routeContext, request, response) => {
      logger.debug('Handling POST /api/crud/entities request');
      
      // Placeholder response - full implementation will be added later
      return response.ok({
        body: {
          id: 'placeholder-id',
          version: 1,
          attributes: {},
          created_at: new Date().toISOString(),
        },
      });
    }
  );

  /**
   * PUT /api/crud/entities/:id
   * Update an existing entity.
   */
  router.put(
    {
      path: `${API_BASE_PATH}/entities/{id}`,
      validate: {
        // Validation will be added in the full CRUD implementation
      },
    },
    async (routeContext, request, response) => {
      logger.debug('Handling PUT /api/crud/entities/:id request');
      
      // Placeholder response - full implementation will be added later
      return response.notFound({
        body: {
          error: {
            code: 'NOT_FOUND',
            message: 'Entity not found',
          },
        },
      });
    }
  );

  /**
   * DELETE /api/crud/entities/:id
   * Delete an entity by ID.
   */
  router.delete(
    {
      path: `${API_BASE_PATH}/entities/{id}`,
      validate: {
        // Validation will be added in the full CRUD implementation
      },
    },
    async (routeContext, request, response) => {
      logger.debug('Handling DELETE /api/crud/entities/:id request');
      
      // Placeholder response - full implementation will be added later
      return response.noContent();
    }
  );

  /**
   * POST /api/crud/entities/bulk/create
   * Create multiple entities in bulk.
   */
  router.post(
    {
      path: `${API_BASE_PATH}/entities/bulk/create`,
      validate: {
        // Validation will be added in the full CRUD implementation
      },
    },
    async (routeContext, request, response) => {
      logger.debug('Handling POST /api/crud/entities/bulk/create request');
      
      // Placeholder response - full implementation will be added later
      return response.ok({
        body: {
          success: true,
          created: [],
          failed: [],
          totalCreated: 0,
          totalFailed: 0,
        },
      });
    }
  );

  /**
   * PUT /api/crud/entities/bulk/update
   * Update multiple entities in bulk.
   */
  router.put(
    {
      path: `${API_BASE_PATH}/entities/bulk/update`,
      validate: {
        // Validation will be added in the full CRUD implementation
      },
    },
    async (routeContext, request, response) => {
      logger.debug('Handling PUT /api/crud/entities/bulk/update request');
      
      // Placeholder response - full implementation will be added later
      return response.ok({
        body: {
          success: true,
          updated: [],
          failed: [],
          totalUpdated: 0,
          totalFailed: 0,
        },
      });
    }
  );

  /**
   * DELETE /api/crud/entities/bulk/delete
   * Delete multiple entities in bulk.
   */
  router.delete(
    {
      path: `${API_BASE_PATH}/entities/bulk/delete`,
      validate: {
        // Validation will be added in the full CRUD implementation
      },
    },
    async (routeContext, request, response) => {
      logger.debug('Handling DELETE /api/crud/entities/bulk/delete request');
      
      // Placeholder response - full implementation will be added later
      return response.ok({
        body: {
          success: true,
          deleted: [],
          failed: [],
          totalDeleted: 0,
          totalFailed: 0,
        },
      });
    }
  );

  /**
   * POST /api/crud/validate
   * Validate entity data.
   */
  router.post(
    {
      path: `${API_BASE_PATH}/validate`,
      validate: {
        // Validation will be added in the full CRUD implementation
      },
    },
    async (routeContext, request, response) => {
      logger.debug('Handling POST /api/crud/validate request');
      
      // Placeholder response - full implementation will be added later
      return response.ok({
        body: {
          isValid: true,
          errors: [],
        },
      });
    }
  );

  logger.info('All routes registered successfully');
}