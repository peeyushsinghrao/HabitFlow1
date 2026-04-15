import { db } from '@/lib/db';
import { normalizeEmail, userIdFromEmail } from '@/lib/auth-user';
import { NextResponse } from 'next/server';

const SESSION_COOKIE = 'nuviora-session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function setSessionCookie(response: NextResponse, userId: string): NextResponse {
  response.cookies.set(SESSION_COOKIE, encodeURIComponent(userId), {
    httpOnly: false,
<<<<<<< HEAD
    secure: false,
    sameSite: 'lax',
=======
    secure: true,
    sameSite: 'none',
>>>>>>> 925ef42 (Initial commit)
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
  return response;
}

function normalizeUsername(u: unknown) {
  if (typeof u !== 'string') return '';
  return u.trim().toLowerCase().replace(/[^a-z0-9_\.]/g, '');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action as 'signup' | 'login' | 'reset-password';
    const email = normalizeEmail(body.email);
    const password = typeof body.password === 'string' ? body.password : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const username = normalizeUsername(body.username);

    if (!email || !email.includes('@') || !password) {
      return NextResponse.json({ error: 'Enter a valid email and password.' }, { status: 400 });
    }

    const userId = userIdFromEmail(email);
    const existing = await db.userProfile.findUnique({ where: { userId } });

    if (action === 'reset-password') {
      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
      }
      if (!existing) {
        return NextResponse.json({ error: 'No account found for this email.' }, { status: 404 });
      }
      const profile = await db.userProfile.update({
        where: { userId },
        data: { email, password },
      });
      return NextResponse.json({ profile, userId });
    }

    if (action === 'signup') {
      if (existing?.password) {
        return NextResponse.json({ error: 'An account with this email already exists. Please sign in.' }, { status: 409 });
      }

      if (!username || username.length < 3) {
        return NextResponse.json({ error: 'Username must be at least 3 characters (letters, numbers, _ or .).' }, { status: 400 });
      }
      if (username.length > 20) {
        return NextResponse.json({ error: 'Username must be 20 characters or less.' }, { status: 400 });
      }

      const usernameConflict = await db.userProfile.findUnique({ where: { username } });
      if (usernameConflict) {
        return NextResponse.json({ error: 'This username is already taken. Please choose another.', field: 'username' }, { status: 409 });
      }

      const profile = await db.userProfile.upsert({
        where: { userId },
        create: { userId, email, password, name: name || 'Nuviora User', username },
        update: { email, password, name: name || existing?.name || 'Nuviora User', username },
      });

      await db.userStats.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });

      const res = NextResponse.json({ profile, userId });
      return setSessionCookie(res, userId);
    }

    if (!existing || !existing.password) {
      return NextResponse.json({ error: 'No account found. Please sign up first.' }, { status: 404 });
    }

    if (existing.password !== password) {
      return NextResponse.json({ error: 'Incorrect password. Try again.' }, { status: 401 });
    }

    const res = NextResponse.json({ profile: existing, userId });
    return setSessionCookie(res, userId);
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed.' }, { status: 500 });
  }
}
