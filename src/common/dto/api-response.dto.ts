export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
}

export function successResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data, error: null };
}

export function errorResponse(
  code: string,
  message: string,
  details?: unknown,
): ApiResponse<null> {
  return {
    success: false,
    data: null,
    error: { code, message, details },
  };
}
