import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Stage, Status } from "@prisma/client";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session as any)?.user?.role as Stage | undefined;
  if (!role) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const item = await prisma.customer.findUnique({ where: { id } });
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only current stage owner can reject
  if (item.approvalStage !== role) {
    return NextResponse.json(
      { error: `Only ${item.approvalStage} can reject at this stage.` },
      { status: 403 }
    );
  }

  const body = await req.json();
  const comment = body.comment as string | undefined;

  // ✅ Map role → remarks field
  const remarksFieldMap: Record<Stage, keyof typeof item> = {
    CCRO: "ccroremarks",
    HCC:  "hccremarks",
    BM:   "bmremarks",
    RH:   "rhremarks",
    RA:   "raremarks",
    IA:   "iaremarks",
    CIA:  "ciaremarks",
    MD:   "mdremarks",
  };

  const remarksField = remarksFieldMap[role];

  const updated = await prisma.customer.update({
    where: { id },
    data: {
      [remarksField]: comment ?? null,
      status: Status.Rejected, // ❌ rejected stays at current stage
    },
  });

  return NextResponse.json(updated);
}
