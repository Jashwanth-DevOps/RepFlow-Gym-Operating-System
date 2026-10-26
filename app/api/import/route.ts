import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    const { type, records } = await req.json();

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ success: false, message: 'No records provided.' }, { status: 400 });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    if (type === 'members') {
      let importedCount = 0;

      for (let i = 0; i < records.length; i++) {
        const row = records[i];

        // 1. Exact Name Extraction
        const nameKey = Object.keys(row).find(k => k.trim().toLowerCase() === 'name');
        const name = (nameKey ? row[nameKey] : (row.name || row.Name || '')).trim();
        if (!name) continue;

        // 2. Normalize Member ID to strictly IT1001, IT1002, etc.
        const idKey = Object.keys(row).find(k => k.trim().toLowerCase().includes('member id') || k.trim().toLowerCase() === 'code');
        const rawIdVal = idKey ? String(row[idKey]).trim() : '';
        
        let itCode = `IT${1001 + i}`;
        if (rawIdVal) {
          const numMatch = rawIdVal.match(/\d+/);
          if (numMatch) {
            itCode = `IT${numMatch[0]}`;
          }
        }

        // 3. Extract Dues Amount from CSV (Dues Amount (INR))
        const duesKey = Object.keys(row).find(k => k.trim().toLowerCase().includes('due'));
        const dues = duesKey ? Number(String(row[duesKey]).replace(/[^0-9.]/g, '') || 0) : 0;

        // 4. Extract Amount Paid from CSV (Amount Paid (INR))
        const paidKey = Object.keys(row).find(k => k.trim().toLowerCase().includes('amount pa') || k.trim().toLowerCase().includes('paid'));
        const paidAmount = paidKey ? Number(String(row[paidKey]).replace(/[^0-9.]/g, '') || 0) : 0;

        // 5. Total Plan Price = Paid Amount + Dues
        const planPrice = (paidAmount + dues) > 0 ? (paidAmount + dues) : 4000;

        // 6. Dates (Joining Date & Ending Date)
        const joinKey = Object.keys(row).find(k => k.trim().toLowerCase().includes('join') || k.trim().toLowerCase().includes('start'));
        const endKey = Object.keys(row).find(k => k.trim().toLowerCase().includes('ending') || k.trim().toLowerCase().includes('expir') || k.trim().toLowerCase().includes('end'));
        
        const startDate = (joinKey && row[joinKey]) ? String(row[joinKey]).trim() : todayStr;
        let expires = (endKey && row[endKey]) ? String(row[endKey]).trim() : '';
        if (!expires) {
          const d = new Date(startDate);
          d.setDate(d.getDate() + 90);
          expires = d.toISOString().split('T')[0];
        }

        // 7. Status (Active vs Expired)
        const statusKey = Object.keys(row).find(k => k.trim().toLowerCase().includes('status'));
        let status = 'Active';
        if (statusKey && row[statusKey]) {
          const rawStatus = String(row[statusKey]).trim().toLowerCase();
          if (rawStatus.includes('expir')) status = 'Expired';
          else if (rawStatus.includes('lapse')) status = 'Lapsed';
        }

        // 8. Phone
        const phoneKey = Object.keys(row).find(k => k.trim().toLowerCase().includes('phone') || k.trim().toLowerCase().includes('mobile') || k.trim().toLowerCase().includes('contact'));
        const rawPhone = phoneKey ? String(row[phoneKey]).replace(/[^0-9]/g, '') : '';
        const phone = rawPhone.length >= 10 ? rawPhone.slice(-10) : `987654${String(1000 + i).slice(-4)}`;

        const id = `mem_${itCode}_${Date.now()}`;

        // Insert Member into Supabase with clean IT ID and true Dues
        await prisma.$executeRawUnsafe(
          `INSERT INTO "Member" (
            "id", "name", "phone", "gender", "plan", "planPrice", "startDate", "expires", 
            "status", "dues", "code", "admissionFee", "grandTotal", "paidAmount", 
            "paymentMethod", "createdAt", "updatedAt"
          ) VALUES (
            $1, $2, $3, 'Male', 'Quarterly', $4, $5, $6, $7, $8, $9, 0, $10, $11, 'Cash', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
          ON CONFLICT ("id") DO UPDATE SET "dues" = EXCLUDED."dues", "code" = EXCLUDED."code"`,
          id, name, phone, planPrice, startDate, expires, status, dues, itCode, planPrice, paidAmount
        );

        // Historical Payment entry (attributed to their original join date, so COLLECTED TODAY stays clean)
        if (paidAmount > 0) {
          const receiptNo = `RCPT-${itCode.replace('IT', '')}`;
          await prisma.$executeRawUnsafe(
            `INSERT INTO "Payment" ("id", "receipt", "member", "phone", "amount", "method", "plan", "note", "date", "operator", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, 'Cash', 'Membership', 'Imported from GymBook', $6, 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            `pay_${itCode}`, receiptNo, name, phone, paidAmount, startDate
          ).catch(() => null);
        }

        importedCount++;
      }

      return NextResponse.json({ success: true, count: importedCount, message: `Successfully imported ${importedCount} members as IT1001...!` });
    }

    return NextResponse.json({ success: false, message: 'Invalid import type' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
