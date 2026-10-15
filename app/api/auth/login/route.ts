import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

async function seedDefaultOwner() {
  try {
    const owner = await prisma.user.findUnique({ where: { email: 'owner@gym.com' } });
    if (!owner) {
      await prisma.user.create({
        data: {
          email: 'owner@gym.com',
          name: 'Gym Owner',
          password: 'password123',
          role: 'OWNER'
        }
      });
    }
  } catch (e) {}
}

export async function POST(request: Request) {
  try {
    await seedDefaultOwner();
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required.' }, { status: 400 });
    }

    // 1. Check User table in Neon
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      if (user.password !== password) {
        return NextResponse.json({ success: false, message: 'Invalid password. Access denied.' }, { status: 401 });
      }
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name || 'User',
          email: user.email,
          role: user.role === 'OWNER' ? 'Owner' : user.role === 'TRAINER' ? 'Trainer' : user.role === 'ACCOUNTANT' ? 'Accountant' : 'Staff'
        }
      });
    }

    // 2. Check Trainer table by email or phone
    const trainers = await prisma.trainer.findMany().catch(() => []);
    const matchTrainer = trainers.find((t: any) => {
      const tEmail = ((t as any).email || `${t.phone}@gym.com`).toLowerCase();
      return tEmail === email || t.phone === email;
    });

    if (matchTrainer) {
      const expectedPassword = (matchTrainer as any).password || 'password123';
      if (password !== expectedPassword) {
        return NextResponse.json({ success: false, message: 'Invalid password.' }, { status: 401 });
      }
      return NextResponse.json({
        success: true,
        user: {
          id: matchTrainer.id,
          name: matchTrainer.name,
          email: email,
          role: 'Trainer'
        }
      });
    }

    return NextResponse.json({ success: false, message: 'Account not found.' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}