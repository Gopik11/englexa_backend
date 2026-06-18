export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  status: 'ok' | 'error';
  data: T | null;
  message: string;
  error: ApiError | null;
  timestamp: string;
}

export function successResponse<T>(data: T, message = ''): ApiResponse<T> {
  return {
    success: true,
    status: 'ok',
    data,
    message,
    error: null,
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse(
  code: string,
  message: string,
  details?: unknown,
): ApiResponse<null> {
  return {
    success: false,
    status: 'error',
    data: null,
    message,
    error: { code, message, details },
    timestamp: new Date().toISOString(),
  };
}
