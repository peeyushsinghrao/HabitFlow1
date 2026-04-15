import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { format } from 'date-fns';
import { getRequestUserId } from '@/lib/auth-user';

export async function GET(req: Request) {
  try {
    const userId = getRequestUserId(request);
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');
    const log = await db.reflectionLog.findUnique({
      where: { userId_date: { userId: userId, date } },
    });
    const history = await db.reflectionLog.findMany({
      where: { userId: userId },
      orderBy: { date: 'desc' },
      take: 60,
    });
    return NextResponse.json({ log, history });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reflection logs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = getRequestUserId(request);
    const { date, prompt, response } = await req.json();
    const safeDate = date || format(new Date(), 'yyyy-MM-dd');
    const log = await db.reflectionLog.upsert({
      where: { userId_date: { userId: userId, date: safeDate } },
      create: {
        userId: userId,
        date: safeDate,
        prompt: prompt || 'What are you proud of today?',
        response: response || '',
      },
      update: {
        prompt: prompt || 'What are you proud of today?',
        response: response || '',
      },
    });
    return NextResponse.json(log);
  } catch {
    return NextResponse.json({ error: 'Failed to save reflection log' }, { status: 500 });
  }
}
