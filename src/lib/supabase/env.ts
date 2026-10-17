export type SupabasePublicConfig = {
  url: string
  publishableKey: string
}

const publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
const isPublicHttps = publicSiteUrl.startsWith('https://')

export const supabaseCookieOptions = {
  sameSite: isPublicHttps ? ('none' as const) : ('lax' as const),
  secure: isPublicHttps,
}

export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !publishableKey) return null

  return { url, publishableKey }
}
