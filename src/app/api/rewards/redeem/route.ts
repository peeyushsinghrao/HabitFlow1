import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { format } from 'date-fns';
import { getRequestUserId } from '@/lib/auth-user';

export async function POST(request: Request) {
  const userId = getRequestUserId(request);
  const { name, cost, emoji, kind = 'consumable' } = await request.json();
  const stats = await db.userStats.upsert({
    where: { userId: userId },
    create: { userId: userId },
    update: {},
  });
  const coins = stats?.coins ?? 0;
  if (coins < cost) return NextResponse.json({ error: 'Not enough coins' }, { status: 400 });

  if (kind === 'collectible') {
    const alreadyOwned = await db.rewardItem.findFirst({
      where: { userId: userId, name },
    });
    if (alreadyOwned) return NextResponse.json({ error: 'Already owned' }, { status: 400 });
  }

  await db.userStats.update({
    where: { userId: userId },
    data: { coins: { decrement: cost } },
  });
  await db.rewardItem.create({
    data: { userId: userId, name, cost, emoji, category: kind, redeemedAt: new Date() },
  });
  await db.coinTransaction.create({
    data: { userId: userId, amount: -cost, reason: `Redeemed: ${emoji} ${name}`, date: format(new Date(), 'yyyy-MM-dd') },
  });
  const updated = await db.userStats.findUnique({ where: { userId: userId } });
  return NextResponse.json({ coins: updated?.coins ?? 0, success: true, kind });
}
