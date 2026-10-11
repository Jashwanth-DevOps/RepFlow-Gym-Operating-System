import { NextResponse } from 'next/server';
import { memoryDb } from '../store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(memoryDb);
}
