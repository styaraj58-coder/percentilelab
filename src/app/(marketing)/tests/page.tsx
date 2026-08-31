import type { Metadata } from "next";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPublishedTests } from "@/lib/tests-data";

import { TestsBrowser, type TestSummary } from "./tests-browser";

export const metadata: Metadata = {
  title: "Mock Tests | Percentile Lab",
  description:
    "Browse timed mock tests for CAT, MAH-CET, MAT, ATMA, and more — filter by entrance exam and start practicing.",
};
export default async function TestsPage() {
  const session = await auth();

  // A fresh lookup (not the JWT session) so a just-granted premium upgrade
  // shows up immediately instead of waiting for the session to re-issue.
  let hasPremiumAccess = false;
  if (session?.user) {
    if (session.user.role === "ADMIN") {
      hasPremiumAccess = true;
    } else {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isPremium: true },
      });
      hasPremiumAccess = user?.isPremium ?? false;
    }
  }

  const tests = await getPublishedTests();

  const testSummaries: TestSummary[] = tests.map((test) => ({
    id: test.id,
    title: test.title,
    description: test.description,
    targetExam: test.targetExam,
    durationMinutes: test.durationMinutes,
    questionCount: test.sections.reduce((sum, s) => sum + s._count.questions, 0),
    sectionCount: test.sections.length,
    isFreePreview: test.isFreePreview,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
        Mock Tests
      </p>
      <h1 className="mt-2 text-3xl font-bold text-brand-navy sm:text-4xl">
        Pick your exam. Start practicing.
      </h1>
      <p className="mt-3 max-w-2xl text-brand-ink/70">
        Every mock and sectional test on Percentile Lab, filterable by
        entrance exam — pick yours from the dropdown below.
      </p>

      <div className="mt-10">
        <TestsBrowser
          tests={testSummaries}
          isAuthenticated={!!session?.user}
          hasPremiumAccess={hasPremiumAccess}
        />
      </div>
    </div>
  );
}
