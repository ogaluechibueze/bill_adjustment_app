import { NextResponse } from "next/server";
import { computeAndUpdateAdjustmentAmount } from "@/lib/services/customerAdjustment";

export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const updated = await computeAndUpdateAdjustmentAmount(id);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
