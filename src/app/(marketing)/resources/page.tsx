import type { Metadata } from "next";
import Link from "next/link";
import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";

import { ResourceTabs } from "./resource-tabs";

// Cached independently of the page's own dynamic rendering (the shared
// header calls auth() on every marketing page, which already forces
// per-request rendering) — this specifically skips the Postgres round-trip
// on repeat visits. Invalidated on-demand via revalidateTag("resources")
// in src/app/admin/resources/actions.ts.
const getResources = unstable_cache(
  async () => prisma.resource.findMany({ orderBy: { createdAt: "desc" } }),
  ["published-resources"],
  { revalidate: 60, tags: ["resources"] }
);

export const metadata: Metadata = { title: "Study Resources | Percentile Lab" };

const articles = [
  {
    title: "Why sectional cutoffs matter more than your overall score",
    body: "Most MBA entrance exams - CAT, MAH-CET, and others - evaluate you section by section, not just on total marks. A strong Quant score can't make up for a section you clear by luck - many institutes apply a minimum cutoff per section. Use the section-wise breakdown on every mock to find your weakest section early, and weight your next week of practice toward it instead of drilling what you're already good at.",
  },
  {
    title: "Time-box every section before you start",
    body: "Decide, before the timer starts, how many minutes each section gets - and stick to it even if you're not done. Students who lose the most marks usually aren't weak on content; they run out of time on a section they were strong in because an earlier section ran long. Check your time-per-question analysis after each mock to see exactly where your pacing breaks down.",
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
    body: "One mock test score can swing a lot based on which questions you happened to know. What actually predicts your performance on exam day is your percentile trend across several tests. Take mocks consistently and watch the trend line, not any single result.",
  },
];

export default async function ResourcesPage() {
  const resources = await getResources();
  const videos = resources.filter((r) => r.type === "VIDEO");
  const materials = resources.filter((r) => r.type === "PDF");

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
        Study Resources
      </p>
      <h1 className="mt-2 text-3xl font-bold text-brand-navy sm:text-4xl">
        Videos, PDFs, and prep tips in one place
      </h1>
      <p className="mt-3 max-w-2xl text-brand-ink/70">
        Free study material curated by the Percentile Lab team - pick a tab
        below to browse.
      </p>

      <div className="mt-10">
        <ResourceTabs videos={videos} materials={materials} />
      </div>

      <div className="mx-auto mt-20 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
          Prep tips
        </p>
        <h2 className="mt-2 text-2xl font-bold text-brand-navy">
          MBA entrance exam prep tips
        </h2>
        <p className="mt-3 text-brand-ink/70">
          Short, practical notes on how to prep smarter - not just longer.
        </p>

        <div className="mt-8 space-y-8">
          {articles.map((article) => (
            <article
              key={article.title}
              className="rounded-xl border border-black/5 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-brand-navy">
                {article.title}
              </h3>
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
    </div>
  );
}
