"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(response, error) {
    const statusCode = error.meta?.statusCode || 500;
    const errorType = error.meta?.body?.error?.type || 'unknown_error';
    const errorReason = error.meta?.body?.error?.reason || error.message || 'An unknown error occurred';
    const errorResponse = {
        statusCode,
        error: errorType,
        message: errorReason,
    };
    switch (statusCode) {
        case 404:
            return response.notFound({ body: errorResponse });
        case 409:
            return response.conflict({ body: errorResponse });
        case 400:
            return response.badRequest({ body: errorResponse });
        case 403:
            return response.forbidden({ body: errorResponse });
        default:
            return response.internalError({ body: errorResponse });
    }
}
