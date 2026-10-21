import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await req.json();
    const { name, phone, plan, status, dues, startDate, expires } = body;

    await prisma.$executeRawUnsafe(
      `UPDATE "Member" 
       SET "name" = COALESCE($1, "name"),
           "phone" = COALESCE($2, "phone"),
           "plan" = COALESCE($3, "plan"),
           "status" = COALESCE($4, "status"),
           "dues" = $5,
           "startDate" = COALESCE($6, "startDate"),
           "expires" = COALESCE($7, "expires"),
           "updatedAt" = CURRENT_TIMESTAMP
       WHERE "id" = $8 OR "code" = $8`,
      name, phone, plan, status, Number(dues || 0), startDate, expires, id
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
