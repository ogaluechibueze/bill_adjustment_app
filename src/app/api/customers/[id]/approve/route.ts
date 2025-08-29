import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Stage, Status } from "@prisma/client";

const nextStageMap: Record<Stage, Stage | null> = {
  CCRO: Stage.CCO,
  CCO: Stage.CAO,
  CAO: Stage.MD,
  MD: null,
};

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Current user role (Stage level)
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

  // Only current stage owner can approve
  if (item.approvalStage !== role) {
    return NextResponse.json(
      { error: `Only ${item.approvalStage} can approve at this stage.` },
      { status: 403 }
    );
  }

  const body = await req.json();
  const comment = body.comment as string | undefined;

  // ✅ Map role → remarks field
  const remarksFieldMap: Record<Stage, keyof typeof item> = {
    CCRO: "ccroremarks",
    CCO: "ccoremarks",
    CAO: "caoremarks",
    MD: "mdremarks",
  };

  const remarksField = remarksFieldMap[role];

  const nextStage = nextStageMap[item.approvalStage];
  const isFinal = nextStage === null;

  const updated = await prisma.customer.update({
    where: { id },
    data: {
      [remarksField]: comment ?? null,
      approvalStage: nextStage ?? item.approvalStage,
      status: isFinal ? Status.Approved : Status.Pending,
    },
  });

  return NextResponse.json(updated);
}
