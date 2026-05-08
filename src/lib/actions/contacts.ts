"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { contactCreateSchema, contactUpdateSchema } from "@/lib/schemas";
import type { ActionResult } from "@/lib/actions/deals";

export async function createContact(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const raw = {
    fullName: formData.get("fullName"),
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    notes: formData.get("notes") || undefined,
    companyId: formData.get("companyId") || undefined,
  };
  const parsed = contactCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const userId = await getCurrentUserId();
  const contact = await prisma.contact.create({
    data: { ...parsed.data, userId },
  });

  revalidatePath("/contacts");
  revalidatePath("/dashboard");
  return { ok: true, data: { id: contact.id } };
}

export async function updateContact(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const id = String(formData.get("id") ?? "");
  const raw = {
    id,
    fullName: formData.get("fullName"),
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    notes: formData.get("notes") || undefined,
    companyId: formData.get("companyId") || undefined,
  };
  const parsed = contactUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const userId = await getCurrentUserId();
  const { id: contactId, ...rest } = parsed.data;
  const result = await prisma.contact.updateMany({
    where: { id: contactId, userId },
    data: rest,
  });
  if (result.count === 0) {
    return { ok: false, error: "Contact not found" };
  }

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${contactId}`);
  return { ok: true, data: { id: contactId } };
}

export async function deleteContact(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const userId = await getCurrentUserId();
  await prisma.contact.deleteMany({ where: { id, userId } });
  revalidatePath("/contacts");
  redirect("/contacts");
}
