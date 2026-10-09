# Percentile Lab - load test report

Run on 9 October 2026 against a **staging copy** of the site (never the real site or the real database).
Every time below is shown as **average / slowest 5%** (the 95th percentile): "1.4 s / 3.5 s" means requests took 1.4 s on average and 95% finished within 3.5 s.

## 1. Verdict

| Question | Answer |
|---|---|
| Can the site handle 300 students submitting together? | **Yes, now.** 0 errors; submitting 0.09 s on average, results page 0.16 s. Before the fixes: 209 failed requests and waits of up to a minute. |
| Can it handle 300 students *opening* the exam within the same 10 seconds? | **Not smoothly.** Nothing fails, but opening takes 12.9 s on average (22.8 s for the slowest 5%). Fine up to about 100 at once (0.27 s). |
| Is saving answers a concern? | **No.** About 0.08 s on average at every size tested, up to 300 students. |
| Was the database the problem? | **No.** At its busiest it used about 15% CPU and about 21 of 60 connections. |
| What was the problem? | The results page and the submit step used too much of the free Vercel plan's CPU. Fixed in two steps. |

## 2. How the test was set up

| | |
|---|---|
| **Site tested** | A separate staging copy of the site on its own free Vercel project (Mumbai region), running the same code as the real site |
| **Database** | A separate free Supabase project (Mumbai), same tables as production, holding only test data |
| **Plans** | Free Vercel (Hobby) and free Supabase, the same as production |
| **Test data** | 300 test students and one 200-question mock (75 + 25 + 50 + 50 questions, with passages), never shown to the public |
| **Tool** | k6, run from one computer in India |
| **What each student did** | Signed in, opened the student portal, opened the exam (whole 200-question test), answered 20 questions (an answer click plus a "next" save each), submitted, loaded the results page |
| **How the students arrived** | "Spike": all students started within 10 seconds of each other - the "test opens at 10:00 sharp" worst case |
| **Pace** | About 5 seconds per question instead of the real 40-60, so each student finished in about 2 minutes. That makes the load per second *higher* than real life for saving answers. |
| **Pass marks used** | Under 1% errors; exam opens in under 3 s; answer saves under 1 s; submit under 5 s; results page under 3 s (all for the slowest 5%) |

## 3. Baseline checks (before the exam tests)

| Test | Load | Result |
|---|---|---|
| One-student walkthrough | 1 student | Every step passed: public pages, sign-in, portal, exam (516 KB), save, submit, results |
| Public pages | 20 visitors for 5.5 minutes, 1,139 page loads | **0 failures**; average 67 ms, slowest 5% 112 ms |
| Sign-ins | 20 students signing in repeatedly for 3 minutes, 2,278 sign-ins (13 per second) | **0 failures**; sign-in 152 ms on average, 220 ms for the slowest 5% |

## 4. The exam tests, in order

### 4.1 Original code

| Run | Opening the exam | Saving an answer | Submitting | Results page | Requests | Failed |
|---|---|---|---|---|---|---|
| 20 students | 244.13ms / 308.1ms | 81.36ms / 121.98ms | 468.57ms / 698.06ms | 479.37ms / 581.8ms | 933 | 0.00% 0 out of 933 |
| 50 students | 267.78ms / 411.87ms | 76.23ms / 111.56ms | 1.38s / 3.76s | 2.31s / 5.59s | 2313 | 0.00% 0 out of 2313 |

At 20 students everything passed. At **50 students the results page failed its limit** (5.59 s for the slowest 5%, limit 3 s). Submitting was also climbing (3.76 s).

### 4.2 After fix 1 (database totals and caching)

