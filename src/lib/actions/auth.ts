"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  createSession,
  destroyCurrentSession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/schemas";
import type { ActionResult } from "@/lib/actions/deals";

export async function registerUser(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return {
      ok: false,
      error: "An account with this email already exists",
      fieldErrors: { email: ["An account with this email already exists"] },
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash,
    },
  });

  await createSession(user.id);
  return { ok: true, data: { id: user.id } };
}

export async function loginUser(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (!user || !user.passwordHash) {
    return { ok: false, error: "Invalid email or password" };
  }
  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    return { ok: false, error: "Invalid email or password" };
  }

  await createSession(user.id);
  return { ok: true, data: { id: user.id } };
}

export async function logoutUser(): Promise<void> {
  await destroyCurrentSession();
  redirect("/login");
}
