import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { examDisplayName, exams } from "@/lib/exam-data";
import { buildExamFaqs } from "@/lib/exam-faq";
import { prisma } from "@/lib/prisma";
import { EXAM_TARGET_EXAM, SITE_NAME, SITE_URL } from "@/lib/site";
import { getPublishedTests, summariseTests } from "@/lib/tests-data";

import { ExamDetails } from "../exam-details";

type Props = { params: Promise<{ slug: string }> };

// Blog posts shown as related reading start with one of these slug prefixes.
// "MBA CET" articles belong with the MAH-CET exam page.
const RELATED_POST_PREFIXES: Record<string, string[]> = {
  "mah-cet": ["mah-cet-", "mba-cet-"],
};

export function generateStaticParams() {
  return exams.map((exam) => ({ slug: exam.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const exam = exams.find((e) => e.slug === slug);
  if (!exam) return { title: "Exam not found | Percentile Lab" };

  const name = examDisplayName(exam);
  const title = `${name} Mock Tests, Exam Pattern & Syllabus | ${SITE_NAME}`;
  const description = `${name} - ${exam.fullName}: exam pattern, syllabus, top colleges, tentative dates and timed online mock tests with percentile and section-wise analysis.`;

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

  const name = examDisplayName(exam);
  const targetExam = EXAM_TARGET_EXAM[exam.slug];
  const prefixes = RELATED_POST_PREFIXES[exam.slug] ?? [`${exam.slug}-`];
  const [allTests, relatedPosts] = await Promise.all([
    getPublishedTests(),
    prisma.blogPost.findMany({
      where: { published: true, OR: prefixes.map((prefix) => ({ slug: { startsWith: prefix } })) },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { slug: true, title: true },
    }),
  ]);
  const summary = summariseTests(allTests, targetExam);
  const faqs = buildExamFaqs(exam, name, summary.total > 0);

  // The answer a student came for, before the long detail below.
  const examDay = exam.tentativeDates.find((d) => /exam day|test windows/i.test(d.label));
  const glance = [
    { label: "Questions", value: exam.pattern.totalQuestions },
    { label: "Duration", value: exam.pattern.duration },
    { label: "Marking", value: exam.pattern.markingScheme },
    ...(examDay ? [{ label: examDay.label === "Exam day" ? "Usual exam time" : examDay.label, value: examDay.window }] : []),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
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
              name,
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
        <span className="text-brand-ink/70">{name}</span>
      </nav>

      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-brand-gold">
        {name}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-brand-navy sm:text-4xl">
        {name} Mock Tests, Exam Pattern &amp; Syllabus
      </h1>
      <p className="mt-3 max-w-3xl text-brand-ink/70">
        Everything you need to prepare for {name}: the exam pattern,
        syllabus, top colleges, tentative dates, and timed mock tests that give
        you a percentile and a section-wise breakdown.
      </p>

      <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {glance.map((item) => (
          <div key={item.label} className="rounded-xl border border-brand-navy/10 bg-white px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-brand-gold">{item.label}</dt>
            <dd className="mt-1 text-sm font-semibold text-brand-navy">{item.value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-10 rounded-2xl border border-black/5 bg-brand-cream p-6 sm:p-8">
        <h2 className="text-xl font-bold text-brand-navy">
          {name} mock tests
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
              Full-length mocks follow the real {name} format
              ({exam.pattern.totalQuestions} in {exam.pattern.duration};{" "}
              {exam.pattern.markingScheme.toLowerCase()}). The tests themselves
              are taken inside your student portal - register, choose{" "}
              {targetExam} as your exam, and they are listed there.
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
              {name} mock tests are being added. Create a free
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

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }}
      />
      <section className="mt-14" aria-labelledby="exam-faq-heading">
        <h2 id="exam-faq-heading" className="text-2xl font-bold text-brand-navy">
          {name} FAQs
        </h2>
        <div className="mt-6 max-w-3xl divide-y divide-black/10 rounded-2xl border border-black/10 bg-white">
          {faqs.map((faq) => (
            <details key={faq.question} className="group px-6 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-brand-navy">
                {faq.question}
                <span className="text-xl leading-none text-brand-gold transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-brand-ink/75">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-black/5 bg-white p-6 text-sm">
        <Link
          href={`/tools/score-calculator?exam=${exam.slug}`}
          className="font-semibold text-brand-navy hover:text-brand-gold"
        >
          {name} score calculator &rarr;
        </Link>
        {relatedPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="font-semibold text-brand-navy hover:text-brand-gold"
          >
            Read: {post.title} &rarr;
          </Link>
        ))}
        <Link href="/courses" className="font-semibold text-brand-navy hover:text-brand-gold">
          Courses &amp; pricing &rarr;
        </Link>
      </div>
    </div>
  );
}
