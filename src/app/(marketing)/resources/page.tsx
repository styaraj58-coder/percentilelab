import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Study Resources | Percentile Lab" };

const articles = [
  {
    title: "Why sectional cutoffs matter more than your overall score",
    body: "MBA CET evaluates you section by section, not just on total marks. A strong Quant score can't make up for a section you clear by luck — many institutes apply a minimum cutoff per section. Use the section-wise breakdown on every mock to find your weakest section early, and weight your next week of practice toward it instead of drilling what you're already good at.",
  },
  {
    title: "Time-box every section before you start",
    body: "Decide, before the timer starts, how many minutes each section gets — and stick to it even if you're not done. Students who lose the most marks usually aren't weak on content; they run out of time on a section they were strong in because an earlier section ran long. Check your time-per-question analysis after each mock to see exactly where your pacing breaks down.",
  },
  {
    title: "Attempt in two passes, not one",
    body: "On your first pass through a section, answer only the questions you're confident about and can solve in under 60–90 seconds. Mark anything that needs more thought and come back in a second pass with whatever time is left. This protects your accuracy on easy marks instead of losing them to a single hard question early on.",
  },
  {
    title: "Read the explanation even when you got it right",
    body: "It's tempting to only review questions you got wrong, but the explanation for a question you guessed correctly often reveals a faster method than the one you used. Go through the full answer review after every test, correct and incorrect, and note any solving approach that's quicker than yours.",
  },
  {
    title: "Track percentile trend, not single-test score",
    body: "One mock test score can swing a lot based on which questions you happened to know. What actually predicts your CET performance is your percentile trend across several tests. Take mocks consistently and watch the trend line, not any single result.",
  },
];

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
        Study Resources
      </p>
      <h1 className="mt-2 text-3xl font-bold text-brand-navy sm:text-4xl">
        MBA CET prep tips
      </h1>
      <p className="mt-3 text-brand-ink/70">
        Short, practical notes on how to prep smarter — not just longer.
      </p>

      <div className="mt-10 space-y-8">
        {articles.map((article) => (
          <article
            key={article.title}
            className="rounded-xl border border-black/5 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-brand-navy">
              {article.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-ink/80">
              {article.body}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-12 rounded-xl bg-brand-cream p-6 text-center">
        <p className="text-sm text-brand-ink/70">
          Put these into practice on your next mock test.
        </p>
        <Link
          href="/register"
          className="mt-4 inline-block rounded-md bg-brand-navy px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
        >
          Take a mock test
        </Link>
      </div>
    </div>
  );
}
