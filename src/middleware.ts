import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('journal_session');

  // If session is present and valid, allow access
  if (session?.value === 'authenticated') {
    return NextResponse.next();
  }

  // Otherwise, redirect to login
  const loginUrl = new URL('/login', request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/login (login API route)
     * - login (login page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, manifest.json (public files)
     * - icons (if any)
     */
    '/((?!api/login|login|_next/static|_next/image|favicon.ico|manifest.json|icon-*|apple-touch-icon.*).*)',
  ],
};
