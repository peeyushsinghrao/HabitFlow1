import { getRequestUserId } from '@/lib/auth-user';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const userId = getRequestUserId(request);
  if (!userId || userId === 'default-user') {
    return NextResponse.json({ authenticated: false });
  }
  try {
    const profile = await db.userProfile.findUnique({
      where: { userId },
      select: { userId: true, email: true },
    });
    if (!profile) {
      return NextResponse.json({ authenticated: false });
    }
    return NextResponse.json({
      authenticated: true,
      userId: profile.userId,
      email: profile.email || '',
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
