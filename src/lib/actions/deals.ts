"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import {
  dealCreateSchema,
  dealUpdateSchema,
  stageTransitionSchema,
} from "@/lib/schemas";

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Create a deal. Used by NewDealDialog.
 *
 * NOTE: Authentication is intentionally deferred for the prototype (see report
 * Part 1.1 / "MVP is NOT"). In the production target this action would call
 * `await auth()` and verify the session before any DB write — see Assignment 3
 * sequence diagram 2 (Create Deal).
 */
export async function createDeal(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const raw = {
    title: formData.get("title"),
    amount: formData.get("amount"),
    stage: formData.get("stage") || undefined,
    contactName: formData.get("contactName") || undefined,
    companyName: formData.get("companyName") || undefined,
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

  // Purpose-limitation: every read/write is scoped to the owner.
  const result = await prisma.deal.updateMany({
    where: { id: parsed.data.dealId, userId },
    data: { stage: parsed.data.newStage },
  });

  if (result.count === 0) {
    return { ok: false, error: "Deal not found or not owned by current user" };
  }

  revalidatePath("/board");
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
    contactName: formData.get("contactName") || undefined,
    companyName: formData.get("companyName") || undefined,
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
  revalidatePath(`/deals/${dealId}`);
  return { ok: true, data: { id: dealId } };
}

export async function deleteDeal(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const userId = await getCurrentUserId();
  await prisma.deal.deleteMany({ where: { id, userId } });
  revalidatePath("/board");
  redirect("/board");
}
