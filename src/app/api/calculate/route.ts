// app/api/calculate/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMonthRange } from "@/utils/dateRange"; // ✅ already defined

export async function POST(req: Request) {
  const { feeder, tariffClass, startDate, endDate } = await req.json();

  if (!feeder || !tariffClass) {
    return NextResponse.json({ error: "Missing feeder or tariff class" }, { status: 400 });
  }

  const months = getMonthRange(new Date(startDate), new Date(endDate));
  let totalAdjustment = 0;

  for (const { month, year } of months) {
    const consumption = await prisma.consumption.findFirst({
      where: { feeder, month, year },
    });

    const tariff = await prisma.tariff.findFirst({
      where: { tariffClass, month, year },
    });

    if (consumption && tariff) {
      totalAdjustment += Number(consumption.consumption) * Number(tariff.rate) * 1.075;
    }
  }

  return NextResponse.json({ adjustmentAmount: totalAdjustment });
}
