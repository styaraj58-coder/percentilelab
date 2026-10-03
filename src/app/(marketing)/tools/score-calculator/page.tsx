import type { Metadata } from "next";

import { ScoreCalculator } from "./score-calculator";

export const metadata: Metadata = {
  title: "MBA Entrance Exam Score Calculator - MAH-CET, CAT, MAT, ATMA, UG BMS CET | Percentile Lab",
  description:
    "Free score calculator for MAH-CET, CAT, MAT, ATMA and UG BMS CET. Enter your correct and wrong answers to get your raw score using each exam's real marking scheme.",
  alternates: { canonical: "/tools/score-calculator" },
};

export default async function ScoreCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{ exam?: string }>;
}) {
  const { exam } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
        Free tool
      </p>
      <h1 className="mt-2 text-3xl font-bold text-brand-navy sm:text-4xl">
        MBA entrance exam score calculator
      </h1>
      <p className="mt-3 text-brand-ink/70">
        Work out your raw score for MAH-CET, CAT, MAT, ATMA or UG BMS CET using
        the exam&apos;s real marking scheme - including negative marking where it
        applies.
      </p>

      <div className="mt-8">
        <ScoreCalculator initialSlug={exam} />
      </div>
    </div>
  );
}
