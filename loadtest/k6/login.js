// Scenario 2 - lots of students signing in at the same time (the start of a
// scheduled mock). Password checking is CPU-heavy, so this shows how the
// server copes with a burst of sign-ins.
//
//   k6 run -e BASE_URL=https://your-staging.vercel.app loadtest/k6/login.js
//   k6 run -e BASE_URL=... -e VUS=150 loadtest/k6/login.js
import http from "k6/http";
import { check, sleep } from "k6";
import { SharedArray } from "k6/data";

import { BASE, login } from "./lib.js";

const users = new SharedArray("users", () => JSON.parse(open("../data.json")).users);
const VUS = Math.min(Number(__ENV.VUS || 50), users.length);

export const options = {
  stages: [
    { duration: "30s", target: VUS },
    { duration: "2m", target: VUS },
    { duration: "20s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.02"],
    "http_req_duration{name:POST sign-in}": ["p(95)<3000"],
  },
};

export default function () {
  const user = users[(__VU - 1) % users.length];
  if (login(user)) {
    const portal = http.get(`${BASE}/student`, { tags: { name: "GET /student" } });
    check(portal, { "portal 200": (r) => r.status === 200 });
  }
  http.cookieJar().clear(BASE); // next iteration signs in again from scratch
  sleep(1);
}
