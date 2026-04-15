import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { format } from 'date-fns';
import { getRequestUserId } from '@/lib/auth-user';

export async function GET(req: Request) {
  try {
    const userId = getRequestUserId(request);
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');
    const log = await db.energyLog.findUnique({
      where: { userId_date: { userId: userId, date } },
    });
    const history = await db.energyLog.findMany({
      where: { userId: userId },
      orderBy: { date: 'desc' },
      take: 30,
    });
    return NextResponse.json({ log, history });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch energy log' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = getRequestUserId(request);
    const { date, morning, evening } = await req.json();
    const log = await db.energyLog.upsert({
      where: { userId_date: { userId: userId, date } },
      create: { userId: userId, date, morning: morning ?? 3, evening: evening ?? 3 },
      update: { morning: morning ?? 3, evening: evening ?? 3 },
    });
    return NextResponse.json(log);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save energy log' }, { status: 500 });
  }
}
