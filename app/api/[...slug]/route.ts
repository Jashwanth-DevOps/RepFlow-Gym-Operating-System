import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET(request: Request, { params }: { params: { slug: string[] } }) {
  const endpoint = params.slug ? params.slug.join('/') : '';

  if (endpoint === 'data') {
    try {
      const [members, payments, expenses, gymProfile] = await Promise.all([
        prisma.member.findMany({ orderBy: { id: 'desc' } }).catch(() => []),
        prisma.payment.findMany({ orderBy: { id: 'desc' } }).catch(() => []),
        prisma.expense.findMany({ orderBy: { id: 'desc' } }).catch(() => []),
        prisma.gymProfile.findFirst().catch(() => null)
      ]);

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
        members: members || [],
        payments: payments || [],
        expenses: expenses || [],
        leads: [],
        trainers: [],
        ptAssignments: [],
        plans: [
          { id: 'P1', name: 'Monthly', days: 30, sessions: 'Standard Gym Access', price: 1500 },
          { id: 'P2', name: 'Quarterly', days: 90, sessions: 'Standard Gym Access', price: 4000 },
          { id: 'P3', name: 'Half-yearly', days: 180, sessions: 'Standard Gym Access', price: 7000 },
          { id: 'P4', name: 'Annual', days: 365, sessions: 'Standard Gym Access', price: 12000 }
        ],
        staff: [
          { id: 'S1', name: 'Gym Owner', email: 'owner@gym.com', role: 'Owner', active: true }
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
      });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

export async function POST(request: Request, { params }: { params: { slug: string[] } }) {
  const endpoint = params.slug ? params.slug.join('/') : '';
  let body: any = {};
  try { body = await request.json(); } catch (e) {}

  if (endpoint === 'members') {
    const cleanPhone = (body.phone || '').replace(/[^0-9]/g, '');
    const created = await prisma.member.create({
      data: {
        name: body.name,
        phone: cleanPhone,
        gender: body.gender || 'Male',
        plan: body.plan || 'Monthly',
        startDate: body.startDate || new Date().toISOString().split('T')[0],
        expires: body.expires || new Date().toISOString().split('T')[0],
        status: 'Active',
        dues: Number(body.dues || 0)
      }
    });

    if (body.totalPaid && Number(body.totalPaid) > 0) {
      await prisma.payment.create({
        data: {
          receipt: 'RCPT-' + Math.floor(1000 + Math.random() * 9000),
          member: body.name,
          phone: cleanPhone,
          amount: Number(body.totalPaid),
          method: body.paymentMethod || 'Cash',
          plan: body.plan || 'Monthly',
          date: body.startDate || new Date().toISOString().split('T')[0]
        }
      }).catch(() => null);
    }

    return NextResponse.json({ success: true, member: created });
  }

  if (endpoint === 'payments') {
    const p = await prisma.payment.create({
      data: {
        receipt: 'RCPT-' + Math.floor(1000 + Math.random() * 9000),
        member: body.member,
        phone: body.phone,
        amount: Number(body.amount || 0),
        method: body.method || 'Cash',
        plan: body.plan || 'Membership',
        note: body.note || '',
        date: body.date || new Date().toISOString().split('T')[0]
      }
    });
    return NextResponse.json({ success: true, payment: p });
  }

  if (endpoint === 'expenses') {
    const exp = await prisma.expense.create({
      data: {
        category: body.category,
        paidTo: body.paidTo,
        amount: Number(body.amount || 0),
        method: body.method || 'Cash',
        date: body.date || new Date().toISOString().split('T')[0]
      }
    });
    return NextResponse.json({ success: true, expense: exp });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: { params: { slug: string[] } }) {
  const endpoint = params.slug ? params.slug.join('/') : '';
  const id = endpoint.split('/')[1];

  if (endpoint.startsWith('expenses/')) {
    await prisma.expense.delete({ where: { id } }).catch(() => null);
    return NextResponse.json({ success: true });
  }

  if (endpoint.startsWith('members/')) {
    await prisma.member.delete({ where: { id } }).catch(() => null);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: true });
}