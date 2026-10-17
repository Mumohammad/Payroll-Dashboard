import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabasePublicConfig, supabaseCookieOptions } from './env'

export async function createClient() {
  const config = getSupabasePublicConfig()
  if (!config) {
    throw new Error('Supabase Auth is not configured for this application.')
  }

  const cookieStore = await cookies()

  return createServerClient(config.url, config.publishableKey, {
    cookieOptions: supabaseCookieOptions,
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server Components cannot write cookies; src/proxy.ts refreshes them.
        }
      },
    },
  })
}
