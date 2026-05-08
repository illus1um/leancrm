import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { NewCompanyDialog } from "./new-company-dialog";

export default async function CompaniesPage() {
  const user = await requireAuth();
  const companies = await prisma.company.findMany({
    where: { userId: user.id },
    include: {
      _count: { select: { contacts: true, deals: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-[1100px] px-5 py-10 sm:px-8">
      <header className="flex items-end justify-between gap-4 border-b border-rule pb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-ink-soft">
            Accounts
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Companies</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {companies.length}{" "}
            {companies.length === 1 ? "organization" : "organizations"} on file.
          </p>
        </div>
        <NewCompanyDialog />
      </header>

      {companies.length === 0 ? (
        <p className="mt-12 text-center text-sm text-ink-soft">
          No companies yet. Add one to group your deals and contacts.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-rule rounded-md border border-rule bg-paper-deep/40">
          {companies.map((c) => (
            <li key={c.id}>
              <Link
                href={`/companies/${c.id}`}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-6 px-5 py-3 transition-colors hover:bg-paper"
              >
                <div>
                  <p className="text-[15px] font-medium">{c.name}</p>
                  <p className="text-xs text-ink-soft">
                    {c.industry ?? c.website ?? ""}
                  </p>
                </div>
                <span className="text-xs uppercase tracking-[0.18em] text-ink-soft tabular-nums">
                  {c._count.contacts} contacts
                </span>
                <span className="text-xs uppercase tracking-[0.18em] text-ink-soft tabular-nums">
                  {c._count.deals} deals
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
