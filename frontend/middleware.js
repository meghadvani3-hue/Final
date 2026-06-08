import { NextResponse } from 'next/server';

export function middleware(request) {
  // Retrieve token from cookies
  const token = request.cookies.get('companion_token')?.value;
  const { pathname } = request.nextUrl;

  // Check if requested path starts with protected prefixes
  const isProtected = 
    pathname.startsWith('/bookings') || 
    pathname.startsWith('/chat') || 
    pathname.startsWith('/dashboard');

  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    // Pass target pathname as a redirect query parameter for post-login redirection
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configuration to optimize middleware execution scope
export const config = {
  matcher: [
    '/bookings/:path*',
    '/chat/:path*',
    '/dashboard/:path*',
  ],
};
