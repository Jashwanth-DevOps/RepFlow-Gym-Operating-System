import { NextResponse } from 'next/server';
import { memoryDb, logAudit } from '../store';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { slug: string[] } }) {
  const endpoint = params.slug ? params.slug.join('/') : '';

  if (endpoint === 'data') {
    return NextResponse.json(memoryDb);
  }

  if (endpoint.startsWith('invoices/')) {
    const invId = endpoint.split('/')[1];
    const member = memoryDb.members.find((m: any) => m.id === invId) || memoryDb.members[0] || {
      id: invId,
      name: 'Valued Member',
      phone: '9845012345',
      plan: 'Quarterly',
      basePlanAmount: 4000,
      admissionAmount: 0,
      ptAmount: 0,
      discountAmount: 0,
      discountPercent: 0,
      calculatedTax: 0,
      taxPercent: 18,
      totalBill: 4000,
      totalPaid: 4000,
      paymentMethod: 'UPI',
      startDate: new Date().toISOString().split('T')[0],
      expires: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      dues: 0
    };

    const baseAmount = Number(member.basePlanAmount || (member.plan === 'Monthly' ? 1500 : member.plan === 'Quarterly' ? 4000 : member.plan === 'Half-yearly' ? 7000 : 12000));
    const admAmount = Number(member.admissionAmount || 0);
    const ptAmount = Number(member.ptAmount || 0);
    const discount = Number(member.discountAmount || 0);
    const discPct = Number(member.discountPercent || 0);
    const tax = Number(member.calculatedTax || 0);
    const taxPct = Number(member.taxPercent || 18);
    const total = Number(member.totalBill || (baseAmount + admAmount + ptAmount - discount + tax));
    const paid = Number(member.totalPaid !== undefined ? member.totalPaid : total);
    const dues = Number(member.dues || 0);
    const payMethod = member.paymentMethod || 'UPI';
    const subtotal = baseAmount + admAmount + ptAmount;

    let rows = '<tr><td>' + member.plan + ' Gym Membership Access</td><td>1</td><td style="text-align:right;">Rs. ' + baseAmount + '</td></tr>';
    if (admAmount > 0) {
      rows += '<tr><td>One-Time Gym Registration / Admission Fee</td><td>1</td><td style="text-align:right;">Rs. ' + admAmount + '</td></tr>';
    }
    if (ptAmount > 0) {
      const trainerName = member.ptTrainer ? 'Trainer: ' + member.ptTrainer : 'Assigned Trainer';
      rows += '<tr><td>Personal Training Package (' + trainerName + ')</td><td>1</td><td style="text-align:right;">Rs. ' + ptAmount + '</td></tr>';
    }

    let summary = '<div>Subtotal: <strong>Rs. ' + subtotal + '</strong></div>';
    if (discount > 0) {
      summary += '<div style="color: red;">Discount Applied (' + discPct + '%): - Rs. ' + discount + '</div>';
    }
    if (tax > 0) {
      summary += '<div style="color: #666;">GST / Tax (' + taxPct + '%): + Rs. ' + tax + '</div>';
    }
    summary += '<div style="font-size: 16px; margin-top: 5px;">Grand Total: <strong>Rs. ' + total + '</strong></div>';
    summary += '<div style="color: green; font-size: 14px;">Amount Paid (' + payMethod + '): <strong>Rs. ' + paid + '</strong></div>';
    if (dues > 0) {
      summary += '<div style="color: red; font-size: 14px; font-weight: bold;">Outstanding Balance Dues: Rs. ' + dues + '</div>';
    }

    const badgeStyle = dues > 0 ? 'background: #fef2f2; color: #dc2626;' : 'background: #f0fdf4; color: #16a34a;';
    const badgeText = dues > 0 ? 'PARTIAL PAYMENT' : 'PAID IN FULL';
    summary += '<div class="status-badge" style="' + badgeStyle + '">' + badgeText + '</div>';

    const gymName = memoryDb.gymProfile.name || 'Iron Temple Fitness';
    const gymBranch = memoryDb.gymProfile.branch || 'Indiranagar, Bengaluru';
    const gymPhone = memoryDb.gymProfile.phone || '9845012345';
    const gymGstin = memoryDb.billingSettings.gstin || '29AABCI1234F1Z8';
    const todayFormatted = new Date().toLocaleDateString('en-GB');

    const html = '<!DOCTYPE html>' +
'<html>' +
'<head>' +
'  <meta charset="utf-8" />' +
'  <title>Invoice #' + member.id + '</title>' +
'  <style>' +
'    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #111; max-width: 720px; margin: auto; }' +
'    .header { border-bottom: 3px solid #84cc16; padding-bottom: 18px; display: flex; justify-content: space-between; align-items: flex-end; }' +
'    .gym-name { font-size: 24px; font-weight: 900; color: #000; text-transform: uppercase; }' +
'    .inv-tag { font-size: 14px; font-weight: 800; color: #84cc16; }' +
'    .details { margin: 25px 0; display: flex; justify-content: space-between; font-size: 13px; line-height: 1.6; }' +
'    table { width: 100%; border-collapse: collapse; margin: 15px 0; }' +
'    th { background: #f4f4f5; text-align: left; padding: 10px; border: 1px solid #ddd; font-size: 11px; text-transform: uppercase; }' +
'    td { padding: 10px; border: 1px solid #eee; font-size: 12px; }' +
'    .total-box { margin-top: 15px; border-top: 2px solid #111; padding-top: 12px; font-size: 13px; line-height: 1.8; text-align: right; }' +
'    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 12px; margin-top: 10px; }' +
'    .print-btn { background: #84cc16; border: none; padding: 10px 22px; font-weight: bold; border-radius: 8px; cursor: pointer; margin-top: 25px; }' +
'    @media print { .print-btn { display: none; } }' +
'  </style>' +
'</head>' +
'<body>' +
'  <div class="header">' +
'    <div>' +
'      <div class="gym-name">' + gymName + '</div>' +
'      <div style="font-size:12px; color:#555;">' + gymBranch + ' | Phone: +91 ' + gymPhone + '</div>' +
'      <div style="font-size:11px; color:#777;">GSTIN: ' + gymGstin + '</div>' +
'    </div>' +
'    <div style="text-align:right;">' +
'      <div class="inv-tag">OFFICIAL TAX INVOICE</div>' +
'      <div style="font-size:12px; font-weight:bold;">#' + member.id + '</div>' +
'      <div style="font-size:12px;">Date: ' + todayFormatted + '</div>' +
'    </div>' +
'  </div>' +
'  <div class="details">' +
'    <div>' +
'      <strong>BILLED TO:</strong><br />' +
'      <span style="font-size: 15px; font-weight: bold;">' + member.name + '</span><br />' +
'      Mobile: +91 ' + member.phone +
'    </div>' +
'    <div style="text-align:right;">' +
'      <strong>MEMBERSHIP VALIDITY:</strong><br />' +
'      ' + member.startDate + ' to ' + member.expires + '<br />' +
'      Plan: <strong>' + member.plan + '</strong>' +
'    </div>' +
'  </div>' +
'  <table>' +
'    <thead>' +
'      <tr>' +
'        <th>Item Description</th>' +
'        <th>Qty</th>' +
'        <th style="text-align:right;">Rate (INR)</th>' +
'      </tr>' +
'    </thead>' +
'    <tbody>' +
'      ' + rows +
'    </tbody>' +
'  </table>' +
'  <div class="total-box">' +
'    ' + summary +
'  </div>' +
'  <button class="print-btn" onclick="window.print()">Print / Save PDF</button>' +
'  <script>window.onload = function() { setTimeout(function(){ window.print(); }, 400); };</script>' +
'</body>' +
'</html>';

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  return NextResponse.json(memoryDb);
}

export async function POST(request: Request, { params }: { params: { slug: string[] } }) {
  const endpoint = params.slug ? params.slug.join('/') : '';
  let body: any = {};
  try {
    body = await request.json();
  } catch (e) {}

  if (endpoint.startsWith('pt-assign/') && endpoint.endsWith('/complete-session')) {
    const ptId = endpoint.split('/')[1];
    const idx = memoryDb.ptAssignments.findIndex((p: any) => p.id === ptId);
    if (idx !== -1) {
      if (memoryDb.ptAssignments[idx].sessions > 0) {
        memoryDb.ptAssignments[idx].sessions = Math.max(0, memoryDb.ptAssignments[idx].sessions - 1);
        logAudit('Completed 1 session for ' + memoryDb.ptAssignments[idx].member + ' (' + memoryDb.ptAssignments[idx].sessions + ' remaining)', body.operator || 'Trainer');
        return NextResponse.json({ success: true, pt: memoryDb.ptAssignments[idx] });
      }
      return NextResponse.json({ success: false, message: 'No sessions remaining in package.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'PT assignment not found' }, { status: 404 });
  }

  if (endpoint.startsWith('members/') && endpoint.endsWith('/renew')) {
    const memberId = endpoint.split('/')[1];
    const idx = memoryDb.members.findIndex((m: any) => m.id === memberId);
    if (idx !== -1) {
      const current = memoryDb.members[idx];
      memoryDb.members[idx] = {
        ...current,
        plan: body.plan || current.plan,
        status: 'Active',
        startDate: body.startDate || new Date().toISOString().split('T')[0],
        expires: body.endDate,
        dues: Number(body.dues || 0)
      };
      if (Number(body.amount || 0) > 0) {
        memoryDb.payments.unshift({
          receipt: 'RCPT-' + Math.floor(1000 + Math.random() * 9000),
          member: current.name,
          phone: current.phone,
          amount: Number(body.amount),
          method: body.method || 'UPI',
          plan: body.plan,
          date: new Date().toISOString().split('T')[0],
          operator: body.operator || 'Owner'
        });
      }
      logAudit('Renewed membership for ' + current.name + ' (' + current.id + ')', body.operator || 'Owner');
      return NextResponse.json({ success: true, member: memoryDb.members[idx] });
    }
    return NextResponse.json({ success: false, message: 'Member not found.' }, { status: 404 });
  }

  if (endpoint === 'members') {
    const cleanPhone = (body.phone || '').replace(/[^0-9]/g, '');
    const newMember = {
      id: 'IT' + (1000 + memoryDb.members.length + 1),
      name: body.name,
      phone: cleanPhone,
      gender: body.gender || 'Male',
      plan: body.plan,
      startDate: body.startDate,
      expires: body.expires,
      status: 'Active',
      dues: Number(body.dues || 0),
      basePlanAmount: Number(body.basePlanAmount || (body.plan === 'Monthly' ? 1500 : body.plan === 'Quarterly' ? 4000 : body.plan === 'Half-yearly' ? 7000 : 12000)),
      admissionAmount: Number(body.admissionAmount || (body.includeAdmissionFee ? 500 : 0)),
      ptAmount: Number(body.ptAmount || (body.assignPT ? body.ptPrice || 0 : 0)),
      ptTrainer: body.ptTrainer || '',
      discountPercent: Number(body.discountPercent || 0),
      discountAmount: Number(body.discountAmount || 0),
      taxPercent: Number(body.taxPercent || (body.applyTax ? 18 : 0)),
      calculatedTax: Number(body.calculatedTax || 0),
      totalBill: Number(body.totalBill || (body.plan === 'Monthly' ? 1500 : body.plan === 'Quarterly' ? 4000 : body.plan === 'Half-yearly' ? 7000 : 12000)),
      totalPaid: Number(body.totalPaid || 0),
      paymentMethod: body.paymentMethod || 'UPI'
    };
    memoryDb.members.unshift(newMember);
    logAudit('Added member ' + newMember.name + ' (' + newMember.id + ')', body.operator || 'Owner');
    return NextResponse.json({ success: true, member: newMember });
  }

  if (endpoint === 'payments') {
    const newP = {
      receipt: 'RCPT-' + Math.floor(1000 + Math.random() * 9000),
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
    logAudit('Recorded payment ' + newP.amount + ' (' + newP.receipt + ') for ' + newP.member, newP.operator);
    return NextResponse.json({ success: true, payment: newP });
  }

  if (endpoint === 'leads') {
    const newLead = {
      id: 'L' + (memoryDb.leads.length + 1),
      name: body.name,
      phone: body.phone,
      source: body.source || 'Walk-in',
      stage: body.stage || 'New',
      followUp: body.followUp || new Date().toISOString().split('T')[0],
      plan: body.plan || 'Monthly',
      note: body.note || ''
    };
    memoryDb.leads.unshift(newLead);
    logAudit('Added lead ' + newLead.name, body.operator || 'Owner');
    return NextResponse.json({ success: true, lead: newLead });
  }

  if (endpoint === 'trainers') {
    const newTr = {
      id: 'TR' + (memoryDb.trainers.length + 1),
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
    memoryDb.staff.push({ id: 'S' + (memoryDb.staff.length + 1), name: newTr.name, email: newTr.email, role: 'Trainer', active: true });
    logAudit('Created trainer ' + newTr.name, 'Owner');
    return NextResponse.json({ success: true, trainer: newTr });
  }

  if (endpoint === 'pt-assign') {
    const newPt = {
      id: 'PT' + (memoryDb.ptAssignments.length + 1),
      trainer: body.trainer,
      member: body.member,
      sessions: Number(body.sessions || 12),
      price: Number(body.price || 0),
      startDate: body.startDate,
      endDate: body.endDate
    };
    memoryDb.ptAssignments.unshift(newPt);

    memoryDb.trainers = (memoryDb.trainers || []).map((tr: any) => {
      if (tr.name === body.trainer) {
        return {
          ...tr,
          clients: (tr.clients || 0) + 1,
          sessions: (tr.sessions || 0) + Number(body.sessions || 12),
          sold: (tr.sold || 0) + Number(body.price || 0),
          commission: (tr.commission || 0) + (Number(body.price || 0) * 0.15)
        };
      }
      return tr;
    });

    logAudit('Assigned ' + newPt.sessions + ' PT sessions to ' + newPt.member, body.operator || 'Owner');
    return NextResponse.json({ success: true, pt: newPt });
  }

  if (endpoint === 'expenses') {
    const newExp = {
      id: 'E' + (memoryDb.expenses.length + 1),
      category: body.category,
      paidTo: body.paidTo,
      amount: Number(body.amount || 0),
      method: body.method || 'UPI',
      date: body.date || new Date().toISOString().split('T')[0]
    };
    memoryDb.expenses.unshift(newExp);
    logAudit('Added expense ' + newExp.amount + ' for ' + newExp.category, 'Owner');
    return NextResponse.json({ success: true, expense: newExp });
  }

  if (endpoint === 'plans') {
    const newPlan = {
      id: 'P' + (memoryDb.plans.length + 1),
      name: body.name,
      days: Number(body.days || 30),
      sessions: body.sessions || 'Standard Gym Access',
      price: Number(body.price || 1500)
    };
    memoryDb.plans.push(newPlan);
    logAudit('Created plan ' + newPlan.name, 'Owner');
    return NextResponse.json({ success: true, plan: newPlan });
  }

  if (endpoint === 'settings/profile') {
    memoryDb.gymProfile = { ...memoryDb.gymProfile, ...body };
    logAudit('Updated gym profile', 'Owner');
    return NextResponse.json({ success: true, gymProfile: memoryDb.gymProfile });
  }

  if (endpoint === 'settings/billing') {
    memoryDb.billingSettings = { ...memoryDb.billingSettings, ...body };
    logAudit('Updated billing settings', 'Owner');
    return NextResponse.json({ success: true, billingSettings: memoryDb.billingSettings });
  }

  return NextResponse.json({ success: true });
}

export async function PUT(request: Request, { params }: { params: { slug: string[] } }) {
  const endpoint = params.slug ? params.slug.join('/') : '';
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

  if (endpoint.startsWith('trainers/')) {
    const id = endpoint.split('/')[1];
    const idx = memoryDb.trainers.findIndex((t: any) => t.id === id);
    if (idx !== -1) {
      memoryDb.trainers[idx] = { ...memoryDb.trainers[idx], ...body };
      return NextResponse.json({ success: true, trainer: memoryDb.trainers[idx] });
    }
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request, { params }: { params: { slug: string[] } }) {
  const endpoint = params.slug ? params.slug.join('/') : '';
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
  const endpoint = params.slug ? params.slug.join('/') : '';

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
