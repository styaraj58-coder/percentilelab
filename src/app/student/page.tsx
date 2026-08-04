import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { startAttempt } from "./actions";

export default async function StudentDashboardPage() {
  const session = await auth();
  const studentId = session!.user.id;

  const tests = await prisma.test.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: { sections: { include: { questions: true } } },
  });

  const attempts = await prisma.testAttempt.findMany({
    where: { studentId, testId: { in: tests.map((t) => t.id) } },
    orderBy: { startedAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Available tests</h1>
      <p className="mt-1 text-sm text-brand-ink/60">
        Pick a test below and take it under a live timer.
      </p>

      {tests.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-brand-navy/20 bg-white p-10 text-center text-brand-ink/60">
          No tests are published yet — check back soon.
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {tests.map((test) => {
            const testAttempts = attempts.filter((a) => a.testId === test.id);
            const inProgress = testAttempts.find((a) => !a.submittedAt);
            const completed = testAttempts.filter((a) => a.submittedAt);
            const questionCount = test.sections.reduce(
              (sum, s) => sum + s.questions.length,
              0
            );

            return (
              <div
                key={test.id}
                className="rounded-xl border border-black/5 bg-white p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-brand-navy">
                      {test.title}
                    </h2>
                    {test.description && (
                      <p className="mt-1 text-sm text-brand-ink/70">
                        {test.description}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-brand-ink/50">
                      {questionCount} questions · {test.sections.length}{" "}
                      sections · {test.durationMinutes} min
                    </p>
                  </div>

                  <form action={startAttempt.bind(null, test.id)}>
                    <button
                      type="submit"
                      className="rounded-md bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
                    >
                      {inProgress ? "Resume test" : "Start test"}
                    </button>
                  </form>
                </div>

                {completed.length > 0 && (
                  <div className="mt-4 border-t border-black/5 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
                      Your attempts
                    </p>
                    <ul className="mt-2 space-y-1">
                      {completed.map((attempt, index) => (
                        <li key={attempt.id} className="text-sm">
                          <Link
                            href={`/student/attempts/${attempt.id}/results`}
                            className="text-brand-navy hover:text-brand-gold hover:underline"
                          >
                            Attempt {completed.length - index}: {attempt.score}/
                            {attempt.totalMarks}
                          </Link>{" "}
                          <span className="text-brand-ink/40">
                            {attempt.submittedAt?.toLocaleDateString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
