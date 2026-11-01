import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';

export function notFoundHandler(request, _response, next) {
  next(new ApiError(404, `Route ${request.method} ${request.originalUrl} was not found.`, 'ROUTE_NOT_FOUND'));
}

export function errorHandler(error, _request, response, _next) {
  if (response.headersSent) return;

  let statusCode = error.statusCode || 500;
  let message = error.message || 'An unexpected server error occurred.';
  let code = error.code || 'INTERNAL_SERVER_ERROR';

  if (error.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Request body must contain valid JSON.';
    code = 'INVALID_JSON';
  } else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = 'The supplied identifier is invalid.';
    code = 'INVALID_ID';
  } else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'The case data is invalid.';
    code = 'DATABASE_VALIDATION_ERROR';
  } else if (statusCode >= 500 && !(error instanceof ApiError)) {
    console.error(error);
    message = 'An unexpected server error occurred.';
  }

  response.status(statusCode).json({ error: { code, message } });
}
