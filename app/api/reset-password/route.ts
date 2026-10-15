import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(request: Request) {
  try {
    const { email, newPassword } = await request.json();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (newPassword || '').trim();

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json({ error: 'Email and new password are required.' }, { status: 400 });
    }

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "gym_credentials" (
        "email" TEXT PRIMARY KEY,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "name" TEXT NOT NULL
      )
    `).catch(() => null);

    await prisma.$executeRawUnsafe(`
      INSERT INTO "gym_credentials" ("email", "password", "role", "name")
      VALUES ($1, $2, $3, $4)
      ON CONFLICT ("email") DO UPDATE SET "password" = $2
    `, cleanEmail, cleanPassword, cleanEmail === 'owner@gym.com' ? 'Owner' : 'Trainer', cleanEmail === 'owner@gym.com' ? 'Gym Owner' : 'Staff');

    return NextResponse.json({ success: true, message: 'Password updated successfully.' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}