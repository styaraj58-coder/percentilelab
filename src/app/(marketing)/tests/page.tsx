import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/auth";
import { exams } from "@/lib/exam-data";
import { EXAM_TARGET_EXAM } from "@/lib/site";
import { getPublishedTests, summariseTests } from "@/lib/tests-data";

export const metadata: Metadata = {
  title: "Mock Tests | Percentile Lab",
  description:
    "What mock tests Percentile Lab offers for CAT, MAH-CET, MAT, ATMA and UG BMS CET - full-length and sectional tests with percentile and section-wise analysis, taken inside your student portal.",
  alternates: { canonical: "/tests" },
};

const steps = [
  { title: "Register", text: "Create your account and pick the exam you are preparing for." },
  { title: "Open your student portal", text: "Your exam's tests are listed there, ready to start." },
  { title: "Take timed tests", text: "Practise under a live timer, then review your percentile and section-wise analysis." },
];

export default async function TestsPage() {
  const [session, tests] = await Promise.all([auth(), getPublishedTests()]);

  const portal = session?.user
    ? session.user.role === "ADMIN"
      ? { href: "/admin", label: "Open admin" }
      : { href: "/student", label: "Open student portal" }
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
        Mock Tests
      </p>
      <h1 className="mt-2 text-3xl font-bold text-brand-navy sm:text-4xl">
        Practice that feels like the real exam
      </h1>
      <p className="mt-3 max-w-2xl text-brand-ink/70">
        Every mock and sectional test is taken inside your student portal. Here
        is what we offer for each exam - register and your tests will be waiting
        there.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        {portal ? (
          <Link
            href={portal.href}
            className="rounded-md bg-brand-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
          >
            {portal.label}
          </Link>
        ) : (
          <>
            <Link
              href="/register"
              className="rounded-md bg-brand-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
            >
              Create free account
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-brand-navy/20 px-6 py-3 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-cream"
            >
              Log in to your portal
            </Link>
          </>
        )}
        <Link
          href="/sample-test"
          className="rounded-md border border-brand-navy/20 px-6 py-3 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-cream"
        >
          Try 10 free questions
        </Link>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {exams.map((exam) => {
          const summary = summariseTests(tests, EXAM_TARGET_EXAM[exam.slug]);
          return (
            <div
              key={exam.slug}
              className="flex flex-col rounded-2xl border border-black/10 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
                    {exam.shortName}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-brand-navy">
                    {exam.shortName} mock tests
                  </h2>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    summary.total > 0 ? "bg-green-100 text-green-700" : "bg-black/5 text-brand-ink/55"
                  }`}
                >
                  {summary.total > 0 ? "Live" : "Coming soon"}
                </span>
              </div>

              {summary.total > 0 ? (
                <p className="mt-3 text-sm text-brand-ink/75">
                  <span className="font-semibold text-brand-navy">{summary.total}</span>{" "}
                  {summary.total === 1 ? "test" : "tests"}
                  {summary.fullLength > 0 && ` · ${summary.fullLength} full-length`}
                  {summary.sectional > 0 && ` · ${summary.sectional} sectional`}
                  {summary.free > 0 && ` · ${summary.free} free to start`}
                </p>
              ) : (
                <p className="mt-3 text-sm text-brand-ink/60">
                  Tests for {exam.shortName} are being added.
                </p>
              )}

              <dl className="mt-4 space-y-1.5 text-sm">
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 text-brand-ink/50">Duration</dt>
                  <dd className="text-brand-ink/80">{exam.pattern.duration}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 text-brand-ink/50">Questions</dt>
                  <dd className="text-brand-ink/80">{exam.pattern.totalQuestions}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 text-brand-ink/50">Marking</dt>
                  <dd className="text-brand-ink/80">{exam.pattern.markingScheme}</dd>
                </div>
              </dl>

              <Link
                href={`/exams/${exam.slug}`}
                className="mt-auto pt-5 text-sm font-semibold text-brand-navy hover:text-brand-gold"
              >
                Exam pattern &amp; syllabus &rarr;
              </Link>
            </div>
          );
        })}
      </div>

      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold text-brand-navy">How it works</h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="rounded-2xl border border-black/10 bg-white p-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold/15 text-sm font-bold text-brand-gold">
                {i + 1}
              </span>
              <h3 className="mt-3 font-semibold text-brand-navy">{step.title}</h3>
              <p className="mt-1 text-sm text-brand-ink/70">{step.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-center text-sm text-brand-ink/70">
          Some tests are free; the rest unlock with a course or the Test Series.{" "}
          <Link href="/courses" className="font-semibold text-brand-navy hover:text-brand-gold">
            See courses &amp; pricing &rarr;
          </Link>
        </p>
      </section>
    </div>
  );
}
