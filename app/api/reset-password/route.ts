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
      return NextResponse.json({ error: 'Email and new password are required' }, { status: 400 });
    }

    if (cleanEmail === 'owner@gym.com') {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "owner_auth" ("email", "password") VALUES ($1, $2)
         ON CONFLICT ("email") DO UPDATE SET "password" = $2`,
        cleanEmail, cleanPassword
      );
      return NextResponse.json({ success: true, message: 'Owner password reset successfully' });
    }

    await prisma.$executeRawUnsafe(
      `UPDATE "trainer_auth" SET "password" = $1 WHERE LOWER("email") = $2`,
      cleanPassword, cleanEmail
    );

    return NextResponse.json({ success: true, message: 'Password reset successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}