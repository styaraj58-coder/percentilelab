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

export type PostInput = {
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  authorName: string;
  published: boolean;
};

function slugify(title: string) {
  const slug = title
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
  return slug || "post";
}

async function uniqueSlug(title: string) {
  const base = slugify(title);
  let slug = base;
  let n = 2;
  while (await prisma.blogPost.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

function clean(input: PostInput) {
  const title = input.title.trim();
  const content = input.content.trim();
  if (!title) throw new Error("Title is required");
  if (!content) throw new Error("Write some content before saving");

  const coverImageUrl = input.coverImageUrl.trim();
  if (coverImageUrl) {
    try {
      new URL(coverImageUrl);
    } catch {
      throw new Error("Cover image URL is not valid");
    }
  }

  return {
    title,
    content,
    excerpt: input.excerpt.trim() || null,
    coverImageUrl: coverImageUrl || null,
    authorName: input.authorName.trim() || "Satya Raj",
    published: input.published,
  };
}

function revalidateBlog(slug?: string) {
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");
}

export async function createPost(input: PostInput) {
  const admin = await requireAdmin();
  const data = clean(input);
  const slug = await uniqueSlug(data.title);

  await prisma.blogPost.create({
    data: { ...data, slug, createdById: admin.id },
  });

  revalidateBlog(slug);
}

export async function updatePost(id: string, input: PostInput) {
  await requireAdmin();
  const data = clean(input);

  const post = await prisma.blogPost.update({ where: { id }, data });

  revalidateBlog(post.slug);
}

export async function setPostPublished(id: string, published: boolean) {
  await requireAdmin();

  const post = await prisma.blogPost.update({ where: { id }, data: { published } });

  revalidateBlog(post.slug);
}

export async function deletePost(id: string) {
  await requireAdmin();

  const post = await prisma.blogPost.delete({ where: { id } });

  revalidateBlog(post.slug);
}
