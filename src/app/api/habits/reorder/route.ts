import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// PUT /api/habits/reorder - Reorder habits
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { orders } = body; // Array of { id: string, sortOrder: number }

    if (!Array.isArray(orders)) {
      return NextResponse.json({ error: 'Invalid orders array' }, { status: 400 });
    }

    for (const item of orders) {
      await db.habit.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering habits:', error);
    return NextResponse.json({ error: 'Failed to reorder habits' }, { status: 500 });
  }
}
