import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Public pages must stay accessible on agency domain.
  // Dashboard access control is handled client-side in the dashboard layout.
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|images|videos|audio|fonts).*)'],
};
