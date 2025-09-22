// app/api/customers/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.trim() || "";

    if (!query) {
      return NextResponse.json([]);
    }

    const customers = await prisma.customerDetails.findMany({
      where: {
        globalAcctNo: {
          startsWith: query, // ✅ indexed prefix search
        },
      },
      include: {
        feeder: { select: { id: true, name: true } },
        tariffClass: { select: { id: true, name: true } },
      },
      take: 10,
    });

    const result = customers.map((c) => ({
      id: c.id,
      globalAcctNo: c.globalAcctNo,
      customerName: c.customerName,
      customerAddress: c.customerAddress,
      region: c.region,
      businessUnit: c.businessUnit,
      serviceUnit: c.serviceUnit,
      customerType: c.customerType,
      meterNumber: c.meterNumber,
      band: c.band,
      billStatus: c.billStatus,
      initialDebt: c.amountBilled,

      // ✅ Preserve exact decimals
            totalOutstanding: c.totalOutstanding !== null && c.totalOutstanding !== undefined 
        ? c.totalOutstanding.toString() 
        : "0.00",
            amountBilled: c.amountBilled !== null && c.amountBilled !== undefined 
        ? c.amountBilled.toString() 
        : "0.00",

      previousAdjustment: c.previousAdjustment !== null && c.previousAdjustment !== undefined 
        ? c.previousAdjustment.toString() 
        : "0.00",

      source: c.source,
      ticketNo: c.ticketNo,

      feederId: c.feeder?.id ?? null,
      feederName: c.feeder?.name ?? null,

      tariffClassId: c.tariffClass?.id ?? null,
      tariffClassName: c.tariffClass?.name ?? null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Search API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}
