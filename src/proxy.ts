import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabasePublicConfig, supabaseCookieOptions } from '@/lib/supabase/env'

function copyCookies(source: NextResponse, target: NextResponse) {
  for (const cookie of source.cookies.getAll()) {
    target.cookies.set(cookie)
  }

  for (const header of ['cache-control', 'expires', 'pragma']) {
    const value = source.headers.get(header)
    if (value) target.headers.set(header, value)
  }

  return target
}

function privateResponse(response: NextResponse) {
  response.headers.set('Cache-Control', 'private, no-store, max-age=0')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  return response
}

function loginRedirect(request: NextRequest, error?: string) {
  const publicOrigin = process.env.NEXT_PUBLIC_SITE_URL
  const destination = publicOrigin
    ? new URL('/login', publicOrigin)
    : request.nextUrl.clone()
  destination.pathname = '/login'
  destination.search = ''
  const next = `${request.nextUrl.pathname}${request.nextUrl.search}`
  if (next !== '/login') destination.searchParams.set('next', next)
  if (error) destination.searchParams.set('error', error)
  return NextResponse.redirect(destination)
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isApi = pathname === '/api' || pathname.startsWith('/api/')
  const isPublic = pathname === '/login' || pathname === '/auth/callback'
  const supabaseConfig = getSupabasePublicConfig()

  if (!supabaseConfig) {
    if (isPublic) return NextResponse.next({ request })
    if (isApi) {
      return NextResponse.json(
        { error: 'Supabase Auth is not configured.' },
        { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
      )
    }
    return loginRedirect(request, 'configuration')
  }

  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    supabaseConfig.url,
    supabaseConfig.publishableKey,
    {
      cookieOptions: supabaseCookieOptions,
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  let claims: Record<string, unknown> | null = null
  let authUnavailable = false
  try {
    const result = await supabase.auth.getClaims()
    claims = result.data?.claims ?? null
    authUnavailable = Boolean(result.error)
  } catch {
    authUnavailable = true
  }

  if (isPublic) {
    if (pathname === '/login' && claims) {
      const origin = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin
      return copyCookies(response, NextResponse.redirect(new URL('/', origin)))
    }
    return response
  }

  if (authUnavailable) {
    if (isApi) {
      return privateResponse(copyCookies(
        response,
        NextResponse.json({ error: 'Authentication service is unavailable.' }, { status: 503 }),
      ))
    }
    return copyCookies(response, loginRedirect(request, 'unavailable'))
  }

  if (!claims) {
    if (isApi) {
      return privateResponse(copyCookies(
        response,
        NextResponse.json({ error: 'Authentication required.' }, { status: 401 }),
      ))
    }
    return copyCookies(response, loginRedirect(request))
  }

  return privateResponse(response)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|map)$).*)',
  ],
}
