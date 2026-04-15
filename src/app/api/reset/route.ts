import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getRequestUserId } from '@/lib/auth-user';

export async function POST(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const habits = await db.habit.findMany({ where: { userId }, select: { id: true } });
    const habitIds = habits.map(habit => habit.id);

    await db.habitLog.deleteMany({ where: { habitId: { in: habitIds } } });
    await db.earnedBadge.deleteMany({ where: { userId } });
    await db.userStats.deleteMany({ where: { userId } });
    await db.habit.deleteMany({ where: { userId } });
    await db.habitCategory.deleteMany({ where: { userId } });
    await db.moodLog.deleteMany({ where: { userId } });
    await db.waterLog.deleteMany({ where: { userId } });
    await db.focusSession.deleteMany({ where: { userId } });
    await db.sleepLog.deleteMany({ where: { userId } });
    await db.periodLog.deleteMany({ where: { userId } });
    await db.pWDaily.deleteMany({ where: { userId } });
    await db.pWClass.deleteMany({ where: { userId } });
    await db.pWTodo.deleteMany({ where: { userId } });
    await db.pWHistory.deleteMany({ where: { userId } });

    await db.userStats.create({ data: { userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting data:', error);
    return NextResponse.json({ error: 'Failed to reset data' }, { status: 500 });
  }
}
