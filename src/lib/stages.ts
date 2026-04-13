export const DEAL_STAGES = [
  "LEAD",
  "QUALIFICATION",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const;

export type DealStage = (typeof DEAL_STAGES)[number];

export const STAGE_LABELS: Record<DealStage, string> = {
  LEAD: "Lead",
  QUALIFICATION: "Qualifying",
  PROPOSAL: "Proposal",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
};

/**
 * Editorial copy: a tiny one-line gloss for each column, surfaced as
 * italic display text below the column heading. Helps non-technical users
 * understand what "Qualifying" means without a tooltip.
 */
export const STAGE_GLOSS: Record<DealStage, string> = {
  LEAD: "first contact",
  QUALIFICATION: "is this real?",
  PROPOSAL: "offer sent",
  NEGOTIATION: "in discussion",
  WON: "closed yes",
  LOST: "closed no",
};

/**
 * "stage-XYZ" CSS classes resolve to dyed-paper colour pairs in globals.css
 * (--stage-bg, --stage-fg). Components consume them via Tailwind arbitrary
 * properties, e.g. `bg-[var(--stage-bg)]`.
 */
export const STAGE_CLASS: Record<DealStage, string> = {
  LEAD: "stage-LEAD",
  QUALIFICATION: "stage-QUALIFICATION",
  PROPOSAL: "stage-PROPOSAL",
  NEGOTIATION: "stage-NEGOTIATION",
  WON: "stage-WON",
  LOST: "stage-LOST",
};

export function isDealStage(value: unknown): value is DealStage {
  return typeof value === "string" && (DEAL_STAGES as readonly string[]).includes(value);
}
