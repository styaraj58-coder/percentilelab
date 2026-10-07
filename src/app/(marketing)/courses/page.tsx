import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { exams } from "@/lib/exam-data";
import { coursePrices, formatPrice, freeAccountFeatures, testSeries } from "@/lib/plans";
import { EXAM_TARGET_EXAM } from "@/lib/site";
import { getPublishedTests } from "@/lib/tests-data";

export const metadata: Metadata = {
  title: "Courses & Pricing | Percentile Lab",
  description:
    "Exam-specific prep courses for MAH-CET, CAT, MAT, ATMA and UG BMS CET with prices, plus a Test Series - live lectures, recordings, full-length mocks, sectional tests and doubt solving.",
  alternates: { canonical: "/courses" },
};

const included = [
  "Live lectures",
  "Recordings of every session",
  "15+ full-length mocks",
  "20+ sectional tests",
  "Personalized doubt solving",
  "Percentile and section-wise analysis",
];

function joinList(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export default async function CoursesPage() {
  const tests = await getPublishedTests();
  const liveExamNames = exams
    .filter((exam) => tests.some((t) => t.targetExam === EXAM_TARGET_EXAM[exam.slug]))
    .map((exam) => exam.shortName);
  const comingSoonNames = exams
    .map((exam) => exam.shortName)
    .filter((name) => !liveExamNames.includes(name));

  const pricedCourses = exams.filter((exam) => coursePrices[exam.slug] != null);
  const unpricedCourses = exams.filter((exam) => coursePrices[exam.slug] == null);

  const faqs = [
    {
      question: "Which exams do your courses cover?",
      answer: `We cover ${joinList(exams.map((e) => e.shortName))}. Mock tests are live for ${joinList(liveExamNames)}${
        comingSoonNames.length > 0 ? `, and more are being added for ${joinList(comingSoonNames)}` : ""
      }.`,
    },
    {
      question: "How much do the courses cost?",
      answer: `${joinList(
        pricedCourses.map((exam) => `${exam.shortName} is ${formatPrice(coursePrices[exam.slug])}`)
      )}${
        unpricedCourses.length > 0
          ? `. The ${joinList(unpricedCourses.map((exam) => exam.shortName))} course${
              unpricedCourses.length > 1 ? "s are" : " is"
            } not available yet`
          : ""
      }. The ${testSeries.name} is ${formatPrice(testSeries.price)}.`,
    },
    {
      question: `What is the ${testSeries.name}?`,
      answer: `The ${testSeries.name} (${formatPrice(testSeries.price)}) is for students who only want practice: ${testSeries.features
        .join(", ")
        .toLowerCase()}. It does not include live lectures, recordings or personalised doubt solving, which come with the courses.`,
    },
    {
      question: "What do I get for free?",
      answer: `Creating an account is free and includes: ${freeAccountFeatures.join(", ").toLowerCase()}.`,
    },
    {
      question: "How is my percentile calculated?",
      answer:
        "Your percentile is based on your score compared with every student who has submitted the same test on Percentile Lab - it is the share of them you scored higher than. It becomes more reliable as more students take the test.",
    },
    {
      question: "Do the mocks have negative marking?",
      answer:
        "Only where the real exam does. Mocks for MAT and ATMA deduct a quarter of a question's marks for each wrong answer, and CAT mocks deduct a third (1 mark on a 3-mark question). MAH-CET and UG BMS CET have no negative marking, just like the real exams. Questions you leave unanswered never lose marks.",
    },
    {
      question: "Can I attempt a test more than once?",
      answer:
        "Yes. Every submitted attempt is saved with its own score and analysis, so you can retake a test and track your progress.",
    },
    {
      question: "Does it work on my phone?",
      answer:
        "Yes. Percentile Lab runs in your phone's browser and can be added to your home screen like an app.",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
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

      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
          Courses
        </p>
        <h1 className="mt-2 text-3xl font-bold text-brand-navy sm:text-4xl">
          Prep built around your exam
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-brand-ink/70">
          Every course is built around the real exam&apos;s sections and duration,
          so practice feels like the actual test.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => (
          <div
            key={exam.slug}
            className="flex flex-col rounded-2xl border border-black/10 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
              {exam.shortName}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-brand-navy">
              {exam.shortName} Preparation Course
            </h2>
            <p className="mt-1 text-sm text-brand-ink/60">{exam.fullName}</p>

            {coursePrices[exam.slug] != null ? (
              <p className="mt-4 text-3xl font-bold text-brand-navy">
                {formatPrice(coursePrices[exam.slug])}
              </p>
            ) : (
              <div className="mt-4">
                <p className="text-3xl font-bold text-brand-ink/35">N/A</p>
                <p className="mt-0.5 text-xs text-brand-ink/50">Not available yet</p>
              </div>
            )}

            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
              What you get
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-brand-gold">✓</span>
                  <span className="text-brand-ink/80">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
              {coursePrices[exam.slug] != null ? (
                <Link
                  href="/register"
                  className="flex items-center justify-center whitespace-nowrap rounded-md border border-brand-navy bg-brand-navy px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
                >
                  Register now
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  className="flex cursor-not-allowed items-center justify-center whitespace-nowrap rounded-md border border-black/10 bg-black/5 px-3 py-2.5 text-sm font-semibold text-brand-ink/40"
                >
                  Register now
                </span>
              )}
              <Link
                href={`/exams/${exam.slug}`}
                className="flex items-center justify-center whitespace-nowrap rounded-md border border-brand-navy/20 px-3 py-2.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-cream"
              >
                More info
              </Link>
            </div>
          </div>
        ))}

        <div className="flex flex-col rounded-2xl border border-brand-gold bg-brand-navy p-6 text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
            Test Series
          </p>
          <h2 className="mt-1 text-lg font-semibold">{testSeries.name}</h2>
          <p className="mt-1 text-sm text-white/65">{testSeries.tagline}</p>

          <p className="mt-4 text-3xl font-bold text-brand-gold">{formatPrice(testSeries.price)}</p>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-white/50">
            What you get
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {testSeries.features.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-brand-gold">✓</span>
                <span className="text-white/90">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
            <Link
              href="/register"
              className="flex items-center justify-center whitespace-nowrap rounded-md bg-brand-gold px-3 py-2.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-gold-light"
            >
              Register now
            </Link>
            <Link
              href="/tests"
              className="flex items-center justify-center whitespace-nowrap rounded-md border border-white/25 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Test details
            </Link>
          </div>
        </div>
      </div>

      <section className="mx-auto mt-20 max-w-3xl">
        <h2 className="text-center text-2xl font-bold text-brand-navy">Frequently asked questions</h2>
        <div className="mt-8 divide-y divide-black/10 rounded-2xl border border-black/10 bg-white">
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

      <div className="mt-16 text-center">
        <p className="text-brand-ink/70">
          Not sure which course fits? Try 10 free questions with no signup, or
          tell us your target exam using the Enquire Now tab.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="/sample-test"
            className="rounded-md bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-gold-light"
          >
            Try 10 free questions
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-brand-navy/20 px-6 py-3 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-cream"
          >
            Create free account
          </Link>
        </div>
      </div>
    </div>
  );
}
