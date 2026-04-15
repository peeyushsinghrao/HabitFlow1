import { db } from '@/lib/db';
import { getRequestUserId } from '@/lib/auth-user';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const [logs, profile] = await Promise.all([
      db.periodLog.findMany({
        where: { userId },
        orderBy: { startDate: 'desc' },
        take: 18,
      }),
      db.userProfile.findUnique({
        where: { userId },
        select: {
          gender: true,
          periodAge: true,
          periodCycleLength: true,
          periodLastDate: true,
          periodReminderEnabled: true,
        },
      }),
    ]);
    return NextResponse.json({
      logs,
      settings: {
        gender: profile?.gender || '',
        age: profile?.periodAge ?? null,
        cycleLength: profile?.periodCycleLength || 28,
        lastPeriodDate: profile?.periodLastDate || logs[0]?.startDate || '',
        reminderEnabled: profile?.periodReminderEnabled || false,
      },
    });
  } catch (error) {
    console.error('Period tracker GET error:', error);
    return NextResponse.json({ error: 'Failed to load period logs.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const body = await request.json();
    const startDate = typeof body.startDate === 'string' ? body.startDate : '';
    const endDate = typeof body.endDate === 'string' ? body.endDate : '';
    const flow = typeof body.flow === 'string' ? body.flow : 'medium';
    const symptoms = Array.isArray(body.symptoms) ? JSON.stringify(body.symptoms) : '[]';
    const notes = typeof body.notes === 'string' ? body.notes : '';

    if (!startDate) {
      return NextResponse.json({ error: 'Start date is required.' }, { status: 400 });
    }

    const log = await db.periodLog.upsert({
      where: { userId_startDate: { userId, startDate } },
      create: { userId, startDate, endDate, flow, symptoms, notes },
      update: { endDate, flow, symptoms, notes },
    });

    await db.userProfile.update({
      where: { userId },
      data: { periodLastDate: startDate },
    }).catch(() => {});

    return NextResponse.json({ log });
  } catch (error) {
    console.error('Period tracker POST error:', error);
    return NextResponse.json({ error: 'Failed to save period log.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const body = await request.json();
    const age = Number(body.age);
    const cycleLength = Number(body.cycleLength || 28);
    const lastPeriodDate = typeof body.lastPeriodDate === 'string' ? body.lastPeriodDate : '';
    const reminderEnabled = Boolean(body.reminderEnabled);

    if (!Number.isFinite(age) || age < 8 || age > 60) {
      return NextResponse.json({ error: 'Enter a valid age.' }, { status: 400 });
    }

    const profile = await db.userProfile.update({
      where: { userId },
      data: {
        periodAge: Math.round(age),
        periodCycleLength: Math.max(21, Math.min(45, Math.round(cycleLength))),
        periodLastDate,
        periodReminderEnabled: reminderEnabled,
      },
      select: {
        periodAge: true,
        periodCycleLength: true,
        periodLastDate: true,
        periodReminderEnabled: true,
      },
    });

    if (lastPeriodDate) {
      await db.periodLog.upsert({
        where: { userId_startDate: { userId, startDate: lastPeriodDate } },
        create: { userId, startDate: lastPeriodDate, flow: 'medium', symptoms: '[]', notes: '' },
        update: {},
      }).catch(() => {});
    }

    return NextResponse.json({
      settings: {
        age: profile.periodAge,
        cycleLength: profile.periodCycleLength,
        lastPeriodDate: profile.periodLastDate,
        reminderEnabled: profile.periodReminderEnabled,
      },
    });
  } catch (error) {
    console.error('Period tracker settings error:', error);
    return NextResponse.json({ error: 'Failed to save period settings.' }, { status: 500 });
  }
}