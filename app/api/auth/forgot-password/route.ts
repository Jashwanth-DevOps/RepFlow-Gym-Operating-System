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
      return NextResponse.json({ success: false, message: 'Email and new password required' }, { status: 400 });
    }

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

    const trainers = await prisma.trainer.findMany().catch(() => []);
    for (const t of trainers) {
      const te = ((t as any).email || `${t.phone}@gym.com`).toLowerCase().trim();
      if (te === cleanEmail || t.phone === cleanEmail) {
        await prisma.$executeRawUnsafe(
          `UPDATE "Trainer" SET "password" = $1 WHERE "id" = $2`,
          cleanPass, t.id
        ).catch(() => null);
      }
    }

    return NextResponse.json({ success: true, message: 'Password reset successfully!' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
