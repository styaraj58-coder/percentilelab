"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { BANK_SECTIONS, MBA_ENTRANCE_EXAMS } from "@/lib/validation";

import { generateMock, type GenerateMockState } from "../actions";

// Full-Length MBA CET Mock defaults from the question-bank blueprint (200
// questions total: 75 LR / 25 AR / 50 QA / 50 VARC).
const DEFAULT_COUNTS: Record<(typeof BANK_SECTIONS)[number], number> = {
  "Logical Reasoning": 75,
  "Abstract Reasoning": 25,
  "Quantitative Aptitude": 50,
  "Verbal Ability & RC": 50,
};

export function GenerateMockForm() {
  const [title, setTitle] = useState("");
  const [targetExam, setTargetExam] = useState<string>("MH-CET (MBA)");
  const [durationMinutes, setDurationMinutes] = useState(150);
  const [published, setPublished] = useState(false);
  const [counts, setCounts] = useState(DEFAULT_COUNTS);
  const [state, setState] = useState<GenerateMockState>(undefined);
  const [isPending, startTransition] = useTransition();

  const total = BANK_SECTIONS.reduce((sum, s) => sum + (counts[s] || 0), 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await generateMock({
        title,
        targetExam: targetExam as (typeof MBA_ENTRANCE_EXAMS)[number],
        durationMinutes,
        published,
        sectionCounts: counts,
      });
      setState(result);
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {state?.error && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-brand-ink">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={3}
            placeholder="e.g. CET Mock 7"
            className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-brand-ink">
              Target exam
            </label>
            <select
              value={targetExam}
              onChange={(e) => setTargetExam(e.target.value)}
              className="mt-1 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
            >
              {MBA_ENTRANCE_EXAMS.map((exam) => (
                <option key={exam} value={exam}>
                  {exam}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-ink">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              min={1}
              max={600}
              required
              className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-brand-ink">
            Questions per section
          </p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {BANK_SECTIONS.map((section) => (
              <div key={section}>
                <label className="block text-xs text-brand-ink/60">{section}</label>
                <input
                  type="number"
                  value={counts[section]}
                  onChange={(e) =>
                    setCounts((prev) => ({
                      ...prev,
                      [section]: Math.max(0, Number(e.target.value)),
                    }))
                  }
                  min={0}
                  className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
                />
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-brand-ink/50">Total: {total} questions</p>
        </div>

        <label className="flex items-center gap-2 text-sm text-brand-ink">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4 w-4 accent-brand-navy"
          />
          Publish immediately
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light disabled:opacity-60"
        >
          {isPending ? "Generating..." : "Generate mock"}
        </button>
      </form>

      {state?.testId && state.summary && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <p className="text-sm font-semibold text-green-800">
            Mock generated —{" "}
            <Link
              href={`/admin/tests/${state.testId}/preview`}
              className="underline hover:text-green-900"
            >
              preview it
            </Link>{" "}
            or{" "}
            <Link
              href={`/admin/tests/${state.testId}/edit`}
              className="underline hover:text-green-900"
            >
              edit it
            </Link>
            .
          </p>
          <table className="mt-3 w-full text-left text-xs text-green-900">
            <thead>
              <tr className="text-green-700/70">
                <th className="py-1 pr-3 font-medium">Section</th>
                <th className="py-1 pr-3 font-medium">Requested</th>
                <th className="py-1 pr-3 font-medium">Drawn</th>
                <th className="py-1 font-medium">Easy / Mod / Diff</th>
              </tr>
            </thead>
            <tbody>
              {state.summary.map((row) => (
                <tr key={row.section}>
                  <td className="py-1 pr-3 font-medium">{row.section}</td>
                  <td className="py-1 pr-3">{row.requested}</td>
                  <td className="py-1 pr-3">{row.drawn}</td>
                  <td className="py-1">
                    {row.byDifficulty.EASY?.drawn ?? 0}/
                    {row.byDifficulty.EASY?.requested ?? 0} ·{" "}
                    {row.byDifficulty.MODERATE?.drawn ?? 0}/
                    {row.byDifficulty.MODERATE?.requested ?? 0} ·{" "}
                    {row.byDifficulty.DIFFICULT?.drawn ?? 0}/
                    {row.byDifficulty.DIFFICULT?.requested ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {state.summary.some((s) => s.drawn < s.requested) && (
            <p className="mt-3 text-xs text-amber-700">
              Some sections came up short — the bank doesn&apos;t have enough
              unused questions at the requested difficulty mix yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
