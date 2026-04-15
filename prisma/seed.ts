import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const demoEmail = "demo@leancrm.local";

  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: { email: demoEmail, name: "Demo Operator" },
  });

  // Wipe and reseed deals so the prototype always opens with a fresh, balanced board.
  await prisma.deal.deleteMany({ where: { userId: user.id } });

  const deals: Array<{
    title: string;
    stage: string;
    amount: number | null;
    contactName: string | null;
    companyName: string | null;
    notes: string | null;
  }> = [
    {
      title: "Wedding bouquet — recurring monthly order",
      stage: "LEAD",
      amount: 1200,
      contactName: "Aliya N.",
      companyName: "Aliya's Flowers",
      notes: "Walked in on Saturday. Asked about subscription pricing.",
    },
    {
      title: "Sofa redesign for boutique hotel",
      stage: "LEAD",
      amount: 8500,
      contactName: "Daniyar K.",
      companyName: "Steppe Hotels",
      notes: null,
    },
    {
      title: "Quarterly content monitoring contract",
      stage: "QUALIFICATION",
      amount: 24000,
      contactName: "Ruslan T.",
      companyName: "Lookout AI",
      notes: "Procurement asked for SOC2 docs — flagged for follow-up.",
    },
    {
      title: "Custom corner sofa, 3-seat",
      stage: "PROPOSAL",
      amount: 3200,
      contactName: "Yerkin S.",
      companyName: null,
      notes: "Proposal sent 2 days ago.",
    },
    {
      title: "Office plant subscription",
      stage: "PROPOSAL",
      amount: 480,
      contactName: "Madina B.",
      companyName: "Tau Coworking",
      notes: null,
    },
    {
      title: "Brand-monitoring pilot, 30 days",
      stage: "NEGOTIATION",
      amount: 4500,
      contactName: "Ruslan T.",
      companyName: "Lookout AI",
      notes: "Negotiating discount. Decision expected by Friday.",
    },
    {
      title: "Anniversary bouquet, 50 stems",
      stage: "WON",
      amount: 350,
      contactName: "Marat A.",
      companyName: null,
      notes: "Delivered on time. Repeat customer.",
    },
    {
      title: "Restaurant table set, 12 chairs",
      stage: "LOST",
      amount: 6800,
      contactName: "Asel R.",
      companyName: "Bayterek Bistro",
      notes: "Lost on price — competitor was 18% cheaper.",
    },
  ];

  for (const d of deals) {
    await prisma.deal.create({
      data: { ...d, userId: user.id },
    });
  }

  const counts = await prisma.deal.groupBy({
    by: ["stage"],
    _count: { _all: true },
    where: { userId: user.id },
  });

  console.log(`Seeded user ${user.email} with ${deals.length} deals.`);
  for (const c of counts) {
    console.log(`  ${c.stage}: ${c._count._all}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
