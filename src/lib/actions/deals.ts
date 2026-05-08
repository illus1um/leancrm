"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { STAGE_LABELS, type DealStage } from "@/lib/stages";
import {
  dealCreateSchema,
  dealUpdateSchema,
  stageTransitionSchema,
} from "@/lib/schemas";

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createDeal(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const raw = {
    title: formData.get("title"),
    amount: formData.get("amount"),
    stage: formData.get("stage") || undefined,
    contactId: formData.get("contactId") || undefined,
    companyId: formData.get("companyId") || undefined,
    notes: formData.get("notes") || undefined,
  };

  const parsed = dealCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const userId = await getCurrentUserId();
  const deal = await prisma.deal.create({
    data: { ...parsed.data, userId },
  });

  revalidatePath("/board");
  revalidatePath("/dashboard");
  return { ok: true, data: { id: deal.id } };
}

export async function updateDealStage(input: {
  dealId: string;
  newStage: string;
}): Promise<ActionResult<{ id: string; stage: string }>> {
  const parsed = stageTransitionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const userId = await getCurrentUserId();

  const existing = await prisma.deal.findFirst({
    where: { id: parsed.data.dealId, userId },
    select: { stage: true },
  });
  if (!existing) {
    return { ok: false, error: "Deal not found" };
  }

  await prisma.$transaction([
    prisma.deal.update({
      where: { id: parsed.data.dealId },
      data: { stage: parsed.data.newStage },
    }),
    prisma.activity.create({
      data: {
        type: "STAGE_CHANGE",
        content: `Stage: ${STAGE_LABELS[existing.stage as DealStage] ?? existing.stage} → ${STAGE_LABELS[parsed.data.newStage as DealStage]}`,
        userId,
        dealId: parsed.data.dealId,
      },
    }),
  ]);

  revalidatePath("/board");
  revalidatePath("/dashboard");
  revalidatePath(`/deals/${parsed.data.dealId}`);
  return { ok: true, data: { id: parsed.data.dealId, stage: parsed.data.newStage } };
}

export async function updateDeal(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const id = String(formData.get("id") ?? "");
  const raw = {
    id,
    title: formData.get("title"),
    amount: formData.get("amount"),
    stage: formData.get("stage") || undefined,
    contactId: formData.get("contactId") || undefined,
    companyId: formData.get("companyId") || undefined,
    notes: formData.get("notes") || undefined,
  };
  const parsed = dealUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const userId = await getCurrentUserId();
  const { id: dealId, ...rest } = parsed.data;
  const result = await prisma.deal.updateMany({
    where: { id: dealId, userId },
    data: rest,
  });

  if (result.count === 0) {
    return { ok: false, error: "Deal not found or not owned by current user" };
  }

  revalidatePath("/board");
  revalidatePath("/dashboard");
  revalidatePath(`/deals/${dealId}`);
  return { ok: true, data: { id: dealId } };
}

export async function deleteDeal(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const userId = await getCurrentUserId();
  await prisma.deal.deleteMany({ where: { id, userId } });
  revalidatePath("/board");
  revalidatePath("/dashboard");
  redirect("/board");
}
