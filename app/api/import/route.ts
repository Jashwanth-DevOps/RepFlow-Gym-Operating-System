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
        const name = (row.name || row.Name || row['Member Name'] || '').trim();
        const rawPhone = String(row.phone || row.Phone || row['Mobile'] || row['Contact'] || '').replace(/[^0-9]/g, '');
        const phone = rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone || '9876543210';
        
        if (!name) continue;

        const id = `mem_${Date.now()}_${i}`;
        const code = row.code || row.Code || row['Member ID'] || `IT${1001 + i}`;
        const plan = row.plan || row.Plan || row['Plan Name'] || 'Quarterly';
        const planPrice = Number(row.planPrice || row.Price || row['Plan Amount'] || row['Amount'] || 4000);
        const dues = Number(row.dues || row.Dues || row['Balance'] || row['Pending Dues'] || 0);
        const gender = (row.gender || row.Gender || 'Male').toLowerCase().startsWith('f') ? 'Female' : 'Male';
        const startDate = row.startDate || row['Start Date'] || row['Join Date'] || todayStr;
        
        // Calculate default end date if not provided
        let expires = row.expires || row['Expiry Date'] || row['End Date'];
        if (!expires) {
          const d = new Date(startDate);
          d.setDate(d.getDate() + 90);
          expires = d.toISOString().split('T')[0];
        }

        const paidAmount = Math.max(0, planPrice - dues);

        // Insert Member
        await prisma.$executeRawUnsafe(
          `INSERT INTO "Member" (
            "id", "name", "phone", "gender", "plan", "planPrice", "startDate", "expires", 
            "status", "dues", "code", "admissionFee", "grandTotal", "paidAmount", 
            "paymentMethod", "createdAt", "updatedAt"
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, 'Active', $9, $10, 0, $11, $12, 'Cash', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
          ON CONFLICT ("id") DO NOTHING`,
          id, name, phone, gender, plan, planPrice, startDate, expires, dues, code, planPrice, paidAmount
        );

        // If amount was paid, insert into Payment history
        if (paidAmount > 0) {
          const receiptNo = `RCPT-${1000 + i}`;
          await prisma.$executeRawUnsafe(
            `INSERT INTO "Payment" ("id", "receipt", "member", "phone", "amount", "method", "plan", "note", "date", "operator", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, 'Cash', $6, 'Imported from GymBook', $7, 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            `pay_imp_${Date.now()}_${i}`, receiptNo, name, phone, paidAmount, `${plan} Membership`, startDate
          ).catch(() => null);
        }

        importedCount++;
      }

      return NextResponse.json({ success: true, count: importedCount, message: `Successfully imported ${importedCount} members!` });
    }

    if (type === 'expenses') {
      let expenseCount = 0;
      for (let i = 0; i < records.length; i++) {
        const row = records[i];
        const category = row.category || row.Category || 'General';
        const paidTo = row.paidTo || row['Paid To'] || row.Title || 'Vendor';
        const amount = Number(row.amount || row.Amount || 0);
        const method = row.method || row.Method || 'UPI';
        const date = row.date || row.Date || todayStr;

        if (amount <= 0) continue;

        await prisma.$executeRawUnsafe(
          `INSERT INTO "Expense" ("id", "category", "paidTo", "title", "amount", "method", "date", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          `exp_imp_${Date.now()}_${i}`, category, paidTo, amount, method, date
        );
        expenseCount++;
      }

      return NextResponse.json({ success: true, count: expenseCount, message: `Successfully imported ${expenseCount} expenses!` });
    }

    return NextResponse.json({ success: false, message: 'Invalid import type' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
