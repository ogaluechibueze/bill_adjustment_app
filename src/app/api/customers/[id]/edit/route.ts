import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🔧 helper to expand date range into months
function getMonthRange(start: Date, end: Date) {
  const months: { month: number; year: number }[] = [];
  const cur = new Date(start);

  while (cur <= end) {
    months.push({ month: cur.getMonth() + 1, year: cur.getFullYear() });
    cur.setMonth(cur.getMonth() + 1);
  }

  return months;
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const customerId = Number(params.id);

    // 1️⃣ Update customer
    const customer = await prisma.customer.update({
      where: { id: customerId },
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

    // 2️⃣ Update related Adjustment (if date range provided)
    if (body.adjustmentStartDate && body.adjustmentEndDate) {
      const startDate = new Date(body.adjustmentStartDate);
      const endDate = new Date(body.adjustmentEndDate);

      // find existing adjustment
      let adjustment = await prisma.adjustment.findFirst({
        where: { customerId },
      });

      if (adjustment) {
        // update existing adjustment
        adjustment = await prisma.adjustment.update({
          where: { id: adjustment.id },
          data: {
            startDate,
            endDate,
          },
        });

        // delete old items
        await prisma.adjustmentItem.deleteMany({
          where: { adjustmentId: adjustment.id },
        });

        // rebuild adjustment items
        const months = getMonthRange(startDate, endDate);
        let totalAmount = 0;

        for (const { month, year } of months) {
          const consumption = await prisma.consumption.findFirst({
            where: {
              feeder: { name: customer.feederName ?? "" },
              month,
              year,
            },
          });

          const tariff = await prisma.tariff.findFirst({
            where: {
              tariffClass: body.type ?? customer.band ?? "", // 👈 adjust mapping
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

        // update adjustment total
        await prisma.adjustment.update({
          where: { id: adjustment.id },
          data: { totalAmount },
        });
      }
    }

    return NextResponse.json(customer);
  } catch (err) {
    console.error("[CUSTOMER_EDIT]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
