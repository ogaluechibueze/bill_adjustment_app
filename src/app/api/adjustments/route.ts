import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function getMonthRange(start: Date, end: Date) {
  const months: { month: number; year: number }[] = [];
  const cur = new Date(start);

  while (cur <= end) {
    months.push({ month: cur.getMonth() + 1, year: cur.getFullYear() });
    cur.setMonth(cur.getMonth() + 1);
  }

  return months;
}

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { username: true } },
        Adjustment: {
          orderBy: { adjustmentStartDate: "desc" },
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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session as any).user?.id;
    const role = (session as any).user?.role;

    if (!userId || role !== "CCRO") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // 🔎 0️⃣ Check if customer already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { globalAcctNo: body.globalAcctNo },
      include: { Adjustment: true },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: `Customer with account ${body.globalAcctNo} already exists.` },
        { status: 400 }
      );
    }

    // 1️⃣ Create Customer
    const newCustomer = await prisma.customer.create({
      data: {
        globalAcctNo: body.globalAcctNo,
        customerName: body.customerName,
        region: body.region ?? null,
        businessUnit: body.businessUnit ?? null,
        band: body.band ?? null,
        tariffClass: body.tariffClass ?? null,
        customerType: body.customerType ?? null,
        feederName: body.feederName ?? null,
        feederId: body.feederId ? Number(body.feederId) : null,
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
        adjustmentStartDate: new Date(body.adjustmentStartDate),
        adjustmentEndDate: new Date(body.adjustmentEndDate),
        balanceAfterAdjustment: 0,
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
          feederId: Number(body.feederId),
          month,
          year,
        },
      });

      const tariff = await prisma.tariff.findFirst({
        where: {
          tariffClassId: Number(body.tariffClassId),
          month,
          year,
        },
      });

      if (consumption && tariff) {
        const amount = Number(consumption.consumption) * Number(tariff.rate);

        await prisma.adjustmentItem.create({
          data: {
            adjustmentId: adjustment.id,
            month,
            year,
            consumption: consumption.consumption,
            tariff: tariff.rate,
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

