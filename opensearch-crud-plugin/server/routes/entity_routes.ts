/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Entity CRUD routes for the CRUD plugin.
 * Handles single entity operations: create, read, update, delete, list.
 */

import type {
  CrudPluginConfig,
  OpenSearchService,
  ValidationService,
  Filter,
  CreateEntityRequest,
  UpdateEntityRequest,
} from '../types';
import { API_BASE_PATH, ErrorCode } from '../../common';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IRouter = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Logger = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteContext = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Request = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Response = any;

/**
 * Route context containing services and configuration
 */
interface RouteHandlerContext {
  logger: Logger;
  config: CrudPluginConfig;
  openSearchService: OpenSearchService;
  validationService: ValidationService;
}

/**
 * Parse sort string into sort array.
 * Format: "field:direction,field2:direction2"
 * @param sortString - Sort string to parse
 * @returns Array of sort objects
 */
function parseSort(sortString?: string): Array<{ field: string; direction: 'asc' | 'desc' }> {
  if (!sortString) {
    return [];
  }

  return sortString.split(',').map((s) => {
    const parts = s.trim().split(':');
    const field = parts[0]?.trim() ?? '';
    const dir = parts[1]?.trim() ?? 'asc';
    return {
      field,
      direction: (dir as 'asc' | 'desc'),
    };
  });
}

/**
 * Parse filters from JSON string.
 * @param filtersString - JSON string of filters
 * @returns Array of filter objects
 */
function parseFilters(filtersString?: string): Array<{
  field: string;
  operator: string;
  value: unknown;
}> {
  if (!filtersString) {
    return [];
  }

  try {
    return JSON.parse(filtersString);
  } catch {
    return [];
  }
}

/**
 * Get user from request context.
 * Falls back to 'system' if no user is available.
 */
function getUserFromContext(request: Request): string {
  // Try to get user from various headers that might be set by security plugins
  const headers = request.headers as Record<string, string | undefined>;
  const userHeader = headers['x-proxy-user'] ?? headers['x-user'];
  if (userHeader && typeof userHeader === 'string') {
    return userHeader;
  }
  return 'system';
}

/**
 * Register entity CRUD routes.
 * @param router - OpenSearch Dashboards router
 * @param context - Route context with services
 */
