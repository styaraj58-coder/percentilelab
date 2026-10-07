"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { CONSENT_CONTACT_EMAIL, PUBLISH_OPTIONS } from "@/lib/feedback";
import { MBA_ENTRANCE_EXAMS } from "@/lib/validation";

import { submitFeedback } from "./actions";

const inputClass =
  "mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";
const labelClass = "block text-sm font-medium text-brand-ink";
const hintClass = "mt-1 text-xs text-brand-ink/50";

export function FeedbackForm({
  studentName,
  defaultExam,
}: {
  studentName: string;
  defaultExam: string;
}) {
  const [state, formAction, pending] = useActionState(submitFeedback, undefined);
  const v = state?.values ?? {};
  const [publishAs, setPublishAs] = useState<string>(v.publishAs ?? "");

  if (state?.success) {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.5 4.5L19 7" />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-bold text-brand-navy">Thank you, {studentName.split(" ")[0]}!</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-brand-ink/70">
          Your feedback has reached us.
          {publishAs && publishAs !== "PRIVATE"
            ? " We will only publish it after we have reviewed it, and you can change your mind any time by emailing us."
            : " It will be used only to improve Percentile Lab."}
        </p>
        <Link
          href="/student"
          className="mt-6 inline-block rounded-md bg-brand-navy px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
        >
          Back to your tests
        </Link>
      </div>
    );
  }

  const wantsPublish = publishAs !== "" && publishAs !== "PRIVATE";

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <fieldset>
        <legend className={labelClass}>How would you rate Percentile Lab overall?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <label
              key={n}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md border border-black/10 text-sm font-semibold text-brand-ink/70 transition-colors has-[:checked]:border-brand-navy has-[:checked]:bg-brand-navy has-[:checked]:text-white has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-gold"
            >
              <input type="radio" name="rating" value={n} required defaultChecked={v.rating === String(n)} className="sr-only" />
              {n}
            </label>
          ))}
        </div>
        <p className={hintClass}>1 = poor, 5 = excellent</p>
      </fieldset>

      <div>
        <label htmlFor="exam" className={labelClass}>
          Which exam are you preparing for?
        </label>
        <select id="exam" name="exam" required defaultValue={v.exam || defaultExam} className={inputClass}>
          <option value="" disabled>
            Select an exam
          </option>
          {MBA_ENTRANCE_EXAMS.map((exam) => (
            <option key={exam} value={exam}>
              {exam}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="liked" className={labelClass}>
          What did you like most? <span className="text-brand-ink/40">(optional)</span>
        </label>
        <textarea id="liked" name="liked" rows={3} maxLength={1000} defaultValue={v.liked} className={inputClass} />
      </div>

      <div>
        <label htmlFor="improve" className={labelClass}>
          What should we improve? <span className="text-brand-ink/40">(optional)</span>
        </label>
        <textarea id="improve" name="improve" rows={3} maxLength={1000} defaultValue={v.improve} className={inputClass} />
        <p className={hintClass}>Bugs, unclear questions, missing topics - anything. Private feedback helps us most.</p>
      </div>

      <div className="rounded-lg border border-black/10 bg-brand-cream/60 p-4">
        <p className="text-sm font-semibold text-brand-navy">Your progress (optional)</p>
        <p className={hintClass}>Only fill this in if you remember. Your percentile on a test of ours.</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstPercentile" className="block text-xs font-medium text-brand-ink/70">
              Percentile on your first test
            </label>
            <input
              id="firstPercentile"
              name="firstPercentile"
              type="number"
              min={0}
              max={100}
              step="0.01"
              inputMode="decimal"
              defaultValue={v.firstPercentile}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="latestPercentile" className="block text-xs font-medium text-brand-ink/70">
              Percentile on your latest test
            </label>
            <input
              id="latestPercentile"
              name="latestPercentile"
              type="number"
              min={0}
              max={100}
              step="0.01"
              inputMode="decimal"
              defaultValue={v.latestPercentile}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="quote" className={labelClass}>
          In a sentence or two, how would you describe Percentile Lab to a friend?{" "}
          <span className="text-brand-ink/40">(needed only if you let us publish)</span>
        </label>
        <textarea id="quote" name="quote" rows={3} maxLength={600} defaultValue={v.quote} className={inputClass} />
        <p className={hintClass}>This is the only part we would ever show publicly, exactly as you write it.</p>
      </div>

      <fieldset className="rounded-lg border border-brand-navy/15 p-4">
        <legend className="px-1 text-sm font-semibold text-brand-navy">
          May we publish your testimonial on our website and social media?
        </legend>
        <div className="mt-2 space-y-2">
          {PUBLISH_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-start gap-3 rounded-md border border-black/10 px-3 py-2.5 text-sm has-[:checked]:border-brand-navy has-[:checked]:bg-brand-navy/5"
            >
              <input
                type="radio"
                name="publishAs"
                value={option.value}
                required
                defaultChecked={v.publishAs === option.value}
                onChange={() => setPublishAs(option.value)}
                className="mt-0.5 accent-[#14224b]"
              />
              <span>
                <span className="font-medium text-brand-ink">{option.label}</span>
                <span className="block text-xs text-brand-ink/55">{option.hint}</span>
              </span>
            </label>
          ))}
        </div>

        {wantsPublish && (
          <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm">
            <input type="checkbox" name="ageConfirmed" defaultChecked={v.ageConfirmed === "on"} className="mt-0.5 h-4 w-4 accent-[#14224b]" />
            <span className="text-brand-ink/80">
              I am 18 or older, or my parent or guardian agrees to this being published.
            </span>
          </label>
        )}

        <p className="mt-4 text-xs leading-relaxed text-brand-ink/55">
          If you say yes, Percentile Lab may publish your testimonial (and, if you shared
          them, your percentile figures) with the name style you chose, on its website and
          social media. We review everything before it goes live and never publish your
          email, phone number or college. You can withdraw this permission at any time by
          emailing{" "}
          <a href={`mailto:${CONSENT_CONTACT_EMAIL}`} className="font-medium text-brand-navy underline">
            {CONSENT_CONTACT_EMAIL}
          </a>
          , and we will remove it.
        </p>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-brand-navy px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light disabled:opacity-60"
      >
        {pending ? "Sending..." : "Send feedback"}
      </button>
    </form>
  );
}
