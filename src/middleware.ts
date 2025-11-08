import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/generate-program", "/profile"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  // FIX #13 (Bug #13): Replaced complex regex with the standard
  // recommended matcher pattern for Next.js App Router.
  matcher: [
    '/((?!.*\\..*|_next).*)', // Matches all routes except static files and _next
    '/',                      // Matches the root route
    '/(api|trpc)(.*)',         // Matches all API routes
  ],
};