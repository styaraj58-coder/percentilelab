# Load testing Percentile Lab

A ready-made kit to find out how many students the site can handle at once.

**Golden rule: only ever test a STAGING copy** - never `percentilelab.in` and
never the production database. The scripts refuse to run against production.

## What it tests

| Script | Simulates | Looks for |
|---|---|---|
| `k6/public.js` | Visitors browsing the public pages | slow pages, errors under traffic |
| `k6/login.js` | Many students signing in at once | password-check CPU, connection pool |
| `k6/exam.js` | Many students taking the same mock (**the real peak**) | slow exam load, answer saving, submitting, results |

`check.mjs` is a one-student smoke test. Run it first.

## One-time setup

### 1. Create the staging database
1. In Supabase create a **new project** (e.g. `percentilelab-staging`), same region as production.
2. Copy its two connection strings (see `DEPLOYMENT.md`, section 1) into
   `loadtest/.env.staging` (start from `.env.staging.example`).
3. Create the tables:
   ```bash
   node -e "require('dotenv').config({path:'loadtest/.env.staging'});const r=require('child_process').spawnSync('npx',['prisma','migrate','deploy'],{env:{...process.env,DATABASE_URL:process.env.DIRECT_URL},stdio:'inherit',shell:true});process.exit(r.status)"
   ```

### 2. Put a staging copy of the site online
Use a **second Vercel project** from the same repo (so production is untouched):
- Environment variables: `DATABASE_URL` and `DIRECT_URL` from the staging file,
  and a **new** random `AUTH_SECRET`.
- Leave `RESEND_API_KEY` unset (no emails are sent).
- Use the same Vercel plan/region as production, otherwise the results do not
  reflect reality.

*Quick alternative (less realistic):* `npm run build` then `npm start` on your
own computer with the staging variables - good for finding database problems,
but your computer then also runs k6, which skews the numbers.

### 3. Install k6
```bash
winget install k6
```

### 4. Create the test students
```bash
node loadtest/seed.cjs seed --users 300 --yes
```
This adds 300 students, an admin and one **unpublished** 200-question mock to
the staging database only, and writes `loadtest/data.json` (git-ignored).

## Every test run

```bash
# 1. smoke test - must pass
node loadtest/check.mjs --base https://your-staging.vercel.app

# 2. fresh attempts (finished attempts can't be reused)
node loadtest/seed.cjs reset --yes

# 3. run one scenario
k6 run -e BASE_URL=https://your-staging.vercel.app loadtest/k6/public.js
k6 run -e BASE_URL=https://your-staging.vercel.app -e VUS=100 loadtest/k6/login.js
k6 run -e BASE_URL=https://your-staging.vercel.app -e USERS=100 loadtest/k6/exam.js
```

`exam.js` options: `-e USERS=100` (students, max = seeded), `-e PROFILE=spike`
(everyone starts within 10 s - the "test opens at 10:00 sharp" case),
`-e QUESTIONS=30`, `-e THINK=15` (seconds per question).

Step up gradually: **20 -> 50 -> 100 -> 200 -> 300**. If a level fails, stop and
fix before going higher. Change one thing at a time.

## Reading the results

k6 prints a summary and marks each threshold with a tick or a cross.

| Number | Healthy |
|---|---|
| `http_req_failed` | under 1% |
| `http_req_duration` p(95) (public pages) | under 1.5 s |
| `exam_open_ms` p(95) | under 3 s |
| `save_answer_ms` p(95) | under 1 s |
| `submit_ms` p(95) | under 5 s |
| `action_errors` | 0 |

While a test runs, watch:
- **Supabase -> Reports / Database:** connections, CPU, slow queries.
- **Vercel -> Logs and Observability:** timeouts, 5xx, "too many connections".

## Likely bottlenecks (and fixes)

- **Home page is slow under visitors:** it runs two COUNT queries on every
  visit - cache them for ~60 s.
- **"Too many connections" / timeouts:** Supabase pool size on your plan;
  upgrade the plan or lower `connection_limit`.
- **Slow exam load at the same instant:** every student fetches the whole
  200-question test - cache the test content per test.
- **Slow results page after many submissions:** the percentile is computed
  from all attempts - precompute or cache it.

## Cleaning up

```bash
node loadtest/seed.cjs cleanup --yes
```
Removes every load-test account and the synthetic test from staging.

## If k6 can't find the action ids
The exam page's two actions (`saveAnswer`, `submitAttempt`) get new ids on every
deployment. The scripts read them automatically; `check.mjs` prints them, and
you can force them with `-e SAVE_ACTION_ID=... -e SUBMIT_ACTION_ID=...`.
