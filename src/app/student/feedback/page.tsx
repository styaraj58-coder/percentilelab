import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { FeedbackForm } from "./feedback-form";

export const metadata: Metadata = { title: "Share your feedback | Percentile Lab" };

export default async function StudentFeedbackPage() {
  const session = await auth();
  const student = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { name: true, targetExam: true },
  });

  return (
    <div>
      <Link href="/student" className="text-sm text-brand-ink/60 hover:text-brand-navy">
        &larr; Back to your tests
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-brand-navy">Share your feedback</h1>
      <p className="mt-1 max-w-2xl text-sm text-brand-ink/60">
        You are one of our first students, so your honest opinion shapes what we
        build next. It takes about two minutes. You decide whether anything you
        write is ever shown publicly.
      </p>

      <div className="mt-8 max-w-2xl rounded-xl border border-black/5 bg-white p-6">
        <FeedbackForm studentName={student?.name ?? ""} defaultExam={student?.targetExam ?? ""} />
      </div>
    </div>
  );
}
