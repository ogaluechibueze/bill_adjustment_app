import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

// Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const results = [];

  const csvPath = path.join(__dirname, 'seed', 'consumption.csv');

  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        results.push({
          id: Number(row.id),
          feederId: Number(row.feederId),
          month: Number(row.month),
          year: Number(row.year),
          consumption: Number(row.consumption)
        });
      })
      .on('end', resolve)
      .on('error', reject);
  });

  await prisma.consumption.createMany({
    data: results,
    skipDuplicates: true,
  });

  console.log(`✅ Seeded ${results.length} tariff.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
