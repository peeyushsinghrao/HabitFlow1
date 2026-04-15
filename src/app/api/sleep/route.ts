import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { format, subDays } from 'date-fns';
import { getRequestUserId } from '@/lib/auth-user';

export async function GET(request: Request) {
  const userId = getRequestUserId(request);
  const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
  const logs = await db.sleepLog.findMany({
    where: { userId: userId, date: { gte: thirtyDaysAgo } },
    orderBy: { date: 'desc' },
  });
  return NextResponse.json(logs);
}

export async function POST(request: Request) {
  const userId = getRequestUserId(request);
  const body = await request.json();
  const { date, bedtime, wakeTime, quality = 3, notes = '' } = body;
  if (!date || !bedtime || !wakeTime) return NextResponse.json({ error: 'Date, bedtime, and wake time required' }, { status: 400 });

  // Calculate duration
  const [bH, bM] = bedtime.split(':').map(Number);
  const [wH, wM] = wakeTime.split(':').map(Number);
  let bMins = bH * 60 + bM;
  let wMins = wH * 60 + wM;
  if (wMins < bMins) wMins += 24 * 60;
  const duration = Math.round((wMins - bMins) / 6) / 10;

  const log = await db.sleepLog.upsert({
    where: { userId_date: { userId: userId, date } },
    create: { userId: userId, date, bedtime, wakeTime, duration, quality: parseInt(quality), notes },
    update: { bedtime, wakeTime, duration, quality: parseInt(quality), notes },
  });
  return NextResponse.json(log);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  await db.sleepLog.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
