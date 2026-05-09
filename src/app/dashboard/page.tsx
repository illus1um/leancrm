import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { DEAL_STAGES, STAGE_CLASS, STAGE_LABELS, type DealStage } from "@/lib/stages";
import { formatAmount, formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireAuth();
  const stuckThreshold = new Date();
  stuckThreshold.setDate(stuckThreshold.getDate() - 7);

  const sessionCount = await prisma.session.count({ where: { userId: user.id } });
  const greeting = sessionCount > 1 ? "Welcome back" : "Welcome";

  const [stageCounts, openReminders, recentActivity, deals, stuckDeals] = await Promise.all([
    prisma.deal.groupBy({
      by: ["stage"],
      _count: { _all: true },
      _sum: { amount: true },
      where: { userId: user.id },
    }),
    prisma.reminder.findMany({
      where: { userId: user.id, status: "OPEN" },
      include: { deal: { select: { id: true, title: true } } },
      orderBy: { dueDate: "asc" },
      take: 6,
    }),
    prisma.activity.findMany({
      where: { userId: user.id },
      include: {
        deal: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.deal.count({ where: { userId: user.id } }),
    prisma.deal.findMany({
      where: {
        userId: user.id,
        stage: { in: ["LEAD", "QUALIFICATION", "PROPOSAL", "NEGOTIATION"] },
        updatedAt: { lt: stuckThreshold },
      },
      include: {
        contact: { select: { fullName: true } },
        company: { select: { name: true } },
      },
      orderBy: { updatedAt: "asc" },
      take: 5,
    }),
  ]);

  const countsByStage = new Map<string, { count: number; sum: number }>();
  for (const row of stageCounts) {
    countsByStage.set(row.stage, {
      count: row._count._all,
      sum: row._sum.amount ?? 0,
    });
  }

  const open = (DEAL_STAGES as readonly DealStage[])
    .filter((s) => s !== "WON" && s !== "LOST")
    .reduce((acc, s) => acc + (countsByStage.get(s)?.count ?? 0), 0);
  const openVolume = (DEAL_STAGES as readonly DealStage[])
    .filter((s) => s !== "WON" && s !== "LOST")
    .reduce((acc, s) => acc + (countsByStage.get(s)?.sum ?? 0), 0);
  const wonVolume = countsByStage.get("WON")?.sum ?? 0;

  const now = new Date();

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8">
      <header className="border-b border-rule pb-6">
        <p className="text-[10px] uppercase tracking-[0.22em] text-ink-soft">
          {greeting}, {user.name}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
      </header>

      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Open deals" value={String(open)} sub={`of ${deals} total`} />
        <Stat label="Open volume" value={formatAmount(openVolume) || "—"} />
        <Stat label="Won volume" value={formatAmount(wonVolume) || "—"} />
        <Stat
          label="Open reminders"
          value={String(openReminders.length)}
          sub={openReminders.some((r) => r.dueDate < now) ? "Some overdue" : "All on schedule"}
        />
      </section>

      <section className="mt-10">
        <h2 className="text-[10px] uppercase tracking-[0.22em] text-ink-soft">
          Pipeline by stage
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {DEAL_STAGES.map((stage) => {
            const data = countsByStage.get(stage) ?? { count: 0, sum: 0 };
            return (
              <Link
                key={stage}
                href={`/board?stage=${stage}`}
                className={`group rounded-md border border-rule p-4 ${STAGE_CLASS[stage]} bg-[color-mix(in_oklab,var(--stage-bg)_55%,var(--paper))] transition-colors hover:border-ink/30`}
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--stage-fg)]">
                  {STAGE_LABELS[stage]}
                </p>
                <p className="mt-1 text-3xl font-semibold tabular-nums">
                  {data.count}
                </p>
                <p className="text-xs text-ink-soft tabular-nums">
                  {formatAmount(data.sum) || "—"}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {stuckDeals.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-[10px] uppercase tracking-[0.22em] text-ink-soft">
            Needs attention · stuck for &gt; 7 days
          </h2>
          <ul className="mt-3 divide-y divide-rule rounded-md border border-rule bg-paper-deep/40">
            {stuckDeals.map((d) => {
              const days = Math.max(
                1,
                Math.floor((Date.now() - d.updatedAt.getTime()) / (1000 * 60 * 60 * 24))
              );
              return (
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
                    <span className="text-xs uppercase tracking-[0.18em] text-destructive tabular-nums">
                      {days}d idle
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1fr]">
        <section>
          <header className="flex items-baseline justify-between">
            <h2 className="text-[10px] uppercase tracking-[0.22em] text-ink-soft">
              Reminders that need you
            </h2>
            <Link
              href="/reminders"
              className="text-[10px] uppercase tracking-[0.18em] text-ink-soft hover:text-accent"
            >
              See all →
            </Link>
          </header>
          {openReminders.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">
              Nothing on the list. <Link href="/reminders" className="link-ink text-ink hover:text-accent">Add one</Link>.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-rule rounded-md border border-rule bg-paper-deep/40">
              {openReminders.map((r) => {
                const overdue = r.dueDate < now;
                return (
                  <li
                    key={r.id}
                    className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm">{r.title}</p>
                      {r.deal ? (
                        <Link
                          href={`/deals/${r.deal.id}`}
                          className="link-ink text-xs text-ink-soft hover:text-accent"
                        >
                          Linked: {r.deal.title}
                        </Link>
                      ) : null}
                    </div>
                    <span
                      className={`text-xs uppercase tracking-[0.18em] tabular-nums ${overdue ? "text-destructive" : "text-ink-soft"}`}
                    >
                      {overdue ? "Overdue · " : ""}
                      {formatRelative(r.dueDate)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <header className="flex items-baseline justify-between">
            <h2 className="text-[10px] uppercase tracking-[0.22em] text-ink-soft">
              Recent activity
            </h2>
            <Link
              href="/board"
              className="text-[10px] uppercase tracking-[0.18em] text-ink-soft hover:text-accent"
            >
              Open pipeline →
            </Link>
          </header>
          {recentActivity.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">
              Move a deal between columns to see entries here.
            </p>
          ) : (
            <ol className="mt-3 grid gap-3">
              {recentActivity.map((a) => (
                <li
                  key={a.id}
                  className="grid grid-cols-[6rem_1fr] gap-3 border-b border-rule pb-2 last:border-b-0"
                >
                  <span className="text-[10px] uppercase tracking-[0.2em] text-ink-soft tabular-nums">
                    {formatRelative(a.createdAt)}
                  </span>
                  <p className="text-sm leading-relaxed">
                    {a.deal ? (
                      <Link
                        href={`/deals/${a.deal.id}`}
                        className="link-ink text-ink hover:text-accent"
                      >
                        {a.deal.title}
                      </Link>
                    ) : null}
                    <span className="ml-2 text-ink-soft">{a.content}</span>
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-md border border-rule bg-paper-deep/40 p-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-ink-soft">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {sub ? <p className="text-xs text-ink-soft">{sub}</p> : null}
    </div>
  );
}
