import { z } from "zod";
import { DEAL_STAGES } from "@/lib/stages";

export const dealStageSchema = z.enum(DEAL_STAGES);

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

const optionalCuid = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null));

const dealBaseShape = {
  title: z.string().trim().min(1, "Title is required").max(120),
  amount: z
    .preprocess(
      (v) => (v === "" || v == null ? null : Number(v)),
      z.number().nonnegative().nullable()
    )
    .optional()
    .transform((v) => (v == null ? null : v)),
  stage: dealStageSchema.default("LEAD"),
  contactId: optionalCuid,
  companyId: optionalCuid,
  notes: optionalString(2000),
} as const;

const requireContactOrCompany = (d: { contactId: string | null; companyId: string | null }) =>
  Boolean(d.contactId || d.companyId);

const contactOrCompanyMsg = {
  message: "Pick a contact or a company (at least one).",
  path: ["contactId"] as PropertyKey[],
};

export const dealCreateSchema = z
  .object(dealBaseShape)
  .refine(requireContactOrCompany, contactOrCompanyMsg);

export type DealCreateInput = z.infer<typeof dealCreateSchema>;

export const dealUpdateSchema = z
  .object({ ...dealBaseShape, id: z.string().min(1) })
  .refine(requireContactOrCompany, contactOrCompanyMsg);

export type DealUpdateInput = z.infer<typeof dealUpdateSchema>;

export const stageTransitionSchema = z.object({
  dealId: z.string().min(1),
  newStage: dealStageSchema,
});

export type StageTransitionInput = z.infer<typeof stageTransitionSchema>;

// Auth ----------------------------------------------------------------------

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(120),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

// Contact -------------------------------------------------------------------

const optionalEmail = z.preprocess(
  (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
  z
    .union([
      z.literal("").transform(() => null),
      z.string().email("Enter a valid email").max(160),
      z.null(),
      z.undefined().transform(() => null),
    ])
    .transform((v) => (v ?? null) as string | null)
);

export const contactCreateSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(120),
  email: optionalEmail,
  phone: optionalString(40),
  notes: optionalString(2000),
  companyId: optionalCuid,
});

export const contactUpdateSchema = contactCreateSchema.extend({
  id: z.string().min(1),
});

// Company -------------------------------------------------------------------

export const companyCreateSchema = z.object({
  name: z.string().trim().min(1, "Company name is required").max(120),
  website: optionalString(200),
  industry: optionalString(80),
  notes: optionalString(2000),
});

export const companyUpdateSchema = companyCreateSchema.extend({
  id: z.string().min(1),
});

// Activity ------------------------------------------------------------------

export const ACTIVITY_TYPES = ["NOTE", "CALL", "EMAIL", "MEETING"] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];
export const activityTypeSchema = z.enum(ACTIVITY_TYPES);

export const activityCreateSchema = z.object({
  type: activityTypeSchema,
  content: z.string().trim().min(1, "Content is required").max(2000),
  dealId: optionalCuid,
  contactId: optionalCuid,
  companyId: optionalCuid,
});

// Reminder ------------------------------------------------------------------

export const REMINDER_STATUSES = ["OPEN", "COMPLETED"] as const;
export const reminderStatusSchema = z.enum(REMINDER_STATUSES);

export const reminderCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(160),
  dueDate: z.preprocess(
    (v) => (typeof v === "string" && v ? new Date(v) : v),
    z.date()
  ),
  dealId: optionalCuid,
  contactId: optionalCuid,
  companyId: optionalCuid,
});

export const reminderUpdateSchema = reminderCreateSchema.extend({
  id: z.string().min(1),
  status: reminderStatusSchema,
});
