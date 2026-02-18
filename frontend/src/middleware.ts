import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/', '/artists', '/about', '/contact', '/curated', '/presskit'];
const authPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-2fa'];
const dashboardPaths = ['/dashboard'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Agency subdomain detection
  const isAgencyDomain = hostname.startsWith('agency.');

  // If accessing agency subdomain without auth, redirect to login
  if (isAgencyDomain) {
    const isAuthPage = authPaths.some((p) => pathname.startsWith(p));
    const isDashboardPage = dashboardPaths.some((p) => pathname.startsWith(p));
    const isPublicAsset = pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.');

    if (!isAuthPage && !isDashboardPage && !isPublicAsset) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|images|videos|audio|fonts).*)'],
};
