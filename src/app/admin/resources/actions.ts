"use server";

import { revalidatePath } from "next/cache";
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

export type ResourceType = "VIDEO" | "PDF";

export async function createResource(input: {
  type: ResourceType;
  title: string;
  description: string;
  url: string;
}) {
  const admin = await requireAdmin();

  const title = input.title.trim();
  const url = input.url.trim();

  if (!title) throw new Error("Title is required");
  if (!url) {
    throw new Error(
      input.type === "VIDEO" ? "Video link is required" : "PDF file is required"
    );
  }
  if (input.type === "VIDEO") {
    try {
      new URL(url);
    } catch {
      throw new Error("Enter a valid video URL");
    }
  }

  await prisma.resource.create({
    data: {
      type: input.type,
      title,
      description: input.description.trim() || null,
      url,
      createdById: admin.id,
    },
  });

  revalidatePath("/admin/resources");
  revalidatePath("/resources");
}

export async function deleteResource(id: string) {
  await requireAdmin();

  await prisma.resource.delete({ where: { id } });

  revalidatePath("/admin/resources");
  revalidatePath("/resources");
}
