import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { format } from 'date-fns';
import { getRequestUserId } from '@/lib/auth-user';

export async function GET(request: Request) {
  const userId = getRequestUserId(request);
  const today = format(new Date(), 'yyyy-MM-dd');
  const mission = await db.dailyMission.findUnique({
    where: { userId_date: { userId: userId, date: today } },
  });
  return NextResponse.json(mission);
}

export async function POST(request: Request) {
  const userId = getRequestUserId(request);
  const body = await request.json();
  const { title, description = '' } = body;
  if (!title?.trim()) return NextResponse.json({ error: 'title required' }, { status: 400 });
  const today = format(new Date(), 'yyyy-MM-dd');
  const mission = await db.dailyMission.upsert({
    where: { userId_date: { userId: userId, date: today } },
    create: { userId: userId, date: today, title: title.trim(), description },
    update: { title: title.trim(), description, isCompleted: false },
  });
  return NextResponse.json(mission, { status: 201 });
}

export async function PUT(request: Request) {
  const userId = getRequestUserId(request);
  const body = await request.json();
  const { isCompleted } = body;
  const today = format(new Date(), 'yyyy-MM-dd');
  const mission = await db.dailyMission.update({
    where: { userId_date: { userId: userId, date: today } },
    data: { isCompleted },
  });
  if (isCompleted) {
    await db.userStats.upsert({
      where: { userId: userId },
      create: { userId: userId, coins: mission.coinsReward },
      update: { coins: { increment: mission.coinsReward } },
    });
  }
  return NextResponse.json(mission);
}
