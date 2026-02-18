import { OpenSearchDashboardsResponseFactory } from "opensearch-dashboards/server";

interface OpenSearchError {
  meta?: {
    statusCode?: number;
    body?: {
      error?: {
        type?: string;
        reason?: string;
      };
    };
  };
  message?: string;
}

export function errorHandler(
  response: OpenSearchDashboardsResponseFactory,
  error: OpenSearchError
) {
  const statusCode = error.meta?.statusCode || 500;
  const errorType = error.meta?.body?.error?.type || "unknown_error";
  const errorReason =
    error.meta?.body?.error?.reason ||
    error.message ||
    "An unknown error occurred";

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
