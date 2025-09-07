import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing tariff classes
  await prisma.tariffClass.deleteMany();

  // Standard + filler tariff classes
  const tariffClasses = [
    "R1", "R2", "R3",
    "C1", "C2", "C3",
    "D1", "D2",
    "A1", "A2",
    "MD1", "MD2", "MD3",
    "SL", "S1", "S2", "S3",
    "X1", "X2", "X3",
    "Y1", "Y2",
    "Z1", "Z2",
    "Special",
  ].map((name) => ({ name }));

  await prisma.tariffClass.createMany({ data: tariffClasses });

  console.log(`✅ Seeded ${tariffClasses.length} tariff classes successfully`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
