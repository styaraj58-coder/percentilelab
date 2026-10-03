import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogContent, extractHeadings } from "@/components/blog-content";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ slug: string }> };

async function getPost(slug: string) {
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  return post && post.published ? post : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Blog | Percentile Lab" };

  return {
    title: `${post.title} | Percentile Lab`,
    description: post.excerpt ?? undefined,
    authors: [{ name: post.authorName }],
    openGraph: post.coverImageUrl ? { images: [post.coverImageUrl] } : undefined,
  };
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const headings = extractHeadings(post.content);
  const related = await prisma.blogPost.findMany({
    where: { published: true, id: { not: post.id } },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, slug: true, title: true, authorName: true, createdAt: true },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Link
        href="/blog"
        className="text-sm font-medium text-brand-navy hover:text-brand-gold"
      >
        &larr; All articles
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <article className="min-w-0">
          <h1 className="text-3xl font-bold text-brand-navy sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 text-sm text-brand-ink/60">
            By <span className="font-semibold text-brand-navy">{post.authorName}</span>
            <span className="mx-2 text-brand-ink/30">|</span>
            {formatDate(post.createdAt)}
          </p>

          {post.coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImageUrl}
              alt=""
              className="mt-8 aspect-[16/9] w-full rounded-2xl border border-black/5 object-cover"
            />
          )}

          {headings.length > 1 && (
            <nav
              aria-label="Table of contents"
              className="mt-8 rounded-2xl border border-black/10 bg-white p-6"
            >
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-lg font-bold text-brand-navy">
                  Table of <span className="text-brand-gold">contents</span>
                </p>
                <p className="text-xs text-brand-ink/50">{headings.length} sections</p>
              </div>
              <ol className="mt-4 space-y-2.5">
                {headings.map((heading, i) => (
                  <li key={heading.id} className="flex gap-3 text-sm">
                    <span className="font-semibold text-brand-gold">
                      {String(i + 1).padStart(2, "0")}.
                    </span>
                    <a
                      href={`#${heading.id}`}
                      className="font-medium text-brand-navy hover:text-brand-gold"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className="mt-8">
            <BlogContent content={post.content} />
          </div>

          <div className="mt-14 rounded-2xl border border-black/5 bg-brand-cream p-6 text-center">
            <p className="font-semibold text-brand-navy">
              Ready to put this into practice?
            </p>
            <Link
              href="/tests"
              className="mt-4 inline-block rounded-md bg-brand-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
            >
              Take a mock test
            </Link>
          </div>
        </article>

        {related.length > 0 && (
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-black/10 bg-white p-6">
              <p className="text-lg font-bold text-brand-navy">
                Related <span className="text-brand-gold">blogs</span>
              </p>
              <p className="mt-1 text-xs text-brand-ink/50">
                Same topic, deeper reads
              </p>
              <ul className="mt-4 divide-y divide-black/5">
                {related.map((item) => (
                  <li key={item.id} className="py-3 first:pt-0 last:pb-0">
                    <Link href={`/blog/${item.slug}`} className="group block">
                      <p className="text-sm font-semibold text-brand-navy group-hover:text-brand-gold">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-brand-ink/50">
                        {item.authorName} &middot; {formatDate(item.createdAt)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
