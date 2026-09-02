"use client";

import Link from "next/link";
import { useState } from "react";

import { startAttempt } from "@/app/student/actions";
import { StartTestButton } from "@/app/student/start-test-button";
import { MBA_ENTRANCE_EXAMS } from "@/lib/validation";

export type TestSummary = {
  id: string;
  title: string;
  description: string | null;
  targetExam: string;
  durationMinutes: number;
  questionCount: number;
  sectionCount: number;
  isFreePreview: boolean;
};

export function TestsBrowser({
  tests,
  isAuthenticated,
  hasPremiumAccess,
}: {
  tests: TestSummary[];
  isAuthenticated: boolean;
  hasPremiumAccess: boolean;
}) {
  const [selectedExam, setSelectedExam] = useState<string>("All");

  const examsWithCounts = MBA_ENTRANCE_EXAMS.map((exam) => ({
    exam,
    count: tests.filter((t) => t.targetExam === exam).length,
  }));

  const visibleTests =
    selectedExam === "All" ? tests : tests.filter((t) => t.targetExam === selectedExam);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <label
            htmlFor="exam-filter"
            className="block text-xs font-medium text-brand-ink/70"
          >
            Entrance exam
          </label>
          <select
            id="exam-filter"
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="mt-1 w-64 max-w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
          >
            <option value="All">All exams ({tests.length})</option>
            {examsWithCounts.map(({ exam, count }) => (
              <option key={exam} value={exam}>
                {exam} ({count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {visibleTests.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-brand-navy/20 bg-white p-10 text-center text-brand-ink/60">
          {selectedExam === "All"
            ? "No tests are published yet - check back soon."
            : `No ${selectedExam} tests published yet - check back soon.`}
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {visibleTests.map((test) => (
            <div
              key={test.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-black/5 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-navy/15 hover:shadow-md"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-brand-navy">
                    {test.title}
                  </h2>
                  <span className="rounded-full bg-brand-gold/15 px-2.5 py-0.5 text-xs font-semibold text-brand-gold">
                    {test.targetExam}
                  </span>
                  {!test.isFreePreview && (
                    <span className="rounded-full bg-brand-navy/10 px-2.5 py-0.5 text-xs font-semibold text-brand-navy">
                      Premium
                    </span>
                  )}
                </div>
                {test.description && (
                  <p className="mt-1 text-sm text-brand-ink/70">
                    {test.description}
                  </p>
                )}
                <p className="mt-2 text-xs text-brand-ink/50">
                  {test.questionCount} questions · {test.sectionCount} sections
                  · {test.durationMinutes} min
                </p>
              </div>

              {!isAuthenticated ? (
                <Link
                  href="/register"
                  className="shrink-0 rounded-md bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
                >
                  Get started free
                </Link>
              ) : test.isFreePreview || hasPremiumAccess ? (
                <form action={startAttempt.bind(null, test.id)} className="shrink-0">
                  <StartTestButton label="Start test" />
                </form>
              ) : (
                <Link
                  href="/pricing"
                  className="shrink-0 rounded-md border border-brand-gold px-5 py-2.5 text-sm font-semibold text-brand-gold transition-colors hover:bg-brand-gold/10"
                >
                  Upgrade to unlock
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
