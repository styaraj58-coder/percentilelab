# Deploying Percentile Lab MBA (Vercel + Supabase)

Local development uses SQLite (a file on disk), which does not work on
serverless hosts like Vercel because the filesystem isn't persistent between
requests. This guide switches the app to your Supabase Postgres database and
deploys to Vercel.

## 1. Get your Supabase connection strings

In your Supabase project: **Project Settings → Database → Connection string**.

Supabase gives you two different connection strings — Prisma needs both when
running on a serverless host like Vercel:

- **Connection pooling** (port `6543`, includes `pgbouncer=true`) — used by
  the running app, since serverless functions open many short-lived
  connections and Postgres itself can't handle that many directly.
- **Direct connection** (port `5432`) — used only for running migrations,
  which need a non-pooled connection.

Copy both — you'll paste them into `.env` (for one-off migration/seed runs
from your machine) and into Vercel's environment variables (for the deployed
app).

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
ADMIN_NAME="Percentile Lab MBA Admin"
```

Generate a fresh `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Then run the same five variables into **Vercel → Project → Settings →
Environment Variables** before your first deploy.

## 4. Create the schema on Supabase and seed the admin account

Run locally, pointed at Supabase via the `.env` values above:

```bash
npx prisma migrate dev --name init_postgres
npm run db:seed
```

`db:seed` is a safe, idempotent upsert — running it again later won't create
duplicates.

## 5. Deploy to Vercel

1. Push this repo to GitHub (ask me to do this once you have a repo URL, or
   run `git remote add origin <url> && git push -u origin master` yourself).
2. Import the repo at vercel.com/new.
3. Confirm the 5 environment variables from step 3 are set in the Vercel
   project.
4. Deploy — Vercel auto-detects Next.js, no build command changes needed.

## Notes

- `xlsx` was deliberately left out (test authoring is done via the web form
  builder, not spreadsheet upload) — it has known unpatched vulnerabilities.
- Next.js is pinned to the 15.x line and Prisma to 6.x deliberately — both
  have newer major versions available (16.x / 7.x) with breaking changes
  from what this codebase was built against. Upgrade deliberately, not via
  `npm audit fix --force`.
