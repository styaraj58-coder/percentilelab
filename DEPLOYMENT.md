# Deploying Percentile Lab (Vercel + Supabase)

Local development uses SQLite (a file on disk), which does not work on
serverless hosts like Vercel because the filesystem isn't persistent between
requests. This guide switches the app to your Supabase Postgres database and
deploys to Vercel.

## 1. Get your Supabase connection strings

In your Supabase project, click **Connect** (top of the dashboard) and look
for the **pooler** connection strings — not "Direct connection". Supabase's
direct host (`db.<ref>.supabase.co`) is IPv6-only and was unreachable from
this machine; the pooler host (`aws-<n>-<region>.pooler.supabase.com`)
resolves to IPv4 and works everywhere.

The pooler offers two modes, both using the same host but different ports —
you need both:

- **Transaction mode** (port `6543`, `?pgbouncer=true`) — used by the
  **running app**. This is `DATABASE_URL`.
- **Session mode** (port `5432`, no `pgbouncer` flag) — used for
  **migrations**. This is `DIRECT_URL`.

Both use username `postgres.<project-ref>` (not just `postgres`) — e.g.:

```
DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-<n>-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.<ref>:<password>@aws-<n>-<region>.pooler.supabase.com:5432/postgres"
```

**Important gotcha**: running `prisma migrate dev/deploy` while `DATABASE_URL`
points at Transaction mode (6543) hangs indefinitely — Transaction mode
doesn't support the session-level advisory lock Prisma's migration engine
needs. When running a migration, temporarily set `DATABASE_URL` to the same
Session-mode (5432) value as `DIRECT_URL`, run the migration, then switch
`DATABASE_URL` back to 6543 before starting the app.

## 2. Switch Prisma to Postgres

In `prisma/schema.prisma`, change:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

to:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## 3. Set environment variables

Locally, update `.env` (already gitignored) with your Supabase values so you
can run migrations and the seed script from your machine:

```
DATABASE_URL="<Supabase pooled connection string, port 6543>"
DIRECT_URL="<Supabase direct connection string, port 5432>"
AUTH_SECRET="<generate below>"
ADMIN_EMAIL="careerprofmarketing@gmail.com"
ADMIN_PASSWORD="<pick a real password>"
ADMIN_NAME="Percentile Lab Admin"
RESEND_API_KEY="<from resend.com/api-keys>"
ADMIN_NOTIFICATION_EMAIL="satyaraj735278@gmail.com"
```

Generate a fresh `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Then run the same variables into **Vercel → Project → Settings →
Environment Variables** before your first deploy.

`RESEND_API_KEY` and `ADMIN_NOTIFICATION_EMAIL` power the "new student
registered" email sent to the admin on every signup. Sign up free at
resend.com, grab an API key — no domain verification needed to start,
since the app sends from Resend's shared `onboarding@resend.dev` address
by default. Leave `RESEND_API_KEY` blank to disable the email entirely
(registration still works fine either way). To send from your own domain
later, verify it in Resend and set `RESEND_FROM_EMAIL`.

## 4. Create the schema on Supabase and seed the admin account

With `DATABASE_URL` temporarily set to the Session-mode (5432) value (see the
gotcha above):

```bash
npx prisma migrate dev --name init_postgres
```

Then switch `DATABASE_URL` back to Transaction mode (6543) and seed:

```bash
npm run db:seed
```

`db:seed` is a safe, idempotent upsert — running it again later won't create
duplicates. Regular queries (seeding, the running app) work fine over
Transaction mode — it's specifically `prisma migrate` that needs Session
mode.

## 5. Switch question/option images to Supabase Storage

Admin-uploaded question/option images currently save to
`public/uploads/` on disk (`src/app/api/admin/upload/route.ts`). That works
locally but **does not persist on Vercel** — its filesystem is read-only
and ephemeral per request, so uploaded images would vanish. Before
deploying with real image content, switch that route to Supabase Storage:

1. In Supabase: **Storage → New bucket** (e.g. `question-images`), set it
   public.
2. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (Project Settings →
   API) to `.env` and Vercel's environment variables.
3. Update `src/app/api/admin/upload/route.ts` to upload the file to that
   bucket via `@supabase/supabase-js` instead of `writeFile`, and return the
   bucket's public URL instead of `/uploads/...`.

Ask me to make this swap once your Supabase project exists — it's a small,
contained change to one file.

## 6. Deploy to Vercel

1. Push this repo to GitHub (ask me to do this once you have a repo URL, or
   run `git remote add origin <url> && git push -u origin master` yourself).
2. Import the repo at vercel.com/new.
3. Confirm the environment variables from step 3 (and Supabase Storage
   variables from step 5, if applicable) are set in the Vercel project.
4. Deploy — Vercel auto-detects Next.js, no build command changes needed.

## Notes

- `xlsx` was deliberately left out (test authoring is done via the web form
  builder, not spreadsheet upload) — it has known unpatched vulnerabilities.
- Next.js is pinned to the 15.x line and Prisma to 6.x deliberately — both
  have newer major versions available (16.x / 7.x) with breaking changes
  from what this codebase was built against. Upgrade deliberately, not via
  `npm audit fix --force`.
