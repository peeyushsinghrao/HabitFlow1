import { db } from '@/lib/db';
import { getRequestUserId } from '@/lib/auth-user';
import { NextResponse } from 'next/server';
import { format, startOfMonth } from 'date-fns';

// GET /api/habits - List all habits with recent logs
export async function GET(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');

    const habits = await db.habit.findMany({
      where: { userId, isArchived: false },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        logs: {
          where: {
            date: { gte: monthStart },
          },
          orderBy: { date: 'desc' },
        },
        category: true,
      },
    });
    return NextResponse.json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 });
  }
}

// POST /api/habits - Create a new habit
export async function POST(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const body = await request.json();
    const { name, type = 'daily', color = '#f472b6', icon = '🎯', targetValue, unit, reminderTime, categoryId, deadline, frequency = 'daily', stackedAfter, minViableVersion, conditionType, conditionValue } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Habit name is required' }, { status: 400 });
    }

    const maxOrder = await db.habit.findFirst({
      where: { userId, isArchived: false },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const habit = await db.habit.create({
      data: {
        userId,
        name: name.trim(),
        type,
        color,
        icon,
        targetValue: targetValue ?? null,
        unit: unit ?? null,
        reminderTime: reminderTime ?? null,
        categoryId: categoryId ?? null,
        deadline: deadline ?? null,
        frequency,
        sortOrder: (maxOrder?.sortOrder ?? 0) + 1,
        stackedAfter: stackedAfter ?? null,
        minViableVersion: minViableVersion ?? null,
        conditionType: conditionType ?? null,
        conditionValue: conditionValue ?? null,
      },
      include: { category: true },
    });

    // Initialize user stats if not exists
    await db.userStats.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    // Award first habit badge
    const existingBadges = await db.earnedBadge.findMany({
      where: { userId, badgeType: 'first_habit' },
    });
    if (existingBadges.length === 0) {
      await db.earnedBadge.create({
        data: { userId, badgeType: 'first_habit' },
      });
      await db.userStats.update({
        where: { userId },
        data: { xp: { increment: 50 } },
      });
    }

    return NextResponse.json(habit, { status: 201 });
  } catch (error) {
    console.error('Error creating habit:', error);
    return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 });
  }
}

// PATCH /api/habits - Reorder habits
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { reorder } = body as { reorder?: string[] };
    if (reorder && Array.isArray(reorder)) {
      await Promise.all(
        reorder.map((id, index) =>
          db.habit.update({ where: { id }, data: { sortOrder: index } })
        )
      );
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error reordering habits:', error);
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 });
  }
}
