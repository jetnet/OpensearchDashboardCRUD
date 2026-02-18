import { IRouter } from 'opensearch-dashboards/server';
import { schema } from '@osd/config-schema';
import { errorHandler } from '../lib/error_handler';

// Schema for any JSON value - using any() for flexibility
const jsonValueSchema = schema.any();

export function registerSearchRoutes(router: IRouter) {
  // POST /api/opensearch_index_manager/indices/{index}/search
  router.post(
    {
      path: '/api/opensearch_index_manager/indices/{index}/search',
      validate: {
        params: schema.object({
          index: schema.string(),
        }),
        body: schema.object({
          query: schema.recordOf(schema.string(), jsonValueSchema),
          from: schema.maybe(schema.number({ min: 0 })),
          size: schema.maybe(schema.number({ min: 1, max: 1000 })),
          sort: schema.maybe(schema.arrayOf(schema.recordOf(schema.string(), schema.any()))),
          _source: schema.maybe(schema.oneOf([schema.boolean(), schema.arrayOf(schema.string())])),
          aggs: schema.maybe(schema.recordOf(schema.string(), jsonValueSchema)),
        }),
      },
    },
    async (context, request, response) => {
      try {
        const client = context.core.opensearch.client.asCurrentUser;
        const { index } = request.params;
        const { query, from, size, sort, _source, aggs } = request.body;
        
        const result = await client.search({
          index,
          body: {
            query,
            from,
            size,
            sort,
            _source,
            aggs,
          },
        });
        
        return response.ok({
          body: {
            took: result.body.took,
            timed_out: result.body.timed_out,
            hits: {
              total: result.body.hits.total,
              max_score: result.body.hits.max_score,
              hits: result.body.hits.hits.map((hit: any) => ({
                _id: hit._id,
                _index: hit._index,
                _score: hit._score,
                _source: hit._source,
              })),
            },
            aggregations: result.body.aggregations,
          },
        });
      } catch (error) {
        return errorHandler(response, error as any);
      }
    }
  );

  // POST /api/opensearch_index_manager/indices/{index}/query
  router.post(
    {
      path: '/api/opensearch_index_manager/indices/{index}/query',
      validate: {
        params: schema.object({
          index: schema.string(),
        }),
        body: schema.object({
          q: schema.string(),
          fields: schema.maybe(schema.arrayOf(schema.string())),
          from: schema.maybe(schema.number({ min: 0 })),
          size: schema.maybe(schema.number({ min: 1, max: 1000 })),
        }),
      },
    },
    async (context, request, response) => {
      try {
        const client = context.core.opensearch.client.asCurrentUser;
        const { index } = request.params;
        const { q, fields, from, size } = request.body;
        
        const result = await client.search({
          index,
          body: {
            query: {
              query_string: {
                query: q,
                fields: fields || ['*'],
              },
            },
            from,
            size,
          },
        });
        
        return response.ok({
          body: {
            took: result.body.took,
            timed_out: result.body.timed_out,
            hits: {
              total: result.body.hits.total,
              max_score: result.body.hits.max_score,
              hits: result.body.hits.hits.map((hit: any) => ({
                _id: hit._id,
                _index: hit._index,
                _score: hit._score,
                _source: hit._source,
              })),
            },
          },
        });
      } catch (error) {
        return errorHandler(response, error as any);
      }
    }
  );
}
