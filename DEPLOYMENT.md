# Deploying Percentile Lab MBA

Local development uses SQLite (a file on disk), which does not work on
serverless hosts like Vercel because the filesystem isn't persistent between
requests. Before going live you need a real Postgres database.

## 1. Get a production Postgres database

Any managed Postgres works. Two free options that pair well with Vercel:

- **Neon** (neon.tech) — serverless Postgres, generous free tier
- **Supabase** (supabase.com) — Postgres + extras, generous free tier

Create a project and copy its connection string (looks like
`postgresql://user:password@host/dbname?sslmode=require`).

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
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then regenerate the migration history against Postgres (run this locally with
`DATABASE_URL` pointed at your new Postgres database):

```bash
npx prisma migrate dev --name init_postgres
```

## 3. Environment variables

Set these on your hosting platform (never commit real secrets):

| Variable        | Value                                                        |
| --------------- | ------------------------------------------------------------- |
| `DATABASE_URL`  | Your Postgres connection string                               |
| `AUTH_SECRET`   | Random secret — generate with the command below                |
| `ADMIN_EMAIL`   | Email for the seeded admin account                             |
| `ADMIN_PASSWORD`| Password for the seeded admin account (change after first login)|
| `ADMIN_NAME`    | Display name for the admin account                             |

Generate a fresh `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 4. Seed the admin account

After the database is migrated and env vars are set on the host, run once:

```bash
npm run db:seed
```

(Or run it locally with `DATABASE_URL` pointed at production — it's a safe,
idempotent upsert.)

## 5. Deploy

**Vercel** (recommended, works well with Next.js):

1. Push this repo to GitHub.
2. Import the repo at vercel.com/new.
3. Add the environment variables from step 3 in the Vercel project settings.
4. Deploy.

Vercel auto-detects Next.js — no build command changes needed.

## Notes

- `xlsx` was deliberately left out (test authoring is done via the web form
  builder, not spreadsheet upload) — it has known unpatched vulnerabilities.
- Next.js is pinned to the 15.x line and Prisma to 6.x deliberately — both
  have newer major versions available (16.x / 7.x) with breaking changes
  from what this codebase was built against. Upgrade deliberately, not via
  `npm audit fix --force`.
