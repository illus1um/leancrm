"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { activityCreateSchema } from "@/lib/schemas";
import type { ActionResult } from "@/lib/actions/deals";

export async function createActivity(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const raw = {
    type: formData.get("type"),
    content: formData.get("content"),
    dealId: formData.get("dealId") || undefined,
    contactId: formData.get("contactId") || undefined,
    companyId: formData.get("companyId") || undefined,
  };
  const parsed = activityCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const userId = await getCurrentUserId();
  const activity = await prisma.activity.create({
    data: { ...parsed.data, userId },
  });

  revalidatePath("/dashboard");
  if (parsed.data.dealId) revalidatePath(`/deals/${parsed.data.dealId}`);
  if (parsed.data.contactId) revalidatePath(`/contacts/${parsed.data.contactId}`);
  if (parsed.data.companyId) revalidatePath(`/companies/${parsed.data.companyId}`);
  return { ok: true, data: { id: activity.id } };
}
