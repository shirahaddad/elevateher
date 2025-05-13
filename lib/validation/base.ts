import { z } from 'zod';
import { TEAM } from '../team';

// Common validation patterns
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format');

export const urlSchema = z
  .string()
  .url('Invalid URL format');

// Common validation error types
export type ValidationError = {
  field: string;
  message: string;
};

export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
};

// Helper function to format Zod errors into our standard format
export const formatZodError = (error: z.ZodError): ValidationError[] => {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
};

// Helper function to validate data against a schema
export const validate = <T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> => {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: formatZodError(error),
      };
    }
    throw error;
  }
};

export const authorNameSchema = z.string().min(1, 'Author name is required');

// Blog post creation schema
export const createBlogPostSchema = z.object({
  title: z.string().min(3, 'Title is required and must be at least 3 characters'),
  content: z.string().min(10, 'Content is required and must be at least 10 characters'),
  excerpt: z.string().optional(),
  author_name: authorNameSchema,
  slug: z.string().min(3, 'Slug is required and must be at least 3 characters'),
  is_published: z.boolean().optional(),
  tags: z.array(z.coerce.string().min(1, 'Tag ID cannot be empty')).optional(),
  image_url: z.string().min(1, 'Image URL is required').optional(),
  image_alt: z.string().max(100, 'Image alt text must be at most 100 characters').optional(),
});

// Blog post update schema
export const updateBlogPostSchema = z.object({
  title: z.string().min(3).optional(),
  content: z.string().min(10).optional(),
  excerpt: z.string().optional(),
  author_name: authorNameSchema.optional(),
  slug: z.string().min(3).optional(),
  is_published: z.boolean().optional(),
  tags: z.array(z.coerce.string().min(1, 'Tag ID cannot be empty')).optional(),
  image_url: z.string().min(1, 'Image URL is required').optional(),
  image_alt: z.string().max(100, 'Image alt text must be at most 100 characters').optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'At least one field to update must be provided',
    path: [],
  }
);

// Blog search/filter query schema (no 'search' field)
export const blogSearchQuerySchema = z.object({
  tag: z.string().optional(),
  is_published: z.union([z.boolean(), z.enum(['true', 'false'])]).optional(),
  author: z.string().optional(),
}); 