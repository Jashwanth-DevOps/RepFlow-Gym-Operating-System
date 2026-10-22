import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    const { name, email, password, phone, specialty } = await req.json();
    const id = `tr_${Date.now()}`;

    await prisma.$executeRawUnsafe(
      `INSERT INTO "Trainer" ("id", "name", "email", "password", "phone", "specialty", "rating", "active", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, '5.0', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      id, name, email, password || 'password123', phone, specialty || 'Strength & HIIT'
    );

    return NextResponse.json({ success: true, trainer: { id, name, email, phone, specialty } });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, email, password, phone, specialty } = await req.json();

    await prisma.$executeRawUnsafe(
      `UPDATE "Trainer"
       SET "name" = $1, "email" = $2, "password" = $3, "phone" = $4, "specialty" = $5, "updatedAt" = CURRENT_TIMESTAMP
       WHERE "id" = $6`,
      name, email, password, phone, specialty, id
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
