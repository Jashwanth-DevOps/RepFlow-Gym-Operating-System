import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    await prisma.$executeRawUnsafe(`DELETE FROM "pt_assignments" WHERE "id" = $1`, id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await req.json();
    const { member, trainer, sessions, price, startDate, endDate } = body;

    await prisma.$executeRawUnsafe(
      `UPDATE "pt_assignments" 
       SET "member" = $1, "trainer" = $2, "sessions" = $3, "price" = $4, "startDate" = $5, "endDate" = $6, "updatedAt" = CURRENT_TIMESTAMP
       WHERE "id" = $7`,
      member, trainer, Number(sessions), Number(price), startDate, endDate, id
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
