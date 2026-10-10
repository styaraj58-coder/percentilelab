import Link from "next/link";

import { exams } from "@/lib/exam-data";
import { SITE_LINKEDIN } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-brand-navy text-white/80">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.5fr]">
          <div>
            <p className="text-lg font-semibold text-white">
              Percentile <span className="text-brand-gold">Lab</span>
            </p>
            <p className="mt-2 text-sm text-white/60">
              Focused MBA entrance exam mock tests with detailed percentile
              and section-wise analysis.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Explore</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-brand-gold">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-gold">
                  About
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-brand-gold">
                  Courses
                </Link>
              </li>
              <li>
                <Link href="/tests" className="hover:text-brand-gold">
                  Tests
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-brand-gold">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-brand-gold">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Exams</p>
            <ul className="mt-3 space-y-2 text-sm">
              {exams.map((exam) => (
                <li key={exam.slug}>
                  <Link href={`/exams/${exam.slug}`} className="hover:text-brand-gold">
                    {exam.shortName}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/tools/score-calculator" className="hover:text-brand-gold">
                  Score Calculator
                </Link>
              </li>
              <li>
                <Link href="/sample-test" className="hover:text-brand-gold">
                  Free Sample Test
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Account</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/login" className="hover:text-brand-gold">
                  Log in
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-brand-gold">
                  Create an account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Contact</p>
            <p className="mt-3 break-words text-sm text-white/60">
              <a
                href="mailto:percentilelab61@gmail.com"
                className="hover:text-brand-gold"
              >
                percentilelab61@gmail.com
              </a>
            </p>
            <p className="mt-1 text-sm text-white/60">
              <a href="tel:+918053134016" className="hover:text-brand-gold">
                +91 80531 34016
              </a>
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <a
                href="https://www.instagram.com/percentile.lab?igsh=NXgxdXUzejZkOXN0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-brand-gold"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  className="h-4 w-4"
                >
                  <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
                  <circle cx="12" cy="12" r="4.25" />
                  <circle cx="17.15" cy="6.85" r="0.5" fill="currentColor" stroke="none" />
                </svg>
                Instagram
              </a>
              <a
                href={SITE_LINKEDIN}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-brand-gold"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
                </svg>
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/50">
          © {new Date().getFullYear()} Percentile Lab. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
