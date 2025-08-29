import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.user?.role as string | undefined;
  const userId = (session as any)?.user?.id as number | undefined;

  if (!session || !role || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  // 🔑 Restrict data visibility
  let where: any = {};
  if (status) where.status = status as any;

  if (role === "CCRO") {
    // ✅ CCRO only sees their own customers
    where.createdById = userId;
  } else {
    // ✅ Other roles only see customers in their stage
    where.approvalStage = role;
  }

  const items = await prisma.customer.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: {
        select: { id: true, email: true, username: true, role: true },
      },
    },
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.user?.role as string | undefined;
  const userId = (session as any)?.user?.id as number | undefined;

  // Only CCRO can create customers
  if (!session || !userId || role !== "CCRO") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  try {
    const created = await prisma.customer.create({
      data: {
        globalAcctNo: data.globalAcctNo,
        customerName: data.customerName,
        region: data.region ?? null,
        businessUnit: data.businessUnit ?? null,
        band: data.band ?? null,
        feederName: data.feederName ?? null,
        source: data.source ?? null,
        ticketNo: data.ticketNo ?? null,
        initialDebt: data.initialDebt ? new Prisma.Decimal(data.initialDebt) : null,
        adjustmentAmount: data.adjustmentAmount ? new Prisma.Decimal(data.adjustmentAmount) : null,
        balanceAfterAdjustment: data.balanceAfterAdjustment ? new Prisma.Decimal(data.balanceAfterAdjustment) : null,
        adjustmentStartDate: data.adjustmentStartDate ? new Date(data.adjustmentStartDate) : null,
        adjustmentEndDate: data.adjustmentEndDate ? new Date(data.adjustmentEndDate) : null,
        ccroremarks: data.ccroremarks ?? null,

        // ✅ Always set creator
        createdById: userId,

        status: "Pending",
        approvalStage: "CCRO",
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}

export async function DELETE() {
  return NextResponse.json({ error: "Not Implemented" }, { status: 405 });
}
