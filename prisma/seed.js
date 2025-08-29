import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data (⚠️ optional, don’t use in production blindly)
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // Hash passwords
  const hashedPassword = await bcrypt.hash("Passw0rd!", 10);

  // Seed users with roles
  const ccro = await prisma.user.create({
    data: {
      email: "ccro@example.com",
      username: "ccro",
      password: hashedPassword,
      role: Role.CCRO,
      active: true,
    },
  });

  const cco = await prisma.user.create({
    data: {
      email: "cco@example.com",
      username: "cco",
      password: hashedPassword,
      role: Role.CCO,
      active: true,
    },
  });

  const cao = await prisma.user.create({
    data: {
      email: "cao@example.com",
      username: "cao",
      password: hashedPassword,
      role: Role.CAO,
      active: true,
    },
  });

  const md = await prisma.user.create({
    data: {
      email: "md@example.com",
      username: "md",
      password: hashedPassword,
      role: Role.MD,
      active: true,
    },
  });

  // Optional: Seed a sample customer linked to CCRO
  await prisma.customer.create({
    data: {
      globalAcctNo: "ACC123456",
      customerName: "John Doe Enterprises",
      region: "North",
      businessUnit: "Power",
      band: "A",
      feederName: "Feeder-1",
      source: "Manual",
      ticketNo: "TKT-001",
      initialDebt: 10000.0,
      adjustmentAmount: 2000.0,
      balanceAfterAdjustment: 8000.0,
      ccroremarks: "Initial adjustment made",
      status: "Pending",
      approvalStage: "CCRO",
      createdById: ccro.id, // ✅ linked to CCRO user
    },
  });
}

main()
  .then(async () => {
    console.log("✅ Database has been seeded with users and one customer");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
