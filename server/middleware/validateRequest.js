import { ApiError } from '../utils/ApiError.js';

export function validateRequest(schema, source = 'body') {
  return function requestValidator(request, _response, next) {
    const result = schema.safeParse(request[source]);
    if (!result.success) {
      next(new ApiError(400, result.error.issues[0]?.message || 'Invalid request.', 'VALIDATION_ERROR'));
      return;
    }

    request[source] = result.data;
    next();
  };
}
