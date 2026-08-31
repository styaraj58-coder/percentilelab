import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/student", "/exam", "/post-login"],
      },
    ],
    sitemap: "https://percentilelab.in/sitemap.xml",
  };
}
