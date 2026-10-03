"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";

import { MathText } from "@/components/math-text";
import { submitEnquiry } from "@/app/(marketing)/enquiry-actions";

import { gradeSampleQuiz, type SampleGrade } from "./actions";

export type SampleQuestion = {
  id: string;
  text: string;
  sectionName: string;
  options: { id: string; text: string }[];
};

const inputClass =
  "mt-1 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";

export function SampleQuiz({ questions }: { questions: SampleQuestion[] }) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [grade, setGrade] = useState<SampleGrade | null>(null);
  const [isPending, startTransition] = useTransition();
  const [leadState, leadAction, leadPending] = useActionState(submitEnquiry, undefined);

  const answeredCount = Object.keys(selected).length;
  const graded = grade && grade.ok ? grade : null;
  const resultById = new Map(graded?.results.map((r) => [r.questionId, r]));

  function submit() {
    startTransition(async () => {
      const result = await gradeSampleQuiz(
        questions.map((q) => ({ questionId: q.id, optionId: selected[q.id] ?? null }))
      );
      setGrade(result);
      if (result.ok) window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  return (
    <div>
      {graded && (
        <div className="mb-8 rounded-2xl border border-brand-gold/40 bg-brand-cream p-6 text-center">
          <p className="text-xs uppercase tracking-wide text-brand-ink/50">Your score</p>
          <p className="mt-1 text-4xl font-bold text-brand-navy">
            {graded.score}
            <span className="text-2xl text-brand-ink/50"> / {graded.total}</span>
          </p>
          <p className="mt-1 text-sm text-brand-ink/70">
            {Math.round((graded.score / graded.total) * 100)}% accuracy. Scroll down to see
            the answers and explanations.
          </p>
        </div>
      )}

      <ol className="space-y-6">
        {questions.map((q, index) => {
          const result = resultById.get(q.id);
          return (
            <li key={q.id} className="rounded-xl border border-black/5 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-brand-ink">
                  <span className="text-brand-ink/50">Q{index + 1}. </span>
                  <MathText text={q.text} />
                </p>
                <span className="shrink-0 rounded-full bg-brand-cream px-2.5 py-0.5 text-[11px] font-medium text-brand-ink/60">
                  {q.sectionName}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {q.options.map((option, oIndex) => {
                  const isSelected = selected[q.id] === option.id;
                  const isCorrectOption = result?.correctOptionId === option.id;
                  const isWrongPick = !!result && isSelected && !isCorrectOption;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={!!graded}
                      aria-pressed={isSelected}
                      onClick={() => setSelected((prev) => ({ ...prev, [q.id]: option.id }))}
                      className={`flex w-full items-start gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                        isCorrectOption
                          ? "border-green-300 bg-green-50"
                          : isWrongPick
                            ? "border-red-300 bg-red-50"
                            : isSelected
                              ? "border-brand-navy bg-brand-navy/5"
                              : "border-black/10 hover:bg-brand-cream"
                      } disabled:cursor-default`}
                    >
                      <span className="text-brand-ink/50">{String.fromCharCode(65 + oIndex)}.</span>
                      <span className="flex-1">
                        <MathText text={option.text} />
                      </span>
                      {isCorrectOption && (
                        <span className="text-xs font-semibold text-green-700">Correct answer</span>
                      )}
                      {isWrongPick && (
                        <span className="text-xs font-semibold text-red-700">Your answer</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {result && !result.selectedOptionId && (
                <p className="mt-3 text-xs font-medium text-brand-ink/50">Skipped</p>
              )}
              {result?.explanation && (
                <p className="mt-3 rounded-md bg-brand-cream p-3 text-sm text-brand-ink/80">
                  <span className="font-semibold text-brand-navy">Explanation: </span>
                  <MathText text={result.explanation} />
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {!graded && (
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={submit}
            disabled={isPending || answeredCount === 0}
            className="rounded-md bg-brand-navy px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light disabled:opacity-50"
          >
            {isPending ? "Checking..." : "Submit answers"}
          </button>
          <span className="text-sm text-brand-ink/60">
            {answeredCount} of {questions.length} answered
          </span>
        </div>
      )}
      {grade && !grade.ok && <p className="mt-4 text-sm text-red-700">{grade.error}</p>}

      {graded && (
        <div className="mt-10 space-y-6">
          <div className="rounded-2xl bg-brand-navy p-6 text-white sm:p-8">
            <h2 className="text-xl font-bold">Want the full picture?</h2>
            <p className="mt-2 text-sm text-white/80">
              A full mock gives you your percentile against other students, a section-wise
              breakdown, time spent per question and an explained answer review.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-md bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-gold-light"
              >
                Create free account
              </Link>
              <Link
                href="/tests"
                className="rounded-md border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Browse mock tests
              </Link>
              <a
                href="/sample-test"
                className="rounded-md border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Try 10 new questions
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8">
            <h2 className="text-lg font-bold text-brand-navy">Get a call back</h2>
            <p className="mt-1 text-sm text-brand-ink/70">
              Leave your details and we&apos;ll help you pick the right exam and test plan.
            </p>
            {leadState?.success ? (
              <p className="mt-4 rounded-md bg-green-50 p-4 text-sm font-medium text-green-800">
                Thanks - we&apos;ve got your details and will get back to you shortly.
              </p>
            ) : (
              <form action={leadAction} className="mt-4 grid gap-4 sm:grid-cols-2">
                <input
                  type="hidden"
                  name="message"
                  value={`Came from the free sample test - scored ${graded.score}/${graded.total}.`}
                />
                <div>
                  <label htmlFor="lead-name" className="text-xs font-medium text-brand-ink/70">
                    Name
                  </label>
                  <input id="lead-name" name="name" required className={inputClass} />
                </div>
                <div>
                  <label htmlFor="lead-phone" className="text-xs font-medium text-brand-ink/70">
                    Phone
                  </label>
                  <input
                    id="lead-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    required
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="lead-email" className="text-xs font-medium text-brand-ink/70">
                    Email (optional)
                  </label>
                  <input id="lead-email" name="email" type="email" className={inputClass} />
                </div>
                {leadState?.error && (
                  <p className="text-sm text-red-700 sm:col-span-2">{leadState.error}</p>
                )}
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={leadPending}
                    className="rounded-md bg-brand-navy px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light disabled:opacity-50"
                  >
                    {leadPending ? "Sending..." : "Request a call back"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
