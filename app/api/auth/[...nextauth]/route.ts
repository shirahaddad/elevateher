import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";
import { emailSchema } from "@/lib/validation/base";

// Define the schema for allowed emails
const allowedEmailsSchema = z.array(emailSchema);

// List of allowed admin emails
const allowedEmails = ['shira.haddad@gmail.com', 'cassiedinhmoore@gmail.com'];

// Validate the allowed emails list
const validatedEmails = allowedEmailsSchema.parse(allowedEmails);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
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
export { authOptions };