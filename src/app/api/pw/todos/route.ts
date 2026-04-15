import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/pw/todos
export async function GET() {
  try {
    const todos = await db.pWTodo.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(todos);
  } catch (error) {
    console.error('Error fetching PW todos:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// POST /api/pw/todos
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const todo = await db.pWTodo.create({
      data: { title: title.trim() },
    });

    return NextResponse.json(todo);
  } catch (error) {
    console.error('Error creating PW todo:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

// DELETE /api/pw/todos?id=xxx
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await db.pWTodo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting PW todo:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
