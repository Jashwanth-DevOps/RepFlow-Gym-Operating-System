import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "owner_auth" (
        "email" TEXT PRIMARY KEY,
        "password" TEXT NOT NULL
      );
      INSERT INTO "owner_auth" ("email", "password")
      VALUES ('owner@gym.com', 'password123')
      ON CONFLICT ("email") DO NOTHING;
    `).catch(() => null);

    if (cleanEmail === 'owner@gym.com') {
      const ownerRows: any[] = await prisma.$queryRawUnsafe(
        `SELECT "password" FROM "owner_auth" WHERE LOWER("email") = $1`, cleanEmail
      ).catch(() => []);

      const expected = ownerRows.length > 0 ? ownerRows[0].password : 'password123';
      if (cleanPassword !== expected) {
        return NextResponse.json({ error: 'Invalid password. Access denied.' }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        user: { name: 'Gym Owner', email: 'owner@gym.com', role: 'Owner' }
      });
    }

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "trainer_auth" (
        "email" TEXT PRIMARY KEY,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "phone" TEXT,
        "role" TEXT NOT NULL DEFAULT 'Trainer'
      );
    `).catch(() => null);

    const trainerRows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM "trainer_auth" WHERE LOWER("email") = $1`, cleanEmail
    ).catch(() => []);

    if (trainerRows.length > 0) {
      if (trainerRows[0].password !== cleanPassword) {
        return NextResponse.json({ error: 'Invalid password. Access denied.' }, { status: 401 });
      }
      return NextResponse.json({
        success: true,
        user: { name: trainerRows[0].name, email: trainerRows[0].email, role: 'Trainer' }
      });
    }

    const legacyTrainers = await prisma.trainer.findMany().catch(() => []);
    const matchLegacy: any = legacyTrainers.find((t: any) => {
      const tEmail = ((t as any).email || `${t.phone}@gym.com`).toLowerCase();
      return tEmail === cleanEmail;
    });

    if (matchLegacy) {
      const expected = (matchLegacy as any).password || 'password123';
      if (cleanPassword !== expected) {
        return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
      }
      return NextResponse.json({
        success: true,
        user: { name: matchLegacy.name, email: cleanEmail, role: 'Trainer' }
      });
    }

    return NextResponse.json({ error: 'Account not found. Please check your email.' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}