import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { format } from 'date-fns';
import { getRequestUserId } from '@/lib/auth-user';

export async function GET(req: Request) {
  try {
    const userId = getRequestUserId(request);
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');
    const log = await db.gratitudeLog.findUnique({
      where: { userId_date: { userId: userId, date } },
    });
    const history = await db.gratitudeLog.findMany({
      where: { userId: userId },
      orderBy: { date: 'desc' },
      take: 30,
    });
    return NextResponse.json({ log, history });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch gratitude log' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = getRequestUserId(request);
    const { date, entry1, entry2, entry3 } = await req.json();
    const log = await db.gratitudeLog.upsert({
      where: { userId_date: { userId: userId, date } },
      create: { userId: userId, date, entry1: entry1 || '', entry2: entry2 || '', entry3: entry3 || '' },
      update: { entry1: entry1 || '', entry2: entry2 || '', entry3: entry3 || '' },
    });
    return NextResponse.json(log);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save gratitude log' }, { status: 500 });
  }
}
