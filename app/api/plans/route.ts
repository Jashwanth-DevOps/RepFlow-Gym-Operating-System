import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    const plans: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "Plan" ORDER BY "price" ASC`).catch(() => []);
    return NextResponse.json({ success: true, plans });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, days, price, sessions } = await req.json();
    const id = `plan_${Date.now()}`;

    await prisma.$executeRawUnsafe(
      `INSERT INTO "Plan" ("id", "name", "days", "price", "sessions", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      id, name, Number(days || 30), Number(price || 1500), sessions || 'Standard Gym Access'
    );

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
