# Nokhaba Payroll & Operations

A bilingual (English/Arabic) payroll and operations platform for Saudi logistics teams. It includes payroll processing, driver records, rules management, payslips, traffic violations, income/expenses, and reporting.

## Stack

- Next.js App Router, React, and TypeScript
- Prisma with SQLite
- Tailwind CSS and shadcn-style UI components

## Requirements

- Node.js 22 or later
- npm

## Local setup

```bash
npm ci
cp .env.example .env
npm run db:generate
npm run db:push
npm run dev
```

Then open <http://localhost:3000>. The sample environment uses a local SQLite file under `db/`; do not use the sample database path for production without planning backups and access controls.

## Production build

```bash
npm run build
npm run start
```

The build creates a Next.js standalone output. `npm run start` runs it with Node.js. For production, provide a persistent SQLite volume (or configure a suitable production database and adapt the Prisma provider), protect the app behind HTTPS, and keep backups of the database.

## Environment

- `DATABASE_URL` — Prisma connection string; see `.env.example` for a local SQLite example.

The project currently configures Next.js to skip TypeScript build validation. The production build succeeds, but a standalone `npx tsc --noEmit` reports existing type errors that should be resolved before removing that setting or treating type checking as a release gate.

## Data and repository hygiene

Local payroll databases, employee exports, uploaded source workbooks, generated payslips, logs, and workspace notes are excluded from this repository. Store production data outside Git and never commit real payroll, bank, or identity data.
