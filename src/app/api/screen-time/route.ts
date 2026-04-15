import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { format } from 'date-fns';
import { getRequestUserId } from '@/lib/auth-user';

export async function GET(request: Request) {
  const userId = getRequestUserId(request);
  const today = format(new Date(), 'yyyy-MM-dd');
  const log = await db.screenTimeLog.findUnique({
    where: { userId_date: { userId: userId, date: today } },
  });
  return NextResponse.json(log);
}

export async function PUT(request: Request) {
  const userId = getRequestUserId(request);
  const body = await request.json();
  const { phoneGoalMins, phoneActualMins, studyGoalMins, studyActualMins } = body;
  const today = format(new Date(), 'yyyy-MM-dd');
  const log = await db.screenTimeLog.upsert({
    where: { userId_date: { userId: userId, date: today } },
    create: {
      userId: userId, date: today,
      phoneGoalMins: phoneGoalMins ?? 120,
      phoneActualMins: phoneActualMins ?? 0,
      studyGoalMins: studyGoalMins ?? 360,
      studyActualMins: studyActualMins ?? 0,
    },
    update: {
      ...(phoneGoalMins !== undefined && { phoneGoalMins }),
      ...(phoneActualMins !== undefined && { phoneActualMins }),
      ...(studyGoalMins !== undefined && { studyGoalMins }),
      ...(studyActualMins !== undefined && { studyActualMins }),
    },
  });
  return NextResponse.json(log);
}
