import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    let rawId = decodeURIComponent(params.id || '').trim();
    const cleanId = rawId.replace(/^INV-/, '');

    // 1. Gym Profile & Settings
    const gymProfiles: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "GymProfile" LIMIT 1`).catch(() => []);
    const billingSettings: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "BillingSettings" LIMIT 1`).catch(() => []);

    const gym = gymProfiles[0] || { name: 'GymRex Fitness', branch: 'Indiranagar, Bengaluru', phone: '9845012345' };
    const billing = billingSettings[0] || { gstin: '29AABCI1234F1Z8', taxPercent: 18 };

    // 2. Fetch Payment or Member
    const payments: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Payment" WHERE "receipt" = $1 OR "id" = $1 OR "receipt" = $2 LIMIT 1`,
      cleanId, rawId
    ).catch(() => []);

    let memberMatchName = payments[0]?.member || '';
    const members: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Member" WHERE "id" = $1 OR "code" = $1 OR "name" = $2 LIMIT 1`,
      cleanId, memberMatchName
    ).catch(() => []);

    const member = members[0] || {};
    const payment = payments[0] || {};

    const clientName = member.name || payment.member || 'Member';
    const clientPhone = member.phone || payment.phone || '9876543210';
    const clientCode = member.code || member.id || 'IT1001';
    const receiptNo = payment.receipt || (rawId.startsWith('RCPT-') ? rawId : `RCPT-${Math.floor(1000 + Math.random() * 9000)}`);
    const invoiceDate = payment.date || member.startDate || new Date().toISOString().split('T')[0];

    const planName = member.plan || payment.plan || 'Membership';
    const planPrice = Number(member.planPrice || 4000);
    const admissionFee = Number(member.admissionFee || 0);
    const ptTrainer = member.ptTrainer || '';
    const ptSessions = Number(member.ptSessions || 0);
    const ptPrice = Number(member.ptPrice || 0);
    const discountAmount = Number(member.discountAmount || 0);
    const discountPercent = Number(member.discountPercent || 0);

    const membershipSubtotal = planPrice - discountAmount;
    const admissionSubtotal = admissionFee;
    const ptSubtotal = ptPrice;

    const taxPercent = Number(member.taxPercent || billing.taxPercent || 18);
    const taxableSubtotal = membershipSubtotal + admissionSubtotal + ptSubtotal;
    const taxAmount = Number(member.taxAmount || Math.round((taxableSubtotal * taxPercent) / 100));
    
    // Grand Total & Balance Due matching the member record
    const dues = Number(member.dues !== undefined ? member.dues : 0);
    const grandTotal = Number(member.grandTotal || (taxableSubtotal + taxAmount));
    const amountReceived = Number(payment.amount || member.paidAmount || (grandTotal - dues));
    const payMethod = payment.method || member.paymentMethod || 'UPI';
    const statusText = dues > 0 ? 'PART-PAID' : 'COMPLETED';
    const statusColor = dues > 0 ? '#f59e0b' : '#22c55e';

    // 3. Fetch deduplicated Payment History
    const historyPayments: any[] = clientName ? await prisma.$queryRawUnsafe(
      `SELECT DISTINCT ON ("receipt") "receipt", "date", "plan", "method", "amount"
       FROM "Payment" 
       WHERE LOWER("member") = LOWER($1) 
       ORDER BY "receipt", "createdAt" DESC 
       LIMIT 5`,
      clientName
    ).catch(() => []) : [];

    const totalPaidSoFar = historyPayments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0) || amountReceived;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Tax Invoice - ${receiptNo}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 40px; color: #111; max-width: 800px; margin: auto; font-size: 13px; line-height: 1.5; }
          .center { text-align: center; }
          .gym-title { font-size: 26px; font-weight: 900; margin-bottom: 2px; color: #111; }
          .gym-meta { font-size: 11px; color: #555; margin-bottom: 15px; }
          .doc-type { font-weight: 900; font-size: 14px; letter-spacing: 1px; border-bottom: 3px solid #84cc16; padding-bottom: 6px; margin-bottom: 25px; text-align: center; }
          .two-col { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; }
          .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .table th { border-top: 1px solid #111; border-bottom: 1px solid #111; padding: 8px 4px; text-align: left; font-size: 11px; text-transform: uppercase; }
          .table td { padding: 8px 4px; border-bottom: 1px solid #eee; font-size: 12px; }
          .section-row { font-weight: 800; background: #fafafa; }
          .calc-table { width: 380px; margin-left: auto; margin-top: 20px; border-collapse: collapse; font-size: 12px; }
          .calc-table td { padding: 6px 4px; }
          .grand-total { border-top: 2px solid #111; border-bottom: 2px solid #111; font-weight: 900; font-size: 15px; }
          .sig-box { width: 180px; border: 1px dashed #999; padding: 25px 10px 10px 10px; text-align: center; font-size: 10px; color: #777; margin-left: auto; margin-top: 30px; }
          .history-box { margin-top: 25px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; background: #fdfdfd; font-size: 11px; }
          .history-title { font-weight: bold; margin-bottom: 6px; text-transform: uppercase; color: #444; }
          .footer { margin-top: 25px; font-size: 11px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="gym-title">${gym.name || 'GymRex Fitness'}</div>
          <div class="gym-meta">Branch: ${gym.branch || 'Indiranagar, Bengaluru'} | GSTIN: ${billing.gstin || '29AABCI1234F1Z8'} | Phone: ${gym.phone || '9845012345'}</div>
          <div class="doc-type">OFFICIAL TAX INVOICE / RECEIPT</div>
        </div>

        <div class="two-col">
          <div>
            <strong>BILLED TO</strong><br>
            <strong>${clientName}</strong><br>
            Phone: +91 ${clientPhone}<br>
            Member ID: ${clientCode}
          </div>
          <div style="text-align: right;">
            <strong>INVOICE DETAILS</strong><br>
            Receipt No: <strong>${receiptNo}</strong><br>
            Date: <strong>${invoiceDate}</strong><br>
            Payment Method: <strong>${payMethod}</strong><br>
            Status: <strong style="color: ${statusColor};">${statusText}</strong>
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th style="width: 8%;">#</th>
              <th style="width: 52%;">DESCRIPTION</th>
              <th style="width: 25%;">PERIOD / DETAILS</th>
              <th style="width: 15%; text-align: right;">AMOUNT (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr class="section-row"><td colspan="4">1. MEMBERSHIP</td></tr>
            <tr>
              <td>1.1</td>
              <td>Membership Plan: ${planName}</td>
              <td>${member.startDate || invoiceDate} to ${member.expires || 'N/A'}</td>
              <td style="text-align: right;">₹${planPrice}</td>
            </tr>
            ${discountAmount > 0 ? `
            <tr>
              <td>1.2</td>
              <td>Discount (${discountPercent}%)</td>
              <td>Applied</td>
              <td style="text-align: right; color: red;">- ₹${discountAmount}</td>
            </tr>` : ''}

            ${admissionFee > 0 ? `
            <tr class="section-row"><td colspan="4">2. ADMISSION / JOINING FEE</td></tr>
            <tr>
              <td>2.1</td>
              <td>One-time admission / registration fee</td>
              <td>One-time</td>
              <td style="text-align: right;">₹${admissionFee}</td>
            </tr>` : ''}

            ${ptPrice > 0 ? `
            <tr class="section-row"><td colspan="4">3. PERSONAL TRAINING (PT)</td></tr>
            <tr>
              <td>3.1</td>
              <td>PT Package (Trainer: ${ptTrainer})</td>
              <td>${ptSessions} sessions</td>
              <td style="text-align: right;">₹${ptPrice}</td>
            </tr>` : ''}
          </tbody>
        </table>

        <table class="calc-table">
          <tr><td>Subtotal:</td><td style="text-align: right;">₹${taxableSubtotal}</td></tr>
          ${taxAmount > 0 ? `<tr><td>Tax / GST (${taxPercent}%):</td><td style="text-align: right;">₹${taxAmount}</td></tr>` : ''}
          <tr class="grand-total"><td>GRAND TOTAL:</td><td style="text-align: right;">₹${grandTotal}</td></tr>
          <tr><td style="color: green; font-weight: bold;">Amount Received (${payMethod}):</td><td style="text-align: right; color: green; font-weight: bold;">₹${amountReceived}</td></tr>
          <tr><td style="color: red; font-weight: bold;">BALANCE DUE:</td><td style="text-align: right; color: red; font-weight: bold;">₹${dues}</td></tr>
        </table>

        ${historyPayments.length > 0 ? `
        <div class="history-box">
          <div class="history-title">Member Payment History (${clientName})</div>
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="border-bottom:1px solid #ddd; text-align:left; color:#666;">
                <th>Receipt</th><th>Date</th><th>Description</th><th>Method</th><th style="text-align:right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${historyPayments.map((hp: any) => `
                <tr style="border-bottom:1px solid #eee;">
                  <td>${hp.receipt}</td>
                  <td>${hp.date}</td>
                  <td>${hp.plan}</td>
                  <td>${hp.method}</td>
                  <td style="text-align:right; font-weight:bold;">₹${hp.amount}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>` : ''}

        <div class="sig-box">
          Authorized Signature & Stamp
        </div>

        <div class="footer">
          Thank you for choosing ${gym.name || 'GymRex Fitness'}! This is an official tax invoice.
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;

    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