| Run | Opening the exam | Saving an answer | Submitting | Results page | Requests | Failed |
|---|---|---|---|---|---|---|
| 50 students, first run after deploy (cold) | 2.12s / 5.25s | 80.6ms / 123.95ms | 5.31s / 13.43s | 7.12s / 15.66s | 2313 | 0.00% 0 out of 2313 |
| 50 students, second run (warm) | 263.72ms / 374.76ms | 85.11ms / 136.12ms | 1.45s / 3.49s | 2.42s / 5.26s | 2313 | 0.00% 0 out of 2313 |
| 100 students | 311.91ms / 595.38ms | 80.6ms / 125.38ms | 12.7s / 31.85s | 17.12s / 29.86s | 4613 | 0.00% 0 out of 4613 |
| 200 students | 9.16s / 16.45s | 76.25ms / 119.72ms | 23.91s / 57.29s | 32.79s / 57.27s | 9213 | 0.17% 16 out of 9213 |
| 300 students | 16.33s / 27.86s | 79.39ms / 132.85ms | 34.72s / 1m0s | 49.3s / 1m0s | 13813 | 1.51% 209 out of 13813 |

Failed requests: 50 cold 0.00% 0 out of 2313; 100 students 0.00% 0 out of 4613; 200 students 0.17% 16 out of 9213; 300 students 1.51% 209 out of 13813.

- Fix 1 did **not** help much on Vercel (results page 5.26 s against 5.59 s before at 50 students), although it halved the time in a local before-and-after test.
- Above 50 students the results page and submitting collapsed: about 30 s at 100, about 57 s at 200, and timeouts at 300.
- The first run after a deployment was far slower (15.7 s) than the second (5.3 s) because new server instances had to start up ("cold starts").
- Opening the exam also degraded at 200 and 300 students.

### 4.3 After fix 2 (answer review loads on demand, instant submit)

| Run | Opening the exam | Saving an answer | Submitting | Results page | Requests | Failed |
|---|---|---|---|---|---|---|
| Warm-up, 50 students (not counted) | 330.1ms / 509.62ms | 75.36ms / 110.83ms | 85.66ms / 114.49ms | 129.49ms / 197.88ms | 2313 | 0.00% 0 out of 2313 |
| 50 students | 249.81ms / 335.11ms | 75.89ms / 109.43ms | 89.61ms / 125.11ms | 171.76ms / 362.5ms | 2313 | 0.00% 0 out of 2313 |
| 100 students | 265.61ms / 389.86ms | 71.49ms / 100.97ms | 84.55ms / 103.23ms | 126.48ms / 196.56ms | 4568 | 0.02% 1 out of 4568 |
| 200 students | 5.91s / 13.94s | 71.25ms / 100.24ms | 88.33ms / 126.78ms | 143.77ms / 192.95ms | 9213 | 0.00% 0 out of 9213 |
| 300 students | 12.85s / 22.8s | 84.66ms / 129.45ms | 90.88ms / 137.3ms | 157.03ms / 229.58ms | 13813 | 0.00% 0 out of 13813 |

Failed requests: 50 0.00% 0 out of 2313; 100 0.02% 1 out of 4568 (one connection timeout on the test computer, not the site); 200 0.00% 0 out of 9213; 300 0.00% 0 out of 13813.

## 5. Before and after (slowest 5%)

| Students | Results page, before | Results page, now | Submit, before | Submit, now | Failed requests, before | Failed requests, now |
|---|---|---|---|---|---|---|
| 50 | 5.26 s | **0.36 s** | 3.49 s | **0.13 s** | 0 | 0 |
| 100 | 29.9 s | **0.20 s** | 31.9 s | **0.10 s** | 0 | 1 (test computer) |
| 200 | 57.3 s | **0.19 s** | 57.3 s | **0.13 s** | 16 | **0** |
| 300 | 60 s (timeouts) | **0.23 s** | 60 s (timeouts) | **0.14 s** | 209 | **0** |

Data downloaded during the 300-student run: **914 MB before, 201 MB now.**

## 6. What the monitoring showed

**Supabase (database), last 3 hours covering all tests**

| Measure | Peak | Limit | Verdict |
|---|---|---|---|
| CPU | about 15% | 100% | Idle |
| Database connections | about 21 | 60 | Room to spare |
| Disk activity | about 8 KB/s | 125 MB/s | Idle |
| Network | up to about 7.6 MB/s in short bursts | | Fine |
| Memory | about 1.15 GB of a 1.23 GB limit, some swap, steady before and during the tests | | Tight but unchanged by the tests |

A separate check from my computer: a simple query took 24 ms; the heaviest query took 150 ms alone and 470 ms with 50 running at once. The database was not the limit.

