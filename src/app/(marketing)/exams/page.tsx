import type { Metadata } from "next";

import { exams } from "@/lib/exam-data";
import { ExamTabs } from "@/app/(marketing)/exams/exam-tabs";

export const metadata: Metadata = {
  title: "MBA Entrance Exams | Percentile Lab",
  description:
    "Syllabus and exam pattern for MAH-CET, CAT, MAT, and ATMA - the major MBA entrance exams in India.",
};

export default function ExamsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
        MBA Entrance Exams
      </p>
      <h1 className="mt-2 text-3xl font-bold text-brand-navy sm:text-4xl">
        Know the exam before you prep for it
      </h1>
      <p className="mt-3 max-w-2xl text-brand-ink/70">
        Syllabus and exam pattern for every major MBA entrance exam - pick a
        tab to see what it actually tests.
      </p>

      <div className="mt-10">
        <ExamTabs exams={exams} />
      </div>
    </div>
  );
}
