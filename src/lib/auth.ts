import { prisma } from "@/lib/db";

const DEMO_EMAIL = "demo@leancrm.local";

/**
 * Auth is intentionally deferred for the Assignment-4 prototype (see report
 * Part 1.1 "What the MVP is NOT"). Every Server Action calls this helper to
 * scope writes/reads to a single seeded user. Replacing this with Auth.js v5
 * is the next-iteration item documented in Part 3.2.
 */
export async function getCurrentUserId(): Promise<string> {
  const user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!user) {
    throw new Error(
      "Demo user not seeded. Run `npx prisma migrate reset` then `npm run db:seed`."
    );
  }
  return user.id;
}
