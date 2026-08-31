"use server";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }
  return session.user;
}

export async function setUserRole(userId: string, role: "ADMIN" | "STUDENT") {
  const admin = await requireAdmin();

  if (userId === admin.id && role === "STUDENT") {
    throw new Error("You can't remove your own admin access.");
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });
}

export async function setUserPremium(userId: string, isPremium: boolean) {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { isPremium } });
}
