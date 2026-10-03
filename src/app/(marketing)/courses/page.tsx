import type { Metadata } from "next";
import Link from "next/link";

import { exams } from "@/lib/exam-data";

export const metadata: Metadata = {
  title: "Courses | Percentile Lab",
  description:
    "Exam-specific prep courses for MAH-CET, CAT, MAT, ATMA and UG BMS CET - live lectures, recordings, full-length mocks, sectional tests and doubt solving.",
};

const inclusions = [
  {
    title: "Live lectures",
    description: "Concept and strategy sessions taught live, with room to ask questions.",
  },
  {
    title: "Session recordings",
    description: "Every class is recorded so you can revisit a topic or catch up on a missed one.",
  },
  {
    title: "15+ full-length mocks",
    description: "Exam-pattern mocks with percentile, section-wise and time-per-question analysis.",
  },
  {
    title: "20+ sectional tests",
    description: "Targeted practice to fix your weakest section without sitting a full paper.",
  },
  {
    title: "Personalized doubt solving",
    description: "Get stuck questions explained instead of guessing at the solution.",
  },
  {
    title: "Detailed answer review",
    description: "Correct answer and explanation for every question after you submit.",
  },
];

export default function CoursesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
          Courses
        </p>
        <h1 className="mt-2 text-3xl font-bold text-brand-navy sm:text-4xl">
          Prep built around your exam
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-brand-ink/70">
          Every course follows the real pattern of the exam it targets - same
          sections, same timing, same marking scheme - so practice feels like
          the actual test.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => (
          <div
            key={exam.slug}
            className="flex flex-col rounded-2xl border border-black/10 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
              {exam.shortName}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-brand-navy">
              {exam.shortName} Preparation Course
            </h2>
            <p className="mt-1 text-sm text-brand-ink/60">{exam.fullName}</p>

            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-brand-ink/60">Exam duration</dt>
                <dd className="text-right font-medium text-brand-navy">
                  {exam.pattern.duration}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-brand-ink/60">Questions</dt>
                <dd className="text-right font-medium text-brand-navy">
                  {exam.pattern.totalQuestions}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-brand-ink/60">Sections</dt>
                <dd className="text-right font-medium text-brand-navy">
                  {exam.pattern.sections.length}
                </dd>
              </div>
            </dl>

            <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
              <Link
                href="/tests"
                className="flex items-center justify-center whitespace-nowrap rounded-md border border-brand-navy bg-brand-navy px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
              >
                Mock tests
              </Link>
              <Link
                href={`/exams?exam=${exam.slug}`}
                className="flex items-center justify-center whitespace-nowrap rounded-md border border-brand-navy/20 px-3 py-2.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-cream"
              >
                Syllabus
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border border-black/5 bg-brand-cream p-8">
        <h2 className="text-xl font-bold text-brand-navy">
          What every course includes
        </h2>
        <ul className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {inclusions.map((item) => (
            <li key={item.title} className="flex items-start gap-3">
              <span className="mt-0.5 text-brand-gold">✓</span>
              <div>
                <p className="font-semibold text-brand-navy">{item.title}</p>
                <p className="mt-0.5 text-sm text-brand-ink/70">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12 text-center">
        <p className="text-brand-ink/70">
          Not sure which course fits? Start with the free mocks, or tell us your
          target exam using the Enquire Now tab.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="/pricing"
            className="rounded-md bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-gold-light"
          >
            View pricing
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-brand-navy/20 px-6 py-3 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-cream"
          >
            Create free account
          </Link>
        </div>
      </div>
    </div>
  );
}
