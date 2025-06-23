import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createValidationMiddleware } from '../middleware';

// Mock NextRequest and NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url, init) => {
    const headers = new Headers(init?.headers);
    let body = init?.body;
    let jsonData: any;
    let formData: FormData | undefined;

    // If body is a string, try to parse it as JSON
    if (typeof body === 'string') {
      try {
        jsonData = JSON.parse(body);
      } catch {
        jsonData = undefined;
      }
    } else if (body instanceof FormData) {
      formData = body;
    }

    return {
      url,
      method: init?.method || 'GET',
      headers,
      json: async () => {
        if (typeof body !== 'string' || body.trim() === '') {
          // Simulate Next.js behavior for empty body: throws an error
          throw new Error('Unexpected end of JSON input');
        }
        try {
          return JSON.parse(body);
        } catch (e) {
          throw new Error('Invalid JSON');
        }
      },
      formData: async () => formData || new FormData(),
      text: async () => typeof body === 'string' ? body : '',
    };
  }),
  NextResponse: {
    json: jest.fn().mockImplementation((data, init) => ({
      status: init?.status || 200,
      json: async () => data,
    })),
  },
}));

describe('Validation Middleware', () => {
  const testSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
  });

  const middleware = createValidationMiddleware({
    schema: testSchema,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate JSON data', async () => {
    const req = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
      }),
    });

    const response = await middleware(req);
    expect(response).toBeNull();
    expect((req as any).validatedData).toEqual({
      name: 'John Doe',
      email: 'john@example.com',
    });
  });

  it('should validate form data', async () => {
    const formData = new FormData();
    formData.append('name', 'John Doe');
    formData.append('email', 'john@example.com');

    const req = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const response = await middleware(req);
    expect(response).toBeNull();
    expect((req as any).validatedData).toEqual({
      name: 'John Doe',
      email: 'john@example.com',
    });
  });

  it('should validate query parameters', async () => {
    const req = new NextRequest('http://localhost:3000/api/test?name=John%20Doe&email=john@example.com', {
      method: 'GET',
    });

    const response = await middleware(req);
    expect(response).toBeNull();
    expect((req as any).validatedData).toEqual({
      name: 'John Doe',
      email: 'john@example.com',
    });
  });

  it('should return error for invalid data', async () => {
    const req = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'J', // Too short
        email: 'invalid-email',
      }),
    });

    const response = await middleware(req);
    expect(response).not.toBeNull();
    expect(response?.status).toBe(400);
    
    const responseData = await response?.json();
    expect(responseData.success).toBe(false);
    expect(responseData.errors).toBeDefined();
    expect(responseData.errors.length).toBeGreaterThan(0);
  });

  it('should use custom error handler when provided', async () => {
    const customMiddleware = createValidationMiddleware({
      schema: testSchema,
      onError: (result) => {
        return NextResponse.json({
          custom: true,
          errors: result.errors,
        }, { status: 422 });
      },
    });

    const req = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'J',
        email: 'invalid-email',
      }),
    });

    const response = await customMiddleware(req);
    expect(response).not.toBeNull();
    expect(response?.status).toBe(422);
    
    const responseData = await response?.json();
    expect(responseData.custom).toBe(true);
    expect(responseData.errors).toBeDefined();
  });

  it('should handle internal errors gracefully', async () => {
    // Suppress console.error for this specific test, as we expect it to be called
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const req = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'invalid json',
    });

    const response = await middleware(req);
    expect(response).not.toBeNull();
    expect(response?.status).toBe(500);
    
    const responseData = await response?.json();
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('Internal server error during validation');

    // Restore the original console.error function
    consoleErrorSpy.mockRestore();
  });
}); 