import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { createValidationMiddleware } from '@/lib/validation/middleware';
import { emailSchema, nameSchema } from '@/lib/validation/base';

// Define the schema for this endpoint
const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: nameSchema,
  lastName: nameSchema,
});

// Create the validation middleware
const validateRegister = createValidationMiddleware({ schema: registerSchema });

export async function POST(req: NextRequest) {
  // Run validation middleware
  const validationResponse = await validateRegister(req);
  if (validationResponse) return validationResponse;

  // Access validated data
  const validatedData = (req as any).validatedData;

  // Example: return the validated data (never do this with real passwords!)
  return NextResponse.json({
    success: true,
    message: 'Validation passed!',
    data: validatedData,
  });
} 