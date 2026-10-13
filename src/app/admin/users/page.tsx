import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/auth";
import { istDate, istDateTime } from "@/lib/admin-format";
import {
  NOT_SET,
  PAGE_SIZE,
  parseStudentFilters,
  studentSelect,
  studentWhere,
  submittedCounts,
  whatsappNumber,
} from "@/lib/admin-students";
import { prisma } from "@/lib/prisma";
import { MBA_ENTRANCE_EXAMS } from "@/lib/validation";

import { ExamSelect } from "./exam-select";
import { PremiumToggle } from "./premium-toggle";
import { RoleToggle } from "./role-toggle";

export const metadata: Metadata = { title: "Students | Percentile Lab Admin" };

const inputClass =
  "mt-1 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  const filters = parseStudentFilters(await searchParams);
  const where = studentWhere(filters);

  const total = await prisma.user.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);

  const [students, admins] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: studentSelect,
    }),
    prisma.user.findMany({
      where: { role: "ADMIN" },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, email: true, role: true },
    }),
  ]);
  const submitted = await submittedCounts(
    prisma,
    students.map((s) => s.id)
  );

  const qs = (overrides: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const merged = {
      q: filters.q,
      exam: filters.exam,
      premium: filters.premium,
      page: undefined,
      ...overrides,
    };
    for (const [k, v] of Object.entries(merged)) {
      const text = v === undefined ? "" : String(v);
      if (text !== "" && text !== "1") p.set(k, text);
    }
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const filtered = Boolean(filters.q || filters.exam || filters.premium);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Students</h1>
          <p className="mt-1 text-sm text-brand-ink/60">
            {total.toLocaleString("en-IN")} {filtered ? "matching" : "registered"}{" "}
            {total === 1 ? "student" : "students"}, newest first.
          </p>
        </div>
        <a
          href={`/admin/users/export${qs({ page: undefined })}`}
          className="whitespace-nowrap rounded-md bg-brand-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
        >
          Download CSV
        </a>
      </div>

      <form
        method="get"
        className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-black/5 bg-white p-4"
      >
        <div className="min-w-[14rem] flex-1">
          <label htmlFor="q" className="block text-xs font-medium text-brand-ink/70">
            Search
          </label>
          <input
            id="q"
            name="q"
            defaultValue={filters.q}
            placeholder="Name, email, phone, college or course"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="exam" className="block text-xs font-medium text-brand-ink/70">
            Target exam
          </label>
          <select id="exam" name="exam" defaultValue={filters.exam} className={`${inputClass} w-48 max-w-full`}>
            <option value="">All exams</option>
            {MBA_ENTRANCE_EXAMS.map((exam) => (
              <option key={exam} value={exam}>
                {exam}
              </option>
            ))}
            <option value={NOT_SET}>{NOT_SET}</option>
          </select>
        </div>
        <div>
          <label htmlFor="premium" className="block text-xs font-medium text-brand-ink/70">
            Plan
          </label>
          <select id="premium" name="premium" defaultValue={filters.premium} className={`${inputClass} w-36`}>
            <option value="">All students</option>
            <option value="yes">Premium</option>
            <option value="no">Free</option>
          </select>
        </div>
        <button
          type="submit"
          className="cursor-pointer rounded-md border border-brand-navy/20 px-4 py-2 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
        >
          Apply
        </button>
        {filtered && (
          <Link
            href="/admin/users"
            className="py-2 text-sm font-medium text-brand-ink/60 hover:text-brand-navy hover:underline"
          >
            Clear
          </Link>
        )}
      </form>

      {students.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-brand-navy/20 bg-white p-10 text-center text-brand-ink/60">
          {filtered ? "No students match these filters." : "No students have registered yet."}
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-black/5 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[60rem] text-left text-sm">
              <thead className="border-b border-black/5 bg-brand-cream/60 text-xs uppercase tracking-wide text-brand-ink/60">
                <tr>
                  <th className="px-3 py-3 font-semibold">Student</th>
                  <th className="px-3 py-3 font-semibold">Phone</th>
                  <th className="px-3 py-3 font-semibold">College / course</th>
                  <th className="px-3 py-3 font-semibold">Exam</th>
                  <th className="px-3 py-3 font-semibold">Premium</th>
                  <th className="px-3 py-3 font-semibold">Joined</th>
                  <th className="px-3 py-3 text-right font-semibold">Tests</th>
                  <th className="px-3 py-3 font-semibold">Last active</th>
                  <th className="px-3 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {students.map((s) => {
                  const last = s.attempts[0]?.startedAt;
                  const wa = whatsappNumber(s.phone);
                  return (
                    <tr key={s.id} className="align-top">
                      <td className="px-3 py-3">
                        <p className="font-medium text-brand-ink">{s.name}</p>
                        <a
                          href={`mailto:${s.email}`}
                          className="text-xs text-brand-ink/60 hover:text-brand-navy hover:underline"
                        >
                          {s.email}
                        </a>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {s.phone ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${s.phone}`}
                              className="text-brand-ink hover:text-brand-navy hover:underline"
                            >
                              {s.phone}
                            </a>
                            {wa && (
                              <a
                                href={`https://wa.me/${wa}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`Message ${s.name} on WhatsApp`}
                                aria-label={`Message ${s.name} on WhatsApp`}
                                className="inline-flex items-center gap-1 rounded-full bg-[#25D366]/10 px-2 py-1 text-xs font-semibold text-[#128C7E] transition-colors hover:bg-[#25D366] hover:text-white"
                              >
                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                                  <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35ZM12.04 21.8h-.01a9.9 9.9 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.89 9.88ZM20.52 3.45A11.8 11.8 0 0 0 12.04 0C5.5 0 .18 5.32.18 11.86c0 2.09.55 4.13 1.59 5.93L.06 24l6.3-1.65a11.85 11.85 0 0 0 5.67 1.44h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.23-6.15-3.48-8.38Z" />
                                </svg>
                                WhatsApp
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-brand-ink/40">-</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-brand-ink">{s.college ?? "-"}</p>
                        <p className="text-xs text-brand-ink/60">{s.course ?? "-"}</p>
                      </td>
                      <td className="px-3 py-3">
                        <ExamSelect userId={s.id} targetExam={s.targetExam} />
                      </td>
                      <td className="px-3 py-3">
                        <PremiumToggle userId={s.id} isPremium={s.isPremium} />
                      </td>
                      <td
                        className="whitespace-nowrap px-3 py-3 text-brand-ink/80"
                        title={istDateTime.format(s.createdAt)}
                      >
                        {istDate.format(s.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right">
                        <span className="font-semibold text-brand-navy">{submitted.get(s.id) ?? 0}</span>
                        <span className="text-brand-ink/50"> / {s._count.attempts}</span>
                      </td>
                      <td
                        className="whitespace-nowrap px-3 py-3 text-brand-ink/80"
                        title={last ? istDateTime.format(last) : undefined}
                      >
                        {last ? istDate.format(last) : <span className="text-brand-ink/40">Never</span>}
                      </td>
                      <td className="px-3 py-3">
                        <RoleToggle userId={s.id} role="STUDENT" isSelf={false} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 px-3 py-3 text-sm">
            <p className="text-brand-ink/60">
              Showing {from}-{to} of {total.toLocaleString("en-IN")}
            </p>
            <div className="flex items-center gap-2">
              {page > 1 ? (
                <Link
                  href={`/admin/users${qs({ page: page - 1 })}`}
                  className="rounded-md border border-black/10 px-3 py-1.5 font-medium text-brand-navy hover:bg-brand-cream"
                >
                  Previous
                </Link>
              ) : (
                <span className="rounded-md border border-black/5 px-3 py-1.5 text-brand-ink/30">Previous</span>
              )}
              <span className="text-brand-ink/60">
                Page {page} of {pageCount}
              </span>
              {page < pageCount ? (
                <Link
                  href={`/admin/users${qs({ page: page + 1 })}`}
                  className="rounded-md border border-black/10 px-3 py-1.5 font-medium text-brand-navy hover:bg-brand-cream"
                >
                  Next
                </Link>
              ) : (
                <span className="rounded-md border border-black/5 px-3 py-1.5 text-brand-ink/30">Next</span>
              )}
            </div>
          </div>
        </div>
      )}

      <p className="mt-4 text-xs text-brand-ink/50">
        &quot;Tests&quot; shows submitted / started. Times are shown in IST.
      </p>

      <section className="mt-10">
        <h2 className="text-base font-semibold text-brand-navy">
          Admins ({admins.length})
        </h2>
        <ul className="mt-3 divide-y divide-black/5 rounded-xl border border-black/5 bg-white">
          {admins.map((admin) => (
            <li key={admin.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-3 text-sm">
              <div>
                <p className="font-medium text-brand-ink">{admin.name}</p>
                <p className="text-xs text-brand-ink/60">{admin.email}</p>
              </div>
              <RoleToggle userId={admin.id} role={admin.role} isSelf={admin.id === session!.user.id} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
