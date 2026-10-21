import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    const { name, branch, phone, publicUrl } = await req.json();

    const existing: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "GymProfile" LIMIT 1`).catch(() => []);
    
    if (existing.length > 0) {
      await prisma.$executeRawUnsafe(
        `UPDATE "GymProfile" SET "name" = $1, "branch" = $2, "phone" = $3, "publicUrl" = $4, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $5`,
        name, branch, phone, publicUrl, existing[0].id
      );
    } else {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "GymProfile" ("id", "name", "branch", "phone", "publicUrl", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        'gym_default', name, branch, phone, publicUrl
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
