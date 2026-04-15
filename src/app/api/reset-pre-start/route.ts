import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getRequestUserId } from '@/lib/auth-user';

// POST /api/reset-pre-start - Reset all data tracked before APP_START_DATE (April 9, 2026)
export async function POST(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const APP_START_DATE = '2026-04-09';
    const userHabits = await db.habit.findMany({
      where: { userId, isArchived: false },
      select: { id: true },
    });
    const habitIds = userHabits.map(h => h.id);

    const deletedLogs = await db.habitLog.deleteMany({
      where: {
        habitId: { in: habitIds },
        date: { lt: APP_START_DATE },
      },
    });

    const deletedPWDaily = await db.pWDaily.deleteMany({
      where: {
        userId,
        date: { lt: APP_START_DATE },
      },
    });

    const deletedClasses = await db.pWClass.deleteMany({
      where: {
        userId,
        date: { lt: APP_START_DATE },
      },
    });

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    if (habitIds.length > 0) {
      const allLogs = await db.habitLog.findMany({
        where: {
          habitId: { in: habitIds },
          date: { gte: APP_START_DATE },
          status: 'completed',
        },
        select: { date: true, habitId: true },
        orderBy: { date: 'asc' },
      });

      const dayCompleted = new Map<string, Set<string>>();
      for (const log of allLogs) {
        if (!dayCompleted.has(log.date)) dayCompleted.set(log.date, new Set());
        dayCompleted.get(log.date)!.add(log.habitId);
      }

      const dates = Array.from(dayCompleted.keys()).sort();
      for (const dateStr of dates) {
        const completed = dayCompleted.get(dateStr);
        if (completed && completed.size === habitIds.length) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const dayStr = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
        const dateKey = `${dayStr.getFullYear()}-${String(dayStr.getMonth() + 1).padStart(2, '0')}-${String(dayStr.getDate()).padStart(2, '0')}`;
        if (dateKey < APP_START_DATE) break;
        const completed = dayCompleted.get(dateKey);
        if (completed && completed.size === habitIds.length) {
          currentStreak++;
        } else if (i > 0) {
          break;
        }
      }
    }

    const totalCompleted = await db.habitLog.count({
      where: { habitId: { in: habitIds }, status: 'completed' },
    });

    const baseXP = totalCompleted * 10;

    await db.userStats.upsert({
      where: { userId: userId },
      create: {
        userId: userId,
        xp: baseXP,
        level: Math.floor(baseXP / 100) + 1,
        currentStreak,
        longestStreak,
        totalCompleted,
      },
      update: {
        xp: baseXP,
        level: Math.floor(baseXP / 100) + 1,
        currentStreak,
        longestStreak,
        totalCompleted,
      },
    });

    await db.earnedBadge.deleteMany({
      where: {
        userId,
        earnedAt: { lt: new Date('2026-04-09T00:00:00') },
      },
    });

    const badgeTypes = new Set(
      (await db.earnedBadge.findMany({
        where: { userId: userId },
        select: { badgeType: true },
      })).map(b => b.badgeType)
    );

    if (!badgeTypes.has('week_streak') && longestStreak >= 7) {
      await db.earnedBadge.create({ data: { userId: userId, badgeType: 'week_streak' } });
    }
    if (!badgeTypes.has('month_streak') && longestStreak >= 30) {
      await db.earnedBadge.create({ data: { userId: userId, badgeType: 'month_streak' } });
    }
    if (!badgeTypes.has('century_streak') && longestStreak >= 100) {
      await db.earnedBadge.create({ data: { userId: userId, badgeType: 'century_streak' } });
    }

    return NextResponse.json({
      success: true,
      deletedLogs: deletedLogs.count,
      deletedPWDaily: deletedPWDaily.count,
      deletedClasses: deletedClasses.count,
      newStats: { currentStreak, longestStreak, totalCompleted },
    });
  } catch (error) {
    console.error('Error resetting pre-start data:', error);
    return NextResponse.json({ error: 'Failed to reset data' }, { status: 500 });
  }
}
