import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

async function initTables() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "attendance" (
      "id" TEXT PRIMARY KEY,
      "memberId" TEXT NOT NULL,
      "memberCode" TEXT NOT NULL,
      "memberName" TEXT NOT NULL,
      "date" TEXT NOT NULL,
      "time" TEXT NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `).catch(() => null);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "trainer_auth" (
      "email" TEXT PRIMARY KEY,
      "password" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "phone" TEXT,
      "role" TEXT NOT NULL DEFAULT 'Trainer'
    );
  `).catch(() => null);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "owner_auth" (
      "email" TEXT PRIMARY KEY,
      "password" TEXT NOT NULL
    );
    INSERT INTO "owner_auth" ("email", "password")
    VALUES ('owner@gym.com', 'password123')
    ON CONFLICT ("email") DO NOTHING;
  `).catch(() => null);
}

export async function POST(request: Request) {
  try {
    await initTables();
    const body = await request.json();
    const { memberId, memberCode, memberName, date, time } = body;

    if (!memberCode || !memberName) {
      return NextResponse.json({ error: 'Missing member details' }, { status: 400 });
    }

    const checkDate = date || new Date().toISOString().split('T')[0];
    const checkTime = time || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const id = 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    await prisma.$executeRawUnsafe(
      `INSERT INTO "attendance" ("id", "memberId", "memberCode", "memberName", "date", "time")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      id, memberId || memberCode, memberCode, memberName, checkDate, checkTime
    );

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}