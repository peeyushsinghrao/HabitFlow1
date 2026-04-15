import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/habits/[id] - Get a single habit
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const habit = await db.habit.findUnique({
      where: { id },
      include: { logs: { orderBy: { date: 'desc' } } },
    });
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }
    return NextResponse.json(habit);
  } catch (error) {
    console.error('Error fetching habit:', error);
    return NextResponse.json({ error: 'Failed to fetch habit' }, { status: 500 });
  }
}

// PUT /api/habits/[id] - Update a habit
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, type, color, icon, targetValue, unit, reminderTime, isArchived, isPaused, frequency, categoryId, deadline, stackedAfter, minViableVersion, conditionType, conditionValue } = body;

    const habit = await db.habit.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(type !== undefined && { type }),
        ...(color !== undefined && { color }),
        ...(icon !== undefined && { icon }),
        ...(targetValue !== undefined && { targetValue: targetValue ?? null }),
        ...(unit !== undefined && { unit: unit ?? null }),
        ...(reminderTime !== undefined && { reminderTime: reminderTime ?? null }),
        ...(isArchived !== undefined && { isArchived }),
        ...(isPaused !== undefined && { isPaused }),
        ...(frequency !== undefined && { frequency }),
        ...(categoryId !== undefined && { categoryId: categoryId ?? null }),
        ...(deadline !== undefined && { deadline: deadline ?? null }),
        ...(stackedAfter !== undefined && { stackedAfter: stackedAfter ?? null }),
        ...(minViableVersion !== undefined && { minViableVersion: minViableVersion ?? null }),
        ...(conditionType !== undefined && { conditionType: conditionType ?? null }),
        ...(conditionValue !== undefined && { conditionValue: conditionValue ?? null }),
      },
    });

    return NextResponse.json(habit);
  } catch (error) {
    console.error('Error updating habit:', error);
    return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 });
  }
}

// DELETE /api/habits/[id] - Delete a habit
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.habit.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting habit:', error);
    return NextResponse.json({ error: 'Failed to delete habit' }, { status: 500 });
  }
}
