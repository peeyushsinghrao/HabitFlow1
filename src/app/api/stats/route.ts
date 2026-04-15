import { db } from '@/lib/db';
import { getRequestUserId } from '@/lib/auth-user';
import { NextResponse } from 'next/server';
import { differenceInCalendarDays, format, parseISO, subDays } from 'date-fns';

// GET /api/stats - Get user stats and badges
export async function GET(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const savedStats = await db.userStats.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    const badges = await db.earnedBadge.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
    });

    const activeHabits = await db.habit.findMany({ where: { userId, isArchived: false }, select: { id: true } });
    const habitIds = activeHabits.map(habit => habit.id);
    const totalHabits = activeHabits.length;
    const completedLogs = habitIds.length > 0
      ? await db.habitLog.findMany({
          where: { status: 'completed', habitId: { in: habitIds } },
          select: { date: true },
        })
      : [];
    const totalCompleted = completedLogs.length;
    const thisWeekCompleted = await db.habitLog.count({
      where: {
        status: 'completed',
        habitId: { in: habitIds },
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const activeDates = Array.from(new Set(completedLogs.map(log => log.date))).sort();
    const { currentStreak, longestStreak } = calculateHabitStreaks(activeDates);

    const stats = await db.userStats.update({
      where: { userId },
      data: {
        currentStreak,
        longestStreak,
        totalCompleted,
        level: Math.floor(savedStats.xp / 100) + 1,
      },
    });

    const level = Math.floor(stats.xp / 100) + 1;
    const xpForNextLevel = level * 100;
    const xpInCurrentLevel = stats.xp % 100;
    const xpProgress = Math.round((xpInCurrentLevel / 100) * 100);

    // Badge definitions
    const badgeDefinitions: Record<string, { name: string; description: string; icon: string; hidden?: boolean }> = {
      first_habit: { name: 'First Step', description: 'Created your first habit', icon: '🌱' },
      week_streak: { name: 'Week Warrior', description: 'Maintained a 7-day streak', icon: '🔥' },
      month_streak: { name: 'Monthly Master', description: 'Maintained a 30-day streak', icon: '⚡' },
      century_streak: { name: 'Century Club', description: 'Maintained a 100-day streak', icon: '💎' },
      perfect_day: { name: 'Perfect Day', description: 'Completed all habits in a day', icon: '🌟' },
      night_owl: { name: 'Night Owl', description: 'Completed a focus session late at night', icon: '🦉', hidden: true },
      early_bird: { name: 'Early Bird', description: 'Completed a focus session before sunrise', icon: '🌅', hidden: true },
      deep_work: { name: 'Deep Work Monk', description: 'Completed a 90-minute focus session', icon: '🧘', hidden: true },
      triple_focus: { name: 'Triple Lock-In', description: 'Completed 3 focus sessions in one day', icon: '🔒', hidden: true },
      lucky_1111: { name: '11:11 Wish', description: 'Completed a habit at exactly 11:11', icon: '✨', hidden: true },
      comeback_kid: { name: 'Comeback Kid', description: 'Resumed habits after a 7-day break', icon: '🦋', hidden: true },
      weekend_warrior: { name: 'Weekend Warrior', description: 'Completed all habits on Saturday and Sunday', icon: '⚔️', hidden: true },
    };

    const formattedBadges = badges.map(b => ({
      ...b,
      ...badgeDefinitions[b.badgeType],
    }));

    return NextResponse.json({
      ...stats,
      level,
      xpForNextLevel,
      xpInCurrentLevel,
      xpProgress,
      totalHabits,
      totalCompleted,
      thisWeekCompleted,
      badges: formattedBadges,
      allBadgeTypes: Object.entries(badgeDefinitions)
        .filter(([type, def]) => !def.hidden || badges.some(b => b.badgeType === type))
        .map(([type, def]) => ({
          type,
          ...def,
          earned: badges.some(b => b.badgeType === type),
        })),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

function calculateHabitStreaks(activeDates: string[]) {
  const activeSet = new Set(activeDates);
  let currentStreak = 0;

  for (let i = 0; i < 3650; i++) {
    const dayStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
    if (activeSet.has(dayStr)) {
      currentStreak++;
      continue;
    }
    if (i > 0) break;
  }

  let longestStreak = 0;
  let runningStreak = 0;
  let previousDate: string | null = null;

  for (const date of activeDates) {
    if (!previousDate || differenceInCalendarDays(parseISO(date), parseISO(previousDate)) === 1) {
      runningStreak++;
    } else {
      runningStreak = 1;
    }
    longestStreak = Math.max(longestStreak, runningStreak);
    previousDate = date;
  }

  return { currentStreak, longestStreak };
}
