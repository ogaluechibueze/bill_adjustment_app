import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Optional: clean old consumption data
  await prisma.consumption.deleteMany();

  // pick 3 feeders for example (you can extend to all 234 feeders if needed)
  const feederIds = Array.from({ length: 651 - 235 + 1 }, (_, i) => i + 235);

  const years = [2024, 2025];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const data = [];

  for (const feederId of feederIds) {
    for (const year of years) {
      for (const month of months) {
        // random-ish consumption between 10,000 – 50,000 kWh
        const consumption = (Math.random() * (50000 - 10000) + 10000).toFixed(2);

        data.push({
          feederId,
          month,
          year,
          consumption,
        });
      }
    }
  }

  await prisma.consumption.createMany({ data });

  console.log(`✅ Seeded consumption for feeders ${feederIds.join(", ")} for years ${years.join(", ")}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
