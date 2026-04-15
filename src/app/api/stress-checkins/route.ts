import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { format, startOfWeek } from 'date-fns';
import { getRequestUserId } from '@/lib/auth-user';

function getWeekStart(date = new Date()) {
  return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

export async function GET(req: Request) {
  try {
    const userId = getRequestUserId(request);
    const { searchParams } = new URL(req.url);
    const weekStart = searchParams.get('weekStart') || getWeekStart();
    const checkIn = await db.stressCheckIn.findUnique({
      where: { userId_weekStart: { userId: userId, weekStart } },
    });
    const history = await db.stressCheckIn.findMany({
      where: { userId: userId },
      orderBy: { weekStart: 'desc' },
      take: 16,
    });
    return NextResponse.json({ checkIn, history });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stress reviews' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = getRequestUserId(request);
    const { weekStart, academicPressure, sleepQuality, socialTime, notes } = await req.json();
    const safeWeekStart = weekStart || getWeekStart();
    const checkIn = await db.stressCheckIn.upsert({
      where: { userId_weekStart: { userId: userId, weekStart: safeWeekStart } },
      create: {
        userId: userId,
        weekStart: safeWeekStart,
        academicPressure: academicPressure ?? 3,
        sleepQuality: sleepQuality ?? 3,
        socialTime: socialTime ?? 3,
        notes: notes || '',
      },
      update: {
        academicPressure: academicPressure ?? 3,
        sleepQuality: sleepQuality ?? 3,
        socialTime: socialTime ?? 3,
        notes: notes || '',
      },
    });
    return NextResponse.json(checkIn);
  } catch {
    return NextResponse.json({ error: 'Failed to save stress review' }, { status: 500 });
  }
}
