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
    const cleanPass = (newPassword || '').trim();

    if (!cleanEmail || !cleanPass) {
      return NextResponse.json({ success: false, message: 'Email and new password required.' }, { status: 400 });
    }

    // 1. Update or create in User table
    await prisma.user.upsert({
      where: { email: cleanEmail },
      update: { password: cleanPass },
      create: {
        email: cleanEmail,
        password: cleanPass,
        name: cleanEmail === 'owner@gym.com' ? 'Gym Owner' : 'Trainer',
        role: cleanEmail === 'owner@gym.com' ? 'OWNER' : 'TRAINER'
      }
    });

    // 2. Also update in Trainer table if it exists
    await prisma.$executeRawUnsafe(
      `UPDATE "Trainer" SET "password" = $1 WHERE LOWER("email") = $2`,
      cleanPass, cleanEmail
    ).catch(() => null);

    return NextResponse.json({ success: true, message: 'Password updated successfully.' });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}