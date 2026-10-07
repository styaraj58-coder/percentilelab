import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { exams } from "@/lib/exam-data";
import { prisma } from "@/lib/prisma";
import { EXAM_TARGET_EXAM, SITE_NAME, SITE_URL } from "@/lib/site";
import { getPublishedTests, summariseTests } from "@/lib/tests-data";

import { ExamDetails } from "../exam-details";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return exams.map((exam) => ({ slug: exam.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const exam = exams.find((e) => e.slug === slug);
  if (!exam) return { title: "Exam not found | Percentile Lab" };

  const title = `${exam.shortName} Mock Tests, Exam Pattern & Syllabus | ${SITE_NAME}`;
  const description = `${exam.shortName} (${exam.fullName}): exam pattern, syllabus, top colleges, tentative dates and timed online mock tests with percentile and section-wise analysis.`;

  return {
    title,
    description,
    alternates: { canonical: `/exams/${exam.slug}` },
    openGraph: { type: "website", title, description },
  };
}

export default async function ExamLandingPage({ params }: Props) {
  const { slug } = await params;
  const exam = exams.find((e) => e.slug === slug);
  if (!exam) notFound();

  const targetExam = EXAM_TARGET_EXAM[exam.slug];
  const [allTests, relatedPost] = await Promise.all([
    getPublishedTests(),
    prisma.blogPost.findFirst({
      where: { published: true, slug: { startsWith: `${exam.slug}-` } },
      select: { slug: true, title: true },
    }),
  ]);
  const summary = summariseTests(allTests, targetExam);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Exams", item: `${SITE_URL}/exams` },
            {
              "@type": "ListItem",
              position: 3,
              name: exam.shortName,
              item: `${SITE_URL}/exams/${exam.slug}`,
            },
          ],
        }}
      />

      <nav aria-label="Breadcrumb" className="text-xs text-brand-ink/50">
        <Link href="/" className="hover:text-brand-navy">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/exams" className="hover:text-brand-navy">Exams</Link>
        <span className="mx-2">/</span>
        <span className="text-brand-ink/70">{exam.shortName}</span>
      </nav>

      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-brand-gold">
        {exam.shortName}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-brand-navy sm:text-4xl">
        {exam.shortName} Mock Tests, Exam Pattern &amp; Syllabus
      </h1>
      <p className="mt-3 max-w-3xl text-brand-ink/70">
        Everything you need to prepare for {exam.shortName}: the exam pattern,
        syllabus, top colleges, tentative dates, and timed mock tests that give
        you a percentile and a section-wise breakdown.
      </p>

      <section className="mt-10 rounded-2xl border border-black/5 bg-brand-cream p-6 sm:p-8">
        <h2 className="text-xl font-bold text-brand-navy">
          {exam.shortName} mock tests
        </h2>

        {summary.total > 0 ? (
          <>
            <p className="mt-1 text-sm text-brand-ink/70">
              {summary.total} {summary.total === 1 ? "test" : "tests"} live
              {summary.fullLength > 0 ? `: ${summary.fullLength} full-length` : ""}
              {summary.sectional > 0
                ? `${summary.fullLength > 0 ? " and " : ": "}${summary.sectional} sectional`
                : ""}
              {summary.free > 0 ? `, ${summary.free} of them free to start.` : "."}
            </p>
            <p className="mt-3 max-w-2xl text-sm text-brand-ink/70">
              Full-length mocks follow the real {exam.shortName} format
              ({exam.pattern.totalQuestions} in {exam.pattern.duration};{" "}
              {exam.pattern.markingScheme.toLowerCase()}). The tests themselves
              are taken inside your student portal - register, choose{" "}
              {exam.shortName} as your exam, and they are listed there.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-md bg-brand-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
              >
                Create free account
              </Link>
              <Link
                href="/student"
                className="rounded-md border border-brand-navy/20 px-6 py-3 text-sm font-semibold text-brand-navy transition-colors hover:bg-white"
              >
                Open student portal
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-brand-ink/70">
              {exam.shortName} mock tests are being added. Create a free
              account and use the Enquire Now tab to tell us you are preparing
              for this exam - or try a free sample quiz in the meantime.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/sample-test"
                className="rounded-md bg-brand-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
              >
                Try 10 free questions
              </Link>
              <Link
                href="/register"
                className="rounded-md border border-brand-navy/20 px-6 py-3 text-sm font-semibold text-brand-navy transition-colors hover:bg-white"
              >
                Create free account
              </Link>
            </div>
          </>
        )}
      </section>

      <ExamDetails exam={exam} />

      <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-black/5 bg-white p-6 text-sm">
        <Link
          href={`/tools/score-calculator?exam=${exam.slug}`}
          className="font-semibold text-brand-navy hover:text-brand-gold"
        >
          {exam.shortName} score calculator &rarr;
        </Link>
        {relatedPost && (
          <Link
            href={`/blog/${relatedPost.slug}`}
            className="font-semibold text-brand-navy hover:text-brand-gold"
          >
            Read: {relatedPost.title} &rarr;
          </Link>
        )}
        <Link href="/courses" className="font-semibold text-brand-navy hover:text-brand-gold">
          Courses &amp; pricing &rarr;
        </Link>
      </div>
    </div>
  );
}
