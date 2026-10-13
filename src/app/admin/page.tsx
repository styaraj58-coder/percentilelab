import type { Metadata } from "next";
import Link from "next/link";

import { istDate, istDateTime } from "@/lib/admin-format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Admin | Percentile Lab" };

export default async function AdminOverviewPage() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const students = { role: "STUDENT" } as const;

  const [
    totalStudents,
    newToday,
    newThisWeek,
    premiumStudents,
    startedAttempts,
    submittedAttempts,
    activeStudentGroups,
    publishedTests,
    totalTests,
    pendingFeedback,
    byExam,
    recent,
  ] = await Promise.all([
    prisma.user.count({ where: students }),
    prisma.user.count({ where: { ...students, createdAt: { gte: startOfToday } } }),
    prisma.user.count({ where: { ...students, createdAt: { gte: weekAgo } } }),
    prisma.user.count({ where: { ...students, isPremium: true } }),
    prisma.testAttempt.count({ where: { student: students } }),
    prisma.testAttempt.count({ where: { student: students, submittedAt: { not: null } } }),
    prisma.testAttempt.groupBy({ by: ["studentId"], where: { student: students } }),
    prisma.test.count({ where: { published: true } }),
    prisma.test.count(),
    prisma.feedback.count({ where: { approved: false, publishAs: { not: "PRIVATE" } } }),
    prisma.user.groupBy({
      by: ["targetExam"],
      where: students,
      _count: { _all: true },
      orderBy: { _count: { targetExam: "desc" } },
    }),
    prisma.user.findMany({
      where: students,
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, name: true, email: true, targetExam: true, createdAt: true },
    }),
  ]);

  const cards = [
    { label: "Students", value: totalStudents, note: "all time" },
    { label: "New this week", value: newThisWeek, note: `${newToday} today` },
    { label: "Took a test", value: activeStudentGroups.length, note: `of ${totalStudents} students` },
    { label: "Tests submitted", value: submittedAttempts, note: `${startedAttempts} started` },
    { label: "Premium students", value: premiumStudents, note: `of ${totalStudents} students` },
    { label: "Live tests", value: publishedTests, note: `${totalTests} in total` },
  ];

  const quickLinks = [
    { href: "/admin/tests/new", label: "New test" },
    { href: "/admin/bank", label: "Question bank" },
    { href: "/admin/blog", label: "Blog" },
    { href: "/admin/resources", label: "Resources" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Overview</h1>
          <p className="mt-1 text-sm text-brand-ink/60">
            How many students have joined and how they are using the tests.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/tests"
            className="whitespace-nowrap rounded-md border border-brand-navy/20 px-4 py-2 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
          >
            Manage tests
          </Link>
          <Link
            href="/admin/users"
            className="whitespace-nowrap rounded-md bg-brand-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
          >
            View all students
          </Link>
        </div>
      </div>

      {pendingFeedback > 0 && (
        <Link
          href="/admin/feedback"
          className="mt-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-gold/40 bg-brand-gold/10 px-5 py-3 text-sm text-brand-navy transition-colors hover:bg-brand-gold/15"
        >
          <span>
            <strong>{pendingFeedback}</strong> student{" "}
            {pendingFeedback === 1 ? "response is" : "responses are"} waiting for your approval before{" "}
            {pendingFeedback === 1 ? "it" : "they"} can appear as testimonials.
          </span>
          <span className="font-semibold">Review feedback &rarr;</span>
        </Link>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-black/5 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">{card.label}</p>
            <p className="mt-1 text-3xl font-bold text-brand-navy">{card.value.toLocaleString("en-IN")}</p>
            <p className="mt-1 text-xs text-brand-ink/50">{card.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <section className="rounded-xl border border-black/5 bg-white p-6 lg:col-span-2">
          <h2 className="text-base font-semibold text-brand-navy">Students by target exam</h2>
          {byExam.length === 0 ? (
            <p className="mt-4 text-sm text-brand-ink/60">No students yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {byExam.map((row) => {
                const count = row._count._all;
                const pct = totalStudents ? Math.round((count / totalStudents) * 100) : 0;
                const exam = row.targetExam ?? "Not set";
                return (
                  <li key={exam}>
                    <div className="flex items-center justify-between text-sm">
                      <Link
                        href={`/admin/users?exam=${encodeURIComponent(exam)}`}
                        className="font-medium text-brand-navy hover:text-brand-gold hover:underline"
                      >
                        {exam}
                      </Link>
                      <span className="text-brand-ink/60">
                        {count} · {pct}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/5">
                      <div className="h-full rounded-full bg-brand-gold" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-black/5 bg-white p-6 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-brand-navy">Latest sign-ups</h2>
            <Link
              href="/admin/users"
              className="text-sm font-medium text-brand-navy hover:text-brand-gold hover:underline"
            >
              See all
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-brand-ink/60">No students yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-black/5">
              {recent.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-brand-ink">{s.name}</p>
                    <p className="truncate text-xs text-brand-ink/60">{s.email}</p>
                  </div>
                  <div className="text-right text-xs text-brand-ink/60">
                    <p>{s.targetExam ?? "-"}</p>
                    <p title={istDateTime.format(s.createdAt)}>{istDate.format(s.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Quick links</span>
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href} className="font-medium text-brand-navy hover:text-brand-gold">
            {link.label} &rarr;
          </Link>
        ))}
      </div>
    </div>
  );
}
