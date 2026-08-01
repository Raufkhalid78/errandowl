import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { createServerClient } from '@supabase/ssr'
import { type NextRequest } from 'next/server'

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1. Handle localization
  const response = intlMiddleware(request);

  // 2. Handle Supabase auth session refresh
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieOptions = { ...options, secure: process.env.NODE_ENV === 'production' }
            request.cookies.set(name, value)
          })
          // Apply cookies to the response from intlMiddleware
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieOptions = { ...options, secure: process.env.NODE_ENV === 'production' }
            response.cookies.set(name, value, cookieOptions)
          })
        },
      },
    }
  )

  // This will refresh the session if needed
  await supabase.auth.getUser()

  return response;
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api routes
    // - /_next (Next.js internals)
    // - /_static (inside /public)
    // - all root files inside /public (e.g. /favicon.ico)
    '/((?!api|_next|_static|_vercel|.*\\..*).*)',
    // Match all pathnames within [locale]
    '/(ur|en)/:path*'
  ],
}
