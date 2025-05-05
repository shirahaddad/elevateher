import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Only allow specific email addresses (admin allowlist)
      const allowedEmails = ['shira.haddad@gmail.com']; // <-- Replace with your admin email(s)
      return allowedEmails.includes(user.email!);
    },
  },
  pages: {
    signIn: '/admin/login', // Optional: custom login page
    error: '/admin/login',  // Optional: custom error page
  },
});

export { handler as GET, handler as POST };