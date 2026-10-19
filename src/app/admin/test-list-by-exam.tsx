"use client";

import Link from "next/link";
import { useState } from "react";

import { MBA_ENTRANCE_EXAMS } from "@/lib/validation";

import { PublishToggle, FreePreviewToggle, DeleteTestButton } from "./test-row-actions";

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
        className="mt-6 flex gap-2 overflow-x-auto border-b border-black/10 pb-4 sm:flex-wrap"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeExam === "All"}
          onClick={() => setActiveExam("All")}
          className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-colors sm:py-2 ${
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
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-colors sm:py-2 ${
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
        <div className="mt-8 rounded-xl border border-black/5 bg-white sm:overflow-x-auto">
          <table className="block w-full text-left text-sm sm:table sm:min-w-[720px]">
            <thead className="hidden border-b border-black/5 bg-brand-cream/60 text-xs uppercase tracking-wide text-brand-ink/50 sm:table-header-group">
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
            <tbody className="block sm:table-row-group">
              {visibleTests.map((test) => (
                <tr key={test.id} className="block border-b border-black/5 px-4 py-4 last:border-0 sm:table-row sm:px-0 sm:py-0">
                  <td className="block px-0 py-1 sm:table-cell sm:px-5 sm:py-4 text-base font-medium text-brand-navy sm:text-sm">
                    {test.title}
                  </td>
                  <td data-label="Exam" className="block px-0 py-1 sm:table-cell sm:px-5 sm:py-4 text-brand-ink/70 before:mr-2 before:text-xs before:uppercase before:tracking-wide before:text-brand-ink/45 before:content-[attr(data-label)] sm:before:content-none">{test.targetExam}</td>
                  <td data-label="Created by" className="block px-0 py-1 sm:table-cell sm:px-5 sm:py-4 text-brand-ink/70 before:mr-2 before:text-xs before:uppercase before:tracking-wide before:text-brand-ink/45 before:content-[attr(data-label)] sm:before:content-none">{test.createdByName}</td>
                  <td data-label="Questions" className="block px-0 py-1 sm:table-cell sm:px-5 sm:py-4 text-brand-ink/70 before:mr-2 before:text-xs before:uppercase before:tracking-wide before:text-brand-ink/45 before:content-[attr(data-label)] sm:before:content-none">
                    {test.questionCount} ({test.sectionCount} sections)
                  </td>
                  <td data-label="Duration" className="block px-0 py-1 sm:table-cell sm:px-5 sm:py-4 text-brand-ink/70 before:mr-2 before:text-xs before:uppercase before:tracking-wide before:text-brand-ink/45 before:content-[attr(data-label)] sm:before:content-none">
                    {test.durationMinutes} min
                  </td>
                  <td data-label="Attempts" className="block px-0 py-1 sm:table-cell sm:px-5 sm:py-4 text-brand-ink/70 before:mr-2 before:text-xs before:uppercase before:tracking-wide before:text-brand-ink/45 before:content-[attr(data-label)] sm:before:content-none">
                    <Link
                      href={`/admin/tests/${test.id}/results`}
                      className="text-brand-navy hover:text-brand-gold hover:underline"
                    >
                      {test.attemptCount}
                    </Link>
                  </td>
                  <td className="block px-0 py-1 sm:table-cell sm:px-5 sm:py-4 sm:py-4">
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
                  <td className="block px-0 py-1 sm:table-cell sm:px-5 sm:py-4 pt-3 sm:py-4">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 [&_a]:py-2 [&_button]:py-2 sm:gap-3 sm:[&_a]:py-0 sm:[&_button]:py-0">
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
                      <FreePreviewToggle
                        testId={test.id}
                        isFreePreview={test.isFreePreview}
                      />
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
