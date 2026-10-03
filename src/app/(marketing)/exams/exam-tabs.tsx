"use client";

import { useState } from "react";

import type { ExamInfo } from "@/lib/exam-data";

import { ExamDetails } from "./exam-details";

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

      <ExamDetails exam={active} />
    </div>
  );
}
