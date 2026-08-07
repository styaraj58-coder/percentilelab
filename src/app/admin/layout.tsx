import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Logo } from "@/components/logo";
import { signOutAction } from "@/lib/actions";

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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden items-center gap-6 sm:flex">
              <Link
                href="/admin"
                className="text-sm font-medium text-brand-ink/80 hover:text-brand-navy"
              >
                Tests
              </Link>
              <Link
                href="/admin/tests/new"
                className="text-sm font-medium text-brand-ink/80 hover:text-brand-navy"
              >
                New test
              </Link>
              <Link
                href="/admin/users"
                className="text-sm font-medium text-brand-ink/80 hover:text-brand-navy"
              >
                Users
              </Link>
              <Link
                href="/admin/resources"
                className="text-sm font-medium text-brand-ink/80 hover:text-brand-navy"
              >
                Resources
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-brand-ink/60 sm:inline">
              {session.user.name}
            </span>
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
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
