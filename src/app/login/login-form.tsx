'use client'

import Image from 'next/image'
import { type FormEvent, useState } from 'react'
import { ArrowRight, LockKeyhole } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const isConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
)

export function LoginForm({ initialMessage = '' }: { initialMessage?: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(initialMessage)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    if (!isConfigured) {
      setMessage('Supabase Auth is not configured yet. Ask your administrator to finish setup.')
      return
    }

    setBusy(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setMessage('We could not sign you in. Check your details or contact your administrator.')
        return
      }

      const requestedNext = new URLSearchParams(window.location.search).get('next')
      let destination = '/'
      if (requestedNext) {
        try {
          const parsed = new URL(requestedNext, window.location.origin)
          if (parsed.origin === window.location.origin) {
            destination = `${parsed.pathname}${parsed.search}${parsed.hash}`
          }
        } catch {
          destination = '/'
        }
      }
      window.location.replace(destination)
    } catch {
      setMessage('Supabase Auth is unavailable. Please try again later.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="gradient-bg flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-xl sm:p-9">
        <div className="mb-8 flex items-center gap-3">
          <Image src="/logo.svg" alt="Nokhaba" width={48} height={48} className="h-12 w-12 object-contain" priority />
          <div>
            <p className="text-lg font-semibold tracking-tight">Nokhaba Payroll</p>
            <p className="text-sm text-muted-foreground">Saudi Logistics Operations</p>
          </div>
        </div>

        <div className="mb-7">
          <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground">
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Sign in to continue</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Access is limited to team members invited by your administrator.
          </p>
        </div>

        {!isConfigured && (
          <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-950" role="status">
            Supabase Auth is not configured yet. Add the project URL and publishable key to the application environment.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Work email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="name@company.com"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Your password"
            />
          </div>

          {message && <p className="text-sm text-destructive" role="alert">{message}</p>}

          <button
            type="submit"
            disabled={busy || !isConfigured}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Signing in…' : 'Sign in'}
            {!busy && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
          No public registration is available. Contact your administrator if you need an invitation.
        </p>
        <p className="mt-4 text-center text-xs text-muted-foreground" lang="ar" dir="rtl">
          تسجيل الدخول متاح لأعضاء الفريق المدعوين فقط
        </p>
      </section>
    </main>
  )
}
