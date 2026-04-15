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

    const sessions = await db.focusSession.findMany({
      where: { userId: userId, date: { gte: since } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching focus sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch focus sessions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const { duration, task, notes, completed } = await request.json();
    const date = format(new Date(), 'yyyy-MM-dd');
    const xpEarned = completed ? Math.floor(duration / 5) * 5 : 0;

    const session = await db.focusSession.create({
      data: {
        userId: userId,
        date,
        duration,
        task: task || '',
        notes: notes || '',
        completed: completed !== false,
        xpEarned,
      },
    });

    if (xpEarned > 0) {
      await db.userStats.upsert({
        where: { userId: userId },
        create: { userId: userId, xp: xpEarned },
        update: { xp: { increment: xpEarned } },
      });
    }

    await awardFocusEasterEggs(duration, date);

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error saving focus session:', error);
    return NextResponse.json({ error: 'Failed to save focus session' }, { status: 500 });
  }
}

async function awardFocusEasterEggs(duration: number, date: string) {
  const now = new Date();
  const hour = now.getHours();
  const completedToday = await db.focusSession.count({
    where: { userId: userId, date, completed: true },
  });

  const possibleBadges: string[] = [];
  if (duration >= 90) possibleBadges.push('deep_work');
  if (completedToday >= 3) possibleBadges.push('triple_focus');
  if (hour >= 22 || hour < 4) possibleBadges.push('night_owl');
  if (hour >= 4 && hour < 6) possibleBadges.push('early_bird');

  if (possibleBadges.length === 0) return;

  const existingBadges = await db.earnedBadge.findMany({
    where: { userId: userId, badgeType: { in: possibleBadges } },
    select: { badgeType: true },
  });
  const existing = new Set(existingBadges.map(badge => badge.badgeType));
  const badgesToAward = possibleBadges.filter(badge => !existing.has(badge));

  for (const badgeType of badgesToAward) {
    await db.earnedBadge.create({ data: { userId: userId, badgeType } });
    await db.userStats.upsert({
      where: { userId: userId },
      create: { userId: userId, xp: 50 },
      update: { xp: { increment: 50 } },
    });
  }
}
