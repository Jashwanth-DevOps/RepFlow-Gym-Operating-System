import { NextResponse } from 'next/server';

let memoryDb: any = {
  gymProfile: {
    name: 'Iron Temple Fitness',
    branch: 'Indiranagar, Bengaluru',
    phone: '9845012345',
    publicUrl: ''
  },
  billingSettings: {
    receiptType: 'GST tax invoice',
    gstin: '29AABCI1234F1Z8',
    taxPercent: 18,
    maxStaffDiscount: 20
  },
  members: [],
  payments: [],
  expenses: [],
  leads: [],
  trainers: [
    { id: 'TR1', name: 'Sameer Khan', email: 'sameer@gym.com', phone: '9876543210', specialty: 'Strength & HIIT', rating: 5.0, clients: 1, sessions: 12, sold: 6000, commission: 900 }
  ],
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
};

function logAudit(action: string, user: string = 'Owner') {
  const now = new Date();
  const timeStr = `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  memoryDb.auditLog.unshift({ action, user, time: timeStr });
}

export async function GET(request: Request, { params }: { params: { slug: string[] } }) {
  const endpoint = params.slug?.join('/') || '';
  if (endpoint === 'data') {
    return NextResponse.json(memoryDb);
  }
  return NextResponse.json({ success: true, data: memoryDb });
}

export async function POST(request: Request, { params }: { params: { slug: string[] } }) {
  const endpoint = params.slug?.join('/') || '';
  let body: any = {};
  try {
    body = await request.json();
  } catch (e) {}

  if (endpoint === 'members') {
    const cleanPhone = (body.phone || '').replace(/[^0-9]/g, '');
    const newMember = {
      id: `IT${1000 + memoryDb.members.length + 1}`,
      name: body.name,
      phone: cleanPhone,
      gender: body.gender || 'Male',
      plan: body.plan,
      startDate: body.startDate,
      expires: body.expires,
      status: 'Active',
      dues: Number(body.dues || 0)
    };
    memoryDb.members.unshift(newMember);
    logAudit(`Added member ${newMember.name} (${newMember.id})`, body.operator || 'Owner');
    return NextResponse.json({ success: true, member: newMember });
  }

  if (endpoint === 'payments') {
    const newP = {
      receipt: `RCPT-${Math.floor(1000 + Math.random() * 9000)}`,
      member: body.member,
      phone: body.phone,
      amount: Number(body.amount || 0),
      method: body.method || 'UPI',
      plan: body.plan || 'Membership',
      note: body.note || '',
      date: body.date || new Date().toISOString().split('T')[0],
      operator: body.operator || 'Owner'
    };
    memoryDb.payments.unshift(newP);
    logAudit(`Recorded payment ${newP.amount} (${newP.receipt}) for ${newP.member}`, newP.operator);
    return NextResponse.json({ success: true, payment: newP });
  }

  if (endpoint === 'leads') {
    const newLead = {
      id: `L${memoryDb.leads.length + 1}`,
      name: body.name,
      phone: body.phone,
      source: body.source || 'Walk-in',
      stage: body.stage || 'New',
      followUp: body.followUp || new Date().toISOString().split('T')[0],
      plan: body.plan || 'Monthly',
      note: body.note || ''
    };
    memoryDb.leads.unshift(newLead);
    logAudit(`Added lead ${newLead.name}`, body.operator || 'Owner');
    return NextResponse.json({ success: true, lead: newLead });
  }

  if (endpoint === 'trainers') {
    const newTr = {
      id: `TR${memoryDb.trainers.length + 1}`,
      name: body.name,
      email: (body.email || '').trim().toLowerCase(),
      password: body.password || 'password123',
      phone: body.phone,
      specialty: body.specialty || 'General Fitness',
      rating: 5.0,
      clients: 0,
      sessions: 0,
      sold: 0,
      commission: 0
    };
    memoryDb.trainers.push(newTr);
    memoryDb.staff.push({ id: `S${memoryDb.staff.length + 1}`, name: newTr.name, email: newTr.email, role: 'Trainer', active: true });
    logAudit(`Created trainer ${newTr.name}`, 'Owner');
    return NextResponse.json({ success: true, trainer: newTr });
  }

  if (endpoint === 'pt-assign') {
    const newPt = {
      id: `PT${memoryDb.ptAssignments.length + 1}`,
      trainer: body.trainer,
      member: body.member,
      sessions: Number(body.sessions || 12),
      price: Number(body.price || 0),
      startDate: body.startDate,
      endDate: body.endDate
    };
    memoryDb.ptAssignments.unshift(newPt);
    logAudit(`Assigned ${newPt.sessions} PT sessions to ${newPt.member}`, body.operator || 'Owner');
    return NextResponse.json({ success: true, pt: newPt });
  }

  if (endpoint === 'expenses') {
    const newExp = {
      id: `E${memoryDb.expenses.length + 1}`,
      category: body.category,
      paidTo: body.paidTo,
      amount: Number(body.amount || 0),
      method: body.method || 'UPI',
      date: body.date || new Date().toISOString().split('T')[0]
    };
    memoryDb.expenses.unshift(newExp);
    logAudit(`Added expense ${newExp.amount} for ${newExp.category}`, 'Owner');
    return NextResponse.json({ success: true, expense: newExp });
  }

  if (endpoint === 'plans') {
    const newPlan = {
      id: `P${memoryDb.plans.length + 1}`,
      name: body.name,
      days: Number(body.days || 30),
      sessions: body.sessions || 'Standard Gym Access',
      price: Number(body.price || 1500)
    };
    memoryDb.plans.push(newPlan);
    logAudit(`Created plan ${newPlan.name}`, 'Owner');
    return NextResponse.json({ success: true, plan: newPlan });
  }

  if (endpoint === 'settings/profile') {
    memoryDb.gymProfile = { ...memoryDb.gymProfile, ...body };
    logAudit(`Updated gym profile`, 'Owner');
    return NextResponse.json({ success: true, gymProfile: memoryDb.gymProfile });
  }

  if (endpoint === 'settings/billing') {
    memoryDb.billingSettings = { ...memoryDb.billingSettings, ...body };
    logAudit(`Updated billing settings`, 'Owner');
    return NextResponse.json({ success: true, billingSettings: memoryDb.billingSettings });
  }

  return NextResponse.json({ success: true });
}

export async function PUT(request: Request, { params }: { params: { slug: string[] } }) {
  const endpoint = params.slug?.join('/') || '';
  let body: any = {};
  try {
    body = await request.json();
  } catch (e) {}

  if (endpoint.startsWith('members/')) {
    const id = endpoint.split('/')[1];
    const idx = memoryDb.members.findIndex((m: any) => m.id === id);
    if (idx !== -1) {
      memoryDb.members[idx] = { ...memoryDb.members[idx], ...body };
      return NextResponse.json({ success: true, member: memoryDb.members[idx] });
    }
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request, { params }: { params: { slug: string[] } }) {
  const endpoint = params.slug?.join('/') || '';
  let body: any = {};
  try {
    body = await request.json();
  } catch (e) {}

  if (endpoint.startsWith('leads/') && endpoint.endsWith('/stage')) {
    const id = endpoint.split('/')[1];
    memoryDb.leads = memoryDb.leads.map((l: any) => l.id === id ? { ...l, stage: body.stage } : l);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: { params: { slug: string[] } }) {
  const endpoint = params.slug?.join('/') || '';

  if (endpoint.startsWith('expenses/')) {
    const id = endpoint.split('/')[1];
    memoryDb.expenses = memoryDb.expenses.filter((e: any) => e.id !== id);
    return NextResponse.json({ success: true });
  }

  if (endpoint.startsWith('plans/')) {
    const id = endpoint.split('/')[1];
    memoryDb.plans = memoryDb.plans.filter((p: any) => p.id !== id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: true });
}
