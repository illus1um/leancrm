import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { RemindersClient } from "./reminders-client";

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const user = await requireAuth();
  const [reminders, deals] = await Promise.all([
    prisma.reminder.findMany({
      where: { userId: user.id },
      include: {
        deal: { select: { id: true, title: true } },
      },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    }),
    prisma.deal.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-[1100px] px-5 py-10 sm:px-8">
      <header className="border-b border-rule pb-6">
        <p className="text-[10px] uppercase tracking-[0.22em] text-ink-soft">
          Follow-ups
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Reminders</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Things you said you'd come back to. Marked overdue when their day passes.
        </p>
      </header>
      <RemindersClient
        deals={deals}
        reminders={reminders.map((r) => ({
          id: r.id,
          title: r.title,
          dueDate: r.dueDate.toISOString(),
          status: r.status,
          dealId: r.dealId,
          dealTitle: r.deal?.title ?? null,
        }))}
      />
    </div>
  );
}
