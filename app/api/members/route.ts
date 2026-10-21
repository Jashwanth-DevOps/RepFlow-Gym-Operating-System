import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    const members = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Member" ORDER BY "createdAt" ASC`
    ).catch(() => []);
    return NextResponse.json({ success: true, members });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, gender, plan, planPrice, startDate, expires, dues, admissionFee } = body;

    const countRes: any[] = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*)::int as total FROM "Member"`
    ).catch(() => [{ total: 0 }]);
    
    const nextNum = (countRes[0]?.total || 0) + 1;
    const memberCode = `IT${1000 + nextNum}`;
    const id = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await prisma.$executeRawUnsafe(
      `INSERT INTO "Member" ("id", "name", "phone", "gender", "plan", "planPrice", "startDate", "expires", "status", "dues", "code", "admissionFee", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Active', $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      id,
      name,
      phone,
      gender || 'Male',
      plan || 'Quarterly',
      Number(planPrice || 4000),
      startDate,
      expires,
      Number(dues || 0),
      memberCode,
      Number(admissionFee || 0)
    );

    const createdMember = {
      id,
      code: memberCode,
      name,
      phone,
      gender: gender || 'Male',
      plan: plan || 'Quarterly',
      startDate,
      expires,
      status: 'Active',
      dues: Number(dues || 0)
    };

    return NextResponse.json({ success: true, member: createdMember });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
