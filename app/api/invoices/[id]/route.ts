import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    const members: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Member" WHERE "id" = $1 OR "code" = $1 LIMIT 1`, id
    ).catch(() => []);

    const payments: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Payment" WHERE "receipt" = $1 OR "id" = $1 LIMIT 1`, id
    ).catch(() => []);

    const gymProfiles: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "GymProfile" LIMIT 1`).catch(() => []);
    const member = members[0] || {};
    const payment = payments[0] || {};
    const gym = gymProfiles[0] || { name: 'Iron Temple Fitness', branch: 'Indiranagar, Bengaluru', gstin: '29AABCI1234F1Z8', phone: '9845012345' };

    const name = member.name || payment.member || 'Member';
    const phone = member.phone || payment.phone || '9876543210';
    const memberCode = member.code || member.id || 'IT1001';
    const date = payment.date || member.startDate || new Date().toISOString().split('T')[0];
    const receiptNo = payment.receipt || `RCPT-${id.substring(0, 6).toUpperCase()}`;

    const planName = member.plan || payment.plan || 'Quarterly';
    const planPrice = Number(member.planPrice || 4000);
    const discountPercent = Number(member.discountPercent || 0);
    const discountAmount = Number(member.discountAmount || 0);
    const admissionFee = Number(member.admissionFee || 0);
    const ptTrainer = member.ptTrainer || '';
    const ptSessions = Number(member.ptSessions || 0);
    const ptPrice = Number(member.ptPrice || 0);

    const membershipSubtotal = planPrice - discountAmount;
    const admissionSubtotal = admissionFee;
    const ptSubtotal = ptPrice;

    const taxPercent = Number(member.taxPercent || 18);
    const taxAmount = Number(member.taxAmount || Math.round(((membershipSubtotal + admissionSubtotal + ptSubtotal) * taxPercent) / 100));
    const grandTotal = Number(member.grandTotal || (membershipSubtotal + admissionSubtotal + ptSubtotal + taxAmount));
    const dues = Number(member.dues || 0);
    const amountReceived = Number(member.paidAmount || (grandTotal - dues));
    const statusText = dues > 0 ? 'PART-PAID' : 'PAID';
    const statusColor = dues > 0 ? '#f59e0b' : '#22c55e';
    const payMethod = member.paymentMethod || payment.method || 'UPI';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Tax Invoice - ${receiptNo}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 40px; color: #111; max-width: 800px; margin: auto; font-size: 13px; line-height: 1.5; }
          .center { text-align: center; }
          .gym-title { font-size: 26px; font-weight: 900; margin-bottom: 2px; }
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
          .sig-box { width: 180px; border: 1px dashed #999; padding: 25px 10px 10px 10px; text-align: center; font-size: 10px; color: #777; margin-left: auto; margin-top: 40px; }
          .footer { margin-top: 30px; font-size: 11px; color: #666; }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="gym-title">${gym.name || 'Iron Temple Fitness'}</div>
          <div class="gym-meta">Branch: ${gym.branch || 'Indiranagar, Bengaluru'} | GSTIN: ${gym.gstin || '29AABCI1234F1Z8'} | Phone: ${gym.phone || '9845012345'}</div>
          <div class="doc-type">TAX INVOICE / RECEIPT</div>
        </div>

        <div class="two-col">
          <div>
            <strong>BILLED TO</strong><br>
            <strong>${name}</strong><br>
            Phone: +91 ${phone}<br>
            Member ID: ${memberCode}
          </div>
          <div style="text-align: right;">
            <strong>INVOICE DETAILS</strong><br>
            Invoice No: <strong>${receiptNo}</strong><br>
            Date: <strong>${date}</strong><br>
            Status: <strong style="color: ${statusColor};">${statusText}</strong>
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th style="width: 5%;">#</th>
              <th style="width: 50%;">DESCRIPTION</th>
              <th style="width: 30%;">PERIOD / QTY</th>
              <th style="width: 15%; text-align: right;">AMOUNT (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr class="section-row"><td colspan="4">1. MEMBERSHIP</td></tr>
            <tr>
              <td>1.1</td>
              <td>Membership Plan: ${planName}</td>
              <td>${member.startDate || date} to ${member.expires || '2027-01-01'}</td>
              <td style="text-align: right;">₹${planPrice}</td>
            </tr>
            ${discountAmount > 0 ? `
            <tr>
              <td>1.2</td>
              <td>Applicable Discount (${discountPercent}%)</td>
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
          <tr><td>Membership Subtotal:</td><td style="text-align: right;">₹${membershipSubtotal}</td></tr>
          ${admissionSubtotal > 0 ? `<tr><td>Admission Subtotal:</td><td style="text-align: right;">₹${admissionSubtotal}</td></tr>` : ''}
          ${ptSubtotal > 0 ? `<tr><td>PT Subtotal:</td><td style="text-align: right;">₹${ptSubtotal}</td></tr>` : ''}
          ${taxAmount > 0 ? `<tr><td>Tax / GST (${taxPercent}%):</td><td style="text-align: right;">₹${taxAmount}</td></tr>` : ''}
          <tr class="grand-total"><td>GRAND TOTAL:</td><td style="text-align: right;">₹${grandTotal}</td></tr>
          <tr><td style="color: green; font-weight: bold;">Amount Received (${payMethod}):</td><td style="text-align: right; color: green; font-weight: bold;">₹${amountReceived}</td></tr>
          <tr><td style="color: red; font-weight: bold;">BALANCE DUE:</td><td style="text-align: right; color: red; font-weight: bold;">₹${dues}</td></tr>
        </table>

        <div class="sig-box">Authorized Signature & Stamp</div>
        <div class="footer">Thank you for training with us! Please retain this receipt for your records.<br>Authorized by: ${gym.name} Admin</div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;

    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
