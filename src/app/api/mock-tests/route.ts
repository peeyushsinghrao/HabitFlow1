import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { format } from 'date-fns';
import { getRequestUserId } from '@/lib/auth-user';

export async function GET(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const tests = await db.mockTest.findMany({
      where: { userId: userId },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(tests);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const body = await request.json();
    const { testName, subject = 'Mixed', marksObtained, maxMarks, accuracy, sillyMistakes = 0, timeTaken = 0, notes = '' } = body;
    if (!testName || marksObtained === undefined || !maxMarks) {
      return NextResponse.json({ error: 'testName, marksObtained, maxMarks required' }, { status: 400 });
    }
    const pct = maxMarks > 0 ? Math.round((marksObtained / maxMarks) * 100) : 0;
    const test = await db.mockTest.create({
      data: {
        userId: userId, testName, subject,
        date: format(new Date(), 'yyyy-MM-dd'),
        marksObtained: parseFloat(marksObtained),
        maxMarks: parseFloat(maxMarks),
        accuracy: accuracy !== undefined ? parseFloat(accuracy) : pct,
        sillyMistakes: parseInt(sillyMistakes),
        timeTaken: parseInt(timeTaken), notes,
      },
    });
    await db.userStats.upsert({
      where: { userId: userId },
      create: { userId: userId, coins: 15 },
      update: { coins: { increment: 15 } },
    });
    return NextResponse.json(test, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  await db.mockTest.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
