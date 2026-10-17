import type { Metadata } from 'next'
import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Sign in · Nokhaba Payroll',
  description: 'Sign in to the invite-only Nokhaba Payroll & Operations workspace.',
  robots: { index: false, follow: false },
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const initialMessage = error === 'configuration'
    ? 'Supabase Auth is not configured yet. Ask your administrator to finish setup.'
    : error === 'unavailable'
      ? 'The authentication service is unavailable. Please try again later.'
      : error === 'invite-invalid'
        ? 'This invitation is invalid or has expired. Request a new invitation from your administrator.'
        : ''

  return <LoginForm initialMessage={initialMessage} />
}
