"use client";

import { useState } from "react";

export type ReviewRow = {
  index: number;
  id: string;
  text: string;
  difficulty: number | null;
  seconds: number;
};

const PAGE_SIZE = 5;

export function QuestionSummaryTable({
  title,
  badgeClass,
  rows,
  emptyMessage,
}: {
  title: string;
  badgeClass: string;
  rows: ReviewRow[];
  emptyMessage: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const visibleRows = expanded ? rows : rows.slice(0, PAGE_SIZE);
  const remaining = rows.length - PAGE_SIZE;

  return (
    <div className="flex h-full flex-col">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
        {title}
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badgeClass}`}>
          {rows.length}
        </span>
      </h3>
      <div className="mt-3 flex-1 overflow-x-auto rounded-xl border border-black/5 bg-white">
        {rows.length === 0 ? (
          <p className="p-4 text-sm text-brand-ink/50">{emptyMessage}</p>
        ) : (
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead className="border-b border-black/5 bg-brand-cream/60 text-xs uppercase tracking-wide text-brand-ink/50">
              <tr>
                <th className="px-4 py-2.5 font-medium">Q#</th>
                <th className="px-4 py-2.5 font-medium">Question</th>
                <th className="px-4 py-2.5 font-medium">Time</th>
                <th className="px-4 py-2.5 font-medium">Difficulty %</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.id} className="border-b border-black/5 last:border-0">
                  <td className="px-4 py-2.5 font-medium text-brand-navy">
                    <a href={`#q-${row.id}`} className="hover:underline">
                      Q{row.index + 1}
                    </a>
                  </td>
                  <td className="max-w-[240px] truncate px-4 py-2.5 text-brand-ink/70">
                    {row.text}
                  </td>
                  <td className="px-4 py-2.5 text-brand-ink/70">{row.seconds}s</td>
                  <td className="px-4 py-2.5 text-brand-ink/70">
                    {row.difficulty === null ? "—" : `${row.difficulty}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {remaining > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 self-start text-xs font-semibold text-brand-navy hover:text-brand-gold hover:underline"
        >
          {expanded ? "Show less" : `See ${remaining} more`}
        </button>
      )}
    </div>
  );
}
