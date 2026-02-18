import { IRouter } from 'opensearch-dashboards/server';
import { schema } from '@osd/config-schema';
import { EntityService } from '../services/EntityService';

export function defineRoutes(router: IRouter, entityService: EntityService) {
  router.get(
    {
      path: '/api/osd_crud/entities',
      validate: false,
    },
    async (context, request, response) => {
      try {
        const data = await entityService.getEntities();
        return response.ok({
          body: {
            total: data.length,
            data,
          },
        });
      } catch (error: any) {
        return response.internalError({
          body: error.message,
        });
      }
    }
  );

  router.post(
    {
      path: '/api/osd_crud/entities',
      validate: {
        body: schema.object({
          name: schema.string(),
          description: schema.maybe(schema.string()),
          type: schema.string(),
        }),
      },
    },
    async (context, request, response) => {
      try {
        const data = await entityService.createEntity(request.body);
        return response.ok({
          body: {
            data,
          },
        });
      } catch (error: any) {
        return response.internalError({
          body: error.message,
        });
      }
    }
  );

  router.put(
    {
      path: '/api/osd_crud/entities/{id}',
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        body: schema.object({
          name: schema.maybe(schema.string()),
          description: schema.maybe(schema.string()),
          type: schema.maybe(schema.string()),
        }),
      },
    },
    async (context, request, response) => {
      try {
        const { id } = request.params;
        await entityService.updateEntity(id, request.body);
        return response.ok({
          body: {
            success: true,
          },
        });
      } catch (error: any) {
        return response.internalError({
          body: error.message,
        });
      }
    }
  );

  router.delete(
    {
      path: '/api/osd_crud/entities/{id}',
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    async (context, request, response) => {
      try {
        const { id } = request.params;
        await entityService.deleteEntity(id);
        return response.ok({
          body: {
            success: true,
            id,
          },
        });
      } catch (error: any) {
        return response.internalError({
          body: error.message,
        });
      }
    }
  );
}
