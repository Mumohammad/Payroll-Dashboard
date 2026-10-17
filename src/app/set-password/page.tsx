'use client'

import { type FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const isConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
)

export default function SetPasswordPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(isConfigured)
  const [busy, setBusy] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [message, setMessage] = useState(
    isConfigured ? '' : 'Supabase Auth is not configured yet. Ask your administrator to finish setup.',
  )

  useEffect(() => {
    if (!isConfigured) return

    createClient().auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        router.replace('/login')
        return
      }
      setChecking(false)
    }).catch(() => {
      setMessage('We could not verify this invitation. Request a new invitation from your administrator.')
      setChecking(false)
    })
  }, [router])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    if (password !== confirmation) {
      setMessage('The passwords do not match.')
      return
    }

    setBusy(true)
    try {
      const { error } = await createClient().auth.updateUser({ password })
      if (error) {
        setMessage('The password could not be saved. Check the password requirements and try again.')
        return
      }
      router.replace('/')
      router.refresh()
    } catch {
      setMessage('Supabase Auth is unavailable. Please try again later.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="gradient-bg flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-xl sm:p-9">
        <p className="text-sm font-semibold text-primary">Nokhaba Payroll</p>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Set your password</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Create a password for your invited team account. You can sign in with it next time.
        </p>

        {checking ? (
          <p className="mt-6 text-sm text-muted-foreground" role="status">Verifying your invitation…</p>
        ) : message && !isConfigured ? (
          <p className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="status">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium">New password</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">Confirm password</label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            {message && <p className="text-sm text-destructive" role="alert">{message}</p>}
            <button
              type="submit"
              disabled={busy}
              className="h-11 w-full rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? 'Saving…' : 'Save password'}
            </button>
          </form>
        )}
      </section>
    </main>
  )
}
