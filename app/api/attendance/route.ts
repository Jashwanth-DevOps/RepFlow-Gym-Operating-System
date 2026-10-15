import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberId, memberCode, memberName, plan, phone, date, time } = body;

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "attendance" (
        "id" TEXT PRIMARY KEY,
        "memberId" TEXT NOT NULL,
        "memberCode" TEXT,
        "memberName" TEXT NOT NULL,
        "plan" TEXT,
        "phone" TEXT,
        "date" TEXT NOT NULL,
        "time" TEXT NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `).catch(() => null);

    const id = 'att_' + Date.now();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "attendance" ("id", "memberId", "memberCode", "memberName", "plan", "phone", "date", "time")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      id,
      memberId || '',
      memberCode || 'IT1001',
      memberName || 'Member',
      plan || 'Standard',
      phone || '',
      date || new Date().toISOString().split('T')[0],
      time || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    );

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}