import { NextResponse } from 'next/server';

export async function GET() {
  const res = await fetch('http://localhost:3000/api/data', { cache: 'no-store' }).catch(() => null);
  return NextResponse.json({
    gymProfile: { name: 'Iron Temple Fitness', branch: 'Indiranagar, Bengaluru', phone: '9845012345' },
    billingSettings: { receiptType: 'GST tax invoice', gstin: '29AABCI1234F1Z8', taxPercent: 18, maxStaffDiscount: 20 },
    members: [],
    payments: [],
    expenses: [],
    leads: [],
    trainers: [{ id: 'TR1', name: 'Sameer Khan', email: 'sameer@gym.com', phone: '9876543210', specialty: 'Strength & HIIT', rating: 5.0, clients: 1, sessions: 12, sold: 6000, commission: 900 }],
    ptAssignments: [],
    plans: [{ id: 'P1', name: 'Monthly', days: 30, sessions: 'Standard Gym Access', price: 1500 }, { id: 'P2', name: 'Quarterly', days: 90, sessions: 'Standard Gym Access', price: 4000 }],
    staff: [{ id: 'S1', name: 'Gym Owner', email: 'owner@gym.com', role: 'Owner', active: true }],
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
}
