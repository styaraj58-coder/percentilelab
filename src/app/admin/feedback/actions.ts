"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { canPublish } from "@/lib/feedback";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");
}

// Marks a response as cleared for the public site. Only possible when the
// student consented to publishing; un-approving is always allowed.
export async function setFeedbackApproved(id: string, approved: boolean) {
  await requireAdmin();

  if (approved) {
    const fb = await prisma.feedback.findUnique({
      where: { id },
      select: { publishAs: true, ageConfirmed: true, quote: true },
    });
    if (!fb || !canPublish(fb)) {
      throw new Error("This student did not agree to publishing, so it can't be approved.");
    }
  }

  await prisma.feedback.update({ where: { id }, data: { approved } });
  revalidatePath("/admin/feedback");
}

export async function deleteFeedback(id: string) {
  await requireAdmin();
  await prisma.feedback.delete({ where: { id } });
  revalidatePath("/admin/feedback");
}
