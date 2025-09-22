// app/api/calculate/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMonthRange } from "@/utils/dateRange";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { feederId, tariffClassId, startDate, endDate, defaultCapUnit, avgConsumption, globalAcctNo } =
      await req.json();

    const feederIdNum = Number(feederId);
    const tariffClassIdNum = Number(tariffClassId);

    if (!feederIdNum || !tariffClassIdNum || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing or invalid feederId, tariffClassId, startDate, or endDate" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = getMonthRange(start, end);

    // ✅ Fetch all tariffs for the months at once
    const tariffs = await prisma.tariff.findMany({
      where: {
        tariffClassId: tariffClassIdNum,
        OR: months.map(({ month, year }) => ({ month, year })),
      },
    });

    // ✅ Fetch all consumptions for the months at once
    const consumptions = await prisma.consumption.findMany({
      where: {
        feederId: feederIdNum,
        OR: months.map(({ month, year }) => ({ month, year })),
      },
    });

    // ✅ Sum billedAmount for globalAcctNo within selected date range
    let totalBilledAmount = 0;
    // if (globalAcctNo) {
    //   const billed = await prisma.customerDetails.aggregate({
    //     where: {
    //       globalAcctNo: String(globalAcctNo),
    //       billDate: { gte: start, lte: end }, // 🔹 filter by date range
    //     },
    //     _sum: { amountBilled: true },
    //   });

    //   const billedAmountDecimal: Prisma.Decimal | null = billed._sum.amountBilled;
    //   totalBilledAmount = billedAmountDecimal ? Number(billedAmountDecimal) : 0;
    // }

    let totalAdjustment = 0;
    let totalConsumption = 0;

    for (const { month, year } of months) {
      const tariff = tariffs.find((t) => t.month === month && t.year === year);
      if (!tariff) continue;

      let consumptionValue: number | null = null;

      if (defaultCapUnit) {
        consumptionValue = Number(defaultCapUnit);
      } else if (avgConsumption) {
        consumptionValue = Number(avgConsumption);
      } else {
        const consumption = consumptions.find(
          (c) => c.month === month && c.year === year
        );
        consumptionValue = consumption ? Number(consumption.consumption) : null;
      }

      if (consumptionValue !== null) {
        totalAdjustment += consumptionValue * Number(tariff.rate) * 1.075; // ✅ Apply VAT
        totalConsumption += consumptionValue;
      }
    }

    return NextResponse.json({
      adjustmentAmount: totalAdjustment,
      totalConsumption,
      // initialDebt: totalBilledAmount, // ✅ return billed sum as "initialDebt"
    });
  } catch (error) {
    console.error("❌ Error in /api/calculate:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
