import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getRequestUserId } from '@/lib/auth-user';

export async function GET(request: Request) {
  const userId = getRequestUserId(request);
  const decks = await db.flashCardDeck.findMany({
    where: { userId: userId },
    include: { _count: { select: { cards: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(decks);
}

export async function POST(request: Request) {
  const userId = getRequestUserId(request);
  const { name, subject = '', color = '#C08552' } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });
  const deck = await db.flashCardDeck.create({
    data: { userId: userId, name: name.trim(), subject, color },
  });
  return NextResponse.json(deck, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  await db.flashCardDeck.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
