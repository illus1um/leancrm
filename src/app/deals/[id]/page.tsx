import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { DEAL_STAGES, STAGE_CLASS, STAGE_LABELS, type DealStage } from "@/lib/stages";
import { DealEditForm } from "./deal-edit-form";
import { ActivityFeed } from "./activity-feed";

export const dynamic = "force-dynamic";

export default async function DealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireAuth();
  const [deal, contacts, companies, activities] = await Promise.all([
    prisma.deal.findFirst({
      where: { id, userId: user.id },
      include: {
        contact: { select: { id: true, fullName: true } },
        company: { select: { id: true, name: true } },
      },
    }),
    prisma.contact.findMany({
      where: { userId: user.id },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true },
    }),
    prisma.company.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.activity.findMany({
      where: { userId: user.id, dealId: id },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  if (!deal) notFound();

  const stage = ((DEAL_STAGES as readonly string[]).includes(deal.stage)
    ? deal.stage
    : "LEAD") as DealStage;

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 lg:py-14">
      <Link
        href="/board"
        className="link-ink mb-10 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="h-3 w-3" strokeWidth={2} />
        Back to the board
      </Link>

      <header className={`mb-10 ${STAGE_CLASS[stage]}`}>
        <p className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--stage-fg)]">
          № {deal.id.slice(-6)} · Filed under {STAGE_LABELS[stage]}
        </p>
        <h1 className="mt-3 text-[clamp(2rem,4.5vw,3rem)] font-semibold leading-[1] tracking-[-0.025em]">
          {deal.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-1 text-[13px] text-ink-soft">
          {deal.contact ? (
            <span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-ink-soft/80">
                Contact ·{" "}
              </span>
              <Link
                href={`/contacts/${deal.contact.id}`}
                className="link-ink text-ink hover:text-accent"
              >
                {deal.contact.fullName}
              </Link>
            </span>
          ) : null}
          {deal.company ? (
            <span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-ink-soft/80">
                Company ·{" "}
              </span>
              <Link
                href={`/companies/${deal.company.id}`}
                className="link-ink text-ink hover:text-accent"
              >
                {deal.company.name}
              </Link>
            </span>
          ) : null}
          <span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-ink-soft/80">
              Opened ·{" "}
            </span>
            <span className="text-ink">
              {deal.createdAt.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </span>
        </div>
        <hr className="mt-6 h-px border-0 bg-hairline" />
      </header>

      <DealEditForm
        deal={{
          id: deal.id,
          title: deal.title,
          amount: deal.amount,
          stage,
          contactId: deal.contactId,
          companyId: deal.companyId,
          notes: deal.notes,
          updatedAt: deal.updatedAt.toISOString(),
        }}
        contacts={contacts.map((c) => ({ id: c.id, name: c.fullName }))}
        companies={companies.map((c) => ({ id: c.id, name: c.name }))}
      />

      <div className="mt-12">
        <ActivityFeed
          dealId={deal.id}
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