export function registerEntityRoutes(router: IRouter, context: RouteHandlerContext): void {
  const { logger, config, openSearchService, validationService } = context;

  /**
   * GET /api/crud/entities
   * List entities with pagination, filtering, and sorting.
   */
  router.get(
    {
      path: `${API_BASE_PATH}/entities`,
      validate: false, // Using query params, validation handled in handler
    },
    async (routeContext: RouteContext, request: Request, response: Response) => {
      logger.debug('Handling GET /api/crud/entities request');

      try {
        // Parse query parameters
        const query = request.query as Record<string, string | undefined>;
        const page = parseInt(query['page'] ?? '1', 10);
        const pageSize = Math.min(
          parseInt(query['pageSize'] ?? String(config.pagination.defaultPageSize), 10),
          config.pagination.maxPageSize
        );

        // Parse and validate pagination
        const paginationValidation = validationService.validatePagination({ page, pageSize });
        if (!paginationValidation.isValid) {
          return response.badRequest({
            body: {
              error: {
                code: ErrorCode.VALIDATION_ERROR,
                message: 'Invalid pagination parameters',
                details: { errors: paginationValidation.errors },
              },
            },
          });
        }

        // Parse and validate sort
        const sort = parseSort(query['sort']);
        const sortValidation = validationService.validateSort(sort);
        if (!sortValidation.isValid) {
          return response.badRequest({
            body: {
              error: {
                code: ErrorCode.VALIDATION_ERROR,
                message: 'Invalid sort parameters',
                details: { errors: sortValidation.errors },
              },
            },
          });
        }

        // Parse and validate filters
        const filters = parseFilters(query['filters']);
        const filtersValidation = validationService.validateFilters(filters);
        if (!filtersValidation.isValid) {
          return response.badRequest({
            body: {
              error: {
                code: ErrorCode.VALIDATION_ERROR,
                message: 'Invalid filter parameters',
                details: { errors: filtersValidation.errors },
              },
            },
          });
        }

        // Execute search
        const searchResult = await openSearchService.searchEntities({
          filters: filters as Filter[],
          sort: sort as Array<{ field: string; direction: 'asc' | 'desc' }>,
          pagination: { page, pageSize },
        });

        return response.ok({
          body: {
            entities: searchResult.entities,
            total: searchResult.total,
            page: searchResult.page,
            pageSize: searchResult.pageSize,
            hasMore: searchResult.hasMore,
          },
        });
      } catch (error) {
        logger.error(`Failed to list entities: ${error}`);
        return response.internalError({
          body: {
            error: {
              code: ErrorCode.INTERNAL_ERROR,
              message: 'Failed to retrieve entities',
            },
          },
        });
      }
    }
  );

  /**
   * GET /api/crud/entities/{id}
   * Get a single entity by ID.
   */
  router.get(
    {
      path: `${API_BASE_PATH}/entities/{id}`,
      validate: false,
    },
    async (routeContext: RouteContext, request: Request, response: Response) => {
      logger.debug('Handling GET /api/crud/entities/:id request');

      try {
        const params = request.params as { id: string };
        const { id } = params;

        // Validate ID
        const idValidation = validationService.validateId(id);
        if (!idValidation.isValid) {
          return response.badRequest({
            body: {
              error: {
                code: ErrorCode.VALIDATION_ERROR,
                message: 'Invalid ID',
                details: { errors: idValidation.errors },
              },
            },
          });
        }

        // Get entity
        const entity = await openSearchService.getEntity(id);

        if (!entity) {
          return response.notFound({
            body: {
              error: {
                code: ErrorCode.NOT_FOUND,
                message: `Entity with ID ${id} not found`,
              },
            },
          });
        }

        return response.ok({
          body: entity,
        });
      } catch (error) {
        logger.error(`Failed to get entity: ${error}`);
        return response.internalError({
          body: {
            error: {
              code: ErrorCode.INTERNAL_ERROR,
              message: 'Failed to retrieve entity',
            },
          },
        });
      }
    }
  );

  /**
   * POST /api/crud/entities
   * Create a new entity.
   */
  router.post(
    {
      path: `${API_BASE_PATH}/entities`,
      validate: false,
    },
    async (routeContext: RouteContext, request: Request, response: Response) => {
      logger.debug('Handling POST /api/crud/entities request');

      try {
        const body = request.body as unknown;

        // Validate entity
        const validation = validationService.validateCreateEntity(body);
        if (!validation.isValid) {
          return response.badRequest({
            body: {
              error: {
                code: ErrorCode.VALIDATION_ERROR,
                message: 'Validation failed',
                details: { errors: validation.errors },
              },
            },
          });
        }

        const user = getUserFromContext(request);
        // Cast to CreateEntityRequest after validation
        const entityData = body as Record<string, unknown>;
        const entity: CreateEntityRequest = {
          title: entityData['title'] as string,
        };
        // Only add optional properties if they exist (for exactOptionalPropertyTypes)
        if (entityData['description'] !== undefined) {
          entity.description = entityData['description'] as string;
        }
        if (entityData['status'] !== undefined) {
          entity.status = entityData['status'] as 'active' | 'inactive' | 'archived';
        }
        if (entityData['priority'] !== undefined) {
          entity.priority = entityData['priority'] as number;
        }
        if (entityData['tags'] !== undefined) {
          entity.tags = entityData['tags'] as string[];
        }

        // Create entity
        const createdEntity = await openSearchService.indexEntity(entity, user);

        return response.ok({
          body: createdEntity,
        });
      } catch (error) {
        logger.error(`Failed to create entity: ${error}`);
        return response.internalError({
          body: {
            error: {
              code: ErrorCode.INTERNAL_ERROR,
              message: 'Failed to create entity',
            },
          },
        });
      }
    }
  );

  /**
   * PUT /api/crud/entities/{id}
   * Update an existing entity.
   */
  router.put(
    {
      path: `${API_BASE_PATH}/entities/{id}`,
      validate: false,
    },
    async (routeContext: RouteContext, request: Request, response: Response) => {
      logger.debug('Handling PUT /api/crud/entities/:id request');

      try {
        const params = request.params as { id: string };
        const { id } = params;
        const body = request.body as unknown;

        // Validate ID
        const idValidation = validationService.validateId(id);
        if (!idValidation.isValid) {
          return response.badRequest({
            body: {
              error: {
                code: ErrorCode.VALIDATION_ERROR,
                message: 'Invalid ID',
                details: { errors: idValidation.errors },
              },
            },
          });
        }

        // Validate update body
        const validation = validationService.validateUpdateEntity(body);
        if (!validation.isValid) {
          return response.badRequest({
            body: {
              error: {
                code: ErrorCode.VALIDATION_ERROR,
                message: 'Validation failed',
                details: { errors: validation.errors },
              },
            },
          });
        }

        const user = getUserFromContext(request);
        // Cast to UpdateEntityRequest after validation
        const updatesData = body as Record<string, unknown>;
        const updates: UpdateEntityRequest = {};
        
        if (updatesData['title'] !== undefined) {
          updates.title = updatesData['title'] as string;
        }
        if (updatesData['description'] !== undefined) {
          updates.description = updatesData['description'] as string;
        }
        if (updatesData['status'] !== undefined) {
          updates.status = updatesData['status'] as 'active' | 'inactive' | 'archived';
        }
        if (updatesData['priority'] !== undefined) {
          updates.priority = updatesData['priority'] as number;
        }
        if (updatesData['tags'] !== undefined) {
          updates.tags = updatesData['tags'] as string[];
        }

        // Update entity
        const updatedEntity = await openSearchService.updateEntity(id, updates, user);

        if (!updatedEntity) {
          return response.notFound({
            body: {
              error: {
                code: ErrorCode.NOT_FOUND,
                message: `Entity with ID ${id} not found`,
              },
            },
          });
        }

        return response.ok({
          body: updatedEntity,
        });
      } catch (error) {
        logger.error(`Failed to update entity: ${error}`);
        return response.internalError({
          body: {
            error: {
              code: ErrorCode.INTERNAL_ERROR,
              message: 'Failed to update entity',
            },
          },
        });
      }
    }
  );

  /**
   * DELETE /api/crud/entities/{id}
   * Delete an entity by ID.
   */
  router.delete(
    {
      path: `${API_BASE_PATH}/entities/{id}`,
      validate: false,
    },
    async (routeContext: RouteContext, request: Request, response: Response) => {
      logger.debug('Handling DELETE /api/crud/entities/:id request');

      try {
        const params = request.params as { id: string };
        const { id } = params;

        // Validate ID
        const idValidation = validationService.validateId(id);
        if (!idValidation.isValid) {
          return response.badRequest({
            body: {
              error: {
                code: ErrorCode.VALIDATION_ERROR,
                message: 'Invalid ID',
                details: { errors: idValidation.errors },
              },
            },
          });
        }

        // Delete entity
        const deleted = await openSearchService.deleteEntity(id);

        if (!deleted) {
          return response.notFound({
            body: {
              error: {
                code: ErrorCode.NOT_FOUND,
                message: `Entity with ID ${id} not found`,
              },
            },
          });
        }

        return response.noContent();
      } catch (error) {
        logger.error(`Failed to delete entity: ${error}`);
        return response.internalError({
          body: {
            error: {
              code: ErrorCode.INTERNAL_ERROR,
              message: 'Failed to delete entity',
            },
          },
        });
      }
    }
  );

  logger.info('Entity routes registered successfully');
}

export default registerEntityRoutes;