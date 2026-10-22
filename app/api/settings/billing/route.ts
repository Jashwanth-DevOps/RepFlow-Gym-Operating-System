import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    const { receiptType, gstin, taxPercent, maxStaffDiscount } = await req.json();

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "BillingSettings" (
        "id" TEXT PRIMARY KEY,
        "receiptType" TEXT,
        "gstin" TEXT,
        "taxPercent" DOUBLE PRECISION,
        "maxStaffDiscount" DOUBLE PRECISION,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `).catch(() => null);

    await prisma.$executeRawUnsafe(
      `INSERT INTO "BillingSettings" ("id", "receiptType", "gstin", "taxPercent", "maxStaffDiscount", "updatedAt")
       VALUES ('billing_default', $1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT ("id") DO UPDATE 
       SET "receiptType" = EXCLUDED."receiptType",
           "gstin" = EXCLUDED."gstin",
           "taxPercent" = EXCLUDED."taxPercent",
           "maxStaffDiscount" = EXCLUDED."maxStaffDiscount",
           "updatedAt" = CURRENT_TIMESTAMP`,
      receiptType || 'GST tax invoice',
      gstin || '29AABCI1234F1Z8',
      Number(taxPercent || 18),
      Number(maxStaffDiscount || 20)
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
