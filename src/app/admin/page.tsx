import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { PublishToggle, DeleteTestButton } from "./test-row-actions";

export default async function AdminDashboardPage() {
  const session = await auth();

  const tests = await prisma.test.findMany({
    where: { createdById: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      sections: { include: { questions: true } },
      _count: { select: { attempts: true } },
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Your tests</h1>
          <p className="mt-1 text-sm text-brand-ink/60">
            {tests.length} test{tests.length === 1 ? "" : "s"} created
          </p>
        </div>
        <Link
          href="/admin/tests/new"
          className="rounded-md bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
        >
          + Create new test
        </Link>
      </div>

      {tests.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-brand-navy/20 bg-white p-10 text-center">
          <p className="text-brand-ink/70">
            You haven&apos;t created any tests yet.
          </p>
          <Link
            href="/admin/tests/new"
            className="mt-4 inline-block rounded-md bg-brand-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy-light"
          >
            Create your first test
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-black/5 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-black/5 bg-brand-cream/60 text-xs uppercase tracking-wide text-brand-ink/50">
              <tr>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Questions</th>
                <th className="px-5 py-3 font-medium">Duration</th>
                <th className="px-5 py-3 font-medium">Attempts</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => {
                const questionCount = test.sections.reduce(
                  (sum, section) => sum + section.questions.length,
                  0
                );
                return (
                  <tr key={test.id} className="border-b border-black/5 last:border-0">
                    <td className="px-5 py-4 font-medium text-brand-navy">
                      {test.title}
                    </td>
                    <td className="px-5 py-4 text-brand-ink/70">
                      {questionCount} ({test.sections.length} sections)
                    </td>
                    <td className="px-5 py-4 text-brand-ink/70">
                      {test.durationMinutes} min
                    </td>
                    <td className="px-5 py-4 text-brand-ink/70">
                      <Link
                        href={`/admin/tests/${test.id}/results`}
                        className="text-brand-navy hover:text-brand-gold hover:underline"
                      >
                        {test._count.attempts}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          test.published
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {test.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={`/admin/tests/${test.id}/edit`}
                          className="text-brand-navy hover:text-brand-gold hover:underline"
                        >
                          Edit
                        </Link>
                        <PublishToggle
                          testId={test.id}
                          published={test.published}
                        />
                        <DeleteTestButton testId={test.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
