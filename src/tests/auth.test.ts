import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth";

describe("password hashing", () => {
  it("produces a hash that does not equal the plaintext", async () => {
    const hash = await hashPassword("hunter22");
    expect(hash).not.toBe("hunter22");
    expect(hash).toMatch(/^\$2[abxy]\$/);
  });

  it("verifyPassword accepts the right password", async () => {
    const hash = await hashPassword("hunter22");
    expect(await verifyPassword("hunter22", hash)).toBe(true);
  });

  it("verifyPassword rejects the wrong password", async () => {
    const hash = await hashPassword("hunter22");
    expect(await verifyPassword("hunter23", hash)).toBe(false);
  });
});
