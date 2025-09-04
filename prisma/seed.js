import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ⚠️ Clean existing data (be careful in production!)
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // Hash passwords
  const hashedPassword = await bcrypt.hash("Passw0rd!", 10);

  // Seed users with roles & business units
  const ccro = await prisma.user.create({
    data: {
      email: "ccro@example.com",
      username: "ccro",
      password: hashedPassword,
      role: Role.CCRO,
      bussinessUnit: "ETETE",
      region: "BENIN SOUTH",
      active: true,
    },
  });

  const cco = await prisma.user.create({
    data: {
      email: "hcc@example.com",
      username: "head customer care",
      password: hashedPassword,
      role: Role.HCC,
      bussinessUnit: "ETETE",
      region: "BENIN SOUTH",
      active: true,
    },
  });

  const cao = await prisma.user.create({
    data: {
      email: "bm@example.com",
      username: "business manager etete",
      password: hashedPassword,
      role: Role.BM,
      bussinessUnit: "ETETE",
      region: "BENIN SOUTH",
      active: true,
    },
  });

   const rh = await prisma.user.create({
    data: {
      email: "rh@example.com",
      username: "regional head",
      password: hashedPassword,
      role: Role.RH,
      bussinessUnit: "ETETE",
      region: "BENIN SOUTH",
      active: true,
    },
  });

   const ra = await prisma.user.create({
    data: {
      email: "ra@example.com",
      username: "regional auditor etete",
      password: hashedPassword,
      role: Role.RA,
      bussinessUnit: "ETETE",
      region: "BENIN SOUTH",
      active: true,
    },
  });

   const ia = await prisma.user.create({
    data: {
      email: "ia@example.com",
      username: "internal auditor etete",
      password: hashedPassword,
      role: Role.IA,
      bussinessUnit: "head office",
      region: "HEAD OFFICE",
      active: true,
    },
  });

   const cia = await prisma.user.create({
    data: {
      email: "cia@example.com",
      username: "chief internal auditor",
      password: hashedPassword,
      role: Role.BM,
      bussinessUnit: "head office",
      region: "BENIN SOUTH",
      active: true,
    },
  });

  const md = await prisma.user.create({
    data: {
      email: "md@example.com",
      username: "md",
      password: hashedPassword,
      role: Role.MD,
      bussinessUnit: "Head office",
      region: "HEAD OFFICE",
      active: true,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      username: "admin",
      password: hashedPassword,
      role: Role.ADMIN,
      bussinessUnit: "ITBEDC",
      region: "HEAD OFFICE",
      active: true,
    },
  });

  // ✅ Seed a sample customer linked to CCRO
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
