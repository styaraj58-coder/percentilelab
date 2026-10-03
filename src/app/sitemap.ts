import type { MetadataRoute } from "next";

import { exams } from "@/lib/exam-data";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://www.percentilelab.in";

// Reads published blog posts from the database, so render per request
// instead of freezing the list at build time.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    "",
    "/about",
    "/blog",
    "/courses",
    "/exams",
    ...exams.map((exam) => `/exams/${exam.slug}`),
    "/pricing",
    "/resources",
    "/sample-test",
    "/tests",
    "/tools/score-calculator",
  ];

  const pages: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/tests" || route === "/blog" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));

  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });

  return [
    ...pages,
    ...posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
