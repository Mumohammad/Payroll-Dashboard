import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabasePublicConfig, supabaseCookieOptions } from '@/lib/supabase/env'

function publicOrigin(request: NextRequest) {
  return process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin
}

function loginError(request: NextRequest, code: string) {
  const destination = new URL('/login', publicOrigin(request))
  destination.searchParams.set('error', code)
  return NextResponse.redirect(destination)
}

export async function GET(request: NextRequest) {
  const config = getSupabasePublicConfig()
  if (!config) return loginError(request, 'configuration')

  const cookieStore = await cookies()
  const supabase = createServerClient(config.url, config.publishableKey, {
    cookieOptions: supabaseCookieOptions,
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options)
        })
      },
    },
  })

  const tokenHash = request.nextUrl.searchParams.get('token_hash')
  const type = request.nextUrl.searchParams.get('type')
  const code = request.nextUrl.searchParams.get('code')

  let error: { message: string } | null = null
  if (tokenHash && type === 'invite') {
    const result = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'invite' })
    error = result.error
  } else if (code) {
    const result = await supabase.auth.exchangeCodeForSession(code)
    error = result.error
  } else {
    return loginError(request, 'invite-invalid')
  }

  if (error) return loginError(request, 'invite-invalid')
  return NextResponse.redirect(new URL('/set-password', publicOrigin(request)))
}
