import { ApiError, ApiResponse } from '../types/common';

export class ApiException extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

export const createErrorResponse = (
  error: ApiException | Error
): ApiResponse<never> => {
  if (error instanceof ApiException) {
    return {
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
  }

  return {
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: error.message || 'An unexpected error occurred',
    },
  };
};

export const handleApiError = (error: unknown): Response => {
  console.error('API Error:', error);

  if (error instanceof ApiException) {
    return Response.json(createErrorResponse(error), { status: error.status });
  }

  if (error instanceof Error) {
    return Response.json(
      createErrorResponse(
        new ApiException(
          'INTERNAL_SERVER_ERROR',
          error.message,
          500
        )
      ),
      { status: 500 }
    );
  }

  return Response.json(
    createErrorResponse(
      new ApiException(
        'INTERNAL_SERVER_ERROR',
        'An unexpected error occurred',
        500
      )
    ),
    { status: 500 }
  );
}; 