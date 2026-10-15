import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ptId = params.id;
    if (!ptId) {
      return NextResponse.json({ success: false, message: 'Missing PT assignment id' }, { status: 400 });
    }

    await prisma.$executeRawUnsafe(`
      UPDATE "pt_assignments"
      SET "sessions" = GREATEST("sessions" - 1, 0)
      WHERE "id" = $1
    `, ptId);

    const rows: any[] = await prisma.$queryRawUnsafe(`
      SELECT * FROM "pt_assignments" WHERE "id" = $1
    `, ptId).catch(() => []);

    const updated = rows.length > 0 ? rows[0] : { id: ptId, sessions: 0, member: 'Member' };

    return NextResponse.json({
      success: true,
      pt: updated,
      message: `Session completed. ${updated.sessions} session(s) remaining.`
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}