import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required.' }, { status: 400 });
    }

    // Always check User table first as it holds updated credentials
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

    // Default owner fallback
    if (email === 'owner@gym.com') {
      if (password !== 'password123') {
        return NextResponse.json({ success: false, message: 'Invalid password. Access denied.' }, { status: 401 });
      }
      return NextResponse.json({
        success: true,
        user: { id: 'owner_1', name: 'Gym Owner', email: 'owner@gym.com', role: 'Owner' }
      });
    }

    // Check trainer table
    const trainers = await prisma.trainer.findMany().catch(() => []);
    const matchTrainer: any = trainers.find((t: any) => {
      const tEmail = ((t as any).email || `${t.phone}@gym.com`).toLowerCase();
      return tEmail === email || t.phone === email;
    });

    if (matchTrainer) {
      const expectedPassword = matchTrainer.password || 'password123';
      if (password !== expectedPassword) {
        return NextResponse.json({ success: false, message: 'Invalid password.' }, { status: 401 });
      }
      return NextResponse.json({
        success: true,
        user: { id: matchTrainer.id, name: matchTrainer.name, email: email, role: 'Trainer' }
      });
    }

    return NextResponse.json({ success: false, message: 'Account not found.' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}