import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The standalone pricing page was folded into the Courses page.
  async redirects() {
    return [{ source: "/pricing", destination: "/courses", permanent: true }];
  },
};

export default nextConfig;
