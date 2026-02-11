import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";
import { emailSchema } from "@/lib/validation/base";

// Required for Google OAuth – add these to .env.local (see .env.example)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error(
    "[NextAuth] Missing Google OAuth env vars. Add to .env.local:\n" +
      "  GOOGLE_CLIENT_ID=...\n" +
      "  GOOGLE_CLIENT_SECRET=...\n" +
      "  NEXTAUTH_SECRET=...  (required by NextAuth)\n" +
      "  NEXTAUTH_URL=http://localhost:3000  (for local dev)"
  );
}

// Define the schema for allowed emails
const allowedEmailsSchema = z.array(emailSchema);

// List of allowed admin emails
const allowedEmails = ['shira.haddad@gmail.com', 'cassiedinhmoore@gmail.com'];

// Validate the allowed emails list
const validatedEmails = allowedEmailsSchema.parse(allowedEmails);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID || "",
      clientSecret: GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      // Validate the user's email against the allowed list
      if (!user.email) return false;
      
      try {
        // Validate email format
        emailSchema.parse(user.email);
        // Check if email is in allowed list
        return validatedEmails.includes(user.email);
      } catch (error) {
        console.error('Email validation error:', error);
        return false;
      }
    },
  },
  pages: {
    signIn: '/admin/login', // Optional: custom login page
    error: '/admin/login',  // Optional: custom error page
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };