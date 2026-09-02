"use client";

import Link from "next/link";
import { useState } from "react";

import { Logo } from "@/components/logo";
import { signOutAction } from "@/lib/actions";
import { exams } from "@/lib/exam-data";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/tests", label: "Tests" },
  { href: "/pricing", label: "Pricing" },
  { href: "/resources", label: "Resources" },
];

type SessionInfo = {
  name: string;
  role: string;
} | null;

export function SiteHeaderClient({ session }: { session: SessionInfo }) {
  const [open, setOpen] = useState(false);
  const dashboardHref = session?.role === "ADMIN" ? "/admin" : "/student";

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.slice(0, 4).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-brand-ink/80 transition-colors hover:text-brand-navy"
            >
              {link.label}
            </Link>
          ))}

          <div className="group relative">
            <Link
              href="/exams"
              className="text-sm font-medium text-brand-ink/80 transition-colors hover:text-brand-navy"
            >
              Exams
            </Link>
            <div className="invisible absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 pt-3 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="overflow-hidden rounded-xl border border-black/5 bg-white py-2 shadow-lg">
                {exams.map((exam) => (
                  <Link
                    key={exam.slug}
                    href={`/exams?exam=${exam.slug}`}
                    className="block px-4 py-2 text-sm text-brand-ink/80 transition-colors hover:bg-brand-cream hover:text-brand-navy"
                  >
                    {exam.shortName}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {navLinks.slice(4).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-brand-ink/80 transition-colors hover:text-brand-navy"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {session ? (
            <>
              <Link
                href={dashboardHref}
                className="rounded-md bg-brand-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
              >
                Dashboard
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="cursor-pointer text-sm font-medium text-brand-navy transition-colors hover:text-brand-gold"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-brand-navy hover:text-brand-gold"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-brand-gold px-4 py-2 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-gold-light"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-md text-brand-navy md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-black/5 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.slice(0, 4).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-brand-ink/80 hover:text-brand-navy"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/exams"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-brand-ink/80 hover:text-brand-navy"
            >
              Exams
            </Link>
            {navLinks.slice(4).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-brand-ink/80 hover:text-brand-navy"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-3 border-t border-black/5 pt-4">
            {session ? (
              <>
                <Link
                  href={dashboardHref}
                  className="rounded-md bg-brand-navy px-4 py-2 text-center text-sm font-semibold text-white"
                >
                  Dashboard
                </Link>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="cursor-pointer text-sm font-medium text-brand-navy"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-brand-navy">
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-brand-gold px-4 py-2 text-center text-sm font-semibold text-brand-navy"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
