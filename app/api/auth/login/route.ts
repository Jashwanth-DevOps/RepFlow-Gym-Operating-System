import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanEmail || !cleanPass) {
      return NextResponse.json({ success: false, message: 'Email and password required' }, { status: 400 });
    }

    // 1. Check Demo Accounts
    const defaultAccounts: Record<string, { name: string; role: string; pass: string }> = {
      'owner@gym.com': { name: 'Gym Owner', role: 'Owner', pass: 'password123' },
      'manager@gym.com': { name: 'Priya Nair', role: 'Manager', pass: 'password123' },
      'desk@gym.com': { name: 'Rahul Gowda', role: 'Front desk', pass: 'password123' },
      'ca@gym.com': { name: 'CA Suresh Bhat', role: 'Accountant', pass: 'password123' }
    };

    if (defaultAccounts[cleanEmail]) {
      const match = defaultAccounts[cleanEmail];
      if (cleanPass !== match.pass) {
        return NextResponse.json({ success: false, message: 'Invalid password. Access denied.' }, { status: 401 });
      }
      return NextResponse.json({
        success: true,
        user: { id: `acc_${cleanEmail.split('@')[0]}`, name: match.name, email: cleanEmail, role: match.role }
      });
    }

    // 2. Check Trainer Table (FIXES: Trainer login from website)
    const trainers: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Trainer" WHERE LOWER("email") = $1 LIMIT 1`, cleanEmail
    ).catch(() => []);

    if (trainers.length > 0) {
      const tr = trainers[0];
      if (tr.password !== cleanPass) {
        return NextResponse.json({ success: false, message: 'Invalid password. Access denied.' }, { status: 401 });
      }
      return NextResponse.json({
        success: true,
        user: { id: tr.id, name: tr.name, email: tr.email, role: 'Trainer' }
      });
    }

    // 3. Check User Table
    const users: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM "User" WHERE LOWER("email") = $1 LIMIT 1`, cleanEmail
    ).catch(() => []);

    if (users.length > 0) {
      const u = users[0];
      if (u.password !== cleanPass) {
        return NextResponse.json({ success: false, message: 'Invalid password. Access denied.' }, { status: 401 });
      }
      return NextResponse.json({
        success: true,
        user: { id: u.id, name: u.name, email: u.email, role: u.role === 'OWNER' ? 'Owner' : u.role }
      });
    }

    return NextResponse.json({ success: false, message: 'Account not found.' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
