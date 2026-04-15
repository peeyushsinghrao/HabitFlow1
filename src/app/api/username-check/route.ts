import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

function normalizeUsername(u: string) {
  return u.trim().toLowerCase().replace(/[^a-z0-9_\.]/g, '');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = searchParams.get('username') || '';
    const username = normalizeUsername(raw);

    if (!username || username.length < 3) {
      return NextResponse.json({ available: false, error: 'Username must be at least 3 characters.' });
    }
    if (username.length > 20) {
      return NextResponse.json({ available: false, error: 'Username must be 20 characters or less.' });
    }

    const existing = await db.userProfile.findUnique({ where: { username } });
    return NextResponse.json({ available: !existing, username });
  } catch (error) {
    console.error('Username check error:', error);
    return NextResponse.json({ available: false, error: 'Could not check username.' }, { status: 500 });
  }
}
