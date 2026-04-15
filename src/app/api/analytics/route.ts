import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, subMonths } from 'date-fns';
import { getRequestUserId } from '@/lib/auth-user';

// GET /api/analytics - Get analytics data (optimized: ~3 DB queries total)
export async function GET(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'weekly';
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    // === QUERY 1: Fetch all habits ===
    const habits = await db.habit.findMany({
      where: { userId, isArchived: false },
    });
    const habitIds = habits.map(h => h.id);

    // === QUERY 2: Fetch ALL logs at once (no more per-day queries!) ===
    // Determine the widest date range we might need
    const yearAgo = format(subDays(today, 365), 'yyyy-MM-dd');
    const allLogs = await db.habitLog.findMany({
      where: {
        habitId: { in: habitIds },
        date: { gte: yearAgo },
      },
    });

    // Build a fast lookup map: logsByDate[date] = count of completed
    const logsByDate: Record<string, number> = {};
    const logsByHabitAndDate: Record<string, { status: string; value: number | null }> = {};
    for (const log of allLogs) {
      if (log.status === 'completed') {
        logsByDate[log.date] = (logsByDate[log.date] || 0) + 1;
      }
      logsByHabitAndDate[`${log.habitId}_${log.date}`] = {
        status: log.status,
        value: log.value,
      };
    }

    const totalHabits = habits.length;

    // === Compute chart data in-memory (zero DB queries) ===
    let labels: string[] = [];
    let chartData: { date: string; completed: number; total: number; rate: number }[] = [];

    if (range === 'weekly') {
      const startDate = startOfWeek(today, { weekStartsOn: 1 });
      const endDate = endOfWeek(today, { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      labels = days.map(d => format(d, 'EEE'));
      chartData = days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const completed = logsByDate[dateStr] || 0;
        return {
          date: dateStr,
          completed,
          total: totalHabits,
          rate: totalHabits > 0 ? Math.round((completed / totalHabits) * 100) : 0,
        };
      });
    } else if (range === 'monthly') {
      const startDate = startOfMonth(today);
      const endDate = endOfMonth(today);
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      labels = days.map(d => format(d, 'd'));
      chartData = days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const completed = logsByDate[dateStr] || 0;
        return {
          date: dateStr,
          completed,
          total: totalHabits,
          rate: totalHabits > 0 ? Math.round((completed / totalHabits) * 100) : 0,
        };
      });
    } else {
      // Yearly - last 12 months
      const monthlyArr: { month: string; completed: number; total: number; rate: number }[] = [];
      for (let i = 11; i >= 0; i--) {
        const monthDate = subMonths(today, i);
        const mStart = startOfMonth(monthDate);
        const mEnd = endOfMonth(monthDate);
        const days = eachDayOfInterval({ start: mStart, end: mEnd });
        let monthCompleted = 0;
        for (const day of days) {
          monthCompleted += logsByDate[format(day, 'yyyy-MM-dd')] || 0;
        }
        const totalPossible = totalHabits * days.length;
        monthlyArr.push({
          month: format(monthDate, 'MMM'),
          completed: monthCompleted,
          total: totalPossible,
          rate: totalPossible > 0 ? Math.round((monthCompleted / totalPossible) * 100) : 0,
        });
      }
      labels = monthlyArr.map(d => d.month);
      chartData = monthlyArr.map(d => ({ date: d.month, completed: d.completed, total: d.total, rate: d.rate }));
    }

    // === Today stats (in-memory) ===
    const todayCompleted = logsByDate[todayStr] || 0;
    const todayRate = totalHabits > 0 ? Math.round((todayCompleted / totalHabits) * 100) : 0;

    // === Habit performance ranking (in-memory) ===
    const habitPerformance = habits.map(habit => {
      let completedDays = 0;
      for (let i = 0; i < 30; i++) {
        const dayStr = format(subDays(today, i), 'yyyy-MM-dd');
        const key = `${habit.id}_${dayStr}`;
        if (logsByHabitAndDate[key]?.status === 'completed') completedDays++;
      }
      return {
        id: habit.id,
        name: habit.name,
        color: habit.color,
        icon: habit.icon,
        rate: Math.round((completedDays / 30) * 100),
        completedDays,
      };
    }).sort((a, b) => b.rate - a.rate);

    // === Smart insights (in-memory) ===
    const insights: string[] = [];
    if (totalHabits > 0) {
      const best = habitPerformance[0];
      const worst = habitPerformance[habitPerformance.length - 1];
      if (best) insights.push(`🏆 "${best.name}" is your best habit with ${best.rate}% completion!`);
      if (worst && worst.rate < 50) insights.push(`💡 "${worst.name}" needs attention — only ${worst.rate}% done this month.`);

      let consecutiveMissed = 0;
      for (let i = 0; i < 3; i++) {
        const dayStr = format(subDays(today, i), 'yyyy-MM-dd');
        if ((logsByDate[dayStr] || 0) < totalHabits) consecutiveMissed++;
      }
      if (consecutiveMissed >= 3) {
        insights.push(`⚠️ You missed habits for ${consecutiveMissed} days in a row. Try to get back on track!`);
      }
      if (todayRate === 100) {
        insights.push(`🎉 Perfect day today! All ${totalHabits} habits completed!`);
      }
    }

    // === Monthly grid for spreadsheet view (in-memory) ===
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const monthlyGrid = habits.map(habit => {
      const dayLogs: Record<string, { status: string; value: number | null }> = {};
      for (const day of monthDays) {
        const dateStr = format(day, 'yyyy-MM-dd');
        const key = `${habit.id}_${dateStr}`;
        dayLogs[dateStr] = logsByHabitAndDate[key] || { status: 'none', value: null };
      }
      return {
        habitId: habit.id,
        habitName: habit.name,
        habitColor: habit.color,
        habitIcon: habit.icon,
        habitType: habit.type,
        logs: dayLogs,
      };
    });

    return NextResponse.json({
      chartData,
      labels,
      todayCompleted,
      todayTotal: totalHabits,
      todayRate,
      habitPerformance,
      insights,
      monthlyGrid,
      habitsCount: totalHabits,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
