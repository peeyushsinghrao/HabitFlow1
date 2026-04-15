import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { format } from 'date-fns';
import { getRequestUserId } from '@/lib/auth-user';

export async function GET(request: Request) {
  const userId = getRequestUserId(request);
  const stats = await db.userStats.findUnique({ where: { userId: userId } });
  return NextResponse.json({ coins: stats?.coins ?? 0, streakFreezes: stats?.streakFreezes ?? 1 });
}

export async function POST(request: Request) {
  const userId = getRequestUserId(request);
  const body = await request.json();
  const { amount, reason } = body;
  await db.userStats.upsert({
    where: { userId: userId },
    create: { userId: userId, coins: Math.max(0, amount) },
    update: { coins: { increment: amount } },
  });
  await db.coinTransaction.create({
    data: { userId: userId, amount, reason, date: format(new Date(), 'yyyy-MM-dd') },
  });
  const stats = await db.userStats.findUnique({ where: { userId: userId } });
  return NextResponse.json({ coins: stats?.coins ?? 0 });
}
