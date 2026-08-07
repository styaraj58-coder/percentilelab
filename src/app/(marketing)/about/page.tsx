import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About | Percentile Lab" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
        About us
      </p>
      <h1 className="mt-2 text-3xl font-bold text-brand-navy sm:text-4xl">
        Built for one goal: a higher CET percentile
      </h1>

      <div className="mt-8 space-y-6 text-brand-ink/80">
        <p>
          Percentile Lab exists because generic mock tests don&apos;t tell
          you what actually went wrong. A raw score out of 200 doesn&apos;t
          tell you whether you lost marks to a weak section, slow pacing, or
          silly mistakes on questions you already knew how to solve.
        </p>
        <p>
          Every test on this platform is built around the same structure as
          the MBA CET — timed, sectional, and scored the way the real exam
          scores you. But the part that actually moves your percentile
          happens after you submit: a full breakdown of your accuracy by
          section, how long you spent on every single question, and a
          question-by-question review with the correct answer and
          explanation.
        </p>
        <p>
          Whether you&apos;re just starting your CET prep or in the final
          stretch before exam day, the idea is the same — practice with
          intent, and let the data tell you exactly what to fix next.
        </p>
      </div>

      <div className="mt-10 rounded-xl border border-black/5 bg-brand-cream p-6">
        <h2 className="text-lg font-semibold text-brand-navy">
          What you get with every test
        </h2>
        <ul className="mt-4 grid gap-3 text-sm text-brand-ink/80 sm:grid-cols-2">
          <li>• Sectional MCQ format matching MBA CET</li>
          <li>• Live countdown timer per test</li>
          <li>• Overall score and percentile</li>
          <li>• Section-wise accuracy breakdown</li>
          <li>• Time spent per question</li>
          <li>• Full answer review with explanations</li>
        </ul>
      </div>

      <div className="mt-10">
        <Link
          href="/register"
          className="inline-block rounded-md bg-brand-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
        >
          Create your free account
        </Link>
      </div>
    </div>
  );
}
