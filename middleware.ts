import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Routes that require authentication (user routes only)
// Note: /admin has its own authentication handled by its layout
const protectedRoutes = ['/home', '/search', '/library', '/profile', '/premium'];

// Routes that should redirect authenticated users
const authRoutes = ['/login', '/register', '/forgot-password'];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if route is auth (login/register)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && user) {
    const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/home';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Note: Admin routes are handled by src/app/admin/layout.tsx
  // which redirects to /admin/login if not authenticated as admin

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (icons, manifest, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|workbox-.*).*)',
  ],
};
