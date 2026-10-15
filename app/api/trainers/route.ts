import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = body.name || 'Trainer';
    const phone = body.phone || '9999999999';
    const email = (body.email || `${phone}@gym.com`).trim().toLowerCase();
    const password = (body.password || 'password123').trim();
    const specialty = body.specialty || 'Strength & HIIT';

    const trainer = await prisma.trainer.create({
      data: { name, phone, specialty, active: true }
    });

    await prisma.user.upsert({
      where: { email },
      update: { name, password, role: 'TRAINER' },
      create: { email, name, password, role: 'TRAINER' }
    });

    return NextResponse.json({ success: true, trainer: { ...trainer, email, password } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, phone, email, password, specialty } = body;
    const cleanEmail = (email || `${phone}@gym.com`).trim().toLowerCase();
    const cleanPass = (password || 'password123').trim();

    if (id) {
      await prisma.trainer.update({
        where: { id },
        data: { name, phone, specialty }
      }).catch(() => null);
    }

    await prisma.user.upsert({
      where: { email: cleanEmail },
      update: { name, password: cleanPass, role: 'TRAINER' },
      create: { email: cleanEmail, name, password: cleanPass, role: 'TRAINER' }
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}