import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes
  const protectedRoutes = ['/dashboard', '/leads', '/calendar', '/employees', '/settings'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // If not authenticated and trying to access protected route -> redirect to login
  if (isProtectedRoute && !user) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  // If authenticated and on login page -> redirect to dashboard
  if (request.nextUrl.pathname === '/login' && user) {
    const url = new URL('/dashboard', request.url);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/leads/:path*',
    '/calendar/:path*',
    '/employees/:path*',
    '/settings/:path*',
    '/login',
  ],
};
