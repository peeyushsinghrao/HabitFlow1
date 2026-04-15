import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getRequestUserId } from '@/lib/auth-user';

export async function GET(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const categories = await db.habitCategory.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'asc' },
      include: { habits: { where: { userId, isArchived: false }, select: { id: true } } },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const { name, color, emoji } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }
    const category = await db.habitCategory.create({
      data: { userId: userId, name: name.trim(), color: color || '#C08552', emoji: emoji || '📁' },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
