"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDocumentRoutes = registerDocumentRoutes;
const config_schema_1 = require("@osd/config-schema");
const error_handler_1 = require("../lib/error_handler");
// Simple document schema that allows any object
const documentSchema = config_schema_1.schema.object({}, { allowUnknowns: true });
function registerDocumentRoutes(router) {
    // GET /api/opensearch_index_manager/indices/{index}/documents
    router.get({
        path: '/api/opensearch_index_manager/indices/{index}/documents',
        validate: {
            params: config_schema_1.schema.object({
                index: config_schema_1.schema.string(),
            }),
            query: config_schema_1.schema.object({
                from: config_schema_1.schema.number({ defaultValue: 0, min: 0 }),
                size: config_schema_1.schema.number({ defaultValue: 20, min: 1, max: 1000 }),
                sort: config_schema_1.schema.maybe(config_schema_1.schema.string()),
            }),
        },
    }, async (context, request, response) => {
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
                    hits: result.body.hits.hits.map((hit) => ({
                        _id: hit._id,
                        _index: hit._index,
                        _score: hit._score,
                        _source: hit._source,
                    })),
                },
            });
        }
        catch (error) {
            return (0, error_handler_1.errorHandler)(response, error);
        }
    });
    // GET /api/opensearch_index_manager/indices/{index}/documents/{id}
    router.get({
        path: '/api/opensearch_index_manager/indices/{index}/documents/{id}',
        validate: {
            params: config_schema_1.schema.object({
                index: config_schema_1.schema.string(),
                id: config_schema_1.schema.string(),
            }),
        },
    }, async (context, request, response) => {
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
        }
        catch (error) {
            return (0, error_handler_1.errorHandler)(response, error);
        }
    });
    // POST /api/opensearch_index_manager/indices/{index}/documents
    router.post({
        path: '/api/opensearch_index_manager/indices/{index}/documents',
        validate: {
            params: config_schema_1.schema.object({
                index: config_schema_1.schema.string(),
            }),
            body: config_schema_1.schema.object({
                id: config_schema_1.schema.maybe(config_schema_1.schema.string()),
                document: documentSchema,
            }),
        },
    }, async (context, request, response) => {
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
        }
        catch (error) {
            return (0, error_handler_1.errorHandler)(response, error);
        }
    });
    // PUT /api/opensearch_index_manager/indices/{index}/documents/{id}
    router.put({
        path: '/api/opensearch_index_manager/indices/{index}/documents/{id}',
        validate: {
            params: config_schema_1.schema.object({
                index: config_schema_1.schema.string(),
                id: config_schema_1.schema.string(),
            }),
            body: config_schema_1.schema.object({
                document: documentSchema,
            }),
        },
    }, async (context, request, response) => {
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
        }
        catch (error) {
            return (0, error_handler_1.errorHandler)(response, error);
        }
    });
    // DELETE /api/opensearch_index_manager/indices/{index}/documents/{id}
    router.delete({
        path: '/api/opensearch_index_manager/indices/{index}/documents/{id}',
        validate: {
            params: config_schema_1.schema.object({
                index: config_schema_1.schema.string(),
                id: config_schema_1.schema.string(),
            }),
        },
    }, async (context, request, response) => {
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
        }
        catch (error) {
            return (0, error_handler_1.errorHandler)(response, error);
        }
    });
}
