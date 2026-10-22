import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { member, phone, amount, method, plan, note, date, operator } = body;
    const payAmount = Number(amount || 0);
    const payDate = date ? String(date).split('T')[0] : new Date().toISOString().split('T')[0];
    const id = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const receipt = `RCPT-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Insert Payment Record
    await prisma.$executeRawUnsafe(
      `INSERT INTO "Payment" ("id", "receipt", "member", "phone", "amount", "method", "plan", "note", "date", "operator", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      id, receipt, member, phone || '', payAmount, method || 'Cash', plan || 'Membership', note || '', payDate, operator || 'Owner'
    );

    // 2. Deduct member dues in Member table automatically!
    if (member) {
      await prisma.$executeRawUnsafe(
        `UPDATE "Member" 
         SET "dues" = GREATEST(0, "dues" - $1),
             "updatedAt" = CURRENT_TIMESTAMP
         WHERE LOWER("name") = LOWER($2)`,
        payAmount, member
      ).catch(() => null);
    }

    return NextResponse.json({
      success: true,
      payment: {
        id,
        receipt,
        member,
        phone,
        amount: payAmount,
        method: method || 'Cash',
        plan: plan || 'Membership',
        date: payDate
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
