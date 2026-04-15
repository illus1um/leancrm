import { z } from "zod";
import { DEAL_STAGES } from "@/lib/stages";

export const dealStageSchema = z.enum(DEAL_STAGES);

export const dealCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  amount: z
    .preprocess(
      (v) => (v === "" || v == null ? null : Number(v)),
      z.number().nonnegative().nullable()
    )
    .optional()
    .transform((v) => (v == null ? null : v)),
  stage: dealStageSchema.default("LEAD"),
  contactName: z.string().trim().max(120).optional().transform((v) => (v ? v : null)),
  companyName: z.string().trim().max(120).optional().transform((v) => (v ? v : null)),
  notes: z.string().trim().max(2000).optional().transform((v) => (v ? v : null)),
});

export type DealCreateInput = z.infer<typeof dealCreateSchema>;

export const dealUpdateSchema = dealCreateSchema.extend({
  id: z.string().min(1),
});

export type DealUpdateInput = z.infer<typeof dealUpdateSchema>;

export const stageTransitionSchema = z.object({
  dealId: z.string().min(1),
  newStage: dealStageSchema,
});

export type StageTransitionInput = z.infer<typeof stageTransitionSchema>;
