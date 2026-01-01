import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "development-secret-key-for-jwt-tokens-32chars"
);

// Routes that require authentication
const protectedRoutes = [
  "/",
  "/transactions",
  "/accounts",
  "/categories",
  "/settings",
];

// Routes that should redirect to home if already authenticated
const authRoutes = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Verify token if present
  let isValidToken = false;
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      isValidToken = true;
    } catch {
      // Token is invalid or expired
      isValidToken = false;
    }
  }

  // Redirect unauthenticated users trying to access protected routes
  if (isProtectedRoute && !isValidToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && isValidToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (they handle their own auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (icons, manifest, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)",
  ],
};

