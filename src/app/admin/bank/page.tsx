import type { Metadata } from "next";
import Link from "next/link";

import { BANK_SECTIONS } from "@/lib/validation";

import { getBankOverview } from "./actions";

export const metadata: Metadata = { title: "Question bank | Percentile Lab" };

// Target bank sizes per the Percentile Lab question-bank blueprint (for a
// 200-question mock at 5-10x coverage). Shown as a progress reference only —
// generation works fine below these numbers, just with fewer distinct mocks
// before questions start running out.
const SECTION_TARGETS: Record<(typeof BANK_SECTIONS)[number], number> = {
  "Logical Reasoning": 750,
  "Abstract Reasoning": 250,
  "Quantitative Aptitude": 500,
  "Verbal Ability & RC": 500,
};

export default async function BankOverviewPage() {
  const rows = await getBankOverview();

  const totalsBySection = new Map<string, { available: number; used: number }>();
  for (const row of rows) {
    const existing = totalsBySection.get(row.section) ?? { available: 0, used: 0 };
    existing.available += row.available;
    existing.used += row.used;
    totalsBySection.set(row.section, existing);
  }

  const rowsBySection = new Map<string, typeof rows>();
  for (const row of rows) {
    if (!rowsBySection.has(row.section)) rowsBySection.set(row.section, []);
    rowsBySection.get(row.section)!.push(row);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Question bank</h1>
          <p className="mt-1 text-sm text-brand-ink/60">
            Reusable pool questions are drawn are into fresh mocks by the
            generator rather than living inside one fixed test.
          </p>
        </div>
        <Link
          href="/admin/bank/generate"
          className="rounded-md bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
        >
          Generate a mock
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BANK_SECTIONS.map((section) => {
          const totals = totalsBySection.get(section) ?? { available: 0, used: 0 };
          const total = totals.available + totals.used;
          const target = SECTION_TARGETS[section];
          return (
            <div key={section} className="rounded-xl border border-black/5 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
                {section}
              </p>
              <p className="mt-1 text-2xl font-bold text-brand-navy">
                {total}
                <span className="text-sm font-normal text-brand-ink/50"> / {target}</span>
              </p>
              <p className="mt-1 text-xs text-brand-ink/60">
                {totals.available} unused · {totals.used} used in mocks
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-brand-cream">
                <div
                  className="h-full rounded-full bg-brand-gold"
                  style={{ width: `${Math.min(100, (total / target) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-brand-navy/20 bg-white p-10 text-center text-brand-ink/60">
          No bank questions yet.
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {BANK_SECTIONS.filter((s) => rowsBySection.has(s)).map((section) => (
            <div key={section}>
              <h2 className="text-lg font-semibold text-brand-navy">{section}</h2>
              <div className="mt-3 overflow-x-auto rounded-xl border border-black/5 bg-white">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead className="border-b border-black/5 bg-brand-cream/60 text-xs uppercase tracking-wide text-brand-ink/50">
                    <tr>
                      <th className="px-5 py-3 font-medium">Topic</th>
                      <th className="px-5 py-3 font-medium">Difficulty</th>
                      <th className="px-5 py-3 font-medium">Unused</th>
                      <th className="px-5 py-3 font-medium">Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rowsBySection.get(section)!.map((row) => (
                      <tr
                        key={`${row.topic}-${row.difficulty}`}
                        className="border-b border-black/5 last:border-0"
                      >
                        <td className="px-5 py-3 font-medium text-brand-navy">
                          {row.topic}
                        </td>
                        <td className="px-5 py-3 text-brand-ink/70">{row.difficulty}</td>
                        <td className="px-5 py-3 text-brand-ink/70">{row.available}</td>
                        <td className="px-5 py-3 text-brand-ink/70">{row.used}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
