import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    // Structural placeholder check (NOT cryptographic authentication).
    // In production, real auth must verify token signature/expiry, and
    // Server Actions/route handlers under /admin must independently re-validate credentials.
    const sessionToken =
      request.cookies.get('sm_session')?.value || request.cookies.get('token')?.value;
    const authRequired = process.env.AUTH_REQUIRED === 'true';

    if (authRequired && !sessionToken) {
      // /login is currently out of scope; redirection will 404 if AUTH_REQUIRED is enabled without /login.
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Can be expanded to ['/admin/:path*', '/api/admin/:path*'] when administrative APIs are added
  matcher: ['/admin/:path*'],
};
