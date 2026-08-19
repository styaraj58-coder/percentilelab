import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-brand-navy text-white/80">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
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
                <Link href="/tests" className="hover:text-brand-gold">
                  Tests
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-brand-gold">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/exams" className="hover:text-brand-gold">
                  Exams
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
            <p className="mt-3 text-sm text-white/60">
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
            <p className="mt-3">
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
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/50">
          © {new Date().getFullYear()} Percentile Lab. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
