// app/api/customers/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust path if your prisma client is elsewhere

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";

    if (!query) {
      return NextResponse.json([]);
    }

    const customers = await prisma.customer.findMany({
      where: {
        globalAcctNo: {
          contains:query ,
          
        },
      },
      take: 10,
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("❌ Search API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}
