"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { sendFeedbackNotification } from "@/lib/email";
import { CONSENT_VERSION } from "@/lib/feedback";
import { prisma } from "@/lib/prisma";
import { feedbackSchema } from "@/lib/validation";

export type FeedbackState =
  | { error?: string; success?: boolean; values?: Record<string, string> }
  | undefined;

const FIELDS = ["exam", "rating", "liked", "improve", "quote", "firstPercentile", "latestPercentile", "publishAs", "ageConfirmed"];

// Echoed back with an error so React does not wipe what the student typed.
function submitted(formData: FormData) {
  return Object.fromEntries(FIELDS.map((f) => [f, String(formData.get(f) ?? "")]));
}

const MAX_PER_DAY = 3;

export async function submitFeedback(
  _prevState: FeedbackState,
  formData: FormData
): Promise<FeedbackState> {
  const session = await auth();
  if (!session?.user || session.user.role === "ADMIN") {
    return { error: "Please sign in as a student to share feedback.", values: submitted(formData) };
  }

  const parsed = feedbackSchema.safeParse({
    exam: formData.get("exam"),
    rating: formData.get("rating"),
    liked: formData.get("liked") ?? undefined,
    improve: formData.get("improve") ?? undefined,
    quote: formData.get("quote") ?? undefined,
    firstPercentile: formData.get("firstPercentile"),
    latestPercentile: formData.get("latestPercentile"),
    publishAs: formData.get("publishAs"),
    ageConfirmed: formData.get("ageConfirmed") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again.", values: submitted(formData) };
  }
  const data = parsed.data;

  const student = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, college: true },
  });
  if (!student) return { error: "We could not find your account. Please sign in again.", values: submitted(formData) };

  const recent = await prisma.feedback.count({
    where: { userId: session.user.id, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
  });
  if (recent >= MAX_PER_DAY) {
    return { error: "You have already sent feedback a few times today. Thank you - please try again tomorrow.", values: submitted(formData) };
  }

  const wantsPublish = data.publishAs !== "PRIVATE";

  await prisma.feedback.create({
    data: {
      userId: session.user.id,
      name: student.name,
      email: student.email,
      college: student.college,
      exam: data.exam,
      rating: data.rating,
      liked: data.liked || null,
      improve: data.improve || null,
      quote: data.quote || null,
      firstPercentile: data.firstPercentile ?? null,
      latestPercentile: data.latestPercentile ?? null,
      publishAs: data.publishAs,
      // Only a student who agreed to publishing has a consent record.
      ageConfirmed: wantsPublish && data.ageConfirmed,
      consentVersion: CONSENT_VERSION,
      consentGivenAt: wantsPublish ? new Date() : null,
    },
  });

  await sendFeedbackNotification({
    name: student.name,
    email: student.email,
    exam: data.exam,
    rating: data.rating,
    publishAs: data.publishAs,
    quote: data.quote,
  });

  revalidatePath("/admin/feedback");
  return { success: true };
}
