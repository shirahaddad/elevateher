import { z } from 'zod';
import { emailSchema, passwordSchema, nameSchema, phoneSchema, urlSchema, validate } from '../base';

describe('Base Validation Schemas', () => {
  describe('emailSchema', () => {
    it('should validate correct email addresses', () => {
      expect(emailSchema.safeParse('test@example.com').success).toBe(true);
      expect(emailSchema.safeParse('user.name@domain.co.uk').success).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(emailSchema.safeParse('invalid-email').success).toBe(false);
      expect(emailSchema.safeParse('missing@domain').success).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    it('should validate correct passwords', () => {
      expect(passwordSchema.safeParse('ValidPass123!').success).toBe(true);
      expect(passwordSchema.safeParse('ComplexP@ssw0rd').success).toBe(true);
    });

    it('should reject invalid passwords', () => {
      expect(passwordSchema.safeParse('short').success).toBe(false);
      expect(passwordSchema.safeParse('NoNumbers!').success).toBe(false);
      expect(passwordSchema.safeParse('no-uppercase123!').success).toBe(false);
      expect(passwordSchema.safeParse('NO-LOWERCASE123!').success).toBe(false);
    });
  });

  describe('nameSchema', () => {
    it('should validate correct names', () => {
      expect(nameSchema.safeParse('John').success).toBe(true);
      expect(nameSchema.safeParse('Mary-Jane').success).toBe(true);
      expect(nameSchema.safeParse("O'Connor").success).toBe(true);
    });

    it('should reject invalid names', () => {
      expect(nameSchema.safeParse('J').success).toBe(false);
      expect(nameSchema.safeParse('Name123').success).toBe(false);
      expect(nameSchema.safeParse('Name@').success).toBe(false);
    });
  });

  describe('phoneSchema', () => {
    it('should validate correct phone numbers', () => {
      expect(phoneSchema.safeParse('+1234567890').success).toBe(true);
      expect(phoneSchema.safeParse('1234567890').success).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(phoneSchema.safeParse('abc').success).toBe(false);
      expect(phoneSchema.safeParse('123').success).toBe(false);
    });
  });

  describe('urlSchema', () => {
    it('should validate correct URLs', () => {
      expect(urlSchema.safeParse('https://example.com').success).toBe(true);
      expect(urlSchema.safeParse('http://sub.domain.co.uk/path').success).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(urlSchema.safeParse('not-a-url').success).toBe(false);
      expect(urlSchema.safeParse('http://').success).toBe(false);
    });
  });

  describe('validate helper function', () => {
    const testSchema = z.object({
      name: nameSchema,
      email: emailSchema,
    });

    it('should return success for valid data', () => {
      const result = validate(testSchema, {
        name: 'John Doe',
        email: 'john@example.com',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
      });
    });

    it('should return errors for invalid data', () => {
      const result = validate(testSchema, {
        name: 'J',
        email: 'invalid-email',
      });

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });
  });
}); 