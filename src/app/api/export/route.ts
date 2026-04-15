import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { format } from 'date-fns';
import { getRequestUserId } from '@/lib/auth-user';

// GET /api/export - Export habit data as CSV
export async function GET(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const profile = await db.userProfile.findUnique({ where: { userId: userId } });
    const habits = await db.habit.findMany({
      where: { userId, isArchived: false },
      include: { logs: { orderBy: { date: 'asc' } }, category: true },
    });
    const url = new URL(request.url);
    const exportFormat = url.searchParams.get('format');
    const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss');

    if (exportFormat === 'json') {
      const [stats, badges, categories, moodLogs, waterLogs, focusSessions, periodLogs, pwDaily, pwClasses, pwTodos, pwHistory] = await Promise.all([
        db.userStats.findUnique({ where: { userId: userId } }),
        db.earnedBadge.findMany({ where: { userId: userId } }),
        db.habitCategory.findMany({ where: { userId: userId } }),
        db.moodLog.findMany({ where: { userId: userId } }),
        db.waterLog.findMany({ where: { userId: userId } }),
        db.focusSession.findMany({ where: { userId: userId } }),
        db.periodLog.findMany({ where: { userId: userId } }),
        db.pWDaily.findMany({ where: { userId: userId } }),
        db.pWClass.findMany({ where: { userId: userId } }),
        db.pWTodo.findMany({ where: { userId: userId } }),
        db.pWHistory.findMany({ where: { userId: userId } }),
      ]);
      const backup = {
        exportedAt: new Date().toISOString(),
        profile,
        habits,
        stats,
        badges,
        categories,
        moodLogs,
        waterLogs,
        focusSessions,
        periodLogs,
        pwDaily,
        pwClasses,
        pwTodos,
        pwHistory,
      };

      return new NextResponse(JSON.stringify(backup, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="nuviora-backup_${timestamp}.json"`,
        },
      });
    }

    const headers = ['Habit', 'Type', 'Color', 'Date', 'Status', 'Value'];
    const rows: string[] = [headers.join(',')];

    for (const habit of habits) {
      for (const log of habit.logs) {
        rows.push(
          [
            `"${habit.name}"`,
            habit.type,
            habit.color,
            log.date,
            log.status,
            log.value ?? '',
          ].join(',')
        );
      }
    }

    const csv = rows.join('\n');
    const filename = `habit-tracker-export_${timestamp}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}

// Extended CSV export by type (habits, focus, mood, mock-tests, sleep)
export async function POST(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const { type } = await request.json();
    const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss');

    if (type === 'mock-tests') {
      const tests = await db.mockTest.findMany({ where: { userId: userId }, orderBy: { date: 'desc' } });
      const rows = ['Date,Test Name,Subject,Score,Total Marks,Percentage,Notes'];
      for (const t of tests) {
        const pct = t.maxMarks > 0 ? Math.round((t.marksObtained / t.maxMarks) * 100) : 0;
        rows.push(`"${t.date}","${t.testName}","${t.subject}","${t.marksObtained}","${t.maxMarks}","${pct}%","${t.notes}"`);
      }
      return new NextResponse(rows.join('\n'), {
        headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="mock-tests_${timestamp}.csv"` },
      });
    }

    if (type === 'sleep') {
      const logs = await db.sleepLog.findMany({ where: { userId: userId }, orderBy: { date: 'desc' } });
      const rows = ['Date,Bedtime,Wake Time,Duration (h),Quality (1-5),Notes'];
      for (const l of logs) rows.push(`"${l.date}","${l.bedtime}","${l.wakeTime}","${l.duration}","${l.quality}","${l.notes}"`);
      return new NextResponse(rows.join('\n'), {
        headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="sleep_${timestamp}.csv"` },
      });
    }

    return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
  } catch (error) {
    console.error('Export POST error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
