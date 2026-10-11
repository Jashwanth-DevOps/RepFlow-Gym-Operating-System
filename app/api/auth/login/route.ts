import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    // Instant authenticated session for the Gym Owner
    return NextResponse.json({
      success: true,
      user: {
        name: 'Gym Owner',
        email: email || 'owner@gym.com',
        role: 'Owner'
      }
    });
  } catch (err) {
    return NextResponse.json({
      success: true,
      user: { name: 'Gym Owner', email: 'owner@gym.com', role: 'Owner' }
    });
  }
}
