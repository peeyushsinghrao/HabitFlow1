import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getRequestUserId } from '@/lib/auth-user';

export async function GET(request: Request) {
  const userId = getRequestUserId(request);
  const { searchParams } = new URL(request.url);
  const deckId = searchParams.get('deckId');
  const cards = await db.flashCard.findMany({
    where: { userId: userId, ...(deckId ? { deckId } : {}) },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(cards);
}

export async function POST(request: Request) {
  const userId = getRequestUserId(request);
  const body = await request.json();
  const { front, back, subject = '', deckId = null, tags = '' } = body;
  if (!front?.trim() || !back?.trim()) return NextResponse.json({ error: 'Front and back required' }, { status: 400 });
  const card = await db.flashCard.create({
    data: { userId: userId, front: front.trim(), back: back.trim(), subject, deckId, tags },
  });
  return NextResponse.json(card, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, box, nextReview, ...rest } = body;
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  const card = await db.flashCard.update({ where: { id }, data: { box, nextReview, ...rest } });
  return NextResponse.json(card);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  await db.flashCard.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
