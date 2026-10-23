import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { MathText } from "@/components/math-text";
import {
  getCategoryQuestions,
  getPracticeCategory,
  PRACTICE_PAGE_SIZE,
  practiceCategories,
} from "@/lib/practice-questions";
import { SITE_URL } from "@/lib/site";

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
};

function parsePage(value: string | undefined) {
  const n = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getPracticeCategory(slug);
  if (!category) return { title: "Practice questions | Percentile Lab" };
  const page = parsePage((await searchParams).page);
  const questions = await getCategoryQuestions(slug);
  const pageSuffix = page > 1 ? ` - Page ${page}` : "";

  return {
    title: `Free ${category.title} Questions with Answers for MBA CET${pageSuffix} | Percentile Lab`,
    description: `${questions.length} free ${category.title.toLowerCase()} practice questions with answers and explanations for MBA CET (MAH-CET), CAT, MAT and ATMA - ${category.topics}.`,
    alternates: { canonical: page > 1 ? `/practice-questions/${slug}?page=${page}` : `/practice-questions/${slug}` },
  };
}

export default async function PracticeCategoryPage({ params, searchParams }: Props) {
  const { category: slug } = await params;
  const category = getPracticeCategory(slug);
  if (!category) notFound();

  const questions = await getCategoryQuestions(slug);
  if (questions.length === 0) notFound();

  const totalPages = Math.ceil(questions.length / PRACTICE_PAGE_SIZE);
  const page = parsePage((await searchParams).page);
  if (page > totalPages) notFound();

  const start = (page - 1) * PRACTICE_PAGE_SIZE;
  const shown = questions.slice(start, start + PRACTICE_PAGE_SIZE);
  const pageHref = (n: number) => (n === 1 ? `/practice-questions/${slug}` : `/practice-questions/${slug}?page=${n}`);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Practice questions", item: `${SITE_URL}/practice-questions` },
            { "@type": "ListItem", position: 3, name: category.title, item: `${SITE_URL}/practice-questions/${slug}` },
          ],
        }}
      />
      <Link href="/practice-questions" className="text-sm font-medium text-brand-navy hover:text-brand-gold">
        &larr; All practice questions
      </Link>

      <div className="mt-6 max-w-3xl">
        <h1 className="text-3xl font-bold text-brand-navy sm:text-4xl">
          Free {category.title} questions with answers for MBA CET
        </h1>
        <p className="mt-3 text-brand-ink/70">
          {category.intro} These {questions.length} questions are also useful for CAT, MAT and ATMA. Tap
          &ldquo;Show answer&rdquo; under any question for the correct option and the explanation.
        </p>
      </div>

      <ol className="mt-10 max-w-3xl space-y-6" start={start + 1}>
        {shown.map((q, i) => {
          const correctIndex = q.options.findIndex((o) => o.isCorrect);
          return (
            <li key={q.id} className="rounded-xl border border-black/5 bg-white p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
                Question {start + i + 1}
              </p>
              <MathText text={q.text} className="mt-2 block font-medium leading-relaxed text-brand-navy" />
              <ul className="mt-4 space-y-2 text-sm text-brand-ink/80">
                {q.options.map((o, k) => (
                  <li key={k} className="flex gap-3">
                    <span className="font-semibold text-brand-navy">({String.fromCharCode(65 + k)})</span>
                    <MathText text={o.text} />
                  </li>
                ))}
              </ul>
              <details className="group mt-4 rounded-lg bg-brand-cream/60">
                <summary className="flex min-h-11 cursor-pointer list-none items-center px-4 text-sm font-semibold text-brand-navy">
                  Show answer and explanation
                </summary>
                <div className="space-y-2 px-4 pb-4 text-sm text-brand-ink/80">
                  <p>
                    <span className="font-semibold text-brand-navy">Correct answer: </span>
                    ({String.fromCharCode(65 + correctIndex)}) <MathText text={q.options[correctIndex].text} />
                  </p>
                  {q.explanation && <MathText text={q.explanation} className="block leading-relaxed" />}
                </div>
              </details>
            </li>
          );
        })}
      </ol>

      {totalPages > 1 && (
        <nav aria-label="Pages" className="mt-10 flex max-w-3xl flex-wrap items-center gap-2">
          {Array.from({ length: totalPages }, (_, n) => n + 1).map((n) => (
            <Link
              key={n}
              href={pageHref(n)}
              aria-current={n === page ? "page" : undefined}
              className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-3 text-sm font-semibold ${
                n === page
                  ? "border-brand-navy bg-brand-navy text-white"
                  : "border-brand-navy/20 text-brand-navy hover:bg-brand-navy hover:text-white"
              }`}
            >
              {n}
            </Link>
          ))}
        </nav>
      )}

      <div className="mt-12 max-w-3xl rounded-2xl border border-black/5 bg-brand-cream p-6 text-center">
        <p className="font-semibold text-brand-navy">Practise under exam conditions</p>
        <p className="mt-1 text-sm text-brand-ink/70">
          Take a timed sectional test or a full-length mock and see your percentile and section-wise analysis.
        </p>
        <Link
          href="/tests"
          className="mt-4 inline-block rounded-md bg-brand-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
        >
          Take a mock test
        </Link>
      </div>

      <div className="mt-10 max-w-3xl">
        <p className="text-sm font-semibold text-brand-navy">More practice questions</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {practiceCategories
            .filter((c) => c.slug !== slug)
            .map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/practice-questions/${c.slug}`}
                  className="inline-block rounded-full border border-brand-navy/20 px-4 py-2 text-sm text-brand-navy hover:bg-brand-navy hover:text-white"
                >
                  {c.title}
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
