"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerIndicesRoutes = registerIndicesRoutes;
const config_schema_1 = require("@osd/config-schema");
const error_handler_1 = require("../lib/error_handler");
function registerIndicesRoutes(router) {
    // GET /api/opensearch_index_manager/indices
    router.get({
        path: '/api/opensearch_index_manager/indices',
        validate: {
            query: config_schema_1.schema.object({
                pattern: config_schema_1.schema.maybe(config_schema_1.schema.string({ defaultValue: '*' })),
            }),
        },
    }, async (context, request, response) => {
        try {
            const client = context.core.opensearch.client.asCurrentUser;
            const { pattern = '*' } = request.query;
            const result = await client.cat.indices({
                index: pattern,
                format: 'json',
                h: 'index,health,status,docs.count,store.size',
            });
            return response.ok({ body: result.body });
        }
        catch (error) {
            return (0, error_handler_1.errorHandler)(response, error);
        }
    });
    // GET /api/opensearch_index_manager/indices/{index}/mapping
    router.get({
        path: '/api/opensearch_index_manager/indices/{index}/mapping',
        validate: {
            params: config_schema_1.schema.object({
                index: config_schema_1.schema.string({
                    validate: (value) => {
                        if (!/^[a-zA-Z0-9_\-*?]+$/.test(value)) {
                            return 'Invalid index name format';
                        }
                    },
                }),
            }),
        },
    }, async (context, request, response) => {
        try {
            const client = context.core.opensearch.client.asCurrentUser;
            const { index } = request.params;
            const result = await client.indices.getMapping({ index });
            return response.ok({ body: result.body });
        }
        catch (error) {
            return (0, error_handler_1.errorHandler)(response, error);
        }
    });
    // GET /api/opensearch_index_manager/indices/{index}/settings
    router.get({
        path: '/api/opensearch_index_manager/indices/{index}/settings',
        validate: {
            params: config_schema_1.schema.object({
                index: config_schema_1.schema.string({
                    validate: (value) => {
                        if (!/^[a-zA-Z0-9_\-*?]+$/.test(value)) {
                            return 'Invalid index name format';
                        }
                    },
                }),
            }),
        },
    }, async (context, request, response) => {
        try {
            const client = context.core.opensearch.client.asCurrentUser;
            const { index } = request.params;
            const result = await client.indices.getSettings({ index });
            return response.ok({ body: result.body });
        }
        catch (error) {
            return (0, error_handler_1.errorHandler)(response, error);
        }
    });
}
