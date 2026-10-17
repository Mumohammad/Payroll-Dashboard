'use client'

import { createBrowserClient } from '@supabase/ssr'
import { getSupabasePublicConfig, supabaseCookieOptions } from './env'

let browserClient: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
  if (browserClient) return browserClient

  const config = getSupabasePublicConfig()
  if (!config) {
    throw new Error('Supabase Auth is not configured for this application.')
  }

  browserClient = createBrowserClient(config.url, config.publishableKey, {
    cookieOptions: supabaseCookieOptions,
  })
  return browserClient
}
