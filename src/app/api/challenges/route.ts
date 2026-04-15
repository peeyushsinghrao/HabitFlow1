import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { addDays, format } from 'date-fns';
import { getRequestUserId } from '@/lib/auth-user';

export async function GET(request: Request) {
  const userId = getRequestUserId(request);
  const challenges = await db.challenge.findMany({
    where: { userId: userId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(challenges);
}

export async function POST(request: Request) {
  const userId = getRequestUserId(request);
  const body = await request.json();
  const { title, description = '' } = body;
  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 });
  const startDate = format(new Date(), 'yyyy-MM-dd');
  const endDate = format(addDays(new Date(), 29), 'yyyy-MM-dd');
  const challenge = await db.challenge.create({
    data: { userId: userId, title: title.trim(), description, startDate, endDate, logs: '[]' },
  });
  return NextResponse.json(challenge, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, logs, isCompleted } = body;
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  const updated = await db.challenge.update({
    where: { id },
    data: { ...(logs !== undefined ? { logs: JSON.stringify(logs) } : {}), ...(isCompleted !== undefined ? { isCompleted } : {}) },
  });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  await db.challenge.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
