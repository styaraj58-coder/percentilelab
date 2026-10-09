// Scenario 1 - visitors browsing the public site (no login).
//
//   k6 run -e BASE_URL=https://your-staging.vercel.app loadtest/k6/public.js
//   k6 run -e BASE_URL=... -e VUS=200 loadtest/k6/public.js
import http from "k6/http";
import { check, sleep } from "k6";

import { BASE, pick } from "./lib.js";

const VUS = Number(__ENV.VUS || 50);

export const options = {
  stages: [
    { duration: "1m", target: VUS }, // ramp up
    { duration: "4m", target: VUS }, // hold
    { duration: "30s", target: 0 }, // ramp down
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"], // under 1% errors
    http_req_duration: ["p(95)<1500"], // 95% of pages under 1.5 s
  },
};

// Weighted like real traffic: lots of home / courses, some blog and exam pages.
const pages = [
  "/", "/", "/", "/courses", "/courses", "/tests", "/about",
  "/blog",
  "/exams/cat", "/exams/mah-cet", "/exams/ug-bms-cet", "/resources", "/sample-test",
];

export default function () {
  const path = pick(pages);
  const res = http.get(`${BASE}${path}`, { tags: { name: `GET ${path}` } });
  check(res, { "status 200": (r) => r.status === 200 });
  sleep(2 + Math.random() * 6); // a visitor reads for a few seconds
}
