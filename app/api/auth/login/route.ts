import { NextResponse } from 'next/server';
import { memoryDb, logAudit } from '../../store';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
try {
const body = await request.json();
const email = (body.email || '').trim().toLowerCase();
const password = (body.password || '').trim();

let matched = (memoryDb.staff || []).find((s: any) => s.email && s.email.trim().toLowerCase() === email);
if (!matched) {
  const tr = (memoryDb.trainers || []).find((t: any) => t.email && t.email.trim().toLowerCase() === email);
  if (tr) {
    matched = { name: tr.name, email: tr.email, password: tr.password, role: 'Trainer' };
  }
}
if (!matched && (email === 'owner@gym.com' || email === 'admin@gym.com')) {
  matched = { name: 'Gym Owner', email: 'owner@gym.com', password: 'password123', role: 'Owner' };
}
if (!matched) {
  return NextResponse.json({ success: false, message: 'Account not found.' }, { status: 401 });
}
if (matched.password && matched.password !== password) {
  return NextResponse.json({ success: false, message: 'Incorrect password.' }, { status: 401 });
}
logAudit('Logged in', matched.name);
return NextResponse.json({ success: true, user: { name: matched.name, email: matched.email, role: matched.role || 'Owner' } });
} catch (err) {
return NextResponse.json({ success: false, message: 'Authentication error.' }, { status: 500 });
}
}
