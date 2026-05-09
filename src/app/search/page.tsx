import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { STAGE_LABELS, type DealStage } from "@/lib/stages";
import { formatAmount } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireAuth();
  const { q = "" } = await searchParams;
  const query = q.trim();
  const isShort = query.length < 2;

  const [deals, contacts, companies] = isShort
    ? [[], [], []]
    : await Promise.all([
        prisma.deal.findMany({
          where: {
            userId: user.id,
            OR: [
              { title: { contains: query } },
              { contact: { fullName: { contains: query } } },
              { company: { name: { contains: query } } },
            ],
          },
          include: {
            contact: { select: { fullName: true } },
            company: { select: { name: true } },
          },
          orderBy: { updatedAt: "desc" },
          take: 25,
        }),
        prisma.contact.findMany({
          where: {
            userId: user.id,
            OR: [
              { fullName: { contains: query } },
              { email: { contains: query } },
              { phone: { contains: query } },
            ],
          },
          include: { company: { select: { name: true } } },
          orderBy: { fullName: "asc" },
          take: 25,
        }),
        prisma.company.findMany({
          where: {
            userId: user.id,
            OR: [
              { name: { contains: query } },
              { industry: { contains: query } },
              { website: { contains: query } },
            ],
          },
          orderBy: { name: "asc" },
          take: 25,
        }),
      ]);

  const total = deals.length + contacts.length + companies.length;

  return (
    <div className="mx-auto max-w-[1100px] px-5 py-10 sm:px-8">
      <header className="border-b border-rule pb-6">
        <p className="text-[10px] uppercase tracking-[0.22em] text-ink-soft">
          Search
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {query ? <>Results for &ldquo;{query}&rdquo;</> : "Workspace search"}
        </h1>
        <form className="mt-4 flex max-w-xl items-center gap-2">
          <input
            type="search"
            name="q"
            defaultValue={query}
            autoFocus
            placeholder="Search deals, contacts, companies…"
            className="h-10 w-full rounded-sm border border-rule bg-paper px-3 text-sm placeholder:text-ink/35 focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            className="h-10 cursor-pointer rounded-sm bg-ink px-4 text-sm font-medium text-paper hover:bg-ink/85"
          >
            Search
          </button>
        </form>
        <p className="mt-3 text-xs text-ink-soft">
          {!query
            ? "Type a keyword to search across deals, contacts, and companies."
            : isShort
            ? "Keep typing — we need at least 2 characters."
            : `${total} result${total === 1 ? "" : "s"} across deals, contacts, and companies.`}
        </p>
      </header>

      {!query || isShort ? null : total === 0 ? (
        <p className="mt-12 text-center text-sm text-ink-soft">
          Nothing matched. Try fewer characters or check spelling.
        </p>
      ) : (
        <div className="mt-8 grid gap-10">
          {deals.length > 0 ? (
            <Section title="Deals" count={deals.length}>
              <ul className="divide-y divide-rule rounded-md border border-rule bg-paper-deep/40">
                {deals.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={`/deals/${d.id}`}
                      className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-3 transition-colors hover:bg-paper"
                    >
                      <div>
                        <p className="text-[15px] font-medium">{d.title}</p>
                        <p className="text-xs text-ink-soft">
                          {[d.contact?.fullName, d.company?.name].filter(Boolean).join(" · ") || "Unattached"}
                        </p>
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                        {STAGE_LABELS[d.stage as DealStage] ?? d.stage}
                      </span>
                      <span className="text-xs tabular-nums text-ink">
                        {d.amount != null ? formatAmount(d.amount) : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {contacts.length > 0 ? (
            <Section title="Contacts" count={contacts.length}>
              <ul className="divide-y divide-rule rounded-md border border-rule bg-paper-deep/40">
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
            </Section>
          ) : null}

          {companies.length > 0 ? (
            <Section title="Companies" count={companies.length}>
              <ul className="divide-y divide-rule rounded-md border border-rule bg-paper-deep/40">
                {companies.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/companies/${c.id}`}
                      className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-3 transition-colors hover:bg-paper"
                    >
                      <span className="text-[15px] font-medium">{c.name}</span>
                      <span className="text-xs text-ink-soft">
                        {c.industry ?? c.website ?? ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 flex items-baseline gap-3 text-[10px] uppercase tracking-[0.22em] text-ink-soft">
        {title}
        <span className="tabular-nums text-ink-soft/70">{count}</span>
      </h2>
      {children}
    </section>
  );
}
