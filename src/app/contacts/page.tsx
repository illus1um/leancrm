import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
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
        <ul className="mt-6 divide-y divide-rule rounded-md border border-rule bg-paper-deep/40">
          {contacts.map((c) => (
            <li key={c.id}>
              <Link
                href={`/contacts/${c.id}`}
                className="grid grid-cols-[1fr_1fr_auto] items-center gap-4 px-5 py-3 transition-colors hover:bg-paper"
              >
                <span className="text-[15px] font-medium">{c.fullName}</span>
                <span className="text-sm text-ink-soft">
                  {c.company?.name ?? "—"}
                </span>
                <span className="text-xs text-ink-soft tabular-nums">
                  {c.email ?? c.phone ?? ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
