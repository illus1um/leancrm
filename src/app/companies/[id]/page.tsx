import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { CompanyEditForm } from "./company-edit-form";
import { ActivityFeed } from "@/components/activity-feed";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireAuth();
  const [company, activities] = await Promise.all([
    prisma.company.findFirst({
      where: { id, userId: user.id },
      include: {
        contacts: {
          orderBy: { fullName: "asc" },
          select: { id: true, fullName: true, email: true },
        },
        deals: {
          orderBy: { updatedAt: "desc" },
          select: { id: true, title: true, stage: true, amount: true },
        },
      },
    }),
    prisma.activity.findMany({
      where: { userId: user.id, companyId: id },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  if (!company) notFound();

  return (
    <div className="mx-auto max-w-[900px] px-5 py-10 sm:px-8">
      <Link
        href="/companies"
        className="text-xs uppercase tracking-[0.22em] text-ink-soft hover:text-ink"
      >
        ← Companies
      </Link>
      <header className="mt-3 border-b border-rule pb-6">
        <p className="text-[10px] uppercase tracking-[0.22em] text-ink-soft">
          Company
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {company.name}
        </h1>
      </header>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_280px]">
        <CompanyEditForm
          company={{
            id: company.id,
            name: company.name,
            website: company.website,
            industry: company.industry,
            notes: company.notes,
            updatedAt: company.updatedAt.toISOString(),
          }}
        />
        <aside className="grid gap-6 text-sm">
          <section>
            <p className="text-[10px] uppercase tracking-[0.22em] text-ink-soft">
              Contacts
            </p>
            {company.contacts.length === 0 ? (
              <p className="mt-2 text-ink-soft">No contacts linked yet.</p>
            ) : (
              <ul className="mt-2 grid gap-1.5">
                {company.contacts.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/contacts/${c.id}`}
                      className="link-ink text-ink hover:text-accent"
                    >
                      {c.fullName}
                    </Link>
                    {c.email ? (
                      <span className="ml-2 text-xs text-ink-soft">{c.email}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <p className="text-[10px] uppercase tracking-[0.22em] text-ink-soft">
              Deals
            </p>
            {company.deals.length === 0 ? (
              <p className="mt-2 text-ink-soft">No deals.</p>
            ) : (
              <ul className="mt-2 grid gap-1.5">
                {company.deals.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={`/deals/${d.id}`}
                      className="link-ink text-ink hover:text-accent"
                    >
                      {d.title}
                    </Link>
                    <span className="ml-2 text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                      {d.stage}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      <div className="mt-12">
        <ActivityFeed
          link={{ companyId: company.id }}
          activities={activities.map((a) => ({
            id: a.id,
            type: a.type,
            content: a.content,
            createdAt: a.createdAt.toISOString(),
            authorName: a.user?.name ?? null,
          }))}
        />
      </div>
    </div>
  );
}
