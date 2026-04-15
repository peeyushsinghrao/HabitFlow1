import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import OpenAI from 'openai';
import { getRequestUserId } from '@/lib/auth-user';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractOpenAIText = (response: any) => {
  if (response.output_text) return response.output_text.trim();
  return response.output
    ?.flatMap(item => item.content ?? [])
    .map(content => content.text ?? '')
    .join('')
    .trim() ?? '';
};

function localCoachReply(message: string, data: unknown) {
  const lower = message.toLowerCase();
  const context = JSON.stringify(data ?? {});
  const hasFocus = context.includes('totalFocusMin') || lower.includes('focus');

  if (lower.includes('study plan') || lower.includes('plan for today') || lower.includes('schedule')) {
    return 'Go to the Ask AI tab and tap "Generate Today\'s Plan" — it builds a time-blocked plan using your subjects. For manual planning: 45 min on your hardest subject, 10 min break, 45 min second subject, then 30 min revision. That\'s a solid 2.5 hour block.';
  }
  if (lower.includes('streak') || lower.includes('streak alive')) {
    return 'Your streak in Nuviora counts every day you complete at least one habit. To protect it: use a Streak Freeze from the Rewards shop before you miss a day, or enable Holiday Mode in Settings when you know you\'ll be away.';
  }
  if (lower.includes('spaced repetition') || lower.includes('spaced rep')) {
    return 'Spaced repetition means reviewing a topic right before you forget it. In Nuviora, add items to your Revision Tracker — it auto-schedules reviews at 1 day, 3 days, and 7 days after you first study it. Check the Study Tools tab to add revision items.';
  }
  if (lower.includes('forget') || lower.includes('retain') || lower.includes('remember')) {
    return 'Forgetting usually means you moved on too fast. After each session, write 3 key points from memory (no notes). Then add the topic to your Revision Tracker in Study Tools — it\'ll remind you to review at the right times.';
  }
  if (lower.includes('pomodoro') || lower.includes('timer') || lower.includes('focus timer')) {
    return 'In Nuviora\'s Pomodoro timer: set 25 min study + 5 min break for normal sessions, or 45 min + 10 min for deep work. Name your session before starting so it gets logged. After 4 rounds, take a 20–30 min long break.';
  }
  if (lower.includes('habit') && (lower.includes('first') || lower.includes('focus on') || lower.includes('which'))) {
    return 'Start with your most skipped habit — check your Analytics tab to see which ones have the lowest completion rate. Fix the easiest one first (quick win = momentum), then tackle the harder ones once you\'re consistent.';
  }
  if (lower.includes('weak subject') || lower.includes('track') || lower.includes('subject')) {
    return 'In Study Tools, open the Subject Progress tracker and add your subjects with current chapter. Rate your progress — the AI study plan uses this to put your weakest subjects first. You can also tag weak subjects in your profile settings.';
  }
  if (lower.includes('focus score') || lower.includes('improve') || hasFocus) {
    return 'Your focus score improves when you log more Pomodoro sessions. Tips: start sessions with a clear task name, avoid checking your phone mid-session, and aim for at least 2 logged sessions a day. Check the Analytics tab to track your weekly focus time.';
  }
  if (lower.includes('build a habit') || lower.includes('habit from scratch') || lower.includes('new habit')) {
    return 'Add a new habit in the Habits tab — keep it tiny at first (5 min reading, 10 pushups). Attach it to something you already do ("after breakfast, I study for 20 min"). Check it off every day to build your streak. Nuviora gives you XP for every completion!';
  }
  if (lower.includes('missed') || lower.includes('restart') || lower.includes('few days')) {
    return 'Don\'t try to catch up — just restart from today. Go to the Habits tab and check off today\'s habits normally. If you had a streak, use a Streak Freeze from the Rewards shop to protect it. One bad week doesn\'t erase months of progress.';
  }
  if (lower.includes('revise') || lower.includes('revision') || lower.includes('exam')) {
    return 'Best revision flow: add topics to the Revision Tracker in Study Tools → it schedules 1-day, 3-day, 7-day reviews automatically. Generate a study plan from the Ask AI tab — it puts pending revision items in your plan. Do active recall (write from memory) instead of just re-reading.';
  }
  if (lower.includes('sleep') || lower.includes('tired')) {
    return 'Sleep is when your brain stores what you studied. Log your sleep in the Wellbeing tab to track patterns. Aim for 7.5–8 hours. Dim your screen 1 hour before bed and keep a consistent wake time — even on weekends.';
  }
  if (lower.includes('stress') || lower.includes('anxious') || lower.includes('burnt out') || lower.includes('burnout')) {
    return 'Burnout is a signal, not a failure. Take 1 rest day — mark it as Rest Day in the Classes tab so your streak is protected. Log your mood in Wellbeing. Then come back with just 1 small habit tomorrow. Nuviora tracks your recovery too.';
  }
  return "I can help with anything you want to talk about — study, habits, life, advice, or just a chat. What's on your mind?";
}

