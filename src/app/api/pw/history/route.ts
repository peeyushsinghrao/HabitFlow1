import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/pw/history?date=2026-04-09
// GET /api/pw/history (returns last 30 days, newest first)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (date) {
      // Return single day
      const record = await db.pWHistory.findUnique({
        where: { date },
      });
      if (!record) {
        return NextResponse.json(null, { status: 404 });
      }
      return NextResponse.json(record);
    }

    // Return list of all history entries (last 30 days, newest first)
    const records = await db.pWHistory.findMany({
      orderBy: { date: 'desc' },
      take: 30,
    });
    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching PW history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

// POST /api/pw/history/snapshot — Create a snapshot of today's PW data
export async function POST(request: Request) {
  try {
    // Get today's date
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Fetch today's PWDaily
    const daily = await db.pWDaily.findUnique({
      where: { date: dateStr },
    });

    // Fetch today's PWClass entries
    const classes = await db.pWClass.findMany({
      where: { date: dateStr },
      orderBy: { createdAt: 'asc' },
    });

    // Fetch today's PWTodo entries
    const todos = await db.pWTodo.findMany({
      orderBy: { createdAt: 'asc' },
    });

    // Compute stats
    const classesAttended = classes.filter(
      (c) => c.attendedLive || c.attendedRecorded,
    ).length;
    const todosCompleted = todos.filter((t) => t.completed).length;
    const todosTotal = todos.length;
    const hasTest = daily?.hasTask ?? false;
    const isRestDay = daily?.isRestDay ?? false;

    // Serialize to JSON strings (strip internal fields)
    const classesJson = JSON.stringify(
      classes.map((c) => ({
        subject: c.subject,
        time: c.time,
        topic: c.topic,
        teacher: c.teacher,
        attendedLive: c.attendedLive,
        attendedRecorded: c.attendedRecorded,
      })),
    );
    const todosJson = JSON.stringify(
      todos.map((t) => ({
        title: t.title,
        completed: t.completed,
      })),
    );
    const dailyJson = JSON.stringify({
      studyWork: daily
        ? {
            theoryRevised: daily.theoryRevised,
            dppSolved: daily.dppSolved,
            practiceSheet: daily.practiceSheet,
            pyqPracticed: daily.pyqPracticed,
            formulaRevised: daily.formulaRevised,
          }
        : {},
      task: daily
        ? {
            hasTask: daily.hasTask,
            testName: daily.testName,
            score: daily.taskScore,
            accuracy: daily.taskAccuracy,
            mistakes: daily.taskMistakes,
            improvedAt: daily.taskImprovedAt,
          }
        : {},
    });

    // Upsert the history record
    const record = await db.pWHistory.upsert({
      where: { date: dateStr },
      create: {
        date: dateStr,
        classesJson,
        todosJson,
        dailyJson,
        classesAttended,
        todosCompleted,
        todosTotal,
        hasTest,
        isRestDay,
      },
      update: {
        classesJson,
        todosJson,
        dailyJson,
        classesAttended,
        todosCompleted,
        todosTotal,
        hasTest,
        isRestDay,
      },
    });

    return NextResponse.json({ success: true, id: record.id, date: dateStr });
  } catch (error) {
    console.error('Error creating PW history snapshot:', error);
    return NextResponse.json({ error: 'Failed to create snapshot' }, { status: 500 });
  }
}
