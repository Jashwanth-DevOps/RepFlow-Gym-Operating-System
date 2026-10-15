import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    const rawMembers = await prisma.member.findMany({ orderBy: { id: 'asc' } }).catch(() => []);
    const rawLeads = await prisma.lead.findMany({ orderBy: { id: 'desc' } }).catch(() => []);
    const rawTrainers = await prisma.trainer.findMany({ orderBy: { id: 'desc' } }).catch(() => []);
    const rawPayments = await prisma.payment.findMany({ orderBy: { id: 'desc' } }).catch(() => []);
    const rawExpenses = await prisma.expense.findMany({ orderBy: { id: 'desc' } }).catch(() => []);
    const gymProfile = await prisma.gymProfile.findFirst().catch(() => null);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "attendance" (
        "id" TEXT PRIMARY KEY,
        "memberId" TEXT NOT NULL,
        "memberCode" TEXT NOT NULL,
        "memberName" TEXT NOT NULL,
        "date" TEXT NOT NULL,
        "time" TEXT NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `).catch(() => null);

    const rawAttendance: any[] = await prisma.$queryRawUnsafe(`
      SELECT * FROM "attendance" ORDER BY "createdAt" DESC
    `).catch(() => []);

    const members = (rawMembers || []).map((m: any, idx: number) => {
      const code = `IT${1001 + idx}`;
      return {
        id: m.id,
        name: m.name || 'Member',
        phone: m.phone || '',
        gender: m.gender || 'Male',
        plan: m.plan || 'Quarterly',
        startDate: m.startDate || new Date().toISOString().split('T')[0],
        expires: m.expires || new Date().toISOString().split('T')[0],
        status: m.status || 'Active',
        dues: Number(m.dues || 0),
        dueAmount: Number(m.dues || 0),
        code: code,
        daysLeft: 90,
        paymentsCount: 1,
        lastActivity: m.startDate || 'Recent'
      };
    });

    const trainers = (rawTrainers || []).map((t: any) => ({
      id: t.id,
      name: t.name || 'Trainer',
      email: (t as any).email || `${t.phone}@gym.com`,
      phone: t.phone || '',
      password: (t as any).password || 'password123',
      specialty: t.specialty || 'Strength & Conditioning',
      active: t.active !== false
    }));

    const payments = (rawPayments || []).map((p: any) => ({
      id: p.id,
      receipt: p.receipt || 'RCPT-1001',
      member: p.member || 'Member',
      phone: p.phone || '',
      amount: Number(p.amount || 0),
      method: p.method || 'UPI',
      plan: p.plan || 'Membership',
      note: p.note || '',
      date: p.date || new Date().toISOString().split('T')[0]
    }));

    const expenses = (rawExpenses || []).map((e: any) => ({
      id: e.id,
      title: e.title || 'General Expense',
      amount: Number(e.amount || 0),
      category: e.category || 'Maintenance',
      date: e.date || new Date().toISOString().split('T')[0]
    }));

    return NextResponse.json({
      gymProfile: gymProfile || {
        name: 'Iron Temple Fitness',
        branch: 'Indiranagar, Bengaluru',
        phone: '9845012345',
        publicUrl: 'https://rep-flow-gym-operating-system-4o78.vercel.app'
      },
      billingSettings: {
        receiptType: 'GST tax invoice',
        gstin: '29AABCI1234F1Z8',
        taxPercent: 18,
        maxStaffDiscount: 20
      },
      members,
      leads: rawLeads || [],
      trainers,
      payments,
      expenses,
      ptAssignments: [],
      attendance: Array.isArray(rawAttendance) ? rawAttendance : [],
      plans: [
        { id: 'P1', name: 'Monthly', days: 30, sessions: 'Standard Gym Access', price: 1500 },
        { id: 'P2', name: 'Quarterly', days: 90, sessions: 'Standard Gym Access', price: 4000 },
        { id: 'P3', name: 'Half-yearly', days: 180, sessions: 'Standard Gym Access', price: 7000 },
        { id: 'P4', name: 'Annual', days: 365, sessions: 'Standard Gym Access', price: 12000 }
      ]
    }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}