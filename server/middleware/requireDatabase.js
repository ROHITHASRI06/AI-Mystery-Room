import { isDatabaseConnected } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';

export function requireDatabase(_request, _response, next) {
  if (!isDatabaseConnected()) {
    next(new ApiError(503, 'The database is unavailable. Please try again later.', 'DATABASE_UNAVAILABLE'));
    return;
  }

  next();
}
