import { IRouter } from 'opensearch-dashboards/server';
import { schema } from '@osd/config-schema';
import { errorHandler } from '../lib/error_handler';

// Recursive schema for any JSON value
const jsonValueSchema: any = schema.oneOf([
  schema.string(),
  schema.number(),
  schema.boolean(),
  schema.null(),
  schema.arrayOf(schema.lazy(() => jsonValueSchema)),
  schema.recordOf(schema.string(), schema.lazy(() => jsonValueSchema)),
]);

export function registerDocumentRoutes(router: IRouter) {
  // GET /api/opensearch_index_manager/indices/{index}/documents
  router.get(
    {
      path: '/api/opensearch_index_manager/indices/{index}/documents',
      validate: {
        params: schema.object({
          index: schema.string(),
        }),
        query: schema.object({
          from: schema.number({ defaultValue: 0, min: 0 }),
          size: schema.number({ defaultValue: 20, min: 1, max: 1000 }),
          sort: schema.maybe(schema.string()),
        }),
      },
    },
    async (context, request, response) => {
      try {
        const client = context.core.opensearch.client.asCurrentUser;
        const { index } = request.params;
        const { from, size, sort } = request.query;
        
        const result = await client.search({
          index,
          body: {
            from,
            size,
            sort: sort ? [sort] : undefined,
            query: { match_all: {} },
          },
        });
        
        return response.ok({
          body: {
            total: result.body.hits.total,
            hits: result.body.hits.hits.map((hit: any) => ({
              _id: hit._id,
              _index: hit._index,
              _score: hit._score,
              _source: hit._source,
            })),
          },
        });
      } catch (error) {
        return errorHandler(response, error as any);
      }
    }
  );

  // GET /api/opensearch_index_manager/indices/{index}/documents/{id}
  router.get(
    {
      path: '/api/opensearch_index_manager/indices/{index}/documents/{id}',
      validate: {
        params: schema.object({
          index: schema.string(),
          id: schema.string(),
        }),
      },
    },
    async (context, request, response) => {
      try {
        const client = context.core.opensearch.client.asCurrentUser;
        const { index, id } = request.params;
        
        const result = await client.get({ index, id });
        
        return response.ok({
          body: {
            _id: result.body._id,
            _index: result.body._index,
            _version: result.body._version,
            found: result.body.found,
            _source: result.body._source,
          },
        });
      } catch (error) {
        return errorHandler(response, error as any);
      }
    }
  );

  // POST /api/opensearch_index_manager/indices/{index}/documents
  router.post(
    {
      path: '/api/opensearch_index_manager/indices/{index}/documents',
      validate: {
        params: schema.object({
          index: schema.string(),
        }),
        body: schema.object({
          id: schema.maybe(schema.string()),
          document: schema.recordOf(schema.string(), jsonValueSchema),
        }),
      },
    },
    async (context, request, response) => {
      try {
        const client = context.core.opensearch.client.asCurrentUser;
        const { index } = request.params;
        const { id, document } = request.body;
        
        const result = await client.index({
          index,
          id,
          body: document,
          refresh: 'wait_for',
        });
        
        return response.ok({
          body: {
            _id: result.body._id,
            _index: result.body._index,
            _version: result.body._version,
            result: result.body.result,
          },
        });
      } catch (error) {
        return errorHandler(response, error as any);
      }
    }
  );

  // PUT /api/opensearch_index_manager/indices/{index}/documents/{id}
  router.put(
    {
      path: '/api/opensearch_index_manager/indices/{index}/documents/{id}',
      validate: {
        params: schema.object({
          index: schema.string(),
          id: schema.string(),
        }),
        body: schema.object({
          document: schema.recordOf(schema.string(), jsonValueSchema),
        }),
      },
    },
    async (context, request, response) => {
      try {
        const client = context.core.opensearch.client.asCurrentUser;
        const { index, id } = request.params;
        const { document } = request.body;
        
        const result = await client.index({
          index,
          id,
          body: document,
          refresh: 'wait_for',
        });
        
        return response.ok({
          body: {
            _id: result.body._id,
            _index: result.body._index,
            _version: result.body._version,
            result: result.body.result,
          },
        });
      } catch (error) {
        return errorHandler(response, error as any);
      }
    }
  );

  // DELETE /api/opensearch_index_manager/indices/{index}/documents/{id}
  router.delete(
    {
      path: '/api/opensearch_index_manager/indices/{index}/documents/{id}',
      validate: {
        params: schema.object({
          index: schema.string(),
          id: schema.string(),
        }),
      },
    },
    async (context, request, response) => {
      try {
        const client = context.core.opensearch.client.asCurrentUser;
        const { index, id } = request.params;
        
        const result = await client.delete({
          index,
          id,
          refresh: 'wait_for',
        });
        
        return response.ok({
          body: {
            _id: result.body._id,
            _index: result.body._index,
            _version: result.body._version,
            result: result.body.result,
          },
        });
      } catch (error) {
        return errorHandler(response, error as any);
      }
    }
  );
}
