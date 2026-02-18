import { IRouter } from 'opensearch-dashboards/server';
import { schema } from '@osd/config-schema';
import { errorHandler } from '../lib/error_handler';

export function registerIndicesRoutes(router: IRouter) {
  // GET /api/opensearch_index_manager/indices
  router.get(
    {
      path: '/api/opensearch_index_manager/indices',
      validate: {
        query: schema.object({
          pattern: schema.maybe(schema.string({ defaultValue: '*' })),
        }),
      },
    },
    async (context, request, response) => {
      try {
        const client = context.core.opensearch.client.asCurrentUser;
        const { pattern = '*' } = request.query;
        
        const result = await client.cat.indices({
          index: pattern,
          format: 'json',
          h: 'index,health,status,docs.count,store.size',
        });
        
        return response.ok({ body: result.body });
      } catch (error) {
        return errorHandler(response, error);
      }
    }
  );

  // GET /api/opensearch_index_manager/indices/{index}/mapping
  router.get(
    {
      path: '/api/opensearch_index_manager/indices/{index}/mapping',
      validate: {
        params: schema.object({
          index: schema.string({
            validate: (value) => {
              if (!/^[a-zA-Z0-9_\-*?]+$/.test(value)) {
                return 'Invalid index name format';
              }
            },
          }),
        }),
      },
    },
    async (context, request, response) => {
      try {
        const client = context.core.opensearch.client.asCurrentUser;
        const { index } = request.params;
        
        const result = await client.indices.getMapping({ index });
        
        return response.ok({ body: result.body });
      } catch (error) {
        return errorHandler(response, error);
      }
    }
  );

  // GET /api/opensearch_index_manager/indices/{index}/settings
  router.get(
    {
      path: '/api/opensearch_index_manager/indices/{index}/settings',
      validate: {
        params: schema.object({
          index: schema.string({
            validate: (value) => {
              if (!/^[a-zA-Z0-9_\-*?]+$/.test(value)) {
                return 'Invalid index name format';
              }
            },
          }),
        }),
      },
    },
    async (context, request, response) => {
      try {
        const client = context.core.opensearch.client.asCurrentUser;
        const { index } = request.params;
        
        const result = await client.indices.getSettings({ index });
        
        return response.ok({ body: result.body });
      } catch (error) {
        return errorHandler(response, error);
      }
    }
  );
}
