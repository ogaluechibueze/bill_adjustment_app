import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ✅ GET all customers with creator's username
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { username: true } }, // 👈 show username always
      },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("GET /api/adjustments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch adjustments" },
      { status: 500 }
    );
  }
}

// ✅ POST new adjustment (CCRO creates)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session as any).user?.id;
    const role = (session as any).user?.role;

    // only CCRO can create
    if (!userId || role !== "CCRO") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const newCustomer = await prisma.customer.create({
      data: {
        globalAcctNo: body.globalAcctNo,
        customerName: body.customerName,
        region: body.region ?? null,
        businessUnit: body.businessUnit ?? null,
        band: body.band ?? null,
        feederName: body.feederName ?? null,
        source: body.source ?? null,
        ticketNo: body.ticketNo ?? null,
        initialDebt: body.initialDebt ?? null,
        adjustmentAmount: body.adjustmentAmount ?? null,
        balanceAfterAdjustment: body.balanceAfterAdjustment ?? null,
        adjustmentStartDate: body.adjustmentStartDate
          ? new Date(body.adjustmentStartDate)
          : null,
        adjustmentEndDate: body.adjustmentEndDate
          ? new Date(body.adjustmentEndDate)
          : null,
        ccroremarks: body.ccroremarks ?? null,
        status: "Pending",
        approvalStage: "CCO",
        createdById: userId, // 👈 now correctly saved from session
      },
      include: {
        createdBy: { select: { username: true } }, // 👈 return username in response
      },
    });

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error("POST /api/adjustments error:", error);
    return NextResponse.json(
      { error: "Failed to create adjustment" },
      { status: 500 }
    );
  }
}
