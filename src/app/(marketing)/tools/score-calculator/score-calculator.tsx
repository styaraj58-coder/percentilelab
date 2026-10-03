"use client";

import Link from "next/link";
import { useState } from "react";

// Marking rules come from each exam's published scheme (see exam-data.ts).
// CAT scores MCQs and type-in-the-answer (TITA) questions separately: wrong
// MCQs lose a mark, wrong TITAs lose nothing.
type Group = { key: string; label: string; correctMarks: number; wrongMarks: number };
type Rule = {
  slug: string;
  name: string;
  total: number;
  approxTotal?: boolean;
  scheme: string;
  groups: Group[];
};

const RULES: Rule[] = [
  {
    slug: "mah-cet",
    name: "MAH-CET (MBA/MMS)",
    total: 200,
    scheme: "+1 per correct answer, no negative marking",
    groups: [{ key: "all", label: "Questions", correctMarks: 1, wrongMarks: 0 }],
  },
  {
    slug: "cat",
    name: "CAT",
    total: 66,
    approxTotal: true,
    scheme: "+3 per correct answer, -1 per wrong MCQ, no negative marking on TITA",
    groups: [
      { key: "mcq", label: "MCQs", correctMarks: 3, wrongMarks: 1 },
      { key: "tita", label: "TITA (type-in answers)", correctMarks: 3, wrongMarks: 0 },
    ],
  },
  {
    slug: "mat",
    name: "MAT",
    total: 200,
    scheme: "+1 per correct answer, -0.25 per wrong answer",
    groups: [{ key: "all", label: "Questions", correctMarks: 1, wrongMarks: 0.25 }],
  },
  {
    slug: "atma",
    name: "ATMA",
    total: 180,
    scheme: "+1 per correct answer, -0.25 per wrong answer",
    groups: [{ key: "all", label: "Questions", correctMarks: 1, wrongMarks: 0.25 }],
  },
  {
    slug: "ug-bms-cet",
    name: "UG BMS CET",
    total: 100,
    scheme: "+1 per correct answer, no negative marking",
    groups: [{ key: "all", label: "Questions", correctMarks: 1, wrongMarks: 0 }],
  },
];

const inputClass =
  "mt-1 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";

function parseCount(value: string) {
  if (value.trim() === "") return 0;
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? n : NaN;
}

