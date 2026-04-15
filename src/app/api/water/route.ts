import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { format } from 'date-fns';
import { getRequestUserId } from '@/lib/auth-user';

export async function GET(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');

    const log = await db.waterLog.findUnique({
      where: { userId_date: { userId: userId, date } },
    });
    return NextResponse.json(log || { date, glasses: 0 });
  } catch (error) {
    console.error('Error fetching water log:', error);
    return NextResponse.json({ error: 'Failed to fetch water log' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const { date, glasses } = await request.json();
    const targetDate = date || format(new Date(), 'yyyy-MM-dd');

    const log = await db.waterLog.upsert({
      where: { userId_date: { userId: userId, date: targetDate } },
      create: { userId: userId, date: targetDate, glasses },
      update: { glasses },
    });
    return NextResponse.json(log);
  } catch (error) {
    console.error('Error saving water log:', error);
    return NextResponse.json({ error: 'Failed to save water log' }, { status: 500 });
  }
}
