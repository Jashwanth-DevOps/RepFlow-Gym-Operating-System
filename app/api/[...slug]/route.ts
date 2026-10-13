import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET(request: Request, { params }: { params: { slug: string[] } }) {
  const endpoint = params.slug ? params.slug.join('/') : '';

  if (endpoint === 'data') {
    try {
      const rawCount: any = await prisma.$queryRaw`SELECT count(*)::text as cnt FROM "Member"`.catch(async () => {
        return await prisma.$queryRaw`SELECT count(*)::text as cnt FROM member`.catch(() => [{ cnt: 'err' }]);
      });

      const currentDb: any = await prisma.$queryRaw`SELECT current_database(), current_schema()`.catch(() => []);
      
      const rawMembers = await prisma.member.findMany({ orderBy: { id: 'asc' } }).catch(() => []);

      return NextResponse.json({
        debugInfo: {
          rawSqlCount: rawCount,
          connectedDb: currentDb,
          prismaMembersCount: rawMembers.length,
          dbUrlHost: process.env.DATABASE_URL ? process.env.DATABASE_URL.split('@')[1]?.split('/')[0] : 'not-set'
        },
        members: rawMembers
      }, {
        headers: { 'Cache-Control': 'no-store' }
      });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}