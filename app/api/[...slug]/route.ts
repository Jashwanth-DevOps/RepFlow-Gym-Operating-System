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
      name: 'Member',
      phone: '9845012345',
      plan: 'Annual',
      basePlanAmount: 12000,
      admissionAmount: 500,
      ptAmount: 0,
      ptSessions: 12,
      ptTrainer: '',
      discountPercent: 0,
      discountAmount: 0,
      taxPercent: 0,
      calculatedTax: 0,
      totalBill: 12500,
      totalPaid: 11500,
      paymentMethod: 'Cash',
      startDate: new Date().toISOString().split('T')[0],
      expires: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      dues: 1000
    };

    const ptAssign = (memoryDb.ptAssignments || []).find((p: any) => (p.member || '').toLowerCase() === (member.name || '').toLowerCase());
    const memberPayment = (memoryDb.payments || []).find((p: any) => (p.member || '').toLowerCase() === (member.name || '').toLowerCase());

    const baseAmount = Number(member.basePlanAmount || (member.plan === 'Monthly' ? 1500 : member.plan === 'Quarterly' ? 4000 : member.plan === 'Half-yearly' ? 7000 : 12000));
    const admAmount = Number(member.admissionAmount !== undefined ? member.admissionAmount : 500);
    const ptAmount = Number(member.ptAmount !== undefined ? member.ptAmount : (ptAssign ? ptAssign.price : 0));
    const ptTrainer = member.ptTrainer || (ptAssign ? ptAssign.trainer : '');
    const ptSessions = member.ptSessions || (ptAssign ? ptAssign.sessions : 12);
    const discount = Number(member.discountAmount || 0);
    const discPct = Number(member.discountPercent || 0);
    const tax = Number(member.calculatedTax || 0);
    const taxPct = Number(member.taxPercent || 18);
    const dues = Number(member.dues || 0);

    const membershipSubtotal = Math.max(0, baseAmount - discount);
    const calculatedGrandTotal = Number(member.totalBill || (membershipSubtotal + admAmount + ptAmount + tax));
    const paid = Number(member.totalPaid !== undefined && member.totalPaid > 0 ? member.totalPaid : (memberPayment ? memberPayment.amount : Math.max(0, calculatedGrandTotal - dues)));
    const payMethod = member.paymentMethod || (memberPayment ? memberPayment.method : 'Cash');

    const receiptNo = memberPayment ? memberPayment.receipt : ('RCPT-' + (member.id ? member.id.replace(/[^0-9]/g, '') : '4997'));
    const statusText = dues > 0 ? 'PART-PAID' : 'PAID IN FULL';
    const statusColor = dues > 0 ? '#ea580c' : '#16a34a';

    let tableRows = '';
    tableRows += '<tr style="font-weight:bold; background:#fafafa;"><td colspan="4">1. MEMBERSHIP</td></tr>';
    tableRows += '<tr><td style="padding-left:16px;">1.1</td><td>Membership Plan: ' + member.plan + '</td><td>' + member.startDate + ' to ' + member.expires + '</td><td style="text-align:right;">₹' + baseAmount + '</td></tr>';
    if (discount > 0) {
      tableRows += '<tr><td style="padding-left:16px;">1.2</td><td>Applicable Discount (' + discPct + '%)</td><td>Applied</td><td style="text-align:right; color:#dc2626;">- ₹' + discount + '</td></tr>';
    }

    if (admAmount > 0) {
      tableRows += '<tr style="font-weight:bold; background:#fafafa;"><td colspan="4">2. ADMISSION / JOINING FEE</td></tr>';
      tableRows += '<tr><td style="padding-left:16px;">2.1</td><td>One-time admission / registration fee</td><td>One-time</td><td style="text-align:right;">₹' + admAmount + '</td></tr>';
    }

    if (ptAmount > 0 || ptTrainer) {
      const sectionNum = admAmount > 0 ? '3' : '2';
      tableRows += '<tr style="font-weight:bold; background:#fafafa;"><td colspan="4">' + sectionNum + '. PERSONAL TRAINING (PT)</td></tr>';
      tableRows += '<tr><td style="padding-left:16px;">' + sectionNum + '.1</td><td>PT Package (Trainer: ' + (ptTrainer || 'Assigned') + ')</td><td>' + ptSessions + ' sessions</td><td style="text-align:right;">₹' + ptAmount + '</td></tr>';
    }

    const html = '<!DOCTYPE html>' +
'<html>' +
'<head>' +
'  <meta charset="utf-8" />' +
'  <title>Tax Invoice - ' + receiptNo + '</title>' +
'  <style>' +
'    * { box-sizing: border-box; }' +
'    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 45px; color: #111; max-width: 820px; margin: auto; font-size: 13px; line-height: 1.5; }' +
'    .top-center { text-align: center; margin-bottom: 25px; }' +
'    .gym-title { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 4px; }' +
'    .sub-info { font-size: 11px; color: #555; }' +
'    .doc-type { font-size: 13px; font-weight: 800; letter-spacing: 0.5px; margin-top: 14px; text-transform: uppercase; }' +
'    .green-line { height: 3px; background: #84cc16; margin: 15px 0 22px 0; border-radius: 2px; }' +
'    .header-grid { display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 12px; }' +
'    .header-col strong { font-size: 11px; text-transform: uppercase; color: #333; display: block; margin-bottom: 4px; border-bottom: 1px solid #ddd; padding-bottom: 3px; }' +
'    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }' +
'    th { background: #fff; text-align: left; padding: 8px 6px; border-bottom: 2px solid #222; font-size: 11px; text-transform: uppercase; color: #222; font-weight: 800; }' +
'    td { padding: 9px 6px; border-bottom: 1px solid #f0f0f0; }' +
'    .summary-wrap { margin-top: 25px; display: flex; justify-content: flex-end; }' +
'    .summary-box { width: 340px; font-size: 12px; line-height: 1.9; }' +
'    .summary-line { display: flex; justify-content: space-between; }' +
'    .grand-total-row { display: flex; justify-content: space-between; font-size: 15px; font-weight: 900; border-top: 2px solid #111; border-bottom: 2px solid #111; padding: 6px 0; margin: 8px 0; }' +
'    .paid-row { display: flex; justify-content: space-between; font-weight: bold; color: #16a34a; }' +
'    .due-row { display: flex; justify-content: space-between; font-weight: bold; color: #dc2626; }' +
'    .footer-section { margin-top: 55px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; color: #666; }' +
'    .stamp-box { width: 160px; height: 75px; border: 1px dashed #999; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #888; text-align: center; }' +
'    @media print { .no-print { display: none !important; } body { padding: 20px; } }' +
'  </style>' +
'</head>' +
'<body>' +
'  <div class="top-center">' +
'    <div class="gym-title">' + (memoryDb.gymProfile.name || 'Iron Temple Fitness') + '</div>' +
'    <div class="sub-info">Branch: ' + (memoryDb.gymProfile.branch || 'Indiranagar, Bengaluru') + ' | GSTIN: ' + (memoryDb.billingSettings.gstin || '29AABCI1234F1Z8') + ' | Phone: ' + (memoryDb.gymProfile.phone || '9845012345') + '</div>' +
'    <div class="doc-type">TAX INVOICE / RECEIPT</div>' +
'  </div>' +
'  <div class="green-line"></div>' +
'  <div class="header-grid">' +
'    <div class="header-col" style="width: 50%;">' +
'      <strong>BILLED TO</strong>' +
'      <div style="font-size: 14px; font-weight: bold; color: #000; margin-top: 2px;">' + member.name + '</div>' +
'      <div>Phone: +91 ' + member.phone + '</div>' +
'      <div>Member ID: ' + member.id + '</div>' +
'    </div>' +
'    <div class="header-col" style="text-align: right; width: 45%;">' +
'      <strong>INVOICE DETAILS</strong>' +
'      <div>Invoice No: <strong>' + receiptNo + '</strong></div>' +
'      <div>Date: <strong>' + member.startDate + '</strong></div>' +
'      <div>Status: <strong style="color: ' + statusColor + ';">' + statusText + '</strong></div>' +
'    </div>' +
'  </div>' +
'  <table>' +
'    <thead>' +
'      <tr>' +
'        <th style="width: 6%;">#</th>' +
'        <th style="width: 44%;">DESCRIPTION</th>' +
'        <th style="width: 32%;">PERIOD / QTY</th>' +
'        <th style="width: 18%; text-align: right;">AMOUNT (₹)</th>' +
'      </tr>' +
'    </thead>' +
'    <tbody>' +
'      ' + tableRows +
'    </tbody>' +
'  </table>' +
'  <div class="summary-wrap">' +
'    <div class="summary-box">' +
'      <div class="summary-line"><span>Membership Subtotal:</span><span>₹' + membershipSubtotal + '</span></div>' +
'      ' + (admAmount > 0 ? '<div class="summary-line"><span>Admission Subtotal:</span><span>₹' + admAmount + '</span></div>' : '') +
'      ' + (ptAmount > 0 ? '<div class="summary-line"><span>PT Subtotal:</span><span>₹' + ptAmount + '</span></div>' : '') +
'      ' + (tax > 0 ? '<div class="summary-line"><span>Tax / GST (' + taxPct + '%):</span><span>₹' + tax + '</span></div>' : '') +
'      '<div class="grand-total-row"><span>GRAND TOTAL:</span><span>₹' + calculatedGrandTotal + '</span></div>' +
'      <div class="paid-row"><span>Amount Received (' + payMethod + '):</span><span>₹' + paid + '</span></div>' +
'      ' + (dues > 0 ? '<div class="due-row"><span>BALANCE DUE:</span><span>₹' + dues + '</span></div>' : '') +
'    </div>' +
'  </div>' +
'  <div class="footer-section">' +
'    <div>' +
'      <div>Thank you for training with us! Please retain this receipt for your records.</div>' +
'      <div>Authorized by: <strong>Gym Owner (Owner)</strong></div>' +
'    </div>' +
'    <div class="stamp-box">Authorized Signature & Stamp</div>' +
'  </div>' +
'  <div class="no-print" style="text-align: center; margin-top: 35px;">' +
'    <button onclick="window.print()" style="background:#84cc16; color:#000; border:none; padding:10px 24px; font-weight:bold; font-size:13px; border-radius:8px; cursor:pointer;">Print / Save as PDF</button>' +
'  </div>' +
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
          method: body.method || 'Cash',
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
      admissionAmount: Number(body.admissionAmount !== undefined ? body.admissionAmount : 500),
      ptAmount: Number(body.ptAmount || 0),
      ptTrainer: body.ptTrainer || '',
      ptSessions: Number(body.ptSessions || 12),
      discountPercent: Number(body.discountPercent || 0),
      discountAmount: Number(body.discountAmount || 0),
      taxPercent: Number(body.taxPercent || 0),
      calculatedTax: Number(body.calculatedTax || 0),
      totalBill: Number(body.totalBill || (body.plan === 'Monthly' ? 1500 : body.plan === 'Quarterly' ? 4000 : body.plan === 'Half-yearly' ? 7000 : 12000)),
      totalPaid: Number(body.totalPaid !== undefined ? body.totalPaid : 0),
      paymentMethod: body.paymentMethod || 'Cash'
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
      method: body.method || 'Cash',
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
      method: body.method || 'Cash',
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
