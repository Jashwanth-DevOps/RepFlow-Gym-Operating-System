import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'repflow_db.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return NextResponse.json(data);
    }
  } catch (e) {
    // fallback empty state
  }

  return NextResponse.json({
    gymProfile: { name: 'Iron Temple Fitness', branch: 'Indiranagar, Bengaluru', phone: '9845012345' },
    members: [],
    payments: [],
    expenses: [],
    leads: [],
    trainers: [],
    ptAssignments: [],
    plans: []
  });
}
