import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { TestBuilder, type InitialTestData } from "../../test-builder";

export const metadata: Metadata = { title: "Edit test | Percentile Lab MBA" };

export default async function EditTestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const test = await prisma.test.findUnique({
    where: { id },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: { options: { orderBy: { order: "asc" } } },
          },
        },
      },
    },
  });

  if (!test || test.createdById !== session.user.id) {
    notFound();
  }

  const initialData: InitialTestData = {
    title: test.title,
    description: test.description ?? "",
    durationMinutes: test.durationMinutes,
    sections: test.sections.map((section) => ({
      id: section.id,
      name: section.name,
      questions: section.questions.map((question) => ({
        id: question.id,
        text: question.text,
        explanation: question.explanation ?? "",
        marks: question.marks,
        options: question.options.map((option) => ({
          id: option.id,
          text: option.text,
          isCorrect: option.isCorrect,
        })),
      })),
    })),
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Edit test</h1>
      <p className="mt-1 text-sm text-brand-ink/60">
        Changes replace all sections and questions when you save.
      </p>
      <div className="mt-8">
        <TestBuilder testId={test.id} initialData={initialData} />
      </div>
    </div>
  );
}
