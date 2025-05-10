/**
 * Validation Middleware for Next.js API Routes
 *
 * This middleware provides a reusable way to validate incoming API requests using Zod schemas.
 * It supports JSON, multipart/form-data, and query parameter parsing, and returns standardized error responses.
 *
 * Usage:
 *
 *   import { z } from 'zod';
 *   import { createValidationMiddleware } from '@/lib/validation/middleware';
 *
 *   // Define your schema
 *   const mySchema = z.object({
 *     email: z.string().email(),
 *     password: z.string().min(8),
 *   });
 *
 *   // Create the middleware
 *   const validateMyRequest = createValidationMiddleware({ schema: mySchema });
 *
 *   // In your API route:
 *   export async function POST(req: Request) {
 *     const validationResponse = await validateMyRequest(req);
 *     if (validationResponse) return validationResponse;
 *     const validatedData = (req as any).validatedData;
 *     // ... your logic ...
 *   }
 *
 * You can also provide a custom error handler via the `onError` option.
 *
 * Best Practices:
 * - Always define strict Zod schemas for your API inputs.
 * - Use the middleware at the top of your API route handler.
 * - Handle validation errors gracefully and log them if needed.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ValidationResult, validate } from './base';

export type ValidationMiddlewareConfig<T> = {
  /**
   * Zod schema to validate the request data against
   */
  schema: z.ZodSchema<T>;
  /**
   * Optional custom error handler. Receives the validation result and returns a NextResponse.
   */
  onError?: (errors: ValidationResult<T>) => NextResponse;
};

/**
 * Creates a validation middleware for Next.js API routes.
 * @param config - Validation schema and optional error handler
 * @returns Middleware function to use in your API route
 */
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