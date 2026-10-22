import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      name, phone, gender, plan, planPrice, startDate, expires, dues, 
      admissionFee, ptTrainer, ptSessions, ptPrice, discountPercent, 
      discountAmount, taxPercent, taxAmount, grandTotal, paidAmount, paymentMethod 
    } = body;

    const countRes: any[] = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as total FROM "Member"`).catch(() => [{ total: 0 }]);
    const nextNum = (countRes[0]?.total || 0) + 1;
    const memberCode = `IT${1000 + nextNum}`;
    const id = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const todayStr = new Date().toISOString().split('T')[0];
    const receiptNo = `RCPT-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Insert Member with accurate invoice details & balance due
    await prisma.$executeRawUnsafe(
      `INSERT INTO "Member" (
        "id", "name", "phone", "gender", "plan", "planPrice", "startDate", "expires", 
        "status", "dues", "code", "admissionFee", "ptTrainer", "ptSessions", "ptPrice", 
        "discountPercent", "discountAmount", "taxPercent", "taxAmount", "grandTotal", 
        "paidAmount", "paymentMethod", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, 'Active', $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )`,
      id, name, phone, gender || 'Male', plan || 'Quarterly', Number(planPrice || 4000),
      startDate, expires, Number(dues || 0), memberCode, Number(admissionFee || 0),
      ptTrainer || '', Number(ptSessions || 0), Number(ptPrice || 0),
      Number(discountPercent || 0), Number(discountAmount || 0), Number(taxPercent || 0),
      Number(taxAmount || 0), Number(grandTotal || 0), Number(paidAmount || 0), paymentMethod || 'UPI'
    );

    // 2. Insert SINGLE payment entry (no duplicates)
    if (Number(paidAmount) > 0) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "Payment" ("id", "receipt", "member", "phone", "amount", "method", "plan", "note", "date", "operator", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        `pay_${Date.now()}`, receiptNo, name, phone, Number(paidAmount), paymentMethod || 'UPI',
        `${plan} Membership`, 'Member initial registration fee', todayStr, 'Owner'
      ).catch(() => null);
    }

    // 3. Assign PT record if selected
    if (ptTrainer && Number(ptSessions) > 0) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "pt_assignments" ("id", "trainer", "member", "sessions", "price", "method", "startDate", "endDate", "operator", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Owner', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        `pt_${Date.now()}`, ptTrainer, name, Number(ptSessions), Number(ptPrice), paymentMethod || 'UPI', startDate, expires
      ).catch(() => null);
    }

    return NextResponse.json({
      success: true,
      member: {
        id, code: memberCode, name, phone, plan, planPrice, dues: Number(dues),
        admissionFee, ptTrainer, ptSessions, ptPrice, grandTotal, paidAmount, paymentMethod,
        startDate, expires, receipt: receiptNo
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
