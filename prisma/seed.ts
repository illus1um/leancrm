import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const demoEmail = "demo@leancrm.local";
  const demoPassword = "demo12345";
  const passwordHash = await bcrypt.hash(demoPassword, 10);

  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: { passwordHash },
    create: {
      email: demoEmail,
      name: "Demo Operator",
      passwordHash,
    },
  });

  // Wipe and reseed downstream tables for a fresh demo state.
  await prisma.activity.deleteMany({ where: { userId: user.id } });
  await prisma.reminder.deleteMany({ where: { userId: user.id } });
  await prisma.deal.deleteMany({ where: { userId: user.id } });
  await prisma.contact.deleteMany({ where: { userId: user.id } });
  await prisma.company.deleteMany({ where: { userId: user.id } });

  const companiesData = [
    { name: "Aliya's Flowers", website: "aliyas-flowers.kz", industry: "Retail" },
    { name: "Steppe Hotels", website: "steppe.kz", industry: "Hospitality" },
    { name: "Lookout AI", website: "lookout.ai", industry: "Software" },
    { name: "Tau Coworking", website: "tau.space", industry: "Real estate" },
    { name: "Bayterek Bistro", website: null, industry: "Food & beverage" },
  ];
  const companies: Record<string, string> = {};
  for (const c of companiesData) {
    const created = await prisma.company.create({
      data: { ...c, userId: user.id },
    });
    companies[c.name] = created.id;
  }

  const contactsData: Array<{
    fullName: string;
    email: string | null;
    phone: string | null;
    companyName: string | null;
  }> = [
    { fullName: "Aliya N.", email: "aliya@flowers.kz", phone: "+7 701 555 0101", companyName: "Aliya's Flowers" },
    { fullName: "Daniyar K.", email: "daniyar@steppe.kz", phone: null, companyName: "Steppe Hotels" },
    { fullName: "Ruslan T.", email: "ruslan@lookout.ai", phone: null, companyName: "Lookout AI" },
    { fullName: "Yerkin S.", email: null, phone: "+7 702 555 0202", companyName: null },
    { fullName: "Madina B.", email: "madina@tau.space", phone: null, companyName: "Tau Coworking" },
    { fullName: "Marat A.", email: null, phone: "+7 705 555 0303", companyName: null },
    { fullName: "Asel R.", email: "asel@bayterek.kz", phone: null, companyName: "Bayterek Bistro" },
  ];
  const contacts: Record<string, string> = {};
  for (const c of contactsData) {
    const created = await prisma.contact.create({
      data: {
        fullName: c.fullName,
        email: c.email,
        phone: c.phone,
        companyId: c.companyName ? companies[c.companyName] : null,
        userId: user.id,
      },
    });
    contacts[c.fullName] = created.id;
  }

  const dealsData = [
    { title: "Wedding bouquet — recurring monthly order", stage: "LEAD", amount: 1200, contact: "Aliya N.", company: "Aliya's Flowers", notes: "Walked in on Saturday. Asked about subscription pricing." },
    { title: "Sofa redesign for boutique hotel", stage: "LEAD", amount: 8500, contact: "Daniyar K.", company: "Steppe Hotels", notes: null },
    { title: "Quarterly content monitoring contract", stage: "QUALIFICATION", amount: 24000, contact: "Ruslan T.", company: "Lookout AI", notes: "Procurement asked for SOC2 docs — flagged for follow-up." },
    { title: "Custom corner sofa, 3-seat", stage: "PROPOSAL", amount: 3200, contact: "Yerkin S.", company: null, notes: "Proposal sent 2 days ago." },
    { title: "Office plant subscription", stage: "PROPOSAL", amount: 480, contact: "Madina B.", company: "Tau Coworking", notes: null },
    { title: "Brand-monitoring pilot, 30 days", stage: "NEGOTIATION", amount: 4500, contact: "Ruslan T.", company: "Lookout AI", notes: "Negotiating discount. Decision expected by Friday." },
    { title: "Anniversary bouquet, 50 stems", stage: "WON", amount: 350, contact: "Marat A.", company: null, notes: "Delivered on time. Repeat customer." },
    { title: "Restaurant table set, 12 chairs", stage: "LOST", amount: 6800, contact: "Asel R.", company: "Bayterek Bistro", notes: "Lost on price — competitor was 18% cheaper." },
  ];

  const deals: Record<string, string> = {};
  for (const d of dealsData) {
    const created = await prisma.deal.create({
      data: {
        title: d.title,
        amount: d.amount,
        stage: d.stage,
        notes: d.notes,
        contactId: d.contact ? contacts[d.contact] : null,
        companyId: d.company ? companies[d.company] : null,
        userId: user.id,
      },
    });
    deals[d.title] = created.id;
  }

  // A couple of demo activities.
  await prisma.activity.create({
    data: {
      type: "CALL",
      content: "Called Ruslan, confirmed the SOC2 doc set will land Wednesday.",
      userId: user.id,
      dealId: deals["Quarterly content monitoring contract"],
    },
  });
  await prisma.activity.create({
    data: {
      type: "STAGE_CHANGE",
      content: "Stage: Lead → Qualification",
      userId: user.id,
      dealId: deals["Quarterly content monitoring contract"],
    },
  });

  // Reminders: one overdue, one upcoming.
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const inThreeDays = new Date(today);
  inThreeDays.setDate(inThreeDays.getDate() + 3);

  await prisma.reminder.create({
    data: {
      title: "Send SOC2 docs to Lookout",
      dueDate: yesterday,
      userId: user.id,
      dealId: deals["Quarterly content monitoring contract"],
    },
  });
  await prisma.reminder.create({
    data: {
      title: "Follow up on subscription pricing with Aliya",
      dueDate: inThreeDays,
      userId: user.id,
      dealId: deals["Wedding bouquet — recurring monthly order"],
    },
  });

  console.log(`Seeded user ${user.email} (password: ${demoPassword})`);
  console.log(`  ${companiesData.length} companies, ${contactsData.length} contacts, ${dealsData.length} deals`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
