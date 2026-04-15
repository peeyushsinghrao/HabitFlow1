import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/pw/daily?date=2026-04-09
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const entry = await db.pWDaily.findUnique({
      where: { date },
    });

    if (!entry) {
      return NextResponse.json({});
    }

    // Shape response to match store expectations
    return NextResponse.json({
      studyWork: {
        theoryRevised: entry.theoryRevised,
        dppSolved: entry.dppSolved,
        practiceSheet: entry.practiceSheet,
        pyqPracticed: entry.pyqPracticed,
        formulaRevised: entry.formulaRevised,
        isRestDay: entry.isRestDay,
      },
      task: {
        hasTask: entry.hasTask,
        testName: entry.testName,
        score: entry.taskScore,
        accuracy: entry.taskAccuracy,
        mistakes: entry.taskMistakes,
        improvedAt: entry.taskImprovedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching PW daily:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// POST /api/pw/daily — Upsert daily study data
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, studyWork, task } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const entry = await db.pWDaily.upsert({
      where: { date },
      create: {
        date,
        theoryRevised: studyWork?.theoryRevised ?? false,
        dppSolved: studyWork?.dppSolved ?? false,
        practiceSheet: studyWork?.practiceSheet ?? false,
        pyqPracticed: studyWork?.pyqPracticed ?? false,
        formulaRevised: studyWork?.formulaRevised ?? false,
        isRestDay: studyWork?.isRestDay ?? false,
        hasTask: task?.hasTask ?? false,
        testName: task?.testName ?? '',
        taskScore: task?.score ?? '',
        taskAccuracy: task?.accuracy ?? '',
        taskMistakes: task?.mistakes ?? '',
        taskImprovedAt: task?.improvedAt ?? '',
      },
      update: {
        theoryRevised: studyWork?.theoryRevised ?? false,
        dppSolved: studyWork?.dppSolved ?? false,
        practiceSheet: studyWork?.practiceSheet ?? false,
        pyqPracticed: studyWork?.pyqPracticed ?? false,
        formulaRevised: studyWork?.formulaRevised ?? false,
        isRestDay: studyWork?.isRestDay ?? false,
        hasTask: task?.hasTask ?? false,
        testName: task?.testName ?? '',
        taskScore: task?.score ?? '',
        taskAccuracy: task?.accuracy ?? '',
        taskMistakes: task?.mistakes ?? '',
        taskImprovedAt: task?.improvedAt ?? '',
      },
    });

    return NextResponse.json({ success: true, id: entry.id });
  } catch (error) {
    console.error('Error saving PW daily:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