function formatMarks(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

export function ScoreCalculator({ initialSlug }: { initialSlug?: string }) {
  const [slug, setSlug] = useState(
    RULES.some((r) => r.slug === initialSlug) ? (initialSlug as string) : RULES[0].slug
  );
  const [values, setValues] = useState<Record<string, string>>({});

  const rule = RULES.find((r) => r.slug === slug) ?? RULES[0];
  const get = (key: string) => values[`${slug}:${key}`] ?? "";
  const set = (key: string, v: string) => setValues((prev) => ({ ...prev, [`${slug}:${key}`]: v }));

  let score = 0;
  let correctTotal = 0;
  let wrongTotal = 0;
  let invalid = false;
  for (const g of rule.groups) {
    const c = parseCount(get(`${g.key}-correct`));
    const w = parseCount(get(`${g.key}-wrong`));
    if (Number.isNaN(c) || Number.isNaN(w)) {
      invalid = true;
      continue;
    }
    correctTotal += c;
    wrongTotal += w;
    score += c * g.correctMarks - w * g.wrongMarks;
  }

  const attempted = correctTotal + wrongTotal;
  const overTotal = !rule.approxTotal && attempted > rule.total;
  const maxScore = rule.total * rule.groups[0].correctMarks;
  const hasInput = attempted > 0;
  const showResult = hasInput && !invalid && !overTotal;
  const accuracy = attempted > 0 ? Math.round((correctTotal / attempted) * 100) : 0;
  const unattempted = Math.max(0, rule.total - attempted);

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8">
      <label htmlFor="calc-exam" className="text-xs font-medium text-brand-ink/70">
        Entrance exam
      </label>
      <select
        id="calc-exam"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        className={`${inputClass} max-w-xs`}
      >
        {RULES.map((r) => (
          <option key={r.slug} value={r.slug}>
            {r.name}
          </option>
        ))}
      </select>
      <p className="mt-2 text-xs text-brand-ink/60">
        Marking scheme: {rule.scheme}.{" "}
        {rule.approxTotal
          ? `The paper has about ${rule.total} questions and can vary slightly.`
          : `The paper has ${rule.total} questions.`}
      </p>

      <div className="mt-6 space-y-5">
        {rule.groups.map((g) => (
          <div key={g.key}>
            {rule.groups.length > 1 && (
              <p className="text-sm font-semibold text-brand-navy">{g.label}</p>
            )}
            <div className="mt-1 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-brand-ink/70">
                  Correct answers
                </label>
                <input
                  inputMode="numeric"
                  value={get(`${g.key}-correct`)}
                  onChange={(e) => set(`${g.key}-correct`, e.target.value)}
                  className={inputClass}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-brand-ink/70">
                  Wrong answers
                </label>
                <input
                  inputMode="numeric"
                  value={get(`${g.key}-wrong`)}
                  onChange={(e) => set(`${g.key}-wrong`, e.target.value)}
                  className={inputClass}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {invalid && (
        <p className="mt-4 text-sm text-red-700">
          Enter whole numbers only (0 or more).
        </p>
      )}
      {overTotal && !invalid && (
        <p className="mt-4 text-sm text-red-700">
          Correct + wrong answers ({attempted}) can&apos;t be more than the {rule.total}{" "}
          questions in {rule.name}.
        </p>
      )}

      <div className="mt-6 rounded-xl bg-brand-cream p-5">
        {showResult ? (
          <>
            <p className="text-xs uppercase tracking-wide text-brand-ink/50">
              Your raw score
            </p>
            <p className="mt-1 text-3xl font-bold text-brand-navy">
              {formatMarks(score)}
              <span className="text-lg font-semibold text-brand-ink/50">
                {" "}
                / {rule.approxTotal ? "~" : ""}
                {formatMarks(maxScore)}
              </span>
            </p>
            <dl className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-lg bg-white p-3">
                <dt className="text-xs text-brand-ink/50">Accuracy</dt>
                <dd className="mt-0.5 font-semibold text-brand-navy">{accuracy}%</dd>
              </div>
              <div className="rounded-lg bg-white p-3">
                <dt className="text-xs text-brand-ink/50">Attempted</dt>
                <dd className="mt-0.5 font-semibold text-brand-navy">{attempted}</dd>
              </div>
              <div className="rounded-lg bg-white p-3">
                <dt className="text-xs text-brand-ink/50">
                  {rule.approxTotal ? "Marks lost" : "Not attempted"}
                </dt>
                <dd className="mt-0.5 font-semibold text-brand-navy">
                  {rule.approxTotal
                    ? formatMarks(
                        rule.groups.reduce(
                          (sum, g) => sum + parseCount(get(`${g.key}-wrong`)) * g.wrongMarks,
                          0
                        )
                      )
                    : unattempted}
                </dd>
              </div>
            </dl>
          </>
        ) : (
          <p className="text-sm text-brand-ink/60">
            Enter your correct and wrong answers to see your raw score.
          </p>
        )}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-brand-ink/60">
        This is your <strong>raw score</strong>, not your percentile. A percentile
        depends on how everyone else who took the exam scored, so it can only be
        known once results are out. To see where you stand among real test-takers
        today, take a timed mock on Percentile Lab.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/tests"
          className="rounded-md bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
        >
          Take a mock test
        </Link>
        <Link
          href={`/exams/${rule.slug}`}
          className="rounded-md border border-brand-navy/20 px-5 py-2.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-cream"
        >
          {rule.name.split(" (")[0]} exam details
        </Link>
      </div>
    </div>
  );
}
