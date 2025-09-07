import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing tariffs
  await prisma.tariff.deleteMany();

  // Get all tariff classes
  const tariffClasses = await prisma.tariffClass.findMany();

  if (tariffClasses.length === 0) {
    throw new Error("No tariff classes found. Seed TariffClass first.");
  }

  // Define years & months
  const years = [2023, 2024]; // you can extend to 2013–2025
  const months = Array.from({ length: 12 }, (_, i) => i + 1); // 1–12

  const tariffsData = [];

  for (const tClass of tariffClasses) {
    for (const year of years) {
      for (const month of months) {
        tariffsData.push({
          tariffClassId: tClass.id,
          month,
          year,
          // Example: random rate with decimals, higher for MD classes
          rate: (
            Math.random() * (tClass.name.startsWith("MD") ? 80 : 50) +
            (tClass.name.startsWith("R") ? 10 : 20)
          ).toFixed(4),
        });
      }
    }
  }

  await prisma.tariff.createMany({ data: tariffsData });

  console.log(
    `✅ Seeded ${tariffsData.length} tariff records across ${tariffClasses.length} classes`
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed error", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
