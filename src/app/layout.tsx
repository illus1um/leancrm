import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { logoutUser } from "@/lib/actions/auth";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LeanCRM — for small teams",
  description:
    "A drag-and-drop CRM for shopkeepers, makers, and small agencies. CSE-2505M Software Development Case Study.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={`${geistSans.variable} antialiased`}>
      <body className="min-h-screen flex flex-col bg-paper text-ink">
        <div className="grain pointer-events-none fixed inset-0 z-50 opacity-[0.035] mix-blend-multiply" />
        <header className="sticky top-0 z-40 border-b border-rule bg-paper/80 backdrop-blur-md">
          <nav className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-5 sm:px-8">
            <div className="flex items-center gap-6">
              <Link
                href={user ? "/dashboard" : "/login"}
                className="flex items-center text-[15px] font-semibold tracking-tight"
              >
                Lean<span className="text-accent">·</span>CRM
              </Link>
              {user ? (
                <>
                  <div className="hidden h-4 w-px bg-rule sm:block" aria-hidden />
                  <NavLinks />
                </>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="hidden items-center gap-2 rounded-full border border-rule bg-paper-deep/60 px-3 py-1 text-xs text-ink-soft sm:flex">
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
                      aria-hidden
                    />
                    {user.email}
                  </div>
                  <form action={logoutUser}>
                    <button
                      type="submit"
                      className="text-xs uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-ink"
                    >
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-xs uppercase tracking-[0.18em] text-ink-soft hover:text-ink"
                >
                  Sign in
                </Link>
              )}
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-rule">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-5 text-[11px] sm:px-8">
            <span className="text-ink/55">
              For shopkeepers, makers, and small agencies.
            </span>
            <span className="text-ink/40">CSE-2505M · Software Development Case Study</span>
          </div>
        </footer>
      </body>
    </html>
  );
}

function NavLinks() {
  const links: Array<{ href: string; label: string }> = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/board", label: "Pipeline" },
    { href: "/contacts", label: "Contacts" },
    { href: "/companies", label: "Companies" },
    { href: "/reminders", label: "Reminders" },
  ];
  return (
    <div className="hidden items-center gap-5 sm:flex">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="text-sm text-ink/80 transition-colors hover:text-ink"
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}
