import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { DEAL_STAGES, type DealStage } from "@/lib/stages";
import { BoardClient, type DealCard } from "./board-client";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const user = await requireAuth();
  const [deals, contacts, companies] = await Promise.all([
    prisma.deal.findMany({
      where: { userId: user.id },
      include: {
        contact: { select: { fullName: true } },
        company: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
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
  ]);

  const initialDeals: DealCard[] = deals.map((d) => ({
    id: d.id,
    title: d.title,
    amount: d.amount,
    stage: ((DEAL_STAGES as readonly string[]).includes(d.stage)
      ? d.stage
      : "LEAD") as DealStage,
    contactName: d.contact?.fullName ?? null,
    companyName: d.company?.name ?? null,
    updatedAt: d.updatedAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 lg:py-14">
      <BoardClient
        initialDeals={initialDeals}
        contacts={contacts.map((c) => ({ id: c.id, name: c.fullName }))}
        companies={companies.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
