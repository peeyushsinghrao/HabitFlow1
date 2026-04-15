import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { format, subDays, startOfWeek } from 'date-fns';
import { getRequestUserId } from '@/lib/auth-user';

export async function GET(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const today = new Date();
    const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const sevenDaysAgo = format(subDays(today, 7), 'yyyy-MM-dd');

    const [habits, stats, focusSessions, moodLogs] = await Promise.all([
      db.habit.findMany({
        where: { userId, isArchived: false },
        include: {
          logs: {
            where: { date: { gte: sevenDaysAgo }, status: 'completed' },
          },
        },
      }),
      db.userStats.findUnique({ where: { userId: userId } }),
      db.focusSession.findMany({
        where: { userId: userId, date: { gte: sevenDaysAgo } },
      }),
      db.moodLog.findMany({
        where: { userId: userId, date: { gte: sevenDaysAgo } },
        orderBy: { date: 'asc' },
      }),
    ]);

    const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + s.duration, 0);
    const avgMood = moodLogs.length > 0
      ? moodLogs.reduce((acc, m) => acc + m.mood, 0) / moodLogs.length
      : null;

    const habitStats = habits.map(h => ({
      id: h.id,
      name: h.name,
      icon: h.icon,
      color: h.color,
      completedDays: h.logs.length,
    }));

    const totalCompleted = habitStats.reduce((acc, h) => acc + h.completedDays, 0);
    const totalPossible = habits.length * 7;
    const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    const bestHabit = habitStats.sort((a, b) => b.completedDays - a.completedDays)[0];
    const worstHabit = [...habitStats].sort((a, b) => a.completedDays - b.completedDays)[0];

    return NextResponse.json({
      weekStart,
      completionRate,
      currentStreak: stats?.currentStreak ?? 0,
      longestStreak: stats?.longestStreak ?? 0,
      totalFocusMinutes,
      avgMood,
      moodLogs,
      habitStats,
      bestHabit,
      worstHabit: worstHabit?.completedDays < 7 ? worstHabit : null,
      xp: stats?.xp ?? 0,
      level: stats?.level ?? 1,
    });
  } catch (error) {
    console.error('Error fetching weekly review:', error);
    return NextResponse.json({ error: 'Failed to fetch weekly review' }, { status: 500 });
  }
}
