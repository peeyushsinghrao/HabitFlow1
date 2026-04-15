import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { getRequestUserId } from '@/lib/auth-user';

const BOSS_CHALLENGES = [
  {
    title: '⚔️ Iron Habit',
    description: 'Complete at least 1 habit every single day this week — no days off!',
    requirementType: 'daily_habit',
    requirementValue: 7,
    coinsReward: 150,
  },
  {
    title: '🏆 All-Star Week',
    description: 'Complete ALL your habits on 3 different days this week.',
    requirementType: 'perfect_days',
    requirementValue: 3,
    coinsReward: 200,
  },
  {
    title: '💥 Total Warrior',
    description: 'Rack up 20 total habit completions across the week.',
    requirementType: 'total_completions',
    requirementValue: 20,
    coinsReward: 150,
  },
  {
    title: '🔥 Streak Machine',
    description: 'Complete any single habit 5 days in a row this week.',
    requirementType: 'habit_streak',
    requirementValue: 5,
    coinsReward: 175,
  },
  {
    title: '🌟 Perfect 5',
    description: 'Have 5 days this week where you complete every single habit.',
    requirementType: 'perfect_days',
    requirementValue: 5,
    coinsReward: 250,
  },
  {
    title: '⚡ Power Surge',
    description: 'Complete 30 total habit completions this week — beast mode!',
    requirementType: 'total_completions',
    requirementValue: 30,
    coinsReward: 200,
  },
];

function getWeekStart(date: Date): string {
  return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

async function computeProgress(
  userId: string,
  requirementType: string,
  requirementValue: number,
  weekStart: string,
  weekEnd: string
): Promise<{ progress: number; isCompleted: boolean }> {
  const habits = await db.habit.findMany({
    where: { userId, isArchived: false },
    select: { id: true },
  });
  const habitIds = habits.map(h => h.id);
  if (habitIds.length === 0) return { progress: 0, isCompleted: false };

  const logs = await db.habitLog.findMany({
    where: { habitId: { in: habitIds }, date: { gte: weekStart, lte: weekEnd }, status: 'completed' },
    select: { date: true, habitId: true },
  });

  const totalHabits = habitIds.length;

  if (requirementType === 'total_completions') {
    const progress = logs.length;
    return { progress, isCompleted: progress >= requirementValue };
  }

  if (requirementType === 'perfect_days') {
    const dayMap = new Map<string, Set<string>>();
    for (const log of logs) {
      if (!dayMap.has(log.date)) dayMap.set(log.date, new Set());
      dayMap.get(log.date)!.add(log.habitId);
    }
    const perfectDays = [...dayMap.values()].filter(s => s.size >= totalHabits).length;
    return { progress: perfectDays, isCompleted: perfectDays >= requirementValue };
  }

  if (requirementType === 'daily_habit') {
    const daysWithAnyHabit = new Set(logs.map(l => l.date)).size;
    return { progress: daysWithAnyHabit, isCompleted: daysWithAnyHabit >= requirementValue };
  }

  if (requirementType === 'habit_streak') {
    const habitLogMap = new Map<string, Set<string>>();
    for (const log of logs) {
      if (!habitLogMap.has(log.habitId)) habitLogMap.set(log.habitId, new Set());
      habitLogMap.get(log.habitId)!.add(log.date);
    }
    let maxStreak = 0;
    for (const [, dates] of habitLogMap) {
      let streak = 0;
      let maxForHabit = 0;
      const d = new Date(weekStart + 'T00:00:00');
      const end = new Date(weekEnd + 'T00:00:00');
      while (d <= end) {
        const ds = format(d, 'yyyy-MM-dd');
        if (dates.has(ds)) { streak++; maxForHabit = Math.max(maxForHabit, streak); }
        else streak = 0;
        d.setDate(d.getDate() + 1);
      }
      maxStreak = Math.max(maxStreak, maxForHabit);
    }
    return { progress: maxStreak, isCompleted: maxStreak >= requirementValue };
  }

  return { progress: 0, isCompleted: false };
}

export async function GET(request: Request) {
  const userId = getRequestUserId(request);
  const now = new Date();
  const weekStart = getWeekStart(now);
  const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');

  let challenge = await db.bossChallenge.findUnique({
    where: { userId_weekStart: { userId: userId, weekStart } },
  });

  if (!challenge) {
    const weekNum = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000));
    const template = BOSS_CHALLENGES[weekNum % BOSS_CHALLENGES.length];
    challenge = await db.bossChallenge.create({
      data: {
        userId: userId,
        weekStart,
        title: template.title,
        description: template.description,
        requirementType: template.requirementType,
        requirementValue: template.requirementValue,
        coinsReward: template.coinsReward,
      },
    });
  }

  const { progress, isCompleted } = await computeProgress(
    userId,
    challenge.requirementType,
    challenge.requirementValue,
    weekStart,
    weekEnd
  );

  if (isCompleted && !challenge.isCompleted) {
    await db.bossChallenge.update({
      where: { id: challenge.id },
      data: { isCompleted: true, currentProgress: progress },
    });
    await db.userStats.upsert({
      where: { userId: userId },
      create: { userId: userId, coins: challenge.coinsReward },
      update: { coins: { increment: challenge.coinsReward } },
    });
    await db.coinTransaction.create({
      data: {
        userId: userId,
        amount: challenge.coinsReward,
        reason: `Boss Challenge: ${challenge.title}`,
        date: weekStart,
      },
    });
    challenge = { ...challenge, isCompleted: true, currentProgress: progress };
  } else {
    await db.bossChallenge.update({
      where: { id: challenge.id },
      data: { currentProgress: progress },
    }).catch(() => {});
    challenge = { ...challenge, currentProgress: progress };
  }

  return NextResponse.json({ challenge, weekStart, weekEnd });
}
