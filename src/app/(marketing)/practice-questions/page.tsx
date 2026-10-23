import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { practiceCategories, getCategoryQuestions } from "@/lib/practice-questions";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free MBA CET Practice Questions with Answers | Percentile Lab",
  description:
    "Free MBA CET (MAH-CET), CAT, MAT and ATMA practice questions with answers and explanations - quantitative aptitude, logical reasoning, verbal ability and general awareness.",
  alternates: { canonical: "/practice-questions" },
};

export default async function PracticeQuestionsIndexPage() {
  const counts = await Promise.all(practiceCategories.map((c) => getCategoryQuestions(c.slug).then((q) => q.length)));
  const categories = practiceCategories.map((c, i) => ({ ...c, count: counts[i] })).filter((c) => c.count > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Practice questions", item: `${SITE_URL}/practice-questions` },
          ],
        }}
      />
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">Free practice</p>
        <h1 className="mt-2 text-3xl font-bold text-brand-navy sm:text-4xl">
          Free MBA CET practice questions with answers
        </h1>
        <p className="mt-3 text-brand-ink/70">
          Practise MBA CET (MAH-CET), CAT, MAT and ATMA style questions section by section. Every question has the
          correct answer and a step-by-step explanation. When you are ready, take a full timed sectional test or
          mock and get your percentile.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/practice-questions/${c.slug}`}
            className="group rounded-xl border border-black/5 bg-white p-6 transition-colors hover:border-brand-gold/50"
          >
            <h2 className="text-xl font-bold text-brand-navy group-hover:text-brand-gold">{c.title}</h2>
            <p className="mt-2 text-sm text-brand-ink/70">{c.intro}</p>
            <p className="mt-4 text-sm font-semibold text-brand-gold">{c.count} free questions &rarr;</p>
          </Link>
        ))}
      </div>

      <div className="mt-12 max-w-3xl rounded-2xl border border-black/5 bg-brand-cream p-6">
        <p className="font-semibold text-brand-navy">Want a timed test with your percentile?</p>
        <p className="mt-1 text-sm text-brand-ink/70">
          Try the free sample test, or register to take the sectional tests and full-length mocks.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/sample-test"
            className="rounded-md bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
          >
            Free sample test
          </Link>
          <Link
            href="/tests"
            className="rounded-md border border-brand-navy/20 px-5 py-2.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
          >
            Browse mock tests
          </Link>
        </div>
      </div>
    </div>
  );
}
