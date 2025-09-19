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
  const csvPath = path.join(__dirname, 'seed', 'EBMS.csv');
  const BATCH_SIZE = 1000; // adjust for your system
  let batch = [];
  let totalInserted = 0;

  await new Promise((resolve, reject) => {
    const stream = fs.createReadStream(csvPath).pipe(csv());

    stream.on('data', (row) => {
      batch.push({
        globalAcctNo: row.globalAcctNo,
        customerName: row.customerName,
        customerAddress: row.customerAddress,
        region: row.region,
        businessUnit: row.businessUnit,
        serviceUnit: row.serviceUnit,
        customerType: row.customerType,
        meterNumber: row.meterNumber || null,
        tariffClassId: Number(row.tariffClassId),
        feederId: Number(row.feederId),
        feederName11kv: row.feederName11kv,
        feederName33kv: row.feederName33kv,
        previousAdjustment: Number(row.previousAdjustment) || 0,
        source: row.source,
        ticketNo: row.ticketNo,
        billStatus: row.billStatus || null,
        transformerName: row.transformerName,
        amountBilled: Number(row.amountBilled) || 0,
        totalOutstanding: Number(row.totalOutstanding) || 0,
      });

      if (batch.length >= BATCH_SIZE) {
        stream.pause();
        prisma.customerDetails
          .createMany({ data: batch, skipDuplicates: true })
          .then((res) => {
            totalInserted += res.count;
            console.log(`✅ Inserted batch (${res.count}), total so far: ${totalInserted}`);
            batch = [];
            stream.resume();
          })
          .catch((err) => {
            console.error('❌ Batch insert failed:', err);
            reject(err);
          });
      }
    });

    stream.on('end', async () => {
      if (batch.length > 0) {
        const res = await prisma.customerDetails.createMany({
          data: batch,
          skipDuplicates: true,
        });
        totalInserted += res.count;
        console.log(`✅ Inserted final batch (${res.count})`);
      }
      resolve();
    });

    stream.on('error', reject);
  });

  console.log(`🎉 Seeding complete. Total inserted: ${totalInserted}`);
}

main()
  .catch((e) => {
    console.error('❌ Error in seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
