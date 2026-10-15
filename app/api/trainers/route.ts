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
    const specialty = body.specialty || 'General Fitness';

    // 1. Create or update in Trainer table
    const trainer = await prisma.trainer.create({
      data: {
        name,
        phone,
        specialty,
        active: true
      }
    });

    // 2. Synchronize credentials directly into User table for instant login
    await prisma.user.upsert({
      where: { email },
      update: {
        name,
        password,
        role: 'TRAINER'
      },
      create: {
        email,
        name,
        password,
        role: 'TRAINER'
      }
    });

    return NextResponse.json({ success: true, trainer });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}