import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

async function ensureTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "pt_assignments" (
      "id" TEXT PRIMARY KEY,
      "trainer" TEXT NOT NULL,
      "member" TEXT NOT NULL,
      "sessions" INTEGER NOT NULL DEFAULT 12,
      "price" DOUBLE PRECISION NOT NULL DEFAULT 6000,
      "method" TEXT NOT NULL DEFAULT 'UPI',
      "startDate" TEXT NOT NULL,
      "endDate" TEXT NOT NULL,
      "operator" TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `).catch(() => null);
}

export async function POST(request: Request) {
  try {
    await ensureTable();
    const body = await request.json();
    const { trainer, member, sessions, price, method, startDate, endDate, operator } = body;

    const id = 'pt_' + Date.now();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "pt_assignments" ("id", "trainer", "member", "sessions", "price", "method", "startDate", "endDate", "operator")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      id, trainer, member, Number(sessions || 12), Number(price || 6000), method || 'UPI',
      startDate || new Date().toISOString().split('T')[0],
      endDate || new Date().toISOString().split('T')[0],
      operator || 'Admin'
    );

    // Also record the payment fee automatically
    try {
      const receiptNo = 'RCPT-PT-' + Date.now().toString().slice(-4);
      await prisma.payment.create({
        data: {
          receipt: receiptNo,
          member: member,
          phone: '',
          amount: Number(price || 6000),
          method: method || 'UPI',
          plan: `PT with ${trainer}`,
          note: `Personal Training: ${sessions} sessions`,
          date: startDate || new Date().toISOString().split('T')[0]
        }
      });
    } catch (e) {}

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}