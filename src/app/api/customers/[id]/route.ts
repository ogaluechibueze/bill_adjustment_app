import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';


export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
const id = Number(params.id);
const item = await prisma.customer.findUnique({ where: { id } });
if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
return NextResponse.json(item);
}


export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
const session = await getServerSession(authOptions);
const role = (session as any)?.user?.role as string | undefined;
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });


const id = Number(params.id);
const item = await prisma.customer.findUnique({ where: { id } });
if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });


// Reject means set status = Rejected, keep record.
const updated = await prisma.customer.update({ where: { id }, data: { status: 'Rejected' } });
return NextResponse.json(updated);
}