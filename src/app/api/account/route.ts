import { db } from '@/lib/db';
import { getRequestUserId } from '@/lib/auth-user';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {
    const userId = getRequestUserId(request);
    if (userId === 'default-user') {
      return NextResponse.json({ error: 'No signed-in account selected.' }, { status: 400 });
    }

    const habits = await db.habit.findMany({ where: { userId }, select: { id: true } });
    const habitIds = habits.map(habit => habit.id);

    await db.$transaction([
      db.habitLog.deleteMany({ where: { habitId: { in: habitIds } } }),
      db.habit.deleteMany({ where: { userId } }),
      db.earnedBadge.deleteMany({ where: { userId } }),
      db.userStats.deleteMany({ where: { userId } }),
      db.moodLog.deleteMany({ where: { userId } }),
      db.waterLog.deleteMany({ where: { userId } }),
      db.focusSession.deleteMany({ where: { userId } }),
      db.sleepLog.deleteMany({ where: { userId } }),
      db.periodLog.deleteMany({ where: { userId } }),
      db.userProfile.deleteMany({ where: { userId } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Failed to delete account.' }, { status: 500 });
  }
}