# Nokhaba Payroll & Operations

A bilingual (English/Arabic) payroll and operations platform for Saudi logistics teams. It includes payroll processing, driver records, rules management, payslips, traffic violations, income/expenses, and reporting.

## Stack

- Next.js App Router, React, and TypeScript
- Prisma ORM with Supabase-hosted PostgreSQL
- Supabase Auth using invite-only email/password sign-in
- Tailwind CSS and shadcn-style UI components

## Requirements

- Node.js 22 or later
- npm 10.9.2
- A Supabase project with PostgreSQL and email/password Auth enabled

## Supabase project setup

1. In Supabase **Authentication → Providers**, enable email/password authentication and disable public email signups. The app intentionally has no registration page; only users invited through Supabase administration should receive accounts.
2. Set the project **Site URL** to the application origin. Add the local callback `http://localhost:3000/auth/callback` and the production callback `https://<your-host>/auth/callback` to the allowed redirect URLs.
3. Configure the Supabase **Invite user** email template to send invited users through the server callback. A suitable link is:

   ```html
   <a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=invite">Accept invitation</a>
   ```

   The callback verifies the invitation and opens the password setup screen. Invite users from the Supabase Auth Users page. The user then chooses a password and signs in through `/login`.
4. Copy the project's URL and **publishable** API key into `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Do not put a Supabase secret/service-role key in either variable or in browser code.
5. Copy the database URLs from the Supabase **Connect** dialog. For this standalone Node server, use the Supavisor Session pooler (port `5432`) as `DATABASE_URL`; use a direct connection or Session pooler URL as `DIRECT_URL` for Prisma migrations. If deploying to a serverless runtime, use the Transaction pooler (port `6543`) for `DATABASE_URL`, with `pgbouncer=true&connection_limit=1`, and keep `DIRECT_URL` on a direct or Session pooler connection. Copy the host and username from Supabase rather than constructing them. URL-encode reserved characters in the database password.

## Local setup

```bash
npm ci
```

Create a local `.env` from the placeholders in `.env.example` and fill in the values from your Supabase project. If `.env` already exists, merge the required variables into it rather than overwriting it. Keep `.env` private and uncommitted.

Set `NEXT_PUBLIC_SITE_URL` to `http://localhost:3000` for local HTTP development and to the app's exact public `https://` origin in deployment. The Supabase session cookie uses `SameSite=Lax` for local HTTP and `SameSite=None; Secure` when this value is HTTPS, including cross-site HTTPS previews.

Then run:

```bash
npm run db:generate
npm run db:migrate
npm run dev
```

Open <http://localhost:3000>. The dashboard and all `/api/*` endpoints require a verified Supabase Auth session. Unauthenticated page requests go to `/login`; unauthenticated API requests receive HTTP 401. If Supabase Auth is not configured, API requests return HTTP 503 and the login screen explains that setup is incomplete.

## Database migrations and production

The Prisma schema targets PostgreSQL. The source-controlled initial migration assumes an empty target schema and creates the current application tables; it does not import or copy existing SQLite rows. Review the target Supabase database before applying migrations. If the database already contains app tables, stop and baseline/reconcile its schema before running this initial migration. Use `npm run db:migrate` for development and `npm run db:deploy` to apply checked-in migrations in production. The project does not provide a schema-reset command.

The existing ignored local SQLite database is left in place and is not uploaded or migrated by this change. If you want its records in Supabase, plan and authorize that data migration separately; never commit payroll, bank, or identity data.

For production, provide the Supabase Auth settings and PostgreSQL URLs in the deployment environment, protect the app behind HTTPS, and maintain backups of the Supabase database.

## Production build

```bash
npm run build
npm run start
```

The build creates a Next.js standalone output. `npm run start` runs it with Node.js. `DATABASE_URL` must be available in the server runtime; the public Supabase values must be available before the build, and `DIRECT_URL` is needed when running Prisma migrations.

Next.js compiles `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` into the browser bundle. Provide these three public values before `npm run build`; rebuild after changing them. `DATABASE_URL` must be present in the server runtime, while `DIRECT_URL` is required when running Prisma migrations.

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — public publishable API key; never use a secret/service-role key here.
- `DATABASE_URL` — Prisma application connection string, usually the Supavisor Session pooler for this standalone server.
- `DIRECT_URL` — direct or Session pooler connection for Prisma migrations.

The project currently configures Next.js to skip TypeScript build validation. A standalone `npx tsc --noEmit` may report pre-existing issues; treat those separately from the Supabase migration.

## Data and repository hygiene

Local payroll databases, employee exports, uploaded source workbooks, generated payslips, logs, and workspace notes are excluded from this repository. Store production data outside Git. Never commit real payroll, bank, or identity data, `.env` files, database passwords, or Supabase secret/service-role keys.
