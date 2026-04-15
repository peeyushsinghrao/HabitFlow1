import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { getRequestUserId } from '@/lib/auth-user';

// POST /api/seed - Seed sample data for demo
export async function POST(request: Request) {
  try {
    const userId = getRequestUserId(request);

    // Create sample habits
    const sampleHabits = [
      { name: 'Study', type: 'daily', color: '#f472b6', icon: '📚', targetValue: null, unit: null, reminderTime: '09:00' },
      { name: 'Exercise', type: 'daily', color: '#34d399', icon: '🏃', targetValue: null, unit: null, reminderTime: '07:00' },
      { name: 'Read', type: 'daily', color: '#60a5fa', icon: '📖', targetValue: null, unit: null, reminderTime: '21:00' },
      { name: 'Meditate', type: 'daily', color: '#c084fc', icon: '🧘', targetValue: null, unit: null, reminderTime: '06:30' },
      { name: 'Water Intake', type: 'numeric', color: '#38bdf8', icon: '💧', targetValue: 8, unit: 'glasses', reminderTime: null },
      { name: 'Journal', type: 'daily', color: '#fb923c', icon: '📝', targetValue: null, unit: null, reminderTime: '22:00' },
      { name: 'Revision', type: 'weekly', color: '#fbbf24', icon: '🔄', targetValue: null, unit: null, reminderTime: '15:00' },
    ];

    const existingHabits = await db.habit.findMany({ where: { userId }, select: { id: true } });
    const existingHabitIds = existingHabits.map(habit => habit.id);
    await db.habitLog.deleteMany({ where: { habitId: { in: existingHabitIds } } });
    await db.earnedBadge.deleteMany({ where: { userId } });
    await db.userStats.deleteMany({ where: { userId } });
    await db.habit.deleteMany({ where: { userId } });

    // Create habits
    for (const h of sampleHabits) {
      await db.habit.create({
        data: { userId, ...h },
      });
    }

    // Generate sample logs for the past 45 days
    const habits = await db.habit.findMany({ where: { userId } });
    const today = new Date();
    const days = eachDayOfInterval({ start: subDays(today, 45), end: today });

    for (const day of days) {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayOfWeek = day.getDay();
      const daysAgo = Math.floor((today.getTime() - day.getTime()) / (1000 * 60 * 60 * 24));

      for (const habit of habits) {
        // Vary completion rate based on recency (more recent = higher completion)
        const baseProbability = daysAgo < 7 ? 0.85 : daysAgo < 14 ? 0.75 : daysAgo < 30 ? 0.6 : 0.5;

        if (habit.type === 'weekly') {
          // Only log on certain days of the week
          if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
            if (Math.random() < baseProbability) {
              await db.habitLog.create({
                data: {
                  habitId: habit.id,
                  date: dayStr,
                  status: 'completed',
                  value: null,
                },
              });
            }
          }
        } else if (habit.type === 'numeric') {
          if (Math.random() < baseProbability) {
            const target = habit.targetValue || 8;
            const value = Math.floor(Math.random() * (target + 2));
            await db.habitLog.create({
              data: {
                habitId: habit.id,
                date: dayStr,
                status: value >= target ? 'completed' : 'completed',
                value,
              },
            });
          }
        } else {
          if (Math.random() < baseProbability) {
            await db.habitLog.create({
              data: {
                habitId: habit.id,
                date: dayStr,
                status: 'completed',
                value: null,
              },
            });
          }
        }
      }
    }

    // Initialize user stats
    await db.userStats.create({
      data: {
        userId,
        xp: 350,
        currentStreak: 5,
        longestStreak: 12,
        totalCompleted: await db.habitLog.count({ where: { habitId: { in: habits.map(habit => habit.id) }, status: 'completed' } }),
      },
    });

    // Award some badges
    await db.earnedBadge.createMany({
      data: [
        { userId, badgeType: 'first_habit' },
        { userId, badgeType: 'week_streak' },
        { userId, badgeType: 'perfect_day' },
      ],
    });

    return NextResponse.json({ success: true, message: 'Sample data seeded successfully' });
  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json({ error: 'Failed to seed data' }, { status: 500 });
  }
}
