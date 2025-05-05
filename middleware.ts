import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token, // Only allow if user is authenticated
  },
});

export const config = {
  matcher: [
    "/admin((?!/login).*)", // Protect all /admin routes except /admin/login
  ],
};