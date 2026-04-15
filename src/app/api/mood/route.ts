import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { format, subDays } from 'date-fns';
import { getRequestUserId } from '@/lib/auth-user';

export async function GET(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const since = format(subDays(new Date(), days), 'yyyy-MM-dd');

    const moods = await db.moodLog.findMany({
      where: { userId: userId, date: { gte: since } },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(moods);
  } catch (error) {
    console.error('Error fetching moods:', error);
    return NextResponse.json({ error: 'Failed to fetch moods' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const { date, mood } = await request.json();
    const targetDate = date || format(new Date(), 'yyyy-MM-dd');

    const moodLog = await db.moodLog.upsert({
      where: { userId_date: { userId: userId, date: targetDate } },
      create: { userId: userId, date: targetDate, mood },
      update: { mood },
    });
    return NextResponse.json(moodLog);
  } catch (error) {
    console.error('Error saving mood:', error);
    return NextResponse.json({ error: 'Failed to save mood' }, { status: 500 });
  }
}
