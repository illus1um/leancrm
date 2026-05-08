"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { companyCreateSchema, companyUpdateSchema } from "@/lib/schemas";
import type { ActionResult } from "@/lib/actions/deals";

export async function createCompany(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const raw = {
    name: formData.get("name"),
    website: formData.get("website") || undefined,
    industry: formData.get("industry") || undefined,
    notes: formData.get("notes") || undefined,
  };
  const parsed = companyCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const userId = await getCurrentUserId();
  const company = await prisma.company.create({
    data: { ...parsed.data, userId },
  });

  revalidatePath("/companies");
  return { ok: true, data: { id: company.id } };
}

export async function updateCompany(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const id = String(formData.get("id") ?? "");
  const raw = {
    id,
    name: formData.get("name"),
    website: formData.get("website") || undefined,
    industry: formData.get("industry") || undefined,
    notes: formData.get("notes") || undefined,
  };
  const parsed = companyUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const userId = await getCurrentUserId();
  const { id: companyId, ...rest } = parsed.data;
  const result = await prisma.company.updateMany({
    where: { id: companyId, userId },
    data: rest,
  });
  if (result.count === 0) {
    return { ok: false, error: "Company not found" };
  }

  revalidatePath("/companies");
  revalidatePath(`/companies/${companyId}`);
  return { ok: true, data: { id: companyId } };
}

export async function deleteCompany(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const userId = await getCurrentUserId();
  await prisma.company.deleteMany({ where: { id, userId } });
  revalidatePath("/companies");
  redirect("/companies");
}
