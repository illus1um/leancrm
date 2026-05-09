"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { logoutUser } from "@/lib/actions/auth";

const LINKS: Array<{ href: string; label: string }> = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/board", label: "Pipeline" },
  { href: "/contacts", label: "Contacts" },
  { href: "/companies", label: "Companies" },
  { href: "/reminders", label: "Reminders" },
];

export function MobileNav({ userEmail }: { userEmail: string }) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="grid h-9 w-9 cursor-pointer place-items-center rounded-sm border border-rule text-ink-soft transition-colors hover:border-accent hover:text-accent sm:hidden"
      >
        <Menu className="h-4 w-4" strokeWidth={2} />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[60] sm:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <nav className="absolute right-0 top-0 flex h-full w-[78%] max-w-xs flex-col bg-paper shadow-[-12px_0_36px_-8px_rgba(40,30,20,0.25)]">
            <div className="flex items-center justify-between border-b border-rule px-5 py-4">
              <span className="text-[10px] uppercase tracking-[0.22em] text-ink-soft">
                Workspace
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 cursor-pointer place-items-center rounded-sm text-ink-soft hover:bg-paper-deep hover:text-ink"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="grid gap-1">
                {LINKS.map((l) => {
                  const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
                  return (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className={`block rounded-sm px-3 py-2.5 text-[15px] transition-colors ${
                          active
                            ? "bg-paper-deep text-ink"
                            : "text-ink-soft hover:bg-paper-deep hover:text-ink"
                        }`}
                      >
                        {l.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <form
                action="/search"
                method="GET"
                className="mt-6 px-3"
                role="search"
              >
                <label
                  htmlFor="mobile-search"
                  className="text-[10px] uppercase tracking-[0.22em] text-ink-soft"
                >
                  Search workspace
                </label>
                <input
                  id="mobile-search"
                  type="search"
                  name="q"
                  placeholder="Find a deal, contact, or company"
                  className="mt-1.5 h-9 w-full rounded-sm border border-rule bg-paper-deep/40 px-3 text-sm placeholder:text-ink/35 focus:border-accent focus:bg-paper focus:outline-none"
                />
              </form>
            </div>
            <div className="grid gap-3 border-t border-rule px-5 py-4">
              <div className="flex items-center gap-2 text-xs text-ink-soft">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
                  aria-hidden
                />
                {userEmail}
              </div>
              <form action={logoutUser}>
                <button
                  type="submit"
                  className="text-left text-xs uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-destructive"
                >
                  Sign out
                </button>
              </form>
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}
