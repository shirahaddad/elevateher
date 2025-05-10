import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createValidationMiddleware } from '@/lib/validation/middleware';
import { z } from 'zod';

// Define the schema for admin login
const adminLoginSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

// Create the validation middleware
const validateAdminLogin = createValidationMiddleware({ schema: adminLoginSchema });

export async function POST(req: NextRequest) {
  // Run validation middleware
  const validationResponse = await validateAdminLogin(req);
  if (validationResponse) return validationResponse;

  // Access validated data
  const { password } = (req as any).validatedData;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json(
      { error: 'Admin password not configured' },
      { status: 500 }
    );
  }

  if (password === adminPassword) {
    const response = NextResponse.json({ success: true });
    
    // Set a secure, HTTP-only cookie that expires in 24 hours
    response.cookies.set('admin-auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  }

  return NextResponse.json(
    { error: 'Invalid password' },
    { status: 401 }
  );
} 