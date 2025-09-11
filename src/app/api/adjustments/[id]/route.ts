import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ GET a single customer with their adjustments + items
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ⬇️ Await params before using
    const { id } = await context.params;
    const customerId = parseInt(id, 10);

    if (isNaN(customerId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
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

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("GET /api/adjustments/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer details" },
      { status: 500 }
    );
  }
}
