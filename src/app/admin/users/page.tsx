import type { Metadata } from "next";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { PremiumToggle } from "./premium-toggle";
import { RoleToggle } from "./role-toggle";

export const metadata: Metadata = { title: "Users | Percentile Lab" };

export default async function AdminUsersPage() {
  const session = await auth();

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isPremium: true,
      phone: true,
      college: true,
      course: true,
      targetExam: true,
      createdAt: true,
      _count: { select: { attempts: true } },
    },
  });

  const admins = users.filter((u) => u.role === "ADMIN");
  const students = users.filter((u) => u.role !== "ADMIN");

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Users</h1>
      <p className="mt-1 text-sm text-brand-ink/60">
        {admins.length} admin{admins.length === 1 ? "" : "s"} · {students.length}{" "}
        student{students.length === 1 ? "" : "s"}
      </p>

      <div className="mt-8 overflow-x-auto rounded-xl border border-black/5 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-black/5 bg-brand-cream/60 text-xs uppercase tracking-wide text-brand-ink/50">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Contact number</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Premium</th>
              <th className="px-5 py-3 font-medium">College / Course</th>
              <th className="px-5 py-3 font-medium">Attempts</th>
              <th className="px-5 py-3 font-medium">Joined</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-black/5 last:border-0">
                <td className="px-5 py-4 font-medium text-brand-navy">{user.name}</td>
                <td className="px-5 py-4 text-brand-ink/70">{user.email}</td>
                <td className="px-5 py-4 text-brand-ink/70">
                  {user.phone || <span className="text-brand-ink/30">-</span>}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      user.role === "ADMIN"
                        ? "bg-brand-navy/10 text-brand-navy"
                        : "bg-black/5 text-brand-ink/60"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <PremiumToggle userId={user.id} isPremium={user.isPremium} />
                </td>
                <td className="px-5 py-4 text-brand-ink/70">
                  {user.college ? (
                    <>
                      {user.college}
                      {user.course && (
                        <span className="text-brand-ink/40"> · {user.course}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-brand-ink/30">-</span>
                  )}
                </td>
                <td className="px-5 py-4 text-brand-ink/70">{user._count.attempts}</td>
                <td className="px-5 py-4 text-brand-ink/70">
                  {user.createdAt.toLocaleDateString()}
                </td>
                <td className="px-5 py-4">
                  <RoleToggle
                    userId={user.id}
                    role={user.role}
                    isSelf={user.id === session!.user.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