**Vercel (server functions), last 6 hours**

| Measure | Value | Meaning |
|---|---|---|
| Compute model | Fluid | Several requests share one instance |
| CPU throttle | 16% | The functions hit their CPU ceiling |
| Memory | 308 MB of 2.05 GB | Not a problem |
| Cold starts | 0.1% | Only mattered right after a deployment |
| Saving an answer | 32,000 calls, about 7 ms of CPU each | Cheap |
| Signing in | 6,100 calls, about 39 ms each | Fine |
| Results page (original) | 1,500 calls, about 80 ms each | The expensive one |

## 7. What was wrong and what changed

**Problem 1 - the results page loaded everything about every student (fix 1, commit 4dff7a2).** To work out question difficulty it loaded every answer from every student on every view, so its cost grew with the number of students. It now asks the database for totals (a few hundred rows instead of tens of thousands), computes percentile and rank with simple counts, loads only the top 10 for the leaderboard, and caches the question paper and answer key until a test is edited. I checked that the new numbers match the old exactly for all 200 questions' difficulty, the top 10, and the percentile and rank of 50 attempts (including many ties): **0 differences**.

**Problem 2 - the results page was heavy to build, and submitting built it first (fix 2, commit e214f96).** Each results view was 1.7 MB: all 200 questions with every option and explanation. And submitting did not answer until the results page was built. Now the page shows the summary only (72 KB) and the full review loads when the student clicks "Show answer review". Submitting grades and answers at once, and the browser opens the results page itself. I compared 8 real students' pages before and after: **all identical** above the review. I also confirmed in a browser that the review loads in about 0.8 s with all 200 questions, and that the Q# links jump to the right question. Your manual Submit check also passed.

## 8. Still slow: opening the exam at 200+ at once

| Students starting within 10 s | Opening the exam |
|---|---|
| 100 | 0.27 s / 0.39 s - fine |
| 200 | 5.9 s / 13.9 s |
| 300 | 12.9 s / 22.8 s |

Each student downloads the whole test (about 516 KB). With 200-300 doing it in the same seconds, the free plan's CPU is the limit again. Nothing fails (the slowest was 31 s, and the limit is 60 s). Possible fix: send one section at a time.

## 9. Limits of this test - please read

- **Synthetic data.** Staging has no real content; the real database is larger, so real pages do a bit more work.
- **The "Show answer review" click was not load-tested.** A real student opening it triggers one extra heavy request (about 700 KB). If all 300 click it in the same few seconds, expect slowness similar to the old results page. Students will normally click at different times, but this should be measured next.
- **Worst-case arrival.** All students started within 10 seconds, and all finished within about 2 minutes. Real exams are usually more spread out - except that everyone still working is auto-submitted at the deadline, which is a burst.
- **One test computer, in India.** Results from other locations may differ slightly.
- **The test does not run the page's JavaScript** like a real browser. Pressing Submit in a real browser was checked by hand.
- **Free plans.** Results will change if you move to paid plans (more CPU), which should help.
- **Caching delays.** The leaderboard can be up to 30 s old, question difficulty up to 60 s, and the cached answer key up to 2 minutes (it refreshes immediately when you edit a test in the admin, but not if the database is edited directly).

## 10. Recommendations

1. **Keep the current code.** Submitting and results are comfortably fast for 300 students.
2. **Plan scheduled tests so students do not all open the exam in the same few seconds**, for example a 5-minute entry window, until the exam-opening fix is done.
3. **Next improvement:** make exam opening lighter (one section at a time), then re-test 200 and 300.
4. **Test the answer-review click** at scale before a large exam.
5. **Before each big exam**, rerun the ladder on staging (README in the loadtest folder) and keep real exams off the first minutes after a new deployment.
6. If you outgrow the free plans, **Vercel Pro** (more CPU) is the first upgrade to consider, not Supabase.

## 11. How to rerun

```
node loadtest/seed.cjs reset --yes          (fresh attempts - before every run)
k6 run -e BASE_URL=https://percentilelab-staging.vercel.app -e PROFILE=spike -e USERS=300 -e QUESTIONS=20 -e THINK=5 loadtest/k6/exam.js
```
