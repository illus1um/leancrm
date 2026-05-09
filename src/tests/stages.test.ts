import { describe, it, expect } from "vitest";
import { DEAL_STAGES, STAGE_LABELS, isDealStage } from "@/lib/stages";
import {
  dealCreateSchema,
  dealUpdateSchema,
  stageTransitionSchema,
} from "@/lib/schemas";

describe("DEAL_STAGES", () => {
  it("preserves the canonical pipeline order", () => {
    expect([...DEAL_STAGES]).toEqual([
      "LEAD",
      "QUALIFICATION",
      "PROPOSAL",
      "NEGOTIATION",
      "WON",
      "LOST",
    ]);
  });

  it("has a label for every stage", () => {
    for (const s of DEAL_STAGES) {
      expect(STAGE_LABELS[s]).toBeTruthy();
    }
  });

  it("isDealStage type guard rejects unknown values", () => {
    expect(isDealStage("LEAD")).toBe(true);
    expect(isDealStage("WON")).toBe(true);
    expect(isDealStage("ARCHIVED")).toBe(false);
    expect(isDealStage(null)).toBe(false);
    expect(isDealStage(42)).toBe(false);
  });
});

describe("Deal Zod schemas", () => {
  it("rejects empty title on create", () => {
    const result = dealCreateSchema.safeParse({
      title: "",
      stage: "LEAD",
      contactId: "c1",
    });
    expect(result.success).toBe(false);
  });

  it("requires either contact or company on create", () => {
    const result = dealCreateSchema.safeParse({ title: "Orphan deal" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const flat = result.error.flatten();
      expect(flat.fieldErrors.contactId?.[0]).toMatch(/contact or a company/i);
    }
  });

  it("accepts when only contactId is provided", () => {
    const result = dealCreateSchema.safeParse({
      title: "X",
      contactId: "c1",
    });
    expect(result.success).toBe(true);
  });

  it("accepts when only companyId is provided", () => {
    const result = dealCreateSchema.safeParse({
      title: "X",
      companyId: "co1",
    });
    expect(result.success).toBe(true);
  });

  it("coerces numeric amount strings", () => {
    const result = dealCreateSchema.safeParse({
      title: "X",
      amount: "1500",
      contactId: "c1",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.amount).toBe(1500);
  });

  it("rejects unknown stage in stage transition", () => {
    const result = stageTransitionSchema.safeParse({
      dealId: "abc",
      newStage: "ARCHIVED",
    });
    expect(result.success).toBe(false);
  });

  it("requires id on update", () => {
    const result = dealUpdateSchema.safeParse({
      title: "X",
      contactId: "c1",
    });
    expect(result.success).toBe(false);
  });
});
