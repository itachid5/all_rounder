import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const sessionToken = request.cookies.get('session-token');
  
  if (!token || !sessionToken) {
    // Redirect to the appropriate login page based on the path
    const path = request.nextUrl.pathname;
    
    // Allow access to login pages and static/internal paths without token
    if (
      path === '/platform/login' || 
      path === '/business-login' ||
      path === '/login-pages' ||
      path.startsWith('/_next') ||
      path.startsWith('/api')
    ) {
      return NextResponse.next();
    }

    if (path.startsWith('/platform')) {
      return NextResponse.redirect(new URL('/platform/login', request.url));
    }
    if (path.startsWith('/app')) {
      return NextResponse.redirect(new URL('/business-login', request.url));
    }
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Add cache control to prevent back-button access after logout
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}

export const config = {
  matcher: ['/platform/:path*', '/app/:path*'],
};
