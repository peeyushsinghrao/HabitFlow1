import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getRequestUserId } from '@/lib/auth-user';

export async function GET(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const mistakes = await db.mistakeNote.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(mistakes);
  } catch (error) {
    console.error('Error fetching mistakes:', error);
    return NextResponse.json({ error: 'Failed to fetch mistakes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const body = await request.json();
    const { subject, topic, mistake, correction = '', source = '' } = body;
    if (!subject || !topic || !mistake) {
      return NextResponse.json({ error: 'subject, topic, and mistake are required' }, { status: 400 });
    }
    const note = await db.mistakeNote.create({
      data: { userId: userId, subject, topic, mistake, correction, source },
    });
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Error creating mistake:', error);
    return NextResponse.json({ error: 'Failed to create mistake' }, { status: 500 });
  }
}
