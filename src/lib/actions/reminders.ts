"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import {
  reminderCreateSchema,
  reminderUpdateSchema,
} from "@/lib/schemas";
import type { ActionResult } from "@/lib/actions/deals";

export async function createReminder(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const raw = {
    title: formData.get("title"),
    dueDate: formData.get("dueDate"),
    dealId: formData.get("dealId") || undefined,
    contactId: formData.get("contactId") || undefined,
    companyId: formData.get("companyId") || undefined,
  };
  const parsed = reminderCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const userId = await getCurrentUserId();
  const reminder = await prisma.reminder.create({
    data: { ...parsed.data, userId },
  });

  revalidatePath("/reminders");
  revalidatePath("/dashboard");
  if (parsed.data.dealId) revalidatePath(`/deals/${parsed.data.dealId}`);
  return { ok: true, data: { id: reminder.id } };
}

export async function toggleReminder(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const userId = await getCurrentUserId();
  const current = await prisma.reminder.findFirst({
    where: { id, userId },
    select: { status: true },
  });
  if (!current) return;
  const next = current.status === "OPEN" ? "COMPLETED" : "OPEN";
  await prisma.reminder.update({ where: { id }, data: { status: next } });
  revalidatePath("/reminders");
  revalidatePath("/dashboard");
}

export async function updateReminder(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const id = String(formData.get("id") ?? "");
  const raw = {
    id,
    title: formData.get("title"),
    dueDate: formData.get("dueDate"),
    status: formData.get("status") || "OPEN",
    dealId: formData.get("dealId") || undefined,
    contactId: formData.get("contactId") || undefined,
    companyId: formData.get("companyId") || undefined,
  };
  const parsed = reminderUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const userId = await getCurrentUserId();
  const { id: reminderId, ...rest } = parsed.data;
  const result = await prisma.reminder.updateMany({
    where: { id: reminderId, userId },
    data: rest,
  });
  if (result.count === 0) {
    return { ok: false, error: "Reminder not found" };
  }
  revalidatePath("/reminders");
  revalidatePath("/dashboard");
  return { ok: true, data: { id: reminderId } };
}

export async function deleteReminder(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const userId = await getCurrentUserId();
  await prisma.reminder.deleteMany({ where: { id, userId } });
  revalidatePath("/reminders");
  revalidatePath("/dashboard");
  redirect("/reminders");
}
