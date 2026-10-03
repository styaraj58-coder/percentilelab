import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Blog | Percentile Lab",
  description:
    "Exam strategy, preparation tips and updates for MBA and undergraduate management entrance exams from the Percentile Lab team.",
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImageUrl: true,
      authorName: true,
      createdAt: true,
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
          Blog
        </p>
        <h1 className="mt-2 text-3xl font-bold text-brand-navy sm:text-4xl">
          Prep smarter, one article at a time
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-brand-ink/70">
          Exam strategy, preparation tips and updates for MBA and undergraduate
          management entrance exams.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="mt-16 text-center text-brand-ink/60">
          No articles yet - check back soon.
        </p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
            >
              {post.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.coverImageUrl}
                  alt=""
                  className="aspect-[16/9] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[16/9] w-full items-center justify-center bg-brand-navy text-3xl font-bold text-brand-gold">
                  {post.title.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-1 flex-col p-6">
                <p className="text-xs text-brand-ink/50">
                  {post.authorName} &middot; {formatDate(post.createdAt)}
                </p>
                <h2 className="mt-2 text-lg font-semibold text-brand-navy group-hover:text-brand-gold">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="mt-2 line-clamp-3 text-sm text-brand-ink/70">
                    {post.excerpt}
                  </p>
                )}
                <span className="mt-auto pt-4 text-sm font-semibold text-brand-navy">
                  Read more &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
