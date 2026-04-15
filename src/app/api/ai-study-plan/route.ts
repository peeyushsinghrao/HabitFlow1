import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { format, subDays } from 'date-fns';
import OpenAI from 'openai';
import { getRequestUserId } from '@/lib/auth-user';

export interface StudyBlock {
  time: string;
  duration: number;
  subject: string;
  task: string;
  type: 'study' | 'break' | 'revision' | 'mock' | 'wrap';
  emoji: string;
}

function formatHour(h: number, m: number): string {
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

const SUBJECT_TASKS: Record<string, string[]> = {
  Mathematics: ['Solve 15 practice problems', 'Revise formulas + 10 questions', 'Work through past paper section'],
  Physics: ['Derive key equations + numericals', 'Concept review + MCQ practice', 'Solve chapter problems'],
  Chemistry: ['Reactions + mechanisms revision', 'Periodic table trends + MCQs', 'Organic/Inorganic chapter notes'],
  Biology: ['Diagram labelling + theory notes', 'NCERT chapter summary', 'MCQ practice set'],
  English: ['Grammar exercises + writing', 'Reading comprehension + vocab', 'Essay outline + revision'],
  Hindi: ['Grammar rules + passages', 'Writing practice + comprehension', 'Vocabulary revision'],
  History: ['Timeline events + causes/effects', 'Source-based questions practice', 'Chapter summary notes'],
  Geography: ['Map work + diagrams', 'Concept notes + MCQs', 'Case studies revision'],
  'Political Science': ['Key terms + concepts', 'Chapter notes + MCQs', 'Previous year questions'],
  Economics: ['Graphs + definitions', 'Numerical problems + theory', 'Chapter questions'],
  Sanskrit: ['Grammar rules + translation', 'Passage practice', 'Vocabulary + shlokas'],
  'Computer Science': ['Code problems + algorithms', 'Theory + diagrams', 'Programming practice'],
  AI: ['Concepts + terminology', 'Application examples + MCQs', 'Chapter revision'],
  Accountancy: ['Journal entries practice', 'Balance sheet problems', 'Theory + MCQs'],
  'Business Studies': ['Key concepts + case study', 'Chapter notes + MCQs', 'Past paper questions'],
  'Physical Education': ['Theory notes + diagrams', 'Sports rules + MCQs', 'Chapter revision'],
};

function getTask(subject: string, index: number): string {
  const tasks = SUBJECT_TASKS[subject];
  if (tasks) return tasks[index % tasks.length];
  return 'Cover key concepts and solve practice questions';
}

function buildLocalPlan(
  profileSubjects: string[],
  trackerSubjects: { subject: string; chapter: string; progress: number; status: string }[],
  weakSubjects: string[],
  examGoal: string,
  revisionCount: number,
): StudyBlock[] {
  const now = new Date();
  let h = now.getHours();
  let m = 0;

  if (now.getMinutes() > 30) { h += 1; m = 0; } else { m = 30; }
  if (h >= 22) { h = 8; m = 0; }

  // SST group — treated as ONE subject; pick at most 1-2 per plan, rotating by session
  const SST_GROUP = ['History', 'Geography', 'Economics', 'Political Science'];

  // Use hour of day to rotate subject order — different each session
  const rotationOffset = now.getHours() + now.getMinutes();

  const blocks: StudyBlock[] = [];

  // Build subject pool: tracker subjects first (have chapter info), then profile subjects as fill
  const trackerPool = trackerSubjects
    .filter(s => s.status !== 'completed')
    .sort((a, b) => a.progress - b.progress)
    .map(s => ({ name: s.subject, chapter: s.chapter }));

  const trackerNames = new Set(trackerPool.map(s => s.name));

  // Add profile subjects not already in tracker
  const extraSubjects = profileSubjects
    .filter(s => !trackerNames.has(s))
    .map(s => ({ name: s, chapter: '' }));

  // Merge: tracker first, then extras
  let fullPool = [...trackerPool, ...extraSubjects];

  // Prioritise weak subjects — move them to front
  fullPool.sort((a, b) => {
    const aWeak = weakSubjects.includes(a.name) ? -1 : 0;
    const bWeak = weakSubjects.includes(b.name) ? -1 : 0;
    return aWeak - bWeak;
  });

  // SST deduplication: from History/Geography/Economics/Political Science,
  // keep at most 2 per plan, rotating which ones appear based on time
  const sstInPool = fullPool.filter(s => SST_GROUP.includes(s.name));
  const nonSst = fullPool.filter(s => !SST_GROUP.includes(s.name));
  if (sstInPool.length > 0) {
    const sstStart = rotationOffset % sstInPool.length;
    const sstRotated = [...sstInPool.slice(sstStart), ...sstInPool.slice(0, sstStart)];
    fullPool = [...nonSst, ...sstRotated.slice(0, Math.min(2, sstRotated.length))];
  }

  // Fallback if nothing available
  if (fullPool.length === 0) {
    fullPool = [
      { name: 'Core Subject', chapter: 'Important topics' },
      { name: 'Revision', chapter: '' },
      { name: 'Practice', chapter: '' },
    ];
  }

  // Rotate starting subject based on time so plan varies
  const startIdx = rotationOffset % fullPool.length;
  const rotated = [...fullPool.slice(startIdx), ...fullPool.slice(0, startIdx)];

  const addBlock = (block: StudyBlock) => {
    blocks.push(block);
    h += Math.floor((m + block.duration) / 60);
    m = (m + block.duration) % 60;
  };

  // Block 1: First subject (45 min deep study)
  const s0 = rotated[0];
  addBlock({
    time: formatHour(h, m),
    duration: 45,
    subject: s0.name,
    task: s0.chapter ? `${s0.chapter} — ${getTask(s0.name, 0)}` : getTask(s0.name, 0),
    type: 'study',
    emoji: '📖',
  });

  // Break
  addBlock({ time: formatHour(h, m), duration: 10, subject: '', task: 'Short break — water, stretch', type: 'break', emoji: '☕' });

  // Block 2: Second subject (45 min)
  const s1 = rotated[1] || rotated[0];
  addBlock({
    time: formatHour(h, m),
    duration: 45,
    subject: s1.name,
    task: s1.chapter ? `${s1.chapter} — ${getTask(s1.name, 1)}` : getTask(s1.name, 1),
    type: 'study',
    emoji: '✏️',
  });

  // Break
  addBlock({ time: formatHour(h, m), duration: 10, subject: '', task: 'Break — away from screen', type: 'break', emoji: '🚶' });

  // Block 3: Third subject or revision (30 min)
  if (revisionCount > 0) {
    addBlock({
      time: formatHour(h, m),
      duration: 30,
      subject: 'Revision',
      task: `Review ${revisionCount} pending revision item${revisionCount > 1 ? 's' : ''}`,
      type: 'revision',
      emoji: '🔄',
    });
  } else {
    const s2 = rotated[2] || rotated[0];
    addBlock({
      time: formatHour(h, m),
      duration: 30,
      subject: s2.name,
      task: s2.chapter ? `${s2.chapter} — ${getTask(s2.name, 2)}` : getTask(s2.name, 2),
      type: 'revision',
      emoji: '🔄',
    });
  }

  // Block 4: Mock/PYQ (25 min)
  addBlock({
    time: formatHour(h, m),
    duration: 25,
    subject: examGoal || 'Mock Practice',
    task: 'Solve 10 PYQ questions — time yourself',
    type: 'mock',
    emoji: '📝',
  });

  // Wrap-up
  addBlock({
    time: formatHour(h, m),
    duration: 10,
    subject: '',
    task: "Update doubts, log session, note tomorrow's target",
    type: 'wrap',
    emoji: '✅',
  });

  return blocks;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractOpenAIText = (response: any) => {
  if (response.output_text) return response.output_text.trim();
  return response.output
    ?.flatMap(item => item.content ?? [])
    .map(content => content.text ?? '')
    .join('')
    .trim() ?? '';
};

export async function GET(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const today = format(new Date(), 'yyyy-MM-dd');
    const last7 = format(subDays(new Date(), 7), 'yyyy-MM-dd');

    const [profile, trackerSubjects, revisionItems, focusSessions, habits] = await Promise.all([
      db.userProfile.findUnique({ where: { userId: userId } }),
      db.subjectProgress.findMany({ where: { userId: userId } }),
      db.revisionItem.findMany({
        where: {
          userId: userId,
          OR: [
            { doneReview1: false, nextReview1: { lte: today } },
            { doneReview3: false, nextReview3: { lte: today } },
            { doneReview7: false, nextReview7: { lte: today } },
          ],
        },
        take: 10,
      }),
      db.focusSession.findMany({
        where: { userId: userId, date: { gte: last7 } },
        orderBy: { createdAt: 'desc' },
      }),
      db.habit.findMany({
        where: { userId, isArchived: false },
        include: { logs: { where: { date: today, status: 'completed' } } },
      }),
    ]);

    // Parse onboarding subjects and weak subjects from profile
    let profileSubjects: string[] = [];
    let weakSubjects: string[] = [];
    try { profileSubjects = JSON.parse(profile?.subjects || '[]'); } catch { profileSubjects = []; }
    try { weakSubjects = JSON.parse(profile?.weakSubjects || '[]'); } catch { weakSubjects = []; }

    const weakHabits = habits.filter(h => h.logs.length === 0).map(h => h.name);
    const subjectList = trackerSubjects.map(s => ({
      subject: s.subject,
      chapter: s.chapter,
      progress: s.progress,
      status: s.status,
    }));
    const examGoal = profile?.examGoal || '';
    const userName = profile?.name || 'Student';
    const recentSubjects = [
      ...new Set(
        focusSessions
          .map(s => s.notes?.split(' — ')[0]?.trim())
          .filter(Boolean) as string[]
      ),
    ].slice(0, 5);

    // All subjects to use in plan (tracker + profile onboarding subjects)
    const allSubjectNames = [
      ...new Set([...subjectList.map(s => s.subject), ...profileSubjects]),
    ];

    // Try OpenAI first
    if (process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
      try {
        const client = new OpenAI({
          apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
          baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
        });
        const now = new Date();
        const prompt = `
You are a study planner for a student.

Student info:
- Name: ${userName}
- Exam goal: ${examGoal || 'Competitive exam'}
- Current time: ${format(now, 'h:mm a')}
- Subjects chosen by student: ${allSubjectNames.join(', ') || 'Physics, Chemistry, Maths'}
- Weaker subjects (prioritise these): ${weakSubjects.join(', ') || 'none specified'}
- Subjects with progress tracked (lowest progress first): ${subjectList.map(s => `${s.subject} (${s.progress}% done, chapter: ${s.chapter})`).join(', ') || 'none yet'}
- Pending revision items: ${revisionItems.length}
- Habits not done today: ${weakHabits.slice(0, 3).join(', ') || 'none'}
- Recently studied: ${recentSubjects.join(', ') || 'nothing tracked yet'}

Generate a realistic time-blocked study plan for the rest of today. IMPORTANT:
- History, Geography, Economics, and Political Science are all part of the SAME subject group (SST/Social Studies). Treat them as ONE subject — include at most 1 or 2 of them total in the entire plan, not all four.
- Include subjects from the student's chosen subject list above, especially weaker ones
- Do NOT repeat the same subject twice in a row
- Vary tasks — don't just say "study" — be specific (solve problems, make notes, revise formulas, etc.)
- Return ONLY a JSON array of blocks, no other text.
Each block must have: time (string like "3:00 PM"), duration (number in minutes), subject (string), task (string, specific and actionable), type ("study"|"break"|"revision"|"mock"|"wrap"), emoji (single emoji).
Generate 6-8 blocks. Start from current time + 5 minutes. Include breaks between study blocks.
`;
        const response = await client.responses.create({
          model: 'gpt-5-mini',
          input: prompt,
        });
        const raw = extractOpenAIText(response);
        const jsonMatch = raw.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as StudyBlock[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            return NextResponse.json({ plan: parsed, userName, generatedAt: format(now, 'h:mm a') });
          }
        }
      } catch {
        // fall through to local plan
      }
    }

    // Local fallback plan — uses onboarding subjects + varies by time
    const plan = buildLocalPlan(profileSubjects, subjectList, weakSubjects, examGoal, revisionItems.length);
    return NextResponse.json({
      plan,
      userName,
      generatedAt: format(new Date(), 'h:mm a'),
    });
  } catch (error) {
    console.error('Study plan error:', error);
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 });
  }
}
