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

  it("has a label for every stage (no UI gap when a new stage lands)", () => {
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

describe("Zod schemas", () => {
  it("rejects empty title on create", () => {
    const result = dealCreateSchema.safeParse({ title: "", stage: "LEAD" });
    expect(result.success).toBe(false);
  });

  it("accepts a minimal valid create payload", () => {
    const result = dealCreateSchema.safeParse({ title: "New deal" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.stage).toBe("LEAD");
      expect(result.data.amount).toBeNull();
    }
  });

  it("coerces blank optional strings to null", () => {
    const result = dealCreateSchema.safeParse({
      title: "X",
      contactName: "",
      companyName: "  ",
      notes: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contactName).toBeNull();
      expect(result.data.companyName).toBeNull();
      expect(result.data.notes).toBeNull();
    }
  });

  it("coerces numeric amount strings", () => {
    const result = dealCreateSchema.safeParse({ title: "X", amount: "1500" });
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
    const result = dealUpdateSchema.safeParse({ title: "X" });
    expect(result.success).toBe(false);
  });
});
