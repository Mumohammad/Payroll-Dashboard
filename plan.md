# Implementation Plan — Supabase-backed Nokhaba Payroll Dashboard

## Product scope

Build on the existing Nokhaba Payroll & Operations application. Keep its Next.js App Router, React, TypeScript, Tailwind CSS/shadcn-style UI, and Prisma data access. Replace the SQLite production database target with Supabase-hosted PostgreSQL, add invite-only Supabase Auth using email and password, and protect the dashboard and every existing API route. Preserve the existing payroll modules and calculations.

The user selected **Supabase Auth email + password, invite-only**. Do not add public account creation. Do not copy, upload, or migrate records from the ignored local SQLite database; leave it untouched. No destructive database operation or live schema change is part of this code pass.

## Implementation approach

- Change the Prisma datasource to PostgreSQL while preserving all current model fields and relationships. Add a versioned initial migration generated from the existing schema. Use a Supabase Session pooler `DATABASE_URL` for the existing standalone Node runtime; for serverless deployments, use the Transaction pooler with `pgbouncer=true&connection_limit=1`. Use a direct/Session pooler `DIRECT_URL` for migrations; deploy migrations with Prisma rather than pushing or resetting the schema.
- Add request-scoped Supabase browser/server clients using `@supabase/ssr` and `@supabase/supabase-js`. Use cookie-based SSR sessions and a Next.js 16 `src/proxy.ts` to refresh verified sessions and protect the dashboard and `/api/*` routes. Configure `SameSite=None; Secure` for the configured public HTTPS origin and separate `Lax`/non-secure attributes for local HTTP; do not infer this from `NODE_ENV` or the internal request transport. Never expose a secret/service-role key to the browser.
- Add a branded email/password sign-in page and an invitation callback/password setup flow. Do not add a sign-up screen. Document the required Supabase project settings: disable email self-signup, enable the email/password provider, configure the application URL and allowed redirect URLs, and invite users through Supabase administration.
- Update `.env.example` and `README.md` with safe placeholders for the public Supabase URL/publishable key and the two Prisma PostgreSQL URLs. Do not read or overwrite the ignored `.env`, and keep local payroll database files excluded from Git.
- Preserve the current visual system: emerald/teal actions on slate-neutral surfaces, existing Geist/Cairo typography, bilingual labels, and tabular financial numerals. Add only the authentication UI and session affordances; do not redesign existing payroll workflows.

## Project structure

- `prisma/schema.prisma` — existing payroll models on the PostgreSQL provider.
- `prisma/migrations/` — reviewed, source-controlled schema creation migration; no local record export/import.
- `src/lib/supabase/client.ts` and `src/lib/supabase/server.ts` — browser and request-scoped cookie clients.
- `src/proxy.ts` — session refresh and access guard for pages and API endpoints.
- `src/app/login/`, `src/app/auth/callback/`, `src/app/set-password/` — invite-only sign-in and invitation acceptance/password setup.
- `src/app/page.tsx` and existing `src/app/api/**` — current dashboard and business API behavior, retained behind verified authentication.
- `.env.example` and `README.md` — safe configuration and setup guidance.

## Design direction

- **Design Movement:** Preserve the existing modern Saudi logistics operations-control aesthetic rather than introducing a new visual system.
- **Core Principles:** Trust-first access; bilingual clarity; precise financial typography; minimal disruption to established payroll workflows.
- **Color Philosophy:** Keep the existing emerald/teal as the action and confirmation color, supported by restrained slate neutrals; reserve warning colors for actual status states.
- **Layout Paradigm:** Keep the existing navigation-and-workspace shell. Give sign-in a compact, focused entry surface that leads into the familiar dashboard after verification.
- **Signature Elements:** Existing emerald action accents; tabular numeric presentation; English/Arabic labels and the Cairo font for Arabic text.
- **Interaction Philosophy:** Make authentication states and errors explicit, support password-manager/autofill behavior, protect navigation and API requests, and provide sign-out. Do not expose registration controls.
- **Animation:** Retain the app's existing restrained motion; use only subtle transitions and respect reduced-motion preferences.
- **Typography System:** Preserve Geist/Geist Mono with Cairo for Arabic; maintain the existing clear hierarchy and numeric alignment.
- **Brand Essence:** A dependable bilingual payroll and operations workspace for Saudi logistics teams; precise, calm, operational.
- **Brand Voice:** Direct and reassuring. Example lines: “Sign in to continue.” “Access is available to users invited by your administrator.”
- **Wordmark & Logo:** Reuse the existing Nokhaba mark and application wordmark; no rebrand.
- **Signature Brand Color:** Existing emerald-700 primary.

## Dependencies and blocking configuration

Add the Supabase SSR/client dependencies at compatible versions. Keep Prisma 6.19 and the current Next.js 16 stack unless compatibility checks require a small adjustment.

The configured session Supabase API endpoint returned HTTP 404 for read-only Auth and Data API health checks, and no `DATABASE_URL` or `DIRECT_URL` is present. Therefore this pass can create and verify the application code and migration source, but cannot honestly claim live Supabase connectivity or apply the migration. The app must remain unconnected until a valid Supabase project URL/publishable key and database runtime/migration connection strings are configured. Existing local payroll data remains in SQLite and is not part of this change.

## Sources

- Supabase SSR clients and Next.js 16 proxy guidance: https://supabase.com/docs/guides/auth/server-side/creating-a-client
- Email/password Auth: https://supabase.com/docs/guides/auth/passwords
- Admin invitation and invite-token verification: https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail
- Signup configuration: https://supabase.com/docs/guides/local-development/cli/config
- Prisma integration: https://supabase.com/docs/guides/database/prisma
- PostgreSQL connection modes: https://supabase.com/docs/guides/database/connecting-to-postgres

## Production-hardening addendum (source-only continuation)

- Keep the original schema-creation migration immutable. Put application-table security in a new forward-only Prisma migration with an explicit allow-list matching the 18 models created by the app migration; do not modify unrelated `public` objects. Enable RLS and revoke `PUBLIC`, `anon`, and `authenticated` table privileges. No direct Data API policies are added; the app uses authenticated server routes and Prisma. Because those tables have no RLS policies, production must confirm the Prisma runtime role owns the tables or has `BYPASSRLS`.
- For browser-session write APIs, require an `Origin` exactly matching `NEXT_PUBLIC_SITE_URL`; reject absent or alternate origins. This deliberately does not create machine-to-machine write authentication. Configure the exact public scheme/host/port before deployment.
- Mark Prisma access as server-only, remove the failed write of uploaded payroll workbooks to a fixed ephemeral path, and make Next.js fail production builds on TypeScript errors.
- Local checks: `npx tsc --noEmit`, `npx prisma validate` with dummy PostgreSQL URLs, and `npm run build` with dummy Supabase/PostgreSQL configuration passed. A local standalone-build POST with an attacker-controlled Origin returned HTTP 403. `npm run lint` remains blocked by 10 React hook/compiler diagnostics in existing components.
- Not performed: no live Supabase connection, migration application, account invitation, production deployment, database backup, or GitHub push. The local SQLite database remains ignored and untouched.
