import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { format, subDays } from 'date-fns';

// GET /api/pw/analytics?range=weekly
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'weekly';
    const daysBack = range === 'monthly' ? 30 : 7;

    const today = format(new Date(), 'yyyy-MM-dd');
    const startDate = format(subDays(new Date(), daysBack - 1), 'yyyy-MM-dd');

    // Fetch daily entries in range
    const entries = await db.pWDaily.findMany({
      where: {
        date: { gte: startDate, lte: today },
      },
      orderBy: { date: 'asc' },
    });

    // Fetch class entries in range
    const classEntries = await db.pWClass.findMany({
      where: {
        date: { gte: startDate, lte: today },
      },
    });

    // Compute study data
    const studyData: { date: string; rate: number }[] = [];
    let totalRate = 0;
    let studyDayCount = 0;
    let restDays = 0;
    let daysWithTask = 0;

    for (const entry of entries) {
      if (entry.isRestDay) {
        restDays++;
        continue;
      }

      const items = [
        entry.theoryRevised,
        entry.dppSolved,
        entry.practiceSheet,
        entry.pyqPracticed,
        entry.formulaRevised,
      ];
      const completed = items.filter(Boolean).length;
      const rate = completed / 5;
      studyData.push({ date: entry.date, rate });
      totalRate += rate;
      studyDayCount++;

      if (entry.hasTask) daysWithTask++;
    }

    const studyCompletionRate = studyDayCount > 0 ? Math.round((totalRate / studyDayCount) * 100) : 0;

    // Compute class stats
    let attendedLive = 0;
    let attendedRecorded = 0;
    for (const cls of classEntries) {
      if (cls.attendedLive) attendedLive++;
      if (cls.attendedRecorded) attendedRecorded++;
    }

    return NextResponse.json({
      studyCompletionRate,
      studyData,
      classStats: {
        attendedLive,
        attendedRecorded,
        totalClasses: classEntries.length,
      },
      taskStats: {
        daysWithTask,
        totalTasks: entries.filter((e) => e.hasTask).length,
      },
      restDays,
    });
  } catch (error) {
    console.error('Error fetching PW analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
