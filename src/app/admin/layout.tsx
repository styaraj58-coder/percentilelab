import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Logo } from "@/components/logo";
import { signOutAction } from "@/lib/actions";

const navLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/tests", label: "Tests" },
  { href: "/admin/tests/new", label: "New test" },
  { href: "/admin/bank", label: "Bank" },
  { href: "/admin/users", label: "Students" },
  { href: "/admin/resources", label: "Resources" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/feedback", label: "Feedback" },
];

const navClass = "whitespace-nowrap text-sm font-medium text-brand-ink/80 transition-colors hover:text-brand-navy";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4 lg:gap-8">
            <Logo />
            <span className="hidden rounded-full bg-brand-navy px-2.5 py-0.5 text-xs font-semibold text-white sm:inline">
              Admin
            </span>
            <nav aria-label="Admin" className="hidden items-center gap-5 lg:flex">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={navClass}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-brand-ink/60 md:inline">{session.user.name}</span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="cursor-pointer text-sm font-medium text-brand-navy hover:text-brand-gold"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        {/* Phones and tablets: the same links in a scrollable row. */}
        <nav aria-label="Admin" className="border-t border-black/5 lg:hidden">
          <div className="mx-auto flex max-w-6xl gap-5 overflow-x-auto px-4 py-2.5 sm:px-6">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={navClass}>
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
