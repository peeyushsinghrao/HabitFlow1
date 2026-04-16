import { db } from '@/lib/db';
import { getRequestUserId } from '@/lib/auth-user';
import { NextResponse } from 'next/server';

function normalizeUsername(u: unknown): string | undefined {
  if (u === null || u === undefined) return undefined;
  if (typeof u !== 'string') return undefined;
  const clean = u.trim().toLowerCase().replace(/[^a-z0-9_\.]/g, '');
  return clean.length >= 3 ? clean : undefined;
}

export async function GET(request: Request) {
  try {
    const userId = getRequestUserId(request);
    if (!userId || userId === 'default-user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const profile = await db.userProfile.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

async function handleUpdate(userId: string, body: Record<string, unknown>) {
  if ('username' in body) {
    const clean = normalizeUsername(body.username);
    if (!clean) {
      delete body.username;
    } else {
      const conflict = await db.userProfile.findFirst({
        where: { username: clean, NOT: { userId } },
      });
      if (conflict) {
        return { error: 'This username is already taken.', status: 409 };
      }
      body.username = clean;
    }
  }

  const profile = await db.userProfile.upsert({
    where: { userId },
    create: { userId, ...body },
    update: body,
  });
  return { profile };
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const userId = getRequestUserId(request);
    const result = await handleUpdate(userId, body);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result.profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = getRequestUserId(request);
    const result = await handleUpdate(userId, body);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result.profile);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
