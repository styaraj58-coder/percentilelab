// Scenario 3 - the real peak: many students taking the same mock together.
// Each virtual student signs in, opens the exam (the whole 200-question test
// loads at once), answers questions at a human pace, submits and views results.
//
//   node loadtest/seed.cjs reset --yes        <- fresh attempts before EVERY run
//   k6 run -e BASE_URL=https://your-staging.vercel.app loadtest/k6/exam.js
//
// Settings (all optional):
//   -e USERS=100        virtual students (max = how many you seeded)
//   -e PROFILE=load     load (default, starts spread over 2 min) |
//                       spike (everyone starts within 10 s - the 10:00 sharp case) |
//                       smoke (one student, no waiting)
//   -e QUESTIONS=30     questions each student answers
//   -e THINK=15         seconds spent per question (real students: ~40-60)
import http from "k6/http";
import { check, sleep } from "k6";
import { SharedArray } from "k6/data";
import { Counter, Trend } from "k6/metrics";

import { BASE, callAction, discoverActionIds, login, pick } from "./lib.js";

const data = new SharedArray("data", () => [JSON.parse(open("../data.json"))]);
const { users, questions } = data[0];

const profile = __ENV.PROFILE || "load";
const USERS = profile === "smoke" ? 1 : Math.min(Number(__ENV.USERS || 50), users.length);
const QUESTIONS = Number(__ENV.QUESTIONS || (profile === "smoke" ? 5 : 30));
const THINK = Number(__ENV.THINK || (profile === "smoke" ? 0 : 15));
const SPREAD = profile === "spike" ? 10 : profile === "smoke" ? 0 : 120;

export const options = {
  scenarios: {
    students: { executor: "per-vu-iterations", vus: USERS, iterations: 1, maxDuration: "90m" },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    exam_open_ms: ["p(95)<3000"],
    save_answer_ms: ["p(95)<1000"],
    submit_ms: ["p(95)<5000"],
    results_ms: ["p(95)<3000"],
    action_errors: ["count<1"],
  },
};

const examOpen = new Trend("exam_open_ms", true);
const saveAnswer = new Trend("save_answer_ms", true);
const submit = new Trend("submit_ms", true);
const results = new Trend("results_ms", true);
const actionErrors = new Counter("action_errors");

export function setup() {
  if (users.length < USERS) throw new Error(`Only ${users.length} students seeded, USERS=${USERS}`);
  return discoverActionIds(users[0]);
}

export default function (ids) {
  const user = users[(__VU - 1) % users.length];
  sleep(Math.random() * SPREAD); // students don't all arrive in the same instant

  if (!login(user)) return;
  http.get(`${BASE}/student`, { tags: { name: "GET /student" } });

  // Opening the exam loads the whole test (questions, options, passages).
  const exam = http.get(`${BASE}/exam/${user.attemptId}`, { tags: { name: "GET /exam/:attempt" } });
  examOpen.add(exam.timings.duration);
  if (!check(exam, { "exam page 200": (r) => r.status === 200 })) {
    actionErrors.add(1);
    return;
  }

  for (let i = 0; i < QUESTIONS; i++) {
    const q = questions[i % questions.length];
    sleep(THINK * (0.5 + Math.random())); // reading + thinking

    // 1) the student clicks an option   2) presses Next (time-only save)
    const click = callAction(ids.saveAnswer, user.attemptId, [user.attemptId, q.id, pick(q.options), Math.round(THINK)], "saveAnswer (click)");
    saveAnswer.add(click.timings.duration);
    const next = callAction(ids.saveAnswer, user.attemptId, [user.attemptId, q.id, "$undefined", 1], "saveAnswer (next)");
    saveAnswer.add(next.timings.duration);
    if (click.status !== 200 || next.status !== 200) actionErrors.add(1);
  }

  const done = callAction(ids.submitAttempt, user.attemptId, [user.attemptId], "submitAttempt");
  submit.add(done.timings.duration);
  if (!check(done, { "submitted": (r) => r.status === 200 || r.status === 303 })) actionErrors.add(1);

  const res = http.get(`${BASE}/student/attempts/${user.attemptId}/results`, { tags: { name: "GET /results/:attempt" } });
  results.add(res.timings.duration);
  check(res, { "results 200": (r) => r.status === 200 });
}
