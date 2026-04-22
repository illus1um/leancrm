import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { DEAL_STAGES, type DealStage } from "@/lib/stages";
import { BoardClient, type DealCard } from "./board-client";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const userId = await getCurrentUserId();
  const deals = await prisma.deal.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  const initialDeals: DealCard[] = deals.map((d) => ({
    id: d.id,
    title: d.title,
    amount: d.amount,
    stage: ((DEAL_STAGES as readonly string[]).includes(d.stage)
      ? d.stage
      : "LEAD") as DealStage,
    contactName: d.contactName,
    companyName: d.companyName,
    updatedAt: d.updatedAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 lg:py-14">
      <BoardClient initialDeals={initialDeals} />
    </div>
  );
}
