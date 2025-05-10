import { z } from 'zod';
import { NextResponse } from 'next/server';
import { createValidationMiddleware } from './middleware';
import { emailSchema, nameSchema } from './base';

// Example schema for a user registration
const registerUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(8),
  firstName: nameSchema,
  lastName: nameSchema,
  phone: z.string().optional(),
});

// Example of how to use the validation middleware in an API route
export const validateRegisterUser = createValidationMiddleware({
  schema: registerUserSchema,
  onError: (result) => {
    // Custom error handling if needed
    return NextResponse.json({
      success: false,
      errors: result.errors,
      message: 'Registration validation failed',
    }, {
      status: 400,
    });
  },
});

// Example of how to use in a Next.js API route:
/*
import { validateRegisterUser } from '@/lib/validation/example';

export async function POST(req: Request) {
  // Apply validation middleware
  const validationResponse = await validateRegisterUser(req);
  if (validationResponse) {
    return validationResponse;
  }

  // If validation passes, the validated data is available on the request
  const validatedData = (req as any).validatedData;
  
  // Continue with your API logic...
  return NextResponse.json({ success: true, data: validatedData });
}
*/ 