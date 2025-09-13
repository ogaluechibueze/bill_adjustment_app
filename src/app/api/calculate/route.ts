// app/api/calculate/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMonthRange } from "@/utils/dateRange";

export async function POST(req: Request) {
  try {
    const { feederId, tariffClassId, startDate, endDate, defaultCapUnit, avgConsumption} =
      await req.json();

    // ✅ Convert IDs to numbers
    const feederIdNum = Number(feederId);
    const tariffClassIdNum = Number(tariffClassId);

    if (!feederIdNum || !tariffClassIdNum || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing or invalid feederId, tariffClassId, startDate, or endDate" },
        { status: 400 }
      );
    }

    const months = getMonthRange(new Date(startDate), new Date(endDate));
    let totalAdjustment = 0;

    for (const { month, year } of months) {
      // ✅ Always fetch tariff
      const tariff = await prisma.tariff.findFirst({
        where: { tariffClassId: tariffClassIdNum, month, year },
      });

      if (!tariff) continue;

      let consumptionValue: number | null = null;

      if (defaultCapUnit !== undefined && defaultCapUnit !== null) {
          consumptionValue = Number(defaultCapUnit);
        } else if (avgConsumption !== undefined && avgConsumption !== null) {
          consumptionValue = Number(avgConsumption);
        } else {
          const consumption = await prisma.consumption.findFirst({
            where: { feederId: feederIdNum, month, year },
          });
          consumptionValue = consumption ? Number(consumption.consumption) : null;
        }

      if (consumptionValue !== null) {
        totalAdjustment += consumptionValue * Number(tariff.rate) * 1.075; // ✅ apply VAT
      }
    }

    return NextResponse.json({ adjustmentAmount: totalAdjustment });
  } catch (error: any) {
    console.error("❌ Error in /api/calculate:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
