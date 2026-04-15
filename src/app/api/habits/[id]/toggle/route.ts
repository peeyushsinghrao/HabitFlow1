import { db } from '@/lib/db';
import { getRequestUserId } from '@/lib/auth-user';
import { NextResponse } from 'next/server';
import { differenceInCalendarDays, format, parseISO, subDays } from 'date-fns';

// POST /api/habits/[id]/toggle - Toggle habit completion for a specific date
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getRequestUserId(request);
    const { id } = await params;
    const body = await request.json();
    const { date, value, status, note } = body;

    const targetDate = date || format(new Date(), 'yyyy-MM-dd');

    // Check if log exists for this habit and date
    const existingLog = await db.habitLog.findUnique({
      where: { habitId_date: { habitId: id, date: targetDate } },
    });

    let log;

    if (existingLog && existingLog.status === 'completed') {
      // Already completed → un-toggle (remove completion)
      await db.habitLog.delete({ where: { id: existingLog.id } });
      log = null;
    } else if (existingLog) {
      log = await db.habitLog.update({
        where: { id: existingLog.id },
        data: {
          status: status || 'completed',
          ...(value !== undefined && { value }),
        },
      });
    } else {
      log = await db.habitLog.create({
        data: {
          habitId: id,
          date: targetDate,
          status: status || 'completed',
          value: value ?? null,
          note: note ?? '',
        },
      });
    }

    // Update user stats (optimized)
    await updateStatsFast(userId, !!log);

    return NextResponse.json(log);
  } catch (error) {
    console.error('Error toggling habit:', error);
    return NextResponse.json({ error: 'Failed to toggle habit' }, { status: 500 });
  }
}

async function updateStatsFast(userId: string, wasCreated: boolean) {
  const allHabits = await db.habit.findMany({
    where: { userId, isArchived: false },
    select: { id: true },
  });
  const habitIds = allHabits.map(h => h.id);
  if (habitIds.length === 0) return;

  const today = format(new Date(), 'yyyy-MM-dd');

  // Fetch all completed logs from the last 365 days in ONE query
  const yearAgo = format(subDays(new Date(), 365), 'yyyy-MM-dd');
  const allLogs = await db.habitLog.findMany({
    where: {
      habitId: { in: habitIds },
      date: { gte: yearAgo },
      status: 'completed',
    },
    select: { date: true, habitId: true },
  });

  const dayCompleted = new Map<string, Set<string>>();
  for (const log of allLogs) {
    if (!dayCompleted.has(log.date)) dayCompleted.set(log.date, new Set());
    dayCompleted.get(log.date)!.add(log.habitId);
  }

  const activeDates = Array.from(dayCompleted.keys()).sort();
  const { currentStreak, longestStreak } = calculateHabitStreaks(activeDates);

  const totalCompleted = allLogs.length;

  // Get or create user stats
  const stats = await db.userStats.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  const xpGain = wasCreated ? 10 : 0;
  const newXP = stats.xp + xpGain;
  const newLevel = Math.floor(newXP / 100) + 1;

  await db.userStats.update({
    where: { userId },
    data: {
      currentStreak,
      longestStreak,
      totalCompleted,
      xp: newXP,
      level: newLevel,
    },
  });

  // Check badge awards (only 1 query each)
  const existingBadges = await db.earnedBadge.findMany({
    where: { userId },
    select: { badgeType: true },
  });
  const badgeTypes = new Set(existingBadges.map(b => b.badgeType));

  const badgesToAward: string[] = [];

  if (currentStreak >= 7 && !badgeTypes.has('week_streak')) badgesToAward.push('week_streak');
  if (currentStreak >= 30 && !badgeTypes.has('month_streak')) badgesToAward.push('month_streak');
  if (currentStreak >= 100 && !badgeTypes.has('century_streak')) badgesToAward.push('century_streak');

  // Perfect day check
  const todayCompleted = dayCompleted.get(today);
  if (todayCompleted && todayCompleted.size === habitIds.length && !badgeTypes.has('perfect_day')) {
    badgesToAward.push('perfect_day');
  }

  for (const badge of badgesToAward) {
    await db.earnedBadge.create({
      data: { userId, badgeType: badge },
    });
    await db.userStats.update({
      where: { userId },
      data: { xp: { increment: 100 } },
    });
  }

  // Award pet XP when habit is completed
  if (wasCreated) {
    const profile = await db.userProfile.findUnique({
      where: { userId },
      select: { petXP: true, petLevel: true },
    });
    if (profile) {
      const petXpGain = 5;
      const newPetXP = (profile.petXP ?? 0) + petXpGain;
      const petLevelThreshold = (profile.petLevel ?? 1) * 50;
      const newPetLevel = newPetXP >= petLevelThreshold
        ? (profile.petLevel ?? 1) + 1
        : (profile.petLevel ?? 1);
      const finalPetXP = newPetXP >= petLevelThreshold ? newPetXP - petLevelThreshold : newPetXP;
      await db.userProfile.update({
        where: { userId },
        data: { petXP: finalPetXP, petLevel: newPetLevel },
      });
    }
  }

  const now = new Date();
  if (wasCreated && now.getHours() === 11 && now.getMinutes() === 11 && !badgeTypes.has('lucky_1111')) {
    await db.earnedBadge.create({
      data: { userId, badgeType: 'lucky_1111' },
    });
    await db.userStats.update({
      where: { userId },
      data: { xp: { increment: 50 } },
    });
  }

  // Comeback Kid: resumed after a 7+ day gap
  if (wasCreated && !badgeTypes.has('comeback_kid')) {
    let gapDays = 0;
    for (let i = 1; i <= 14; i++) {
      const dayStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
      if (!dayCompleted.has(dayStr)) {
        gapDays++;
      } else {
        break;
      }
    }
    if (gapDays >= 7) {
      await db.earnedBadge.create({
        data: { userId, badgeType: 'comeback_kid' },
      });
      await db.userStats.update({
        where: { userId },
        data: { xp: { increment: 75 } },
      });
    }
  }

  // Weekend Warrior: complete all habits on both Saturday and Sunday of the same weekend
  if (wasCreated && !badgeTypes.has('weekend_warrior')) {
    const todayDate = new Date();
    const dayOfWeek = todayDate.getDay(); // 0=Sun, 6=Sat
    if (dayOfWeek === 0) {
      const satStr = format(subDays(todayDate, 1), 'yyyy-MM-dd');
      const satCompleted = dayCompleted.get(satStr);
      const sunCompleted = dayCompleted.get(today);
      if (satCompleted && satCompleted.size === habitIds.length &&
          sunCompleted && sunCompleted.size === habitIds.length) {
        await db.earnedBadge.create({
          data: { userId, badgeType: 'weekend_warrior' },
        });
        await db.userStats.update({
          where: { userId },
          data: { xp: { increment: 100 } },
        });
      }
    }
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
