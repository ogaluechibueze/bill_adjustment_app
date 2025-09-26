import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// ✅ Correct params typing for Next 15
interface RouteContext {
  params: { id: string };
}

// Utility to parse and validate the numeric id
function parseId(id: string): number {
  const num = Number(id);
  if (Number.isNaN(num)) throw new Error("Invalid ID");
  return num;
}

export async function GET(
  _req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseId(params.id) },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /users/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { id: _id, createdAt, updatedAt, ...data } = body;

    // Hash password if provided
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: parseId(params.id) },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /users/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  try {
    await prisma.user.delete({
      where: { id: parseId(params.id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /users/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, context: any): Promise<NextResponse> {
  const { id } = context.params as { id: string };   // 👈 manual cast

  const data = await req.json();
  const updated = await prisma.customer.update({
    where: { id: parseInt(id, 10) },
    data,
  });

  return NextResponse.json(updated);
}