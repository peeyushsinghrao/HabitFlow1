import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getRequestUserId } from '@/lib/auth-user';

export async function GET(request: Request) {
  const userId = getRequestUserId(request);
  const doubts = await db.doubtNote.findMany({
    where: { userId: userId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(doubts);
}

export async function POST(request: Request) {
  const userId = getRequestUserId(request);
  const body = await request.json();
  const { subject, topic, question, answer = '', source = '' } = body;
  if (!subject || !topic || !question) return NextResponse.json({ error: 'subject, topic, question required' }, { status: 400 });
  const doubt = await db.doubtNote.create({
    data: { userId: userId, subject, topic, question, answer, source },
  });
  return NextResponse.json(doubt, { status: 201 });
}
