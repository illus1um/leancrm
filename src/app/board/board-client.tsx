"use client";

import * as React from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  DEAL_STAGES,
  STAGE_CLASS,
  STAGE_GLOSS,
  STAGE_LABELS,
  type DealStage,
} from "@/lib/stages";
import { updateDealStage } from "@/lib/actions/deals";
import { cn, formatAmount, formatRelative } from "@/lib/utils";
import { NewDealDialog } from "./new-deal-dialog";

export type DealCard = {
  id: string;
  title: string;
  amount: number | null;
  stage: DealStage;
  contactName: string | null;
  companyName: string | null;
  updatedAt: string;
};

export type Picker = { id: string; name: string };

export function BoardClient({
  initialDeals,
  contacts,
  companies,
  focusStage = null,
}: {
  initialDeals: DealCard[];
  contacts: Picker[];
  companies: Picker[];
  focusStage?: DealStage | null;
}) {
  const [deals, setDeals] = React.useState<DealCard[]>(initialDeals);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    setDeals(initialDeals);
  }, [initialDeals]);

  React.useEffect(() => {
    if (!focusStage) return;
    const el = document.getElementById(`column-${focusStage}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [focusStage]);

  const filteredDeals = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return deals;
    return deals.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        (d.contactName ?? "").toLowerCase().includes(q) ||
        (d.companyName ?? "").toLowerCase().includes(q)
    );
  }, [deals, search]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const grouped = React.useMemo(() => {
    const map: Record<DealStage, DealCard[]> = {
      LEAD: [],
      QUALIFICATION: [],
      PROPOSAL: [],
      NEGOTIATION: [],
      WON: [],
      LOST: [],
    };
    for (const d of filteredDeals) map[d.stage].push(d);
    return map;
  }, [filteredDeals]);

  const totals = React.useMemo(() => {
    const total = deals.reduce((s, d) => s + (d.amount ?? 0), 0);
    const open = deals.filter((d) => d.stage !== "WON" && d.stage !== "LOST");
    const openTotal = open.reduce((s, d) => s + (d.amount ?? 0), 0);
    return { total, openTotal, openCount: open.length };
  }, [deals]);

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
    setError(null);
  }

  async function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const dealId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;
    if (!overId) return;

    const newStage = (DEAL_STAGES as readonly string[]).includes(overId)
      ? (overId as DealStage)
      : null;
    if (!newStage) return;

    const moved = deals.find((d) => d.id === dealId);
    if (!moved || moved.stage === newStage) return;

    const prev = deals;
    setDeals((current) =>
      current.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d))
    );

    const result = await updateDealStage({ dealId, newStage });
    if (!result.ok) {
      setDeals(prev);
      setError(result.error);
    }
  }

  const activeCard = activeId ? deals.find((d) => d.id === activeId) ?? null : null;

  return (
    <DndContext
      id="leancrm-board"
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {/* Editorial masthead */}
      <header className="mb-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-ink-soft">
            № 01 · The pipeline
          </p>
          {deals.length === 0 ? (
            <>
              <h1 className="mt-3 text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[0.95] tracking-[-0.03em]">
                Start your{" "}
                <span className="text-accent">first deal.</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
                Pick a column below and tap the <span className="rounded-full border border-hairline px-2 py-0.5 text-xs">+</span>{" "}
                in its header. You can drag the card later to push it through stages.
              </p>
            </>
          ) : (
            <>
              <h1 className="mt-3 text-[clamp(2.5rem,6vw,4.25rem)] font-semibold leading-[0.95] tracking-[-0.03em]">
                Where every deal is{" "}
                <span className="text-accent">visible.</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
                Drag a card across columns to change its stage. Click any title to edit
                details. The board is the source of truth — there is no second place a
                deal can hide.
              </p>
            </>
          )}
        </div>
        {deals.length > 0 ? (
          <dl className="flex gap-8 border-l border-rule pl-8 md:pl-10">
            <Stat label="Open deals" value={String(totals.openCount)} />
            <Stat label="Open volume" value={formatAmount(totals.openTotal) || "—"} />
            <Stat label="All-time" value={formatAmount(totals.total) || "—"} muted />
          </dl>
        ) : null}
      </header>

      <div className="mb-4 flex items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search deals, contacts, companies…"
          className="h-9 w-full max-w-sm rounded-sm border border-rule bg-paper px-3 text-sm placeholder:text-ink/35 focus:border-accent focus:outline-none"
          aria-label="Search deals"
        />
        {search ? (
          <span className="text-xs text-ink-soft">
            {filteredDeals.length} of {deals.length}
          </span>
        ) : null}
      </div>

      {error ? (
        <div
          className="mb-4 rounded-sm border border-l-2 border-l-destructive bg-destructive/5 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {deals.length === 0 ? (
        <div className="mb-4 grid gap-3 rounded-md border border-dashed border-hairline/70 bg-paper-deep/30 px-6 py-8 text-center sm:py-10">
          <p className="text-[10px] uppercase tracking-[0.22em] text-ink-soft">
            Board is empty
          </p>
          <p className="text-base text-ink">
            Add your first deal to one of the six columns below. Use{" "}
            <span className="rounded-full border border-hairline px-2 py-0.5 text-xs">+</span>{" "}
            in the column header.
          </p>
          <p className="mx-auto max-w-md text-xs text-ink-soft">
            Need contacts or companies to attach? Create them under{" "}
            <Link href="/contacts" className="link-ink text-ink hover:text-accent">
              Contacts
            </Link>{" "}
            or{" "}
            <Link href="/companies" className="link-ink text-ink hover:text-accent">
              Companies
            </Link>{" "}
            first — every deal needs one of them.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {DEAL_STAGES.map((stage) => (
          <Column
            key={stage}
            stage={stage}
            cards={grouped[stage]}
            isDraggingOverlay={activeCard?.stage === stage}
            isFocused={focusStage === stage}
            contacts={contacts}
            companies={companies}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeCard ? (
          <div className="paper-lift w-[var(--card-w)] [--card-w:18rem]">
            <DealCardView deal={activeCard} draggingOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function Stat({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex flex-col items-start">
      <dt className="text-[10px] uppercase tracking-[0.2em] text-ink-soft">
        {label}
      </dt>
      <dd
        className={cn(
          "text-2xl font-semibold leading-none tracking-tight tabular-nums",
          muted ? "text-ink-soft" : ""
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function Column({
  stage,
  cards,
  isDraggingOverlay,
  isFocused,
  contacts,
  companies,
}: {
  stage: DealStage;
  cards: DealCard[];
  isDraggingOverlay: boolean;
  isFocused: boolean;
  contacts: Picker[];
  companies: Picker[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <section
      ref={setNodeRef}
      id={`column-${stage}`}
      className={cn(
        "group/col flex flex-col rounded-md border border-rule transition-all",
        STAGE_CLASS[stage],
        "bg-[color-mix(in_oklab,var(--stage-bg)_55%,var(--paper))]",
        isOver && "ring-1 ring-accent ring-offset-2 ring-offset-paper",
        isFocused && "ring-2 ring-accent ring-offset-2 ring-offset-paper"
      )}
    >
      <header className="flex items-baseline justify-between border-b border-hairline/50 px-4 py-3">
        <div className="flex items-baseline gap-3">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--stage-fg)" }}
            aria-hidden
          />
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--stage-fg)]">
            {STAGE_LABELS[stage]}
          </h2>
          <span className="text-[11px] tabular-nums text-ink-soft">
            {String(cards.length).padStart(2, "0")}
          </span>
        </div>
        <NewDealDialog defaultStage={stage} contacts={contacts} companies={companies} />
      </header>
      <p className="px-4 pt-2 text-xs text-ink-soft">{STAGE_GLOSS[stage]}</p>
      <div className="flex flex-col gap-2 p-3 min-h-32">
        {cards.length === 0 ? (
          <div className="rounded-sm border border-dashed border-hairline/50 px-3 py-8 text-center text-sm text-ink-soft">
            {isDraggingOverlay ? "drop here" : "nothing yet"}
          </div>
        ) : (
          cards.map((deal) => <DraggableCard key={deal.id} deal={deal} />)
        )}
      </div>
    </section>
  );
}

function DraggableCard({ deal }: { deal: DealCard }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn("touch-none focus:outline-none", isDragging && "opacity-30")}
    >
      <DealCardView deal={deal} />
    </div>
  );
}

function DealCardView({
  deal,
  draggingOverlay = false,
}: {
  deal: DealCard;
  draggingOverlay?: boolean;
}) {
  return (
    <article
      className={cn(
        "group/card relative cursor-grab select-none rounded-sm border border-hairline/60 bg-paper px-3 py-2.5 shadow-[0_1px_0_rgba(0,0,0,0.03)] transition-all",
        "hover:border-ink/30 hover:shadow-[0_3px_0_rgba(0,0,0,0.04),0_8px_16px_-8px_rgba(40,30,20,0.18)] hover:-translate-y-px",
        draggingOverlay && "border-ink/40"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/deals/${deal.id}`}
          className="link-ink text-[14px] font-medium leading-tight tracking-tight"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {deal.title}
        </Link>
        {deal.amount != null ? (
          <span className="shrink-0 text-[11px] tabular-nums text-ink">
            {formatAmount(deal.amount)}
          </span>
        ) : null}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-ink-soft">
        <span className="truncate">
          {deal.contactName ?? deal.companyName ? (
            <>
              <span className="text-ink/80">
                {deal.contactName ?? deal.companyName}
              </span>
              {deal.contactName && deal.companyName ? (
                <span className="text-ink-soft"> · {deal.companyName}</span>
              ) : null}
            </>
          ) : (
            <span className="text-ink-soft/70">unattached</span>
          )}
        </span>
        <span className="shrink-0 text-[10px] uppercase tracking-wider">
          {formatRelative(new Date(deal.updatedAt))}
        </span>
      </div>
    </article>
  );
}
