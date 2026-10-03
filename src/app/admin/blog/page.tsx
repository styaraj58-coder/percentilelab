import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/prisma";

import { PostRowActions } from "./post-row-actions";

export const metadata: Metadata = { title: "Blog | Percentile Lab" };

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      published: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Blog</h1>
          <p className="mt-1 text-sm text-brand-ink/60">
            Published articles appear on the public Blog page. Drafts stay
            hidden until you publish them.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="rounded-md bg-brand-navy px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
        >
          + New post
        </Link>
      </div>

      <ul className="mt-8 space-y-3">
        {posts.length === 0 && (
          <p className="text-sm text-brand-ink/50">No posts yet.</p>
        )}
        {posts.map((post) => (
          <li
            key={post.id}
            className="rounded-xl border border-black/5 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-brand-navy">{post.title}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      post.published
                        ? "bg-green-100 text-green-800"
                        : "bg-black/5 text-brand-ink/60"
                    }`}
                  >
                    {post.published ? "Published" : "Draft"}
                  </span>
                </div>
                {post.excerpt && (
                  <p className="mt-1 line-clamp-2 text-sm text-brand-ink/60">
                    {post.excerpt}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-4 text-xs">
                  <span className="text-brand-ink/40">
                    {post.createdAt.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <Link
                    href={`/admin/blog/${post.id}/edit`}
                    className="font-medium text-brand-navy hover:underline"
                  >
                    Edit
                  </Link>
                  {post.published && (
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="text-brand-ink/50 hover:text-brand-navy hover:underline"
                    >
                      View
                    </Link>
                  )}
                </div>
              </div>
              <PostRowActions postId={post.id} published={post.published} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
