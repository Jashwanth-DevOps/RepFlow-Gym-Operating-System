import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (newPassword || '').trim();

    if (!cleanEmail || !cleanPass) {
      return NextResponse.json({ success: false, message: 'Email and new password required.' }, { status: 400 });
    }

    // 1. Update Trainer password if it's a trainer
    await prisma.$executeRawUnsafe(
      `UPDATE "Trainer" SET "password" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE LOWER("email") = $2`,
      cleanPass, cleanEmail
    ).catch(() => null);

    // 2. Update User password
    const userUpdate = await prisma.$executeRawUnsafe(
      `UPDATE "User" SET "password" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE LOWER("email") = $2`,
      cleanPass, cleanEmail
    ).catch(() => 0);

    // 3. If user doesn't exist yet, insert them safely
    if (userUpdate === 0) {
      const id = `usr_${Date.now()}`;
      await prisma.$executeRawUnsafe(
        `INSERT INTO "User" ("id", "name", "email", "password", "role", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, 'OWNER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT ("email") DO UPDATE SET "password" = EXCLUDED."password"`,
        id, cleanEmail.split('@')[0], cleanEmail, cleanPass
      ).catch(() => null);
    }

    return NextResponse.json({ success: true, message: 'Password reset successfully!' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
