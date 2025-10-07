import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can go here
    console.log("Token:", req.nextauth.token);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Routes that require authentication
        const protectedRoutes = [
          "/dashboard",
          "/api/applications",
          "/api/documents",
          "/api/share",
        ];

        // Check if the route requires authentication
        const isProtectedRoute = protectedRoutes.some((route) =>
          pathname.startsWith(route)
        );

        // If it's a protected route, require a token
        if (isProtectedRoute) {
          return !!token;
        }

        // Allow all other routes
        return true;
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/applications/:path*",
    "/api/documents/:path*",
    "/api/share/:path*",
  ],
};