export async function GET(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const today = new Date();
    const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const weekEnd = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const last30Start = format(subDays(today, 30), 'yyyy-MM-dd');

    const [stats, habits, focusSessions, moodLogs, profile, sleepLogs, waterLogs] = await Promise.all([
      db.userStats.findUnique({ where: { userId: userId } }),
      db.habit.findMany({
        where: { userId, isArchived: false },
        include: {
          logs: {
            where: { date: { gte: weekStart, lte: weekEnd }, status: 'completed' },
          },
        },
      }),
      db.focusSession.findMany({ where: { userId: userId, date: { gte: weekStart, lte: weekEnd } } }),
      db.moodLog.findMany({ where: { userId: userId, date: { gte: last30Start } }, orderBy: { date: 'desc' }, take: 7 }),
      db.userProfile.findUnique({ where: { userId: userId } }),
      db.sleepLog.findMany({ where: { userId: userId, date: { gte: last30Start } }, orderBy: { date: 'desc' }, take: 7 }),
      db.waterLog.findMany({ where: { userId: userId, date: { gte: weekStart, lte: weekEnd } } }),
    ]);

    const userName = profile?.name || 'Student';
    const totalFocusMin = focusSessions.reduce((a, s) => a + s.duration, 0);
    const habitsCompletedThisWeek = habits.reduce((a, h) => a + h.logs.length, 0);
    const totalPossible = habits.length * 7;
    const completionRate = totalPossible > 0 ? Math.round((habitsCompletedThisWeek / totalPossible) * 100) : 0;
    const avgMood = moodLogs.length > 0 ? moodLogs.reduce((a, m) => a + m.mood, 0) / moodLogs.length : 0;
    const avgSleep = sleepLogs.length > 0 ? sleepLogs.reduce((a, s) => a + s.duration, 0) / sleepLogs.length : 0;
    const avgWater = waterLogs.length > 0 ? waterLogs.reduce((a, w) => a + w.glasses, 0) / waterLogs.length : 0;
    const streak = stats?.currentStreak ?? 0;
    const longestStreak = stats?.longestStreak ?? 0;
    const level = stats?.level ?? 1;
    const xp = stats?.xp ?? 0;

    const topHabits = habits.filter(h => h.logs.length >= 5).map(h => h.name);
    const weakHabits = habits.filter(h => h.logs.length <= 2 && h.logs.length < 5).map(h => h.name);

    const lines: string[] = [];

    lines.push(`Hey ${userName}! Here's your week at a glance 👋`);
    lines.push('');

    if (completionRate >= 80) {
      lines.push(`🌟 Incredible week! You completed ${completionRate}% of your habits — that's elite-level consistency.`);
    } else if (completionRate >= 60) {
      lines.push(`💪 Solid week! You hit ${completionRate}% of your habits. You're building real momentum.`);
    } else if (completionRate >= 40) {
      lines.push(`🔄 Mixed week — ${completionRate}% completion. You showed up, and that's what matters. Next week, aim for 60%+.`);
    } else {
      lines.push(`🌱 Tough week with ${completionRate}% completion. Every expert started as a beginner. Start fresh tomorrow.`);
    }

    if (streak >= 30) lines.push(`🔥 You're on a ${streak}-day streak — legendary!`);
    else if (streak >= 14) lines.push(`🔥 ${streak}-day streak going strong. Keep it alive!`);
    else if (streak >= 7) lines.push(`🔥 ${streak} days in a row. One week of discipline becomes a habit!`);
    else if (streak > 0) lines.push(`🔥 ${streak}-day streak. Build on this!`);
    else lines.push(`💡 Start a new streak today — even one small habit counts.`);

    if (totalFocusMin >= 600) lines.push(`⏱️ You focused for ${Math.round(totalFocusMin / 60)}h ${totalFocusMin % 60}m this week — deep work at its finest.`);
    else if (totalFocusMin >= 300) lines.push(`⏱️ ${Math.round(totalFocusMin / 60)}h ${totalFocusMin % 60}m of focused study. Good progress!`);
    else if (totalFocusMin > 0) lines.push(`⏱️ ${totalFocusMin} minutes of focus. Try to hit 5+ hours next week for deeper learning.`);
    else lines.push(`⏱️ No focus sessions logged this week. Try even one 25-minute Pomodoro tomorrow.`);

    if (topHabits.length > 0) lines.push(`✅ Your strongest habits: ${topHabits.slice(0, 3).join(', ')}.`);
    if (weakHabits.length > 0) lines.push(`⚠️ Needs attention: ${weakHabits.slice(0, 2).join(', ')}. Start small — even 1 rep counts.`);

    if (avgSleep > 0) {
      if (avgSleep >= 7.5) lines.push(`😴 Great sleep avg: ${avgSleep.toFixed(1)}h. Well-rested mind = better retention.`);
      else if (avgSleep >= 6) lines.push(`😴 Sleep avg: ${avgSleep.toFixed(1)}h. Try to get 7.5+ hours for peak performance.`);
      else lines.push(`😴 Low sleep: ${avgSleep.toFixed(1)}h avg. Your brain needs rest to consolidate what you studied!`);
    }

    if (avgMood > 0) {
      const moodWords = ['', 'difficult', 'challenging', 'neutral', 'good', 'great'];
      lines.push(`😊 Mood this week felt ${moodWords[Math.round(avgMood)] || 'neutral'} (${avgMood.toFixed(1)}/5).`);
    }

    if (avgWater >= 8) lines.push(`💧 Hydration game strong — ${avgWater.toFixed(0)} glasses/day on average!`);
    else if (avgWater > 0) lines.push(`💧 Drink more water! Aim for 8 glasses daily — your brain is 75% water.`);

    lines.push('');
    lines.push(`📊 You're Level ${level} with ${xp} total XP. Your longest streak is ${longestStreak} days.`);

    if (completionRate >= 70 && streak >= 7) {
      lines.push('');
      lines.push('🏆 Overall assessment: You are in excellent shape. Keep this up and results will follow naturally.');
    } else if (completionRate >= 50) {
      lines.push('');
      lines.push('🎯 Overall assessment: Good foundation. Focus on consistency over intensity — small daily actions compound powerfully.');
    } else {
      lines.push('');
      lines.push('🌱 Overall assessment: Use this week as fuel. Reset, pick 2–3 core habits, and commit to them. Progress is a process.');
    }

    return NextResponse.json({
      summary: lines.join('\n'),
      stats: { completionRate, streak, totalFocusMin, avgMood, avgSleep, level, xp, topHabits, weakHabits },
    });
  } catch (error) {
    console.error('AI summary error:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const { message, history = [], data = null } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 });
    }

    const today = new Date();
    const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const weekEnd = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');

    const [stats, habits, focusSessions, profile, subjects, mockTests] = await Promise.all([
      db.userStats.findUnique({ where: { userId: userId } }),
      db.habit.findMany({
        where: { userId, isArchived: false },
        include: { logs: { where: { date: { gte: weekStart, lte: weekEnd } } } },
      }),
      db.focusSession.findMany({ where: { userId: userId, date: { gte: weekStart, lte: weekEnd } } }),
      db.userProfile.findUnique({ where: { userId: userId } }),
      db.subjectProgress.findMany({ where: { userId: userId }, take: 20 }),
      db.mockTest.findMany({ where: { userId: userId }, orderBy: { createdAt: 'desc' }, take: 5 }),
    ]);

    const studentData = {
      profile: {
        name: profile?.name || 'Student',
        class: profile?.studentClass || '',
        goal: profile?.examGoal || '',
        studyMode: profile?.studyMode || 'pw',
      },
      stats,
      habits: habits.map(habit => ({
        name: habit.name,
        completedThisWeek: habit.logs.filter(log => log.status === 'completed').length,
      })),
      totalFocusMin: focusSessions.reduce((sum, session) => sum + session.duration, 0),
      subjects,
      mockTests,
      extraData: data,
    };

    if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
      return NextResponse.json({ reply: localCoachReply(message, studentData) });
    }

    const client = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
    const response = await client.responses.create({
      model: 'gpt-4o-mini',
      input: `
You are Aria — a warm, intelligent AI companion inside Nuviora.
Your name is Aria. Always refer to yourself as Aria.

You can talk about ANYTHING the user brings up — no topic is off limits. This includes but is not limited to:
study, exams, habits, science, maths, history, coding, relationships, emotions, mental health, food, fitness, career, hobbies, philosophy, pop culture, general knowledge, random curiosity, jokes, advice, opinions — absolutely anything.

How to respond:
- Match the length to the question: short questions get short answers, detailed questions get thorough answers
- Use simple, warm, conversational language — never stiff or robotic
- Be genuinely helpful, honest, and supportive
- When the question is study or habit related, weave in the student's real data to personalise your answer
- For everything else, just be a great AI to talk to
- Never refuse to answer or say "I'm just a study coach" — you are not limited in any way

Student profile data (use when relevant):
${JSON.stringify(studentData)}

Conversation history:
${JSON.stringify(Array.isArray(history) ? history.slice(-10) : [])}

User says:
${message}

Reply as Aria — naturally, helpfully, and without restrictions.
`,
    });

    return NextResponse.json({ reply: extractOpenAIText(response) || localCoachReply(message, studentData) });
  } catch (error) {
    console.error('AI coach chat error:', error);
    return NextResponse.json({ error: 'Failed to get coach reply' }, { status: 500 });
  }
}
