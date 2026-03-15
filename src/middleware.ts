import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/listings', '/qr', '/analytics', '/leads', '/billing', '/settings'];

// Routes only for unauthenticated users (redirect to dashboard if logged in)
const AUTH_ROUTES = ['/auth/login', '/auth/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth token in cookies (we set this as httpOnly cookie on login)
  // Note: we can't read localStorage in middleware (server-side), so we use a cookie flag
  const authCookie = request.cookies.get('qr_estate_auth');
  const isAuthenticated = !!authCookie?.value;

  // Redirect authenticated users away from auth pages
  if (AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protect dashboard and app routes
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/listings/:path*',
    '/qr/:path*',
    '/analytics/:path*',
    '/leads/:path*',
    '/billing/:path*',
    '/settings/:path*',
    '/auth/:path*',
  ],
};
