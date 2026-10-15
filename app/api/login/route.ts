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

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "gym_credentials" (
        "email" TEXT PRIMARY KEY,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "name" TEXT NOT NULL
      )
    `).catch(() => null);

    const creds: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM "gym_credentials" WHERE LOWER("email") = $1`, cleanEmail
    ).catch(() => []);

    if (cleanEmail === 'owner@gym.com') {
      const expectedPassword = creds.length > 0 ? creds[0].password : 'password123';
      if (cleanPassword !== expectedPassword) {
        return NextResponse.json({ error: 'Invalid password. Please check your password.' }, { status: 401 });
      }
      return NextResponse.json({
        success: true,
        user: { name: 'Gym Owner', email: 'owner@gym.com', role: 'Owner' }
      });
    }

    if (creds.length > 0) {
      if (creds[0].password !== cleanPassword) {
        return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
      }
      return NextResponse.json({
        success: true,
        user: { name: creds[0].name, email: creds[0].email, role: creds[0].role }
      });
    }

    const trainers = await prisma.trainer.findMany().catch(() => []);
    const matchTrainer: any = trainers.find((t: any) => {
      const tEmail = ((t as any).email || `${t.phone}@gym.com`).toLowerCase();
      return tEmail === cleanEmail || (t.phone && t.phone === cleanEmail);
    });

    if (matchTrainer) {
      const tPass = matchTrainer.password || 'password123';
      if (cleanPassword !== tPass) {
        return NextResponse.json({ error: 'Invalid password for trainer.' }, { status: 401 });
      }
      return NextResponse.json({
        success: true,
        user: { name: matchTrainer.name, email: matchTrainer.email || cleanEmail, role: 'Trainer' }
      });
    }

    return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}