import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/prisma";

type Props = { searchParams: Promise<{ q?: string }> };

function cleanQuery(q: string | undefined) {
  return (q ?? "").replace(/\s+/g, " ").trim().slice(0, 100);
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: "Blog | Percentile Lab",
    description:
      "Exam strategy, preparation tips and updates for MBA and undergraduate management entrance exams from the Percentile Lab team.",
    // Search-result pages are thin duplicates of /blog; keep them out of Google.
    robots: cleanQuery(q) ? { index: false, follow: true } : undefined,
  };
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPage({ searchParams }: Props) {
  const query = cleanQuery((await searchParams).q);
  // Every word must appear somewhere in the title, summary or article.
  const terms = query.split(" ").filter(Boolean).slice(0, 6);

  const posts = await prisma.blogPost.findMany({
    where: {
      published: true,
      AND: terms.map((term) => ({
        OR: [
          { title: { contains: term, mode: "insensitive" } },
          { excerpt: { contains: term, mode: "insensitive" } },
          { content: { contains: term, mode: "insensitive" } },
        ],
      })),
    },
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

      <form action="/blog" method="get" role="search" className="mx-auto mt-8 flex max-w-xl gap-2">
        <label htmlFor="blog-search" className="sr-only">
          Search articles
        </label>
        <div className="relative flex-1">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-ink/40"
          >
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m20 20-3.5-3.5" />
          </svg>
          <input
            id="blog-search"
            type="search"
            name="q"
            defaultValue={query}
            maxLength={100}
            placeholder="Search articles, e.g. MAH-CET or syllabus"
            className="w-full rounded-md border border-black/10 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
        >
          Search
        </button>
      </form>

      {query && (
        <p className="mt-6 text-center text-sm text-brand-ink/70" aria-live="polite">
          {posts.length === 0
            ? "No articles found for "
            : `${posts.length} ${posts.length === 1 ? "article" : "articles"} for `}
          <span className="font-semibold text-brand-navy">&ldquo;{query}&rdquo;</span>
          {" - "}
          <Link href="/blog" className="font-medium text-brand-navy underline decoration-brand-gold underline-offset-2 hover:text-brand-gold">
            clear search
          </Link>
        </p>
      )}

      {posts.length === 0 ? (
        <p className="mt-12 text-center text-brand-ink/60">
          {query ? "Try a different keyword, or browse all articles." : "No articles yet - check back soon."}
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
