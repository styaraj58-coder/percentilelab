"use client";

import { useState } from "react";

import type { ExamInfo } from "@/lib/exam-data";

export function ExamTabs({
  exams,
  initialSlug,
}: {
  exams: ExamInfo[];
  initialSlug?: string;
}) {
  const [activeSlug, setActiveSlug] = useState(initialSlug ?? exams[0]?.slug);
  const active = exams.find((e) => e.slug === activeSlug) ?? exams[0];

  if (!active) return null;

  return (
    <div>
      <div
        role="tablist"
        aria-label="MBA entrance exams"
        className="flex flex-wrap gap-2 border-b border-black/10 pb-4"
      >
        {exams.map((exam) => {
          const isActive = exam.slug === active.slug;
          return (
            <button
              key={exam.slug}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveSlug(exam.slug)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-brand-navy text-white"
                  : "bg-brand-cream text-brand-ink/70 hover:bg-brand-navy/10"
              }`}
            >
              {exam.shortName}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <div>
          <h2 className="text-2xl font-bold text-brand-navy">
            {active.fullName}
          </h2>
          <p className="mt-1 text-sm font-medium text-brand-gold">
            Conducted by {active.conductedBy}
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-brand-ink/80">
            {active.about}
          </p>
        </div>

        <div className="mt-10">
          <h3 className="text-lg font-semibold text-brand-navy">
            Exam pattern
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-black/5 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-navy/15 hover:shadow-md">
              <p className="text-xs uppercase tracking-wide text-brand-ink/50">
                Mode
              </p>
              <p className="mt-1 text-sm font-semibold text-brand-navy">
                {active.pattern.mode}
              </p>
            </div>
            <div className="rounded-xl border border-black/5 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-navy/15 hover:shadow-md">
              <p className="text-xs uppercase tracking-wide text-brand-ink/50">
                Duration
              </p>
              <p className="mt-1 text-sm font-semibold text-brand-navy">
                {active.pattern.duration}
              </p>
            </div>
            <div className="rounded-xl border border-black/5 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-navy/15 hover:shadow-md">
              <p className="text-xs uppercase tracking-wide text-brand-ink/50">
                Total questions
              </p>
              <p className="mt-1 text-sm font-semibold text-brand-navy">
                {active.pattern.totalQuestions}
              </p>
            </div>
            <div className="rounded-xl border border-black/5 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-navy/15 hover:shadow-md">
              <p className="text-xs uppercase tracking-wide text-brand-ink/50">
                Marking scheme
              </p>
              <p className="mt-1 text-sm font-semibold text-brand-navy">
                {active.pattern.markingScheme}
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-black/5 bg-white">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="border-b border-black/5 bg-brand-cream/60 text-xs uppercase tracking-wide text-brand-ink/50">
                <tr>
                  <th className="px-5 py-3 font-medium">Section</th>
                  <th className="px-5 py-3 font-medium">Questions</th>
                </tr>
              </thead>
              <tbody>
                {active.pattern.sections.map((section) => (
                  <tr
                    key={section.name}
                    className="border-b border-black/5 last:border-0"
                  >
                    <td className="px-5 py-3 font-medium text-brand-navy">
                      {section.name}
                      {section.detail && (
                        <span className="mt-0.5 block text-xs font-normal text-brand-ink/50">
                          {section.detail}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-brand-ink/70">
                      {section.questions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-lg font-semibold text-brand-navy">Syllabus</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {active.syllabus.map((group) => (
              <div
                key={group.category}
                className="rounded-xl border border-black/5 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-navy/15 hover:shadow-md"
              >
                <p className="font-semibold text-brand-navy">
                  {group.category}
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-brand-ink/80">
                  {group.topics.map((topic) => (
                    <li key={topic} className="flex gap-2">
                      <span className="text-brand-gold">•</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold text-brand-navy">
              Top colleges accepting {active.shortName}
            </h3>
            <ol className="mt-4 space-y-2 rounded-xl border border-black/5 bg-white p-5 text-sm text-brand-ink/80">
              {active.topColleges.map((college, index) => (
                <li key={college} className="flex gap-3">
                  <span className="shrink-0 font-semibold text-brand-gold">
                    {index + 1}.
                  </span>
                  <span>{college}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-brand-navy">
              Tentative exam dates
            </h3>
            <div className="mt-4 rounded-xl border border-black/5 bg-white p-5">
              <ul className="space-y-4">
                {active.tentativeDates.map((date) => (
                  <li key={date.label} className="flex gap-3 text-sm">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-gold" />
                    <div>
                      <p className="font-semibold text-brand-navy">
                        {date.label}
                      </p>
                      <p className="text-brand-ink/70">{date.window}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-10 text-xs text-brand-ink/50">
          Exam patterns, syllabi, accepting colleges, and dates are set by
          each conducting body and can change from year to year - dates
          above are typical tentative windows based on past cycles, not
          confirmed for the upcoming exam. This page is a study reference.
          Always confirm current-year details on the official exam website
          before you plan your prep.
        </p>
      </div>
    </div>
  );
}
