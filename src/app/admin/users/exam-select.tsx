"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { MBA_ENTRANCE_EXAMS } from "@/lib/validation";

import { setUserExam } from "./actions";

export function ExamSelect({
  userId,
  targetExam,
}: {
  userId: string;
  targetExam: string | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <span className="flex flex-col gap-1">
      <select
        aria-label="Registered exam"
        value={targetExam ?? ""}
        disabled={isPending}
        onChange={(e) => {
          const value = e.target.value;
          setError(null);
          startTransition(async () => {
            try {
              await setUserExam(userId, value);
              router.refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed");
            }
          });
        }}
        className="rounded-md border border-black/10 bg-white px-2 py-1 text-xs focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy disabled:opacity-50"
      >
        {!targetExam && (
          <option value="" disabled>
            Not set
          </option>
        )}
        {MBA_ENTRANCE_EXAMS.map((exam) => (
          <option key={exam} value={exam}>
            {exam}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-700">{error}</span>}
    </span>
  );
}
