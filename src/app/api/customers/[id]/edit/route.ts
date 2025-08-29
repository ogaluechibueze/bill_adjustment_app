import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"; // adjust import to your setup

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const customer = await prisma.customer.update({
      where: { id: Number(params.id) },
      data: {
        ...body,
        initialDebt: body.initialDebt ?? null,
        adjustmentAmount: body.adjustmentAmount ?? null,
        balanceAfterAdjustment: body.balanceAfterAdjustment ?? null,
        adjustmentStartDate: body.adjustmentStartDate
          ? new Date(body.adjustmentStartDate)
          : null,
        adjustmentEndDate: body.adjustmentEndDate
          ? new Date(body.adjustmentEndDate)
          : null,
      },
    });

    return NextResponse.json(customer);
  } catch (err) {
    console.error("[CUSTOMER_EDIT]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
