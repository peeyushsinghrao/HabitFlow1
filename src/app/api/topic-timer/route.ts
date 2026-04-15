import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getRequestUserId } from '@/lib/auth-user';

export async function GET(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const logs = await db.topicTimerLog.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });
    const totals: Record<string, number> = {};
    const subjectTotals: Record<string, number> = {};
    for (const log of logs) {
      const key = `${log.subject}|||${log.topic}`;
      totals[key] = (totals[key] || 0) + log.minutes;
      subjectTotals[log.subject] = (subjectTotals[log.subject] || 0) + log.minutes;
    }
    const bySubjectTopic = Object.entries(totals).map(([key, minutes]) => {
      const [subject, topic] = key.split('|||');
      return { subject, topic, minutes };
    });
    const bySubject = Object.entries(subjectTotals).map(([subject, minutes]) => ({ subject, minutes }));
    return NextResponse.json({ logs, bySubjectTopic, bySubject });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch topic timer' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = getRequestUserId(request);
    const { subject, topic, minutes, date } = await req.json();
    const log = await db.topicTimerLog.create({
      data: { userId: userId, subject, topic: topic || '', minutes, date },
    });
    return NextResponse.json(log);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log topic timer' }, { status: 500 });
  }
}
