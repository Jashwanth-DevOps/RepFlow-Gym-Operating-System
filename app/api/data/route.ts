import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    const [rawMembers, rawLeads, rawTrainers, rawPayments, rawExpenses, gymProfile] = await Promise.all([
      prisma.member.findMany({ orderBy: { id: 'asc' } }).catch(() => []),
      prisma.lead.findMany({ orderBy: { id: 'desc' } }).catch(() => []),
      prisma.trainer.findMany({ orderBy: { id: 'desc' } }).catch(() => []),
      prisma.payment.findMany({ orderBy: { id: 'desc' } }).catch(() => []),
      prisma.expense.findMany({ orderBy: { id: 'desc' } }).catch(() => []),
      prisma.gymProfile.findFirst().catch(() => null)
    ]);

    const members = (rawMembers || []).map((m: any, idx: number) => {
      const codeNum = 1001 + idx;
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
        code: `IT${codeNum}`,
        daysLeft: 90,
        paymentsCount: 1,
        lastActivity: m.startDate || 'Recent',
        checkInsCount: 0
      };
    });

    const trainers = (rawTrainers || []).map((t: any) => ({
      id: t.id,
      name: t.name || 'Trainer',
      email: (t as any).email || `${t.phone}@gym.com`,
      phone: t.phone || '',
      specialty: t.specialty || 'Strength & Conditioning',
      active: t.active !== false
    }));

    const staff = [
      { id: 'S1', name: 'Gym Owner', email: 'owner@gym.com', role: 'Owner', active: true },
      ...trainers.map((t: any) => ({
        id: t.id,
        name: t.name,
        email: t.email,
        phone: t.phone,
        role: 'Trainer',
        active: t.active
      }))
    ];

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

    return NextResponse.json(
      {
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
        staff,
        payments,
        expenses,
        ptAssignments: [],
        attendance: [],
        enquiries: [],
        transactions: payments,
        smsLogs: [],
        plans: [
          { id: 'P1', name: 'Monthly', days: 30, sessions: 'Standard Gym Access', price: 1500 },
          { id: 'P2', name: 'Quarterly', days: 90, sessions: 'Standard Gym Access', price: 4000 },
          { id: 'P3', name: 'Half-yearly', days: 180, sessions: 'Standard Gym Access', price: 7000 },
          { id: 'P4', name: 'Annual', days: 365, sessions: 'Standard Gym Access', price: 12000 }
        ],
        permissions: {
          'See revenue dashboard': { Owner: true, Trainer: false, Accountant: true },
          'Check in members': { Owner: true, Trainer: true, Accountant: false },
          'Add & edit members': { Owner: true, Trainer: false, Accountant: false },
          'Manage PT sessions': { Owner: true, Trainer: true, Accountant: false },
          'Collect payments': { Owner: true, Trainer: false, Accountant: true },
          'Record expenses': { Owner: true, Trainer: false, Accountant: true }
        },
        auditLog: []
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}