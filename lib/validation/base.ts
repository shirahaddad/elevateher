/**
 * Base validation schemas and utilities for the application.
 * This module provides common validation patterns and helper functions for data validation.
 */

import { z } from 'zod';
import { TEAM } from '../team';

/**
 * Common validation patterns
 */

/**
 * Email validation schema
 * Validates that a string is a properly formatted email address
 */
export const emailSchema = z.string().email('Invalid email address');

/**
 * Password validation schema
 * Enforces password requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

/**
 * Name validation schema
 * Validates that a name:
 * - Is between 2 and 50 characters
 * - Contains only letters, spaces, hyphens, and apostrophes
 */
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

/**
 * Phone number validation schema
 * Validates international phone number format
 */
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format');

/**
 * URL validation schema
 * Validates that a string is a properly formatted URL
 */
export const urlSchema = z
  .string()
  .url('Invalid URL format');

/**
 * Common validation error types
 */

/**
 * Represents a single validation error with field name and error message
 */
export type ValidationError = {
  field: string;
  message: string;
};

/**
 * Represents the result of a validation operation
 * @template T The type of the validated data
 */
export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
};

/**
 * Formats Zod validation errors into the application's standard error format
 * @param error - The Zod error to format
 * @returns Array of formatted validation errors
 */
export const formatZodError = (error: z.ZodError): ValidationError[] => {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
};

/**
 * Validates data against a Zod schema
 * @template T The type of the data to validate
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns Validation result containing either the validated data or error messages
 */
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

/**
 * Author name validation schema
 * Requires at least one character
 */
export const authorNameSchema = z.string().min(1, 'Author name is required');

/**
 * Schema for creating a new blog post
 * Validates all required and optional fields for blog post creation
 */
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

/**
 * Schema for updating an existing blog post
 * All fields are optional, but at least one field must be provided
 */
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

/**
 * Schema for blog post search and filtering
 * Validates query parameters for searching and filtering blog posts
 */
export const blogSearchQuerySchema = z.object({
  tag: z.string().optional(),
  is_published: z.union([z.boolean(), z.enum(['true', 'false'])]).optional(),
  author: z.string().optional(),
}); 

/**
 * File upload validation schema
 * Validates file uploads for:
 * - Required image file
 * - File type (images only)
 * - File size (max 5MB)
 */
export const fileUploadSchema = z.object({
  filename: z.string().min(1),
  mimetype: z.string().refine((val) => ['image/jpeg', 'image/png', 'image/webp'].includes(val), {
    message: 'Unsupported file type',
  }),
  size: z.number().max(5 * 1024 * 1024, { message: 'File size must be less than 5MB' }), // Max 5MB
});

/**
 * Learn More form validation schema
 * Validates the learn more form submission data
 */
export const learnMoreFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  mailingList: z.boolean().default(false),
  // Honeypot field for spam prevention - must be empty
  website: z.string().max(0).optional(),
});

/**
 * Questionnaire form validation schema
 * Validates the questionnaire form submission data
 */
export const questionnaireFormSchema = z.object({
  client_name: nameSchema,
  email: emailSchema,
  goals: z.string().min(1, 'Please tell us about your goals'),
  skills: z.array(z.string()),
  otherSkill: z.string().optional(),
  timeCommitment: z.enum(['yes', 'no', 'maybe'], {
    errorMap: () => ({ message: 'Please select a valid time commitment option' })
  }),
  linkedin: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
  additionalInfo: z.string().optional(),
  mailingList: z.boolean().default(false),
  source: z.string().optional(),
  website: z.string().max(0).optional(), // Honeypot field for spam prevention
}).refine(
  (data) => {
    // If "Other" is selected, otherSkill must be filled
    if (data.skills.includes('Other')) {
      return data.otherSkill && data.otherSkill.length > 0;
    }
    return true;
  },
  {
    message: 'Please specify your other skill',
    path: ['otherSkill']
  }
);