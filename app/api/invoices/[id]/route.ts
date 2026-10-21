import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    
    // Find member or payment
    const members: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Member" WHERE "id" = $1 OR "code" = $1 LIMIT 1`, id
    ).catch(() => []);
    
    const payments: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Payment" WHERE "receipt" = $1 OR "id" = $1 LIMIT 1`, id
    ).catch(() => []);

    const gymProfiles: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "GymProfile" LIMIT 1`).catch(() => []);
    const gym = gymProfiles[0] || { name: 'GymRex Fitness', branch: 'Indiranagar, Bengaluru', phone: '9845012345' };

    const member = members[0];
    const payment = payments[0];
    const name = member?.name || payment?.member || 'Gym Member';
    const amount = payment?.amount || member?.planPrice || 4000;
    const plan = member?.plan || payment?.plan || 'Quarterly Membership';
    const date = payment?.date || new Date().toISOString().split('T')[0];
    const receiptNo = payment?.receipt || `RCPT-${id.substring(0, 6).toUpperCase()}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - ${receiptNo}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #111; max-width: 650px; margin: auto; }
          .invoice-box { border: 2px solid #84cc16; padding: 30px; border-radius: 12px; }
          .header { border-bottom: 2px solid #eee; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .title { font-size: 26px; font-weight: 900; color: #84cc16; }
          .details { margin: 25px 0; line-height: 1.8; font-size: 14px; }
          .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .table th { background: #f4f4f5; text-align: left; padding: 10px; border: 1px solid #ddd; }
          .table td { padding: 10px; border: 1px solid #eee; }
          .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; color: #111; }
          .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #777; }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <div>
              <div class="title">${gym.name}</div>
              <div style="font-size:12px;color:#555;">${gym.branch} | Phone: ${gym.phone}</div>
            </div>
            <div style="text-align:right;">
              <strong style="font-size:14px;">OFFICIAL INVOICE</strong><br>
              <span style="font-size:12px;color:#555;">Receipt: ${receiptNo}</span>
            </div>
          </div>
          
          <div class="details">
            <div><strong>Billed To:</strong> ${name}</div>
            <div><strong>Date:</strong> ${date}</div>
            <div><strong>Payment Status:</strong> <span style="color:#22c55e;font-weight:bold;">Completed</span></div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align:right;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${plan}</td>
                <td style="text-align:right;">₹${amount}</td>
              </tr>
            </tbody>
          </table>

          <div class="total">Total Paid: ₹${amount}</div>
          <div class="footer">Thank you for working out with ${gym.name}! This is a computer-generated tax invoice.</div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
