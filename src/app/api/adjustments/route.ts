import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 🔧 helper: get all {month, year} in date range
function getMonthRange(start: Date, end: Date) {
  const months: { month: number; year: number }[] = [];
  const cur = new Date(start);

  while (cur <= end) {
    months.push({ month: cur.getMonth() + 1, year: cur.getFullYear() });
    cur.setMonth(cur.getMonth() + 1);
  }

  return months;
}

// ✅ GET all customers with adjustments + items
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { username: true } },
        Adjustment: {
          orderBy: { startDate: "desc" },
          include: {
            items: {
              orderBy: [{ year: "asc" }, { month: "asc" }],
            },
          },
        },
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

    // 1️⃣ Create Customer
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
        initialDebt: body.initialDebt ? parseFloat(body.initialDebt) : null,
        adjustmentAmount: body.adjustmentAmount
          ? parseFloat(body.adjustmentAmount)
          : null,
        balanceAfterAdjustment: body.balanceAfterAdjustment
          ? parseFloat(body.balanceAfterAdjustment)
          : null,
        adjustmentStartDate: body.adjustmentStartDate
          ? new Date(body.adjustmentStartDate)
          : null,
        adjustmentEndDate: body.adjustmentEndDate
          ? new Date(body.adjustmentEndDate)
          : null,
        ccroremarks: body.ccroremarks ?? null,
        status: "Pending",
        approvalStage: "HCC",
        createdById: userId,
      },
      include: {
        createdBy: { select: { username: true } },
      },
    });

    // 2️⃣ Create Adjustment
    if (!body.adjustmentStartDate || !body.adjustmentEndDate) {
      return NextResponse.json(
        { error: "Start and End dates are required" },
        { status: 400 }
      );
    }

    const adjustment = await prisma.adjustment.create({
      data: {
        customerId: newCustomer.id,
        startDate: new Date(body.adjustmentStartDate),
        endDate: new Date(body.adjustmentEndDate),
        totalAmount: 0,
      },
    });

    // 3️⃣ Generate AdjustmentItems
    const months = getMonthRange(
      new Date(body.adjustmentStartDate),
      new Date(body.adjustmentEndDate)
    );

    let totalAmount = 0;

    for (const { month, year } of months) {
      const consumption = await prisma.consumption.findFirst({
        where: {
          feeder: body.feederName,
          month,
          year,
        },
      });

      const tariff = await prisma.tariff.findFirst({
        where: {
          tariffClass: body.type, // 👈 type maps to tariffClass
          month,
          year,
        },
      });

      if (consumption && tariff) {
        const amount =
          Number(consumption.consumption) * Number(tariff.rate);

        await prisma.adjustmentItem.create({
          data: {
            adjustmentId: adjustment.id,
            month,
            year,
            consumption: consumption.consumption,
            tariffRate: tariff.rate,
            amount,
          },
        });

        totalAmount += amount;
      }
    }

    // 4️⃣ Update total
    await prisma.adjustment.update({
      where: { id: adjustment.id },
      data: { totalAmount },
    });

    return NextResponse.json(
      { customer: newCustomer, adjustmentId: adjustment.id, totalAmount },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/adjustments error:", error);
    return NextResponse.json(
      { error: "Failed to create adjustment" },
      { status: 500 }
    );
  }
}
