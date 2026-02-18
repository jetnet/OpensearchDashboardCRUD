"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSearchRoutes = registerSearchRoutes;
const config_schema_1 = require("@osd/config-schema");
const error_handler_1 = require("../lib/error_handler");
// Simple document schema that allows any object
const querySchema = config_schema_1.schema.object({}, { allowUnknowns: true });
function registerSearchRoutes(router) {
    // POST /api/opensearch_index_manager/indices/{index}/search
    router.post({
        path: '/api/opensearch_index_manager/indices/{index}/search',
        validate: {
            params: config_schema_1.schema.object({
                index: config_schema_1.schema.string(),
            }),
            body: config_schema_1.schema.object({
                query: querySchema,
                from: config_schema_1.schema.maybe(config_schema_1.schema.number({ min: 0 })),
                size: config_schema_1.schema.maybe(config_schema_1.schema.number({ min: 1, max: 1000 })),
                sort: config_schema_1.schema.maybe(config_schema_1.schema.arrayOf(config_schema_1.schema.recordOf(config_schema_1.schema.string(), config_schema_1.schema.any()))),
                _source: config_schema_1.schema.maybe(config_schema_1.schema.oneOf([config_schema_1.schema.boolean(), config_schema_1.schema.arrayOf(config_schema_1.schema.string())])),
                aggs: config_schema_1.schema.maybe(querySchema),
            }),
        },
    }, async (context, request, response) => {
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
                        hits: result.body.hits.hits.map((hit) => ({
                            _id: hit._id,
                            _index: hit._index,
                            _score: hit._score,
                            _source: hit._source,
                        })),
                    },
                    aggregations: result.body.aggregations,
                },
            });
        }
        catch (error) {
            return (0, error_handler_1.errorHandler)(response, error);
        }
    });
    // POST /api/opensearch_index_manager/indices/{index}/query
    router.post({
        path: '/api/opensearch_index_manager/indices/{index}/query',
        validate: {
            params: config_schema_1.schema.object({
                index: config_schema_1.schema.string(),
            }),
            body: config_schema_1.schema.object({
                q: config_schema_1.schema.string(),
                fields: config_schema_1.schema.maybe(config_schema_1.schema.arrayOf(config_schema_1.schema.string())),
                from: config_schema_1.schema.maybe(config_schema_1.schema.number({ min: 0 })),
                size: config_schema_1.schema.maybe(config_schema_1.schema.number({ min: 1, max: 1000 })),
            }),
        },
    }, async (context, request, response) => {
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
                        hits: result.body.hits.hits.map((hit) => ({
                            _id: hit._id,
                            _index: hit._index,
                            _score: hit._score,
                            _source: hit._source,
                        })),
                    },
                },
            });
        }
        catch (error) {
            return (0, error_handler_1.errorHandler)(response, error);
        }
    });
}
