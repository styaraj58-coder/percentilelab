"use client";

import Link from "next/link";
import { useState } from "react";

import { MBA_ENTRANCE_EXAMS } from "@/lib/validation";

import { PublishToggle, DeleteTestButton } from "./test-row-actions";

export type TestRow = {
  id: string;
  title: string;
  targetExam: string;
  durationMinutes: number;
  published: boolean;
  isFreePreview: boolean;
  questionCount: number;
  sectionCount: number;
  attemptCount: number;
  createdByName: string;
};

export function TestListByExam({ tests }: { tests: TestRow[] }) {
  const [activeExam, setActiveExam] = useState<string>("All");

  const examsWithCounts = MBA_ENTRANCE_EXAMS.map((exam) => ({
    exam,
    count: tests.filter((t) => t.targetExam === exam).length,
  }));

  const visibleTests =
    activeExam === "All" ? tests : tests.filter((t) => t.targetExam === activeExam);

  const createHref =
    activeExam === "All"
      ? "/admin/tests/new"
      : `/admin/tests/new?exam=${encodeURIComponent(activeExam)}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">All tests</h1>
          <p className="mt-1 text-sm text-brand-ink/60">
            {tests.length} test{tests.length === 1 ? "" : "s"} across every admin
          </p>
        </div>
        <Link
          href={createHref}
          className="rounded-md bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
        >
          + Create new test
        </Link>
      </div>

      <div
        role="tablist"
        aria-label="Filter tests by entrance exam"
        className="mt-6 flex flex-wrap gap-2 border-b border-black/10 pb-4"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeExam === "All"}
          onClick={() => setActiveExam("All")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            activeExam === "All"
              ? "bg-brand-navy text-white"
              : "bg-brand-cream text-brand-ink/70 hover:bg-brand-navy/10"
          }`}
        >
          All ({tests.length})
        </button>
        {examsWithCounts.map(({ exam, count }) => (
          <button
            key={exam}
            type="button"
            role="tab"
            aria-selected={activeExam === exam}
            onClick={() => setActiveExam(exam)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              activeExam === exam
                ? "bg-brand-navy text-white"
                : "bg-brand-cream text-brand-ink/70 hover:bg-brand-navy/10"
            }`}
          >
            {exam} ({count})
          </button>
        ))}
      </div>

      {visibleTests.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-brand-navy/20 bg-white p-10 text-center">
          <p className="text-brand-ink/70">
            {activeExam === "All"
              ? "No tests have been created yet."
              : `No tests yet for ${activeExam}.`}
          </p>
          <Link
            href={createHref}
            className="mt-4 inline-block rounded-md bg-brand-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy-light"
          >
            {activeExam === "All"
              ? "Create your first test"
              : `Create a test for ${activeExam}`}
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-black/5 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-black/5 bg-brand-cream/60 text-xs uppercase tracking-wide text-brand-ink/50">
              <tr>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Exam</th>
                <th className="px-5 py-3 font-medium">Created by</th>
                <th className="px-5 py-3 font-medium">Questions</th>
                <th className="px-5 py-3 font-medium">Duration</th>
                <th className="px-5 py-3 font-medium">Attempts</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleTests.map((test) => (
                <tr key={test.id} className="border-b border-black/5 last:border-0">
                  <td className="px-5 py-4 font-medium text-brand-navy">
                    {test.title}
                  </td>
                  <td className="px-5 py-4 text-brand-ink/70">{test.targetExam}</td>
                  <td className="px-5 py-4 text-brand-ink/70">{test.createdByName}</td>
                  <td className="px-5 py-4 text-brand-ink/70">
                    {test.questionCount} ({test.sectionCount} sections)
                  </td>
                  <td className="px-5 py-4 text-brand-ink/70">
                    {test.durationMinutes} min
                  </td>
                  <td className="px-5 py-4 text-brand-ink/70">
                    <Link
                      href={`/admin/tests/${test.id}/results`}
                      className="text-brand-navy hover:text-brand-gold hover:underline"
                    >
                      {test.attemptCount}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          test.published
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {test.published ? "Published" : "Draft"}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          test.isFreePreview
                            ? "bg-blue-100 text-blue-700"
                            : "bg-brand-gold/15 text-brand-gold"
                        }`}
                      >
                        {test.isFreePreview ? "Free" : "Premium"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href={`/admin/tests/${test.id}/preview`}
                        className="text-brand-navy hover:text-brand-gold hover:underline"
                      >
                        Preview
                      </Link>
                      <Link
                        href={`/admin/tests/${test.id}/edit`}
                        className="text-brand-navy hover:text-brand-gold hover:underline"
                      >
                        Edit
                      </Link>
                      <PublishToggle testId={test.id} published={test.published} />
                      <DeleteTestButton testId={test.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
