import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { TestBuilder, type InitialTestData } from "../../test-builder";

export const metadata: Metadata = { title: "Edit test | Percentile Lab" };

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
            include: {
              options: { orderBy: { order: "asc" } },
              passage: { select: { id: true, title: true, text: true } },
            },
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
    targetExam: test.targetExam,
    durationMinutes: test.durationMinutes,
    sections: test.sections.map((section) => {
      const blocks: InitialTestData["sections"][number]["blocks"] = [];
      let openPassageId: string | null = null;

      for (const question of section.questions) {
        const questionState = {
          id: question.id,
          text: question.text,
          imageUrl: question.imageUrl ?? "",
          explanation: question.explanation ?? "",
          marks: question.marks,
          options: question.options.map((option) => ({
            id: option.id,
            text: option.text,
            imageUrl: option.imageUrl ?? "",
            isCorrect: option.isCorrect,
          })),
        };

        const last = blocks[blocks.length - 1];
        if (question.passage && question.passage.id === openPassageId && last?.passage) {
          last.questions.push(questionState);
          continue;
        }

        if (question.passage) {
          blocks.push({
            id: question.passage.id,
            passage: {
              title: question.passage.title ?? "",
              text: question.passage.text,
            },
            questions: [questionState],
          });
          openPassageId = question.passage.id;
        } else {
          blocks.push({ id: question.id, passage: null, questions: [questionState] });
          openPassageId = null;
        }
      }

      return { id: section.id, name: section.name, blocks };
    }),
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
