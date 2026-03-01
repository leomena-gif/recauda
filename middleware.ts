import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/create-account'];
const SELLER_PATH_PREFIX = '/seller/';
const AUTH_CALLBACK_PREFIX = '/auth/';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not add logic between createServerClient and getUser().
  // This pattern is required by @supabase/ssr for session refresh to work correctly.
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // If auth check fails (e.g. invalid key format), treat as unauthenticated
  }

  const { pathname } = request.nextUrl;

  // Seller portal: token-based auth handled inside the page itself
  if (pathname.startsWith(SELLER_PATH_PREFIX)) {
    return supabaseResponse;
  }

  // Auth callback route: must always be accessible
  if (pathname.startsWith(AUTH_CALLBACK_PREFIX)) {
    return supabaseResponse;
  }

  // Public pages: redirect authenticated users to home
  if (PUBLIC_PATHS.includes(pathname)) {
    if (user) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return supabaseResponse;
  }

  // Protected pages: redirect unauthenticated users to login
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
