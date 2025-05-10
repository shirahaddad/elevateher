import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ValidationResult, validate } from './base';

export type ValidationMiddlewareConfig<T> = {
  schema: z.ZodSchema<T>;
  onError?: (errors: ValidationResult<T>) => NextResponse;
};

export const createValidationMiddleware = <T>(config: ValidationMiddlewareConfig<T>) => {
  return async (req: NextRequest) => {
    try {
      let data: unknown;
      
      // Handle different content types
      const contentType = req.headers.get('content-type');
      try {
        if (contentType?.includes('application/json')) {
          data = await req.json();
        } else if (contentType?.includes('multipart/form-data')) {
          const formData = await req.formData();
          data = Object.fromEntries(formData.entries());
        } else {
          data = Object.fromEntries(new URL(req.url).searchParams.entries());
        }
      } catch (error) {
        // If we can't parse the request body, it's an internal error
        console.error('Error parsing request body:', error);
        return NextResponse.json(
          {
            success: false,
            message: 'Internal server error during validation',
          },
          { status: 500 }
        );
      }

      const result = validate(config.schema, data);

      if (!result.success) {
        if (config.onError) {
          return config.onError(result);
        }
        
        return NextResponse.json(
          {
            success: false,
            errors: result.errors,
          },
          { status: 400 }
        );
      }

      // Add validated data to request for use in route handlers
      (req as any).validatedData = result.data;
      
      return null; // Continue to the next middleware/route handler
    } catch (error) {
      console.error('Validation middleware error:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Internal server error during validation',
        },
        { status: 500 }
      );
    }
  };
}; 