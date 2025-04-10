import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { password } = await request.json();
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