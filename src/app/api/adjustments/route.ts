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

// ✅ GET all adjustments
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { username: true } },
        Adjustment: {
          orderBy: { adjustmentStartDate: "desc" },
          include: {
            items: { orderBy: [{ year: "asc" }, { month: "asc" }] },
          },
        },
      },
    });

    return NextResponse.json(customers, { status: 200 });
  } catch (error) {
    console.error("❌ GET /api/adjustments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch adjustments. Please try again later." },
      { status: 500 }
    );
  }
}

// ✅ POST create adjustment
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
    }

    const userId = (session as any).user?.id;
    const role = (session as any).user?.role;

    if (!userId || role !== "CCRO") {
      return NextResponse.json(
        { error: "You do not have permission to perform this action." },
        { status: 403 }
      );
    }

    const body = await req.json();

    // 🔎 Validate required fields
    if (!body.globalAcctNo || !body.customerName) {
      return NextResponse.json(
        { error: "Global Account No and Customer Name are required." },
        { status: 422 }
      );
    }

    if (!body.adjustmentStartDate || !body.adjustmentEndDate) {
      return NextResponse.json(
        { error: "Adjustment start and end dates are required." },
        { status: 422 }
      );
    }

    // 🔎 0️⃣ Check if customer already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { globalAcctNo: body.globalAcctNo },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: `Customer with account ${body.globalAcctNo} already exists.` },
        { status: 409 } // conflict
      );
    }

    function parseDate(value: any): Date | null {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
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
        adjustmentStartDate: new Date(body.adjustmentStartDate),
        adjustmentEndDate: new Date(body.adjustmentEndDate),
        premiseVisit: body.premiseVisit ?? null,            
        premiseType: body.premiseType ?? null,
        adjustmentPeriod: body.adjustmentPeriod ? parseFloat(body.adjustmentPeriod) : null,
        avgConsumption: body.avgConsumption ? parseFloat(body.avgConsumption) : null,
        currentTotalAmount: body.currentTotalAmount ? parseFloat(body.currentTotalAmount) : null,
        avgBilledAmount: body.avgBilledAmount ? parseFloat(body.avgBilledAmount) : null,
        proposedAdjustment: body.proposedAdjustment ? parseFloat(body.proposedAdjustment) : null,
        previousAdjustment: body.previousAdjustment ? parseFloat(body.previousAdjustment) : null,
        finalAdjustment: body.finalAdjustment ? parseFloat(body.finalAdjustment) : null,
        adjustmentType: body.adjustmentType ?? null,
        defaultCapUnit: body.defaultCapUnit ? parseFloat(body.defaultCapUnit) : null,
        marketerName: body.marketerName ?? null,            
        feedbackMarketer: body.feedbackMarketer ?? null,        
        pictorialEvidence: body.pictorialEvidence ?? null,           
        previousReading: body.previousReading ?? null,         
        lastReadDate: parseDate(body.lastReadDate),
        presentReading: body.presentReading ? parseFloat(body.presentReading) : null,
        meterNumber: body.meterNumber ?? null,
        totalConsumption: body.totalConsumption ? parseFloat(body.totalConsumption) : null,
        readingConsistent: body.readingConsistent ?? null,
        pictureReading: body.pictureReading ?? null,          
        pictureReadingDate: parseDate(body.pictureReadingDate), 
        resultantBillingAmount: body.resultantBillingAmount ? parseFloat(body.resultantBillingAmount) : null,
        ccroremarks: body.ccroremarks ?? null,
        status: "Pending",
        approvalStage: "HCC",
        createdById: Number(userId),
      },
      include: {
        createdBy: { select: { username: true } },
      },
    });

    // 2️⃣ Create Adjustment
    const adjustment = await prisma.adjustment.create({
      data: {
        customerId: newCustomer.id,
        adjustmentAmount: body.adjustmentAmount,
        adjustmentStartDate: new Date(body.adjustmentStartDate),
        adjustmentEndDate: new Date(body.adjustmentEndDate),
        balanceAfterAdjustment: body.balanceAfterAdjustment,
      },
    });

    // 3️⃣ Generate AdjustmentItems
    const months = getMonthRange(
      new Date(body.adjustmentStartDate),
      new Date(body.adjustmentEndDate)
    );

    let totalAmount = 0;

    for (const { month, year } of months) {
      const [consumption, tariff] = await Promise.all([
        prisma.consumption.findFirst({
          where: { feederId: Number(body.feederId), month, year },
        }),
        prisma.tariff.findFirst({
          where: { tariffClassId: Number(body.tariffClassId), month, year },
        }),
      ]);

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
  } catch (error: any) {
    console.error("❌ POST /api/adjustments error:", error);

    // Handle Prisma-specific errors
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Duplicate record detected (unique constraint failed)." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create adjustment. Please try again later." },
      { status: 500 }
    );
  }
}
