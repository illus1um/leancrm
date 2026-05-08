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
  contactId: optionalCuid,
  companyId: optionalCuid,
  notes: optionalString(2000),
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

export const contactCreateSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(120),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(160)
    .optional()
    .transform((v) => (v ? v : null))
    .pipe(
      z
        .string()
        .email("Enter a valid email")
        .nullable()
    ),
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
