#!/usr/bin/env node
// Smoke test: walks one seeded student through the whole exam flow once.
// Run this BEFORE k6 - if it passes, the load test scripts will work too.
//
//   node loadtest/check.mjs --base https://your-staging-url.vercel.app
//
// Steps: public pages -> sign in -> student portal -> open the exam (200
// questions) -> save answers -> submit -> results page.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};

const base = (arg("base", process.env.BASE_URL || "") || "").replace(/\/$/, "");
if (!base) {
  console.error("Usage: node loadtest/check.mjs --base <STAGING url>");
  process.exit(1);
}
if (/percentilelab\.in/i.test(base) && !process.env.I_UNDERSTAND_THIS_IS_PRODUCTION) {
  console.error("Refusing to run against the production site. Use your STAGING address.");
  process.exit(1);
}

const dataFile = path.resolve(arg("data", path.join(here, "data.json")));
if (!fs.existsSync(dataFile)) {
  console.error(`Missing ${dataFile}. Run: node loadtest/seed.cjs seed --yes`);
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(dataFile, "utf8"));
const student = data.users[Number(arg("user", 0))];

// ---- tiny cookie jar -------------------------------------------------------
const jar = new Map();
function remember(res) {
  for (const line of res.headers.getSetCookie?.() ?? []) {
    const [pair] = line.split(";");
    const eq = pair.indexOf("=");
    const name = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    if (/expires=Thu, 01 Jan 1970|max-age=0/i.test(line) || value === "") jar.delete(name);
    else jar.set(name, value);
  }
}
const cookieHeader = () => [...jar].map(([k, v]) => `${k}=${v}`).join("; ");

async function request(method, url, { headers = {}, body, redirect = "manual" } = {}) {
  const started = performance.now();
  const res = await fetch(url.startsWith("http") ? url : base + url, {
    method,
    headers: { ...headers, Cookie: cookieHeader() },
    body,
    redirect,
  });
  remember(res);
  return { res, ms: Math.round(performance.now() - started) };
}

const results = [];
let failed = false;
function step(name, ok, detail) {
  results.push({ name, ok, detail });
  if (!ok) failed = true;
  console.log(`${ok ? "✔" : "✖"} ${name}${detail ? "  - " + detail : ""}`);
}

// ---- 1. public pages --------------------------------------------------------
for (const p of ["/", "/courses", "/blog", "/tests", "/exams/cat"]) {
  const { res, ms } = await request("GET", p);
  step(`GET ${p}`, res.status === 200, `${res.status}, ${ms} ms`);
}

// ---- 2. sign in -------------------------------------------------------------
{
  const csrfRes = await request("GET", "/api/auth/csrf");
  const csrf = (await csrfRes.res.json()).csrfToken;
  step("GET /api/auth/csrf", !!csrf, `${csrfRes.ms} ms`);

  const body = new URLSearchParams({
    csrfToken: csrf,
    email: student.email,
    password: student.password,
    callbackUrl: `${base}/student`,
    json: "true",
  });
  const login = await request("POST", "/api/auth/callback/credentials", {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  step("POST sign-in", login.res.status < 400, `${login.res.status}, ${login.ms} ms`);

  const session = await request("GET", "/api/auth/session");
  const who = await session.res.json();
  step("session is signed in", who?.user?.email === student.email, who?.user?.email ?? "no session");
}

// ---- 3. student portal ------------------------------------------------------
{
  const { res, ms } = await request("GET", "/student");
  step("GET /student", res.status === 200, `${res.status}, ${ms} ms`);
}

// ---- 4. open the exam, find the server-action ids ------------------------------
const examPath = `/exam/${student.attemptId}`;
const ids = {};
{
  const { res, ms } = await request("GET", examPath);
  const html = await res.text();
  step(`GET ${examPath}`, res.status === 200, `${res.status}, ${ms} ms, ${(html.length / 1024).toFixed(0)} KB`);

  const chunks = [...new Set([...html.matchAll(/src="(\/_next\/static\/[^"]+\.js)"/g)].map((m) => m[1]))];
  const pattern = /createServerReference\)?\(\s*["']([0-9a-f]{20,})["'][^)]*?["'](saveAnswer|submitAttempt)["']\s*\)/g;
  for (const chunk of chunks) {
    const js = await (await request("GET", chunk)).res.text();
    for (const m of js.matchAll(pattern)) ids[m[2]] = m[1];
    if (ids.saveAnswer && ids.submitAttempt) break;
  }
  step("found server-action ids", !!(ids.saveAnswer && ids.submitAttempt), JSON.stringify(ids));
}

// ---- 5. answer some questions, then submit ------------------------------------
async function callAction(actionId, argsArray) {
  return request("POST", examPath, {
    headers: {
      "Next-Action": actionId,
      "Content-Type": "text/plain;charset=UTF-8",
      Accept: "text/x-component",
      Origin: base,
    },
    body: JSON.stringify(argsArray),
  });
}

if (ids.saveAnswer && ids.submitAttempt) {
  let okSaves = 0;
  let slowest = 0;
  for (const q of data.questions.slice(0, 5)) {
    const { res, ms } = await callAction(ids.saveAnswer, [student.attemptId, q.id, q.options[0], 4]);
    if (res.status === 200) okSaves++;
    slowest = Math.max(slowest, ms);
  }
  step("saveAnswer x5", okSaves === 5, `${okSaves}/5 ok, slowest ${slowest} ms`);

  const submit = await callAction(ids.submitAttempt, [student.attemptId]);
  step("submitAttempt", submit.res.status === 200 || submit.res.status === 303, `${submit.res.status}, ${submit.ms} ms`);

  const results = await request("GET", `/student/attempts/${student.attemptId}/results`);
  step("GET results page", results.res.status === 200, `${results.res.status}, ${results.ms} ms`);
}

console.log(failed ? "\n✖ Smoke test FAILED - fix this before running k6." : "\n✔ Smoke test passed. Run: node loadtest/seed.cjs reset --yes   then the k6 scripts.");
process.exit(failed ? 1 : 0);
