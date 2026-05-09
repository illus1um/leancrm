import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { ContactEditForm } from "./contact-edit-form";
import { ActivityFeed } from "@/components/activity-feed";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireAuth();
  const [contact, companies, activities] = await Promise.all([
    prisma.contact.findFirst({
      where: { id, userId: user.id },
      include: {
        company: { select: { id: true, name: true } },
        deals: {
          orderBy: { updatedAt: "desc" },
          select: { id: true, title: true, stage: true, amount: true },
        },
      },
    }),
    prisma.company.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.activity.findMany({
      where: { userId: user.id, contactId: id },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  if (!contact) notFound();

  return (
    <div className="mx-auto max-w-[900px] px-5 py-10 sm:px-8">
      <Link
        href="/contacts"
        className="text-xs uppercase tracking-[0.22em] text-ink-soft hover:text-ink"
      >
        ← Contacts
      </Link>
      <header className="mt-3 border-b border-rule pb-6">
        <p className="text-[10px] uppercase tracking-[0.22em] text-ink-soft">
          Contact
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {contact.fullName}
        </h1>
      </header>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_280px]">
        <ContactEditForm
          contact={{
            id: contact.id,
            fullName: contact.fullName,
            email: contact.email,
            phone: contact.phone,
            notes: contact.notes,
            companyId: contact.companyId,
            updatedAt: contact.updatedAt.toISOString(),
          }}
          companies={companies}
        />
        <aside className="grid gap-6 text-sm">
          <section>
            <p className="text-[10px] uppercase tracking-[0.22em] text-ink-soft">
              Linked deals
            </p>
            {contact.deals.length === 0 ? (
              <p className="mt-2 text-ink-soft">No deals yet.</p>
            ) : (
              <ul className="mt-2 grid gap-1.5">
                {contact.deals.map((d) => (
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
          link={{ contactId: contact.id }}
          activities={activities.map((a) => ({
            id: a.id,
            type: a.type,
            content: a.content,
            createdAt: a.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
