import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, paidTo, amount, method, date } = body;
    const id = `exp_${Date.now()}`;

    await prisma.$executeRawUnsafe(
      `INSERT INTO "Expense" ("id", "category", "paidTo", "title", "amount", "method", "date", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      id, category || 'General', paidTo || 'Vendor', Number(amount || 0), method || 'UPI', date || new Date().toISOString().split('T')[0]
    );

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
