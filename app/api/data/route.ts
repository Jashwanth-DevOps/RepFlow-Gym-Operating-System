import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    const rawMembers: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "Member" ORDER BY "createdAt" ASC`).catch(() => []);
    const rawLeads: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "Lead" ORDER BY "createdAt" DESC`).catch(() => []);
    const rawTrainers: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "Trainer" ORDER BY "createdAt" DESC`).catch(() => []);
    const rawPayments: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "Payment" ORDER BY "createdAt" DESC`).catch(() => []);
    const rawExpenses: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "Expense" ORDER BY "createdAt" DESC`).catch(() => []);
    const rawProfiles: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "GymProfile" LIMIT 1`).catch(() => []);
    const rawAttendance: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "attendance" ORDER BY "createdAt" DESC`).catch(() => []);
    const rawPT: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "pt_assignments" ORDER BY "createdAt" DESC`).catch(() => []);
    const rawPlans: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "Plan" ORDER BY "price" ASC`).catch(() => []);
    const rawBilling: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "BillingSettings" LIMIT 1`).catch(() => []);

    const members = rawMembers.map((m: any, idx: number) => ({
      id: m.id,
      name: m.name || 'Member',
      phone: m.phone || '',
      gender: m.gender || 'Male',
      plan: m.plan || 'Quarterly',
      startDate: m.startDate || new Date().toISOString().split('T')[0],
      expires: m.expires || new Date().toISOString().split('T')[0],
      status: m.status || 'Active',
      dues: Number(m.dues || 0),
      code: m.code || `IT${1001 + idx}`
    }));

    // Keep actual owner-created email and password
    const trainers = rawTrainers.map((t: any) => ({
      id: t.id,
      name: t.name || 'Trainer',
      email: t.email || '',
      phone: t.phone || '',
      password: t.password || 'password123',
      specialty: t.specialty || 'Strength & HIIT',
      rating: t.rating || '5.0',
      active: t.active !== false
    }));

    const payments = rawPayments.map((p: any) => ({
      id: p.id,
      receipt: p.receipt || 'RCPT-1001',
      member: p.member || 'Member',
      phone: p.phone || '',
      amount: Number(p.amount || 0),
      method: p.method || 'UPI',
      plan: p.plan || 'Membership',
      note: p.note || '',
      date: p.date ? String(p.date).split('T')[0] : new Date().toISOString().split('T')[0]
    }));

    // Map expense fields so PDF displays paidTo and method without 'undefined'
    const expenses = rawExpenses.map((e: any) => ({
      id: e.id,
      category: e.category || 'General',
      paidTo: e.paidTo || e.title || 'Vendor',
      title: e.paidTo || e.title || 'Vendor',
      amount: Number(e.amount || 0),
      method: e.method || 'UPI',
      date: e.date ? String(e.date).split('T')[0] : new Date().toISOString().split('T')[0]
    }));

    const staff = [
      { name: 'Gym Owner', email: 'owner@gym.com', role: 'Owner' },
      { name: 'Priya Nair', email: 'manager@gym.com', role: 'Manager' },
      { name: 'Rahul Gowda', email: 'desk@gym.com', role: 'Front desk' },
      { name: 'CA Suresh Bhat', email: 'ca@gym.com', role: 'Accountant' }
    ];

    const permissions: Record<string, Record<string, boolean>> = {
      'See revenue dashboard': { Trainer: false, Accountant: true, Manager: true },
      'Check in members': { Trainer: true, Accountant: true, Manager: true },
      'Add & edit members': { Trainer: false, Accountant: true, Manager: true },
      'Collect payments': { Trainer: false, Accountant: true, Manager: true },
      'Record expenses': { Trainer: false, Accountant: true, Manager: true },
      'Manage PT sessions': { Trainer: true, Accountant: false, Manager: true }
    };

    const auditLog = [
      { action: 'Owner logged in successfully', user: 'Gym Owner', time: '10:00 AM' },
      { action: 'Database schema verified on Supabase Mumbai', user: 'System', time: '09:00 AM' },
      { action: 'Daily automated backup completed', user: 'System', time: '06:00 AM' }
    ];

    const gymProfile = rawProfiles[0] || {
      name: 'GymRex Fitness',
      branch: 'Indiranagar, Bengaluru',
      phone: '9845012345',
      publicUrl: 'https://gymrex-os.vercel.app',
      gstin: '29AABCI1234F1Z8'
    };

    const billingSettings = rawBilling[0] || {
      receiptType: 'GST tax invoice',
      gstin: rawProfiles[0]?.gstin || '29AABCI1234F1Z8',
      taxPercent: 18,
      maxStaffDiscount: 20
    };

    const plans = rawPlans.length > 0 ? rawPlans.map((p: any) => ({
      id: p.id,
      name: p.name,
      days: Number(p.days),
      price: Number(p.price),
      sessions: p.sessions || 'Standard Gym Access'
    })) : [
      { id: 'P1', name: 'Monthly', days: 30, sessions: 'Standard Gym Access', price: 1500 },
      { id: 'P2', name: 'Quarterly', days: 90, sessions: 'Standard Gym Access', price: 4000 },
      { id: 'P3', name: 'Half-yearly', days: 180, sessions: 'Standard Gym Access', price: 7000 },
      { id: 'P4', name: 'Annual', days: 365, sessions: 'Standard Gym Access', price: 12000 }
    ];

    return NextResponse.json({
      gymProfile,
      billingSettings,
      members,
      leads: rawLeads,
      trainers,
      payments,
      expenses,
      staff,
      permissions,
      auditLog,
      ptAssignments: rawPT,
      attendance: rawAttendance,
      plans
    }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
