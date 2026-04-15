import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getRequestUserId } from '@/lib/auth-user';

export async function GET(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const items = await db.subjectProgress.findMany({
      where: { userId: userId },
      orderBy: [{ subject: 'asc' }, { createdAt: 'asc' }],
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const body = await request.json();
    const { subject, chapter, progress = 0, status = 'not_started', notes = '' } = body;
    if (!subject || !chapter) {
      return NextResponse.json({ error: 'subject and chapter are required' }, { status: 400 });
    }
    const item = await db.subjectProgress.create({
      data: { userId: userId, subject, chapter, progress, status, notes },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}
