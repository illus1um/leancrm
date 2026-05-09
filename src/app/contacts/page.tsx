import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { formatRelative } from "@/lib/utils";
import { NewContactDialog } from "./new-contact-dialog";

export default async function ContactsPage() {
  const user = await requireAuth();
  const [contacts, companies] = await Promise.all([
    prisma.contact.findMany({
      where: { userId: user.id },
      include: { company: { select: { id: true, name: true } } },
      orderBy: { fullName: "asc" },
    }),
    prisma.company.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-[1100px] px-5 py-10 sm:px-8">
      <header className="flex items-end justify-between gap-4 border-b border-rule pb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-ink-soft">
            Roster
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Contacts</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {contacts.length} {contacts.length === 1 ? "person" : "people"} on file.
          </p>
        </div>
        <NewContactDialog companies={companies} />
      </header>

      {contacts.length === 0 ? (
        <p className="mt-12 text-center text-sm text-ink-soft">
          No contacts yet. Add one to get started.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-md border border-rule bg-paper-deep/40">
          <div className="hidden grid-cols-[1.4fr_1.1fr_1.3fr_0.8fr_auto] gap-4 border-b border-rule px-5 py-2.5 text-[10px] uppercase tracking-[0.18em] text-ink-soft md:grid">
            <span>Name</span>
            <span>Company</span>
            <span>Email</span>
            <span>Phone</span>
            <span className="text-right">Last update</span>
          </div>
          <ul className="divide-y divide-rule">
            {contacts.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/contacts/${c.id}`}
                  className="grid grid-cols-1 items-center gap-1 px-5 py-3 transition-colors hover:bg-paper md:grid-cols-[1.4fr_1.1fr_1.3fr_0.8fr_auto] md:gap-4"
                >
                  <span className="text-[15px] font-medium">{c.fullName}</span>
                  <span className="text-sm text-ink-soft">
                    {c.company?.name ?? "—"}
                  </span>
                  <span className="text-xs text-ink-soft tabular-nums">
                    {c.email ?? "—"}
                  </span>
                  <span className="text-xs text-ink-soft tabular-nums">
                    {c.phone ?? "—"}
                  </span>
                  <span className="text-xs uppercase tracking-[0.16em] text-ink-soft tabular-nums md:text-right">
                    {formatRelative(c.updatedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
