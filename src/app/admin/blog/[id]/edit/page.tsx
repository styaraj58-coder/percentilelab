import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import { PostForm } from "../../post-form";

export const metadata: Metadata = { title: "Edit post | Percentile Lab" };

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-brand-navy">Edit post</h1>
      <div className="mt-6">
        <PostForm
          postId={post.id}
          initial={{
            title: post.title,
            excerpt: post.excerpt ?? "",
            content: post.content,
            coverImageUrl: post.coverImageUrl ?? "",
            authorName: post.authorName,
            published: post.published,
          }}
        />
      </div>
    </div>
  );
}
