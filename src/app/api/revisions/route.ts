import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { format, addDays } from 'date-fns';
import { getRequestUserId } from '@/lib/auth-user';

export async function GET(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const items = await db.revisionItem.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching revisions:', error);
    return NextResponse.json({ error: 'Failed to fetch revisions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const body = await request.json();
    const { subject, topic, notes = '' } = body;
    if (!subject || !topic) {
      return NextResponse.json({ error: 'subject and topic are required' }, { status: 400 });
    }
    const today = format(new Date(), 'yyyy-MM-dd');
    const item = await db.revisionItem.create({
      data: {
        userId: userId,
        subject,
        topic,
        notes,
        studiedDate: today,
        nextReview1: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        nextReview3: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
        nextReview7: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating revision:', error);
    return NextResponse.json({ error: 'Failed to create revision' }, { status: 500 });
  }
}
