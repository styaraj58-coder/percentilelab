"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MBA_ENTRANCE_EXAMS } from "@/lib/validation";

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

export async function setUserExam(userId: string, targetExam: string) {
  await requireAdmin();

  const parsed = z.enum(MBA_ENTRANCE_EXAMS).safeParse(targetExam);
  if (!parsed.success) throw new Error("Pick a valid exam.");

  await prisma.user.update({ where: { id: userId }, data: { targetExam: parsed.data } });
  revalidatePath("/student");
  revalidatePath("/tests");
}

export async function setUserPremium(userId: string, isPremium: boolean) {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { isPremium } });
}
