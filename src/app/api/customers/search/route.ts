// app/api/customers/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";

    if (!query) {
      return NextResponse.json([]);
    }

    const customers = await prisma.customerDetails.findMany({
      where: {
        globalAcctNo: {
          contains: query,
        },
      },
      include: {
        feeder: {
          select: { id: true, name: true },
        },
        tariffClass: {
          select: { id: true, name: true },
        },
      },
      take: 10,
    });

    // Format the response so frontend has both IDs & names
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
      totalOutstanding: c.totalOutstanding,
      amountBilled: c.amountBilled,
      source: c.source,
      ticketNo: c.ticketNo,

      // ✅ Feeder info
      feederId: c.feeder?.id ?? null,
      feederName: c.feeder?.name ?? null,

      // ✅ Tariff info
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
