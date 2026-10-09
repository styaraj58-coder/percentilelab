// Shared helpers for the k6 load tests. Every request mirrors what the real
// site's browser code sends (verified with loadtest/check.mjs).
import http from "k6/http";
import { check, fail } from "k6";

export const BASE = (__ENV.BASE_URL || "").replace(/\/$/, "");
if (!BASE) {
  throw new Error("Set BASE_URL to your STAGING address, e.g. -e BASE_URL=https://your-staging.vercel.app");
}
if (/percentilelab\.in/i.test(BASE) && !__ENV.I_UNDERSTAND_THIS_IS_PRODUCTION) {
  throw new Error("Refusing to load test the production site. Use your STAGING address.");
}

// Sign in the way the login form does (NextAuth credentials). k6 keeps the
// session cookie in the virtual user's own cookie jar.
export function login(user) {
  const csrfRes = http.get(`${BASE}/api/auth/csrf`, { tags: { name: "GET /api/auth/csrf" } });
  const csrf = csrfRes.json("csrfToken");
  const res = http.post(
    `${BASE}/api/auth/callback/credentials`,
    { csrfToken: csrf, email: user.email, password: user.password, callbackUrl: `${BASE}/student`, json: "true" },
    { redirects: 0, tags: { name: "POST sign-in" } }
  );
  const ok = check(res, { "sign-in accepted": (r) => r.status === 302 || r.status === 200 });
  return ok;
}

// The exam page calls two server actions (saveAnswer, submitAttempt). Their
// ids change with every deployment, so read them from the site's own script
// files - exactly where the browser gets them.
export function discoverActionIds(user) {
  if (__ENV.SAVE_ACTION_ID && __ENV.SUBMIT_ACTION_ID) {
    return { saveAnswer: __ENV.SAVE_ACTION_ID, submitAttempt: __ENV.SUBMIT_ACTION_ID };
  }
  if (!login(user)) fail("setup: could not sign in as the first load-test student");
  const page = http.get(`${BASE}/exam/${user.attemptId}`, { tags: { name: "setup: exam page" } });
  if (page.status !== 200) fail(`setup: exam page returned ${page.status}`);

  const chunks = [];
  const srcRe = /src="(\/_next\/static\/[^"]+\.js)"/g;
  let m;
  while ((m = srcRe.exec(page.body)) !== null) if (chunks.indexOf(m[1]) === -1) chunks.push(m[1]);

  const ids = {};
  for (let i = 0; i < chunks.length && !(ids.saveAnswer && ids.submitAttempt); i++) {
    const js = http.get(`${BASE}${chunks[i]}`, { tags: { name: "setup: script file" } }).body;
    const re = /createServerReference\)?\(\s*["']([0-9a-f]{20,})["'][^)]*?["'](saveAnswer|submitAttempt)["']\s*\)/g;
    while ((m = re.exec(js)) !== null) ids[m[2]] = m[1];
  }
  if (!ids.saveAnswer || !ids.submitAttempt) {
    fail("setup: could not find the server-action ids. Run `node loadtest/check.mjs` or pass -e SAVE_ACTION_ID=... -e SUBMIT_ACTION_ID=...");
  }
  return ids;
}

// Calls a server action on the exam page the way the browser does.
export function callAction(actionId, attemptId, args, name) {
  return http.post(`${BASE}/exam/${attemptId}`, JSON.stringify(args), {
    headers: {
      "Next-Action": actionId,
      "Content-Type": "text/plain;charset=UTF-8",
      Accept: "text/x-component",
      Origin: BASE,
    },
    redirects: 0,
    tags: { name },
  });
}

export function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}
