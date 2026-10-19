import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Logo } from "@/components/logo";
import { signOutAction } from "@/lib/actions";

const navLinks = [
  { href: "/student", label: "My tests" },
  { href: "/student/feedback", label: "Feedback" },
  { href: "/student/profile", label: "Edit profile" },
];

const linkClass = "whitespace-nowrap text-sm font-medium text-brand-navy hover:text-brand-gold";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin");

  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Logo className="shrink-0" />
          <div className="flex items-center gap-4 sm:gap-5">
            <span className="hidden max-w-[10rem] truncate text-sm text-brand-ink/60 md:inline">
              {session.user.name}
            </span>
            {/* tablets and up: the links sit beside Sign out */}
            <nav aria-label="Student" className="hidden items-center gap-5 sm:flex">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              ))}
            </nav>
            <form action={signOutAction}>
              <button
                type="submit"
                className={`${linkClass} flex min-h-11 cursor-pointer items-center`}
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        {/* phones: the same links in their own row below the logo */}
        <nav aria-label="Student" className="border-t border-black/5 sm:hidden">
          <div className="mx-auto flex max-w-5xl gap-6 overflow-x-auto px-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`${linkClass} flex min-h-11 items-center`}>
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
