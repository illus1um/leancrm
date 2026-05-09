import { describe, it, expect } from "vitest";
import {
  contactCreateSchema,
  companyCreateSchema,
  reminderCreateSchema,
  registerSchema,
  loginSchema,
  activityCreateSchema,
} from "@/lib/schemas";

describe("Contact schema", () => {
  it("requires a full name", () => {
    expect(
      contactCreateSchema.safeParse({ fullName: "" }).success
    ).toBe(false);
  });

  it("accepts a name-only contact", () => {
    const r = contactCreateSchema.safeParse({ fullName: "Aliya N." });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.email).toBeNull();
      expect(r.data.phone).toBeNull();
    }
  });

  it("rejects malformed email", () => {
    const r = contactCreateSchema.safeParse({
      fullName: "X",
      email: "not-an-email",
    });
    expect(r.success).toBe(false);
  });

  it("treats empty email as null (not as a parse error)", () => {
    const r = contactCreateSchema.safeParse({
      fullName: "X",
      email: "",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBeNull();
  });

  it("normalises email to lowercase + trims", () => {
    const r = contactCreateSchema.safeParse({
      fullName: "X",
      email: "  HI@Acme.COM  ",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("hi@acme.com");
  });
});

describe("Company schema", () => {
  it("requires a name", () => {
    expect(companyCreateSchema.safeParse({ name: "" }).success).toBe(false);
  });
  it("accepts a name-only company", () => {
    const r = companyCreateSchema.safeParse({ name: "Aliya's Flowers" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.website).toBeNull();
      expect(r.data.industry).toBeNull();
      expect(r.data.notes).toBeNull();
    }
  });
});

describe("Reminder schema", () => {
  it("rejects missing dueDate", () => {
    expect(
      reminderCreateSchema.safeParse({ title: "Follow up" }).success
    ).toBe(false);
  });

  it("parses an ISO date string into a Date", () => {
    const r = reminderCreateSchema.safeParse({
      title: "Follow up",
      dueDate: "2026-05-10",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.dueDate).toBeInstanceOf(Date);
  });
});

describe("Auth schemas", () => {
  it("registerSchema rejects short passwords", () => {
    const r = registerSchema.safeParse({
      name: "Yaki",
      email: "y@x.com",
      password: "short",
    });
    expect(r.success).toBe(false);
  });

  it("registerSchema accepts an 8-char password", () => {
    const r = registerSchema.safeParse({
      name: "Yaki",
      email: "y@x.com",
      password: "12345678",
    });
    expect(r.success).toBe(true);
  });

  it("loginSchema rejects empty password", () => {
    const r = loginSchema.safeParse({ email: "y@x.com", password: "" });
    expect(r.success).toBe(false);
  });
});

describe("Activity schema", () => {
  it("rejects unknown type", () => {
    const r = activityCreateSchema.safeParse({
      type: "POSTCARD",
      content: "x",
    });
    expect(r.success).toBe(false);
  });
  it("accepts NOTE/CALL/EMAIL/MEETING", () => {
    for (const t of ["NOTE", "CALL", "EMAIL", "MEETING"] as const) {
      const r = activityCreateSchema.safeParse({ type: t, content: "x" });
      expect(r.success).toBe(true);
    }
  });
  it("rejects empty content", () => {
    const r = activityCreateSchema.safeParse({ type: "NOTE", content: "" });
    expect(r.success).toBe(false);
  });
});
