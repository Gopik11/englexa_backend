import {
  ApiResponse,
  errorResponse,
} from '../dto/api-response.dto';

/** Normalized success envelope used by all controllers. */
export function normalizeResponse<T>(
  data: T,
  message = 'ok',
): ApiResponse<T> {
  return {
    success: true,
    status: 'ok',
    data,
    message,
    error: null,
    timestamp: new Date().toISOString(),
  };
}

export function normalizeErrorResponse(
  code: string,
  message: string,
  details?: unknown,
): ApiResponse<null> {
  return errorResponse(code, message, details);
}
