import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  
  if (!token) {
    // Redirect to the appropriate login page based on the path
    const path = request.nextUrl.pathname;
    
    // Allow access to login pages and static/internal paths without token
    if (
      path === '/platform/login' || 
      path === '/app/login' ||
      path.startsWith('/_next') ||
      path.startsWith('/api')
    ) {
      return NextResponse.next();
    }

    if (path.startsWith('/platform')) {
      return NextResponse.redirect(new URL('/platform/login', request.url));
    }
    if (path.startsWith('/app')) {
      return NextResponse.redirect(new URL('/app/login', request.url));
    }
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/platform/:path*', '/app/:path*'],
};
