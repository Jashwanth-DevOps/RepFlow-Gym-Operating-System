import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    // Fetch Member, Payment, Gym Profile, and Billing Settings from Supabase
    const members: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Member" WHERE "id" = $1 OR "code" = $1 LIMIT 1`, id
    ).catch(() => []);

    const payments: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Payment" WHERE "receipt" = $1 OR "id" = $1 LIMIT 1`, id
    ).catch(() => []);

    const gymProfiles: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM "GymProfile" LIMIT 1`
    ).catch(() => []);

    const member = members[0] || {};
    const payment = payments[0] || {};
    const gym = gymProfiles[0] || {
      name: 'GymRex Fitness',
      branch: 'Indiranagar, Bengaluru',
      phone: '9845012345',
      gstin: '29AABCI1234F1Z8'
    };

    const name = member.name || payment.member || 'Member';
    const phone = member.phone || payment.phone || '9876543210';
    const memberCode = member.code || member.id || 'IT1001';
    const date = payment.date || member.startDate || new Date().toISOString().split('T')[0];
    const receiptNo = payment.receipt || `RCPT-${Math.floor(1000 + Math.random() * 9000)}`;

    const planName = member.plan || payment.plan || 'Quarterly';
    const basePrice = Number(member.planPrice || payment.amount || 4000);
    const admissionFee = Number(member.admissionFee || 500);
    const dues = Number(member.dues || 0);

    // Calculate itemized breakdown
    const discountAmount = 0; // Default or calculated discount
    const membershipSubtotal = basePrice - discountAmount;
    const admissionSubtotal = admissionFee;
    const ptSubtotal = 0; // Optional PT add-on
    const taxRate = 18;
    const taxableSubtotal = membershipSubtotal + admissionSubtotal + ptSubtotal;
    const taxAmount = Math.round((taxableSubtotal * taxRate) / 100);
    const grandTotal = taxableSubtotal + taxAmount;
    const amountReceived = Math.max(0, grandTotal - dues);
    const statusText = dues > 0 ? 'PART-PAID' : 'PAID';
    const statusColor = dues > 0 ? '#f59e0b' : '#22c55e';

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
          .calc-table { width: 350px; margin-left: auto; margin-top: 15px; border-collapse: collapse; font-size: 12px; }
          .calc-table td { padding: 5px 4px; }
          .grand-total { border-top: 2px solid #111; border-bottom: 2px solid #111; font-weight: 900; font-size: 15px; }
          .sig-box { width: 180px; border: 1px dashed #999; padding: 25px 10px 10px 10px; text-align: center; font-size: 10px; color: #777; margin-left: auto; margin-top: 40px; }
          .footer { margin-top: 30px; font-size: 11px; color: #666; }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="gym-title">${gym.name || 'GymRex Fitness'}</div>
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
              <td style="text-align: right;">₹${basePrice}</td>
            </tr>
            <tr class="section-row"><td colspan="4">2. ADMISSION / JOINING FEE</td></tr>
            <tr>
              <td>2.1</td>
              <td>One-time admission / registration fee</td>
              <td>One-time</td>
              <td style="text-align: right;">₹${admissionFee}</td>
            </tr>
          </tbody>
        </table>

        <table class="calc-table">
          <tr><td>Membership Subtotal:</td><td style="text-align: right;">₹${membershipSubtotal}</td></tr>
          <tr><td>Admission Subtotal:</td><td style="text-align: right;">₹${admissionSubtotal}</td></tr>
          <tr><td>Tax / GST (${taxRate}%):</td><td style="text-align: right;">₹${taxAmount}</td></tr>
          <tr class="grand-total"><td>GRAND TOTAL:</td><td style="text-align: right;">₹${grandTotal}</td></tr>
          <tr><td style="color: green; font-weight: bold;">Amount Received:</td><td style="text-align: right; color: green; font-weight: bold;">₹${amountReceived}</td></tr>
          <tr><td style="color: red; font-weight: bold;">BALANCE DUE:</td><td style="text-align: right; color: red; font-weight: bold;">₹${dues}</td></tr>
        </table>

        <div class="sig-box">
          Authorized Signature & Stamp
        </div>

        <div class="footer">
          Thank you for training with us! Please retain this receipt for your records.<br>
          Authorized by: ${gym.name || 'GymRex'} Admin
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
