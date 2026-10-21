import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    const leads = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Lead" ORDER BY "createdAt" DESC`
    ).catch(() => []);
    return NextResponse.json({ success: true, leads });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, source, followUp, plan, note, stage } = body;
    const id = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    await prisma.$executeRawUnsafe(
      `INSERT INTO "Lead" ("id", "name", "phone", "source", "followUp", "plan", "note", "stage", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      id,
      name,
      phone,
      source || 'Walk-in',
      followUp,
      plan || 'Quarterly',
      note || '',
      stage || 'New'
    );

    return NextResponse.json({
      success: true,
      lead: { id, name, phone, source, followUp, plan, note, stage: stage || 'New' }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
