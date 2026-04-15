import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { format, startOfWeek, endOfWeek, subDays } from 'date-fns';
import OpenAI from 'openai';
import { getRequestUserId } from '@/lib/auth-user';

const extractOpenAIText = (response: { output_text?: string; output?: { content?: { text?: string }[] }[] }) => {
  if (response.output_text) return response.output_text.trim();
  return response.output?.flatMap(i => i.content ?? []).map(c => c.text ?? '').join('').trim() ?? '';
};

export async function GET(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const today = new Date();
    const dayOfWeek = today.getDay();

    const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const weekEnd = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const last7 = format(subDays(today, 7), 'yyyy-MM-dd');

    const cacheKey = `nuviora-weekly-debrief-${weekStart}`;

    const [habits, focusSessions, profile, sleepLogs] = await Promise.all([
      db.habit.findMany({
        where: { userId, isArchived: false },
        include: { logs: { where: { date: { gte: last7, lte: weekEnd }, status: 'completed' } } },
      }),
      db.focusSession.findMany({ where: { userId: userId, date: { gte: last7, lte: weekEnd } } }),
      db.userProfile.findUnique({ where: { userId: userId } }),
      db.sleepLog.findMany({ where: { userId: userId, date: { gte: last7 } }, orderBy: { date: 'desc' }, take: 7 }),
    ]);

    const totalFocusMin = focusSessions.reduce((a, s) => a + s.duration, 0);
    const avgSleep = sleepLogs.length > 0 ? sleepLogs.reduce((a, s) => a + s.duration, 0) / sleepLogs.length : 0;
    const habitsCompletedThisWeek = habits.reduce((a, h) => a + h.logs.length, 0);
    const totalPossible = habits.length * 7;
    const completionRate = totalPossible > 0 ? Math.round((habitsCompletedThisWeek / totalPossible) * 100) : 0;

    const topHabit = [...habits].sort((a, b) => b.logs.length - a.logs.length)[0];
    const weakHabit = [...habits].filter(h => h.logs.length < 4).sort((a, b) => a.logs.length - b.logs.length)[0];
    const subjectSet = [...new Set(focusSessions.map(s => s.task).filter(Boolean))];

    const userName = profile?.name || 'Student';

    let lines: string[] = [];

    if (process.env.OPENAI_API_KEY) {
      try {
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const prompt = `You are Aria, a warm and supportive AI study companion for a student named ${userName}.
Write a concise 5-line weekly debrief for them based on this data:
- Subjects studied this week: ${subjectSet.length > 0 ? subjectSet.slice(0, 5).join(', ') : 'Not tracked yet'}
- Habit completion rate: ${completionRate}%
- Total focus time: ${Math.floor(totalFocusMin / 60)}h ${totalFocusMin % 60}m
- Strongest habit: ${topHabit?.name || 'None yet'}
- Weakest day tendency: ${weakHabit?.name ? `"${weakHabit.name}" was skipped most` : 'All habits consistent'}
- Average sleep: ${avgSleep > 0 ? `${avgSleep.toFixed(1)}h` : 'Not tracked'}

Write exactly 5 short, punchy lines. Each line starts with an emoji. Line 1: subjects studied. Line 2: strongest habit. Line 3: weakest point. Line 4: one specific suggestion. Line 5: encouraging close. Keep it warm, personal, and under 20 words per line.`;

        const response = await client.responses.create({ model: 'gpt-4o-mini', input: prompt });
        const text = extractOpenAIText(response as Parameters<typeof extractOpenAIText>[0]);
        if (text) lines = text.split('\n').filter(l => l.trim()).slice(0, 5);
      } catch { /* fall through to local */ }
    }

    if (lines.length === 0) {
      const subStr = subjectSet.length > 0 ? subjectSet.slice(0, 3).join(', ') : 'your core subjects';
      lines = [
        `📚 This week you studied ${subStr} — that's ${Math.floor(totalFocusMin / 60)}h ${totalFocusMin % 60}m of focused work.`,
        `🏆 Your strongest habit was "${topHabit?.name || 'daily study'}" — keep that momentum going!`,
        `⚠️ ${weakHabit?.name ? `"${weakHabit.name}" needs more attention` : completionRate < 60 ? 'Consistency was the main challenge this week' : 'Weekend energy dips slightly — watch it'} — small daily actions fix this.`,
        `💡 Suggestion: ${completionRate < 70 ? 'Try habit stacking — attach new habits to existing ones for better adherence.' : 'Add one more 25-min focus block daily to compound your progress.'}`,
        `✨ You showed up this week, ${userName} — that's what makes champions. Keep going! 🚀`,
      ];
    }

    return NextResponse.json({
      debrief: lines,
      weekStart,
      dayOfWeek,
      generatedFor: format(today, 'yyyy-MM-dd'),
      cacheKey,
    });
  } catch (error) {
    console.error('Weekly debrief error:', error);
    return NextResponse.json({ error: 'Failed to generate debrief' }, { status: 500 });
  }
}
