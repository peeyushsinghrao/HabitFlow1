'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { differenceInCalendarDays, format, startOfWeek, addDays, parseISO, subDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabitStore, type Habit } from '@/stores/habit-store';
import { usePWStore } from '@/stores/pw-store';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Sparkles,
  Flame,
  Check,
  CheckCircle2,
  Trash2,
  Edit3,
  Coffee,
  ListTodo,
  BookOpen,
  Package,
  GraduationCap,
  Play,
  Pause,
  RotateCcw,
  Timer,
  ShieldCheck,
  PauseCircle,
  PlayCircle,
  TrendingUp,
  ChevronDown,
  GripVertical,
  Star,
  Zap,
  Target,
  AlertCircle,
  CalendarDays,
  Clock,
  Umbrella,
  Trophy,
  Shield,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { WaterTracker } from './water-tracker';
import { MoodTracker } from './mood-tracker';
import { ConfettiCelebration } from './confetti-celebration';
import { HabitTemplatesDialog } from './habit-templates';
import { DailyMissionWidget } from './daily-mission';
import { BurnoutDetector } from './burnout-detector';
import { ScreenTimeWidget } from './screen-time-widget';
import { DailyStudyGoalWidget } from './daily-study-goal-widget';
import { BossChallengeWidget } from './boss-challenge-widget';
import { StatsWidgetCard } from './stats-widget-card';

// ── Mantra Banner ────────────────────────────────────────────────────────────
function MantraBanner({ mantra }: { mantra: string }) {
  if (!mantra) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary/8 via-primary/5 to-transparent border border-primary/15 flex items-center gap-2"
    >
<<<<<<< HEAD
      <Target className="h-3.5 w-3.5 text-primary/70 flex-shrink-0" />
      <p className="text-[11px] font-semibold text-primary/90 leading-snug truncate italic">&ldquo;{mantra}&rdquo;</p>
=======
<<<<<<< HEAD
      <span className="text-base flex-shrink-0">🎯</span>
      <p className="text-xs font-semibold text-primary/90 leading-snug truncate italic">&ldquo;{mantra}&rdquo;</p>
=======
      <Target className="h-3.5 w-3.5 text-primary/70 flex-shrink-0" />
      <p className="text-[11px] font-semibold text-primary/90 leading-snug truncate italic">&ldquo;{mantra}&rdquo;</p>
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
    </motion.div>
  );
}

// ── Weekly Debrief Card ──────────────────────────────────────────────────────
function WeeklyDebriefCard() {
  const [debrief, setDebrief] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');
  const dayOfWeek = new Date().getDay();
  const DEBRIEF_CACHE_KEY = `nuviora-weekly-debrief-cache-${today}`;

  useEffect(() => {
    const shouldShow = dayOfWeek === 1; // Monday only
    if (!shouldShow) return;

    try {
      const cachedDismissed = localStorage.getItem(`nuviora-debrief-dismissed-${today}`);
      if (cachedDismissed) { setDismissed(true); return; }

      const cached = localStorage.getItem(DEBRIEF_CACHE_KEY);
      if (cached) { setDebrief(JSON.parse(cached)); return; }
    } catch {}

    setLoading(true);
    fetch('/api/weekly-debrief')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.debrief) {
          setDebrief(data.debrief);
          try { localStorage.setItem(DEBRIEF_CACHE_KEY, JSON.stringify(data.debrief)); } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [today, dayOfWeek, DEBRIEF_CACHE_KEY]);

  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(`nuviora-debrief-dismissed-${today}`, '1'); } catch {}
  };

  if (dayOfWeek !== 1 || dismissed || (!loading && debrief.length === 0)) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="weekly-debrief"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.3 }}
      >
<<<<<<< HEAD
        <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-50/80 to-purple-50/60 dark:from-violet-900/20 dark:to-purple-900/10 overflow-hidden">
=======
        <Card className="border border-violet-200/40 dark:border-violet-800/20 shadow-sm bg-gradient-to-br from-violet-50/80 to-purple-50/60 dark:from-violet-900/20 dark:to-purple-900/10 overflow-hidden">
>>>>>>> 925ef42 (Initial commit)
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7C3AED, #C026D3)' }}>
                  <span className="text-white text-xs font-bold">A</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Aria&apos;s Monday Debrief</p>
<<<<<<< HEAD
                  <p className="text-[10px] text-muted-foreground">Your week at a glance</p>
=======
                  <p className="text-xs text-muted-foreground">Your week at a glance</p>
>>>>>>> 925ef42 (Initial commit)
                </div>
              </div>
              <button onClick={dismiss} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted/50">
                <span className="text-xs">✕</span>
              </button>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-3.5 rounded-full bg-violet-200/50 dark:bg-violet-700/30 animate-pulse" style={{ width: `${60 + i * 12}%` }} />
                ))}
              </div>
            ) : (
              <div className="space-y-1.5">
                {debrief.map((line, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="text-[12px] text-foreground/85 leading-relaxed"
                  >
                    {line}
                  </motion.p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Vacation Mode Banner ─────────────────────────────────────────────────────
function VacationModeBanner({ vacationEnd }: { vacationEnd: string }) {
  if (!vacationEnd) return null;
  const today = format(new Date(), 'yyyy-MM-dd');
  if (today > vacationEnd) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/10 border border-sky-200/50 dark:border-sky-700/20 flex items-center gap-2"
    >
      <Umbrella className="h-4 w-4 text-sky-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
<<<<<<< HEAD
        <p className="text-[11px] font-bold text-sky-700 dark:text-sky-300">Break Mode Active</p>
        <p className="text-[10px] text-sky-600/70 dark:text-sky-400/60">Streaks are protected until {vacationEnd}</p>
=======
<<<<<<< HEAD
        <p className="text-xs font-bold text-sky-700 dark:text-sky-300">Vacation Mode Active</p>
        <p className="text-xs text-sky-600/70 dark:text-sky-400/60">Streaks are protected until {vacationEnd}</p>
=======
        <p className="text-[11px] font-bold text-sky-700 dark:text-sky-300">Break Mode Active</p>
        <p className="text-[10px] text-sky-600/70 dark:text-sky-400/60">Streaks are protected until {vacationEnd}</p>
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
      </div>
    </motion.div>
  );
}

const MOTIVATIONAL_QUOTES = [
  { text: "Small steps every day lead to big changes.", author: "Unknown" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "R. Collier" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
  { text: "Progress, not perfection.", author: "Unknown" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Your only limit is your mind.", author: "Unknown" },
  { text: "Study hard what interests you the most, in the most undisciplined, irreverent way possible.", author: "Richard Feynman" },
  { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "Education is not the learning of facts, but the training of the mind to think.", author: "Albert Einstein" },
  { text: "One hour of focused study is worth more than three hours of distracted effort.", author: "Unknown" },
  { text: "Consistency is more important than perfection.", author: "Unknown" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Great things are not done by impulse, but by a series of small things brought together.", author: "Vincent Van Gogh" },
  { text: "Stay focused and never give up.", author: "Unknown" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "If you're going through a tough chapter, keep reading. It gets better.", author: "Unknown" },
  { text: "Today's struggle is tomorrow's strength.", author: "Unknown" },
  { text: "Concentration is the root of all higher abilities in man.", author: "Bruce Lee" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "The pain of studying is far less than the pain of regret.", author: "Unknown" },
  { text: "Each day is a new opportunity to grow.", author: "Unknown" },
];

function MiniProgressRing({ progress, size = 44, strokeWidth = 4 }: { progress: number; size?: number; strokeWidth?: number; }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress / 100);
  return (
    <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" className="stroke-muted" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" className="stroke-primary"
        strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
      />
    </svg>
  );
}

// ── Mini Pomodoro Widget ─────────────────────────────────────────────
function QuickFocusWidget() {
  const WORK_SECONDS = 25 * 60;
  const [seconds, setSeconds] = useState(WORK_SECONDS);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            setRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  const progress = ((WORK_SECONDS - seconds) / WORK_SECONDS) * 100;
  const isDone = seconds === 0;

  const reset = () => { setRunning(false); setSeconds(WORK_SECONDS); };

  return (
<<<<<<< HEAD
    <Card className="border-0 shadow-sm overflow-hidden">
=======
    <Card className="border border-border/40 shadow-sm overflow-hidden">
>>>>>>> 925ef42 (Initial commit)
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex-shrink-0">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="none" className="stroke-muted" strokeWidth="4" />
              <motion.circle
                cx="24" cy="24" r="20" fill="none"
                className={isDone ? 'stroke-emerald-500' : 'stroke-primary'}
                strokeWidth="4" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 20}`}
                animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - progress / 100) }}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Timer className={`h-4 w-4 ${isDone ? 'text-emerald-500' : 'text-primary'}`} />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Quick Focus</p>
            <p className={`text-2xl font-bold tabular-nums leading-tight flex items-center gap-1.5 ${isDone ? 'text-emerald-500' : 'text-foreground'}`}>
              {isDone ? <><CheckCircle2 className="h-5 w-5" /> Done!</> : `${mins}:${secs}`}
            </p>
<<<<<<< HEAD
            <p className="text-[10px] text-muted-foreground">25-min Pomodoro</p>
=======
            <p className="text-xs text-muted-foreground">25-min Pomodoro</p>
>>>>>>> 925ef42 (Initial commit)
          </div>
          <div className="flex items-center gap-1.5">
            {!isDone ? (
              <button
                onClick={() => setRunning(r => !r)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  running
                    ? 'bg-primary/10 text-primary hover:bg-primary/20'
                    : 'bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90'
                }`}
              >
                {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>
            ) : null}
            {(running || seconds !== WORK_SECONDS) && (
              <button
                onClick={reset}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-muted/60 text-muted-foreground hover:bg-muted transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Mini Calendar Strip ──────────────────────────────────────────────────────
function MiniCalendarStrip({ habits, today }: { habits: Habit[]; today: string }) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
<<<<<<< HEAD
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">This Week</p>
=======
    <Card className="border border-border/40 shadow-sm">
      <CardContent className="p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">This Week</p>
>>>>>>> 925ef42 (Initial commit)
        <div className="flex justify-between gap-1">
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isFuture = dateStr > today;
            const isToday = dateStr === today;
            const completedCount = isFuture ? 0 : habits.filter(h =>
              h.logs?.some(l => l.date === dateStr && l.status === 'completed')
            ).length;
            const totalHabits = habits.length;
            const pct = totalHabits > 0 ? completedCount / totalHabits : 0;
            let dotClass = 'bg-muted/40';
            if (!isFuture && totalHabits > 0) {
              if (pct >= 1) dotClass = 'bg-primary';
              else if (pct >= 0.5) dotClass = 'bg-primary/60';
              else if (pct > 0) dotClass = 'bg-primary/30';
            }
            return (
              <div key={dateStr} className="flex flex-col items-center gap-1.5">
<<<<<<< HEAD
                <span className={`text-[10px] font-medium ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                  {format(day, 'EEE').charAt(0)}
                </span>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors ${
=======
                <span className={`text-xs font-medium ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                  {format(day, 'EEE').charAt(0)}
                </span>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
>>>>>>> 925ef42 (Initial commit)
                  isToday ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
                }`}>
                  {format(day, 'd')}
                </div>
                <div className={`w-2 h-2 rounded-full ${dotClass}`} />
              </div>
            );
          })}
        </div>
        <div className="flex gap-3 mt-2.5">
<<<<<<< HEAD
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /><span className="text-[10px] text-muted-foreground">All done</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary/50" /><span className="text-[10px] text-muted-foreground">Partial</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-muted/40" /><span className="text-[10px] text-muted-foreground">None</span></div>
=======
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /><span className="text-xs text-muted-foreground">All done</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary/50" /><span className="text-xs text-muted-foreground">Partial</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-muted/40" /><span className="text-xs text-muted-foreground">None</span></div>
>>>>>>> 925ef42 (Initial commit)
        </div>
      </CardContent>
    </Card>
  );
}

// ── Today's Intention Widget ─────────────────────────────────────────────────
function TodayIntentionWidget({ today }: { today: string }) {
  const storageKey = `nuviora-intention-${today}`;
  const [intention, setIntention] = useState(() => {
    try { return localStorage.getItem(storageKey) || ''; } catch { return ''; }
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(intention);

  const save = () => {
    try { localStorage.setItem(storageKey, draft); } catch { /* ignore */ }
    setIntention(draft);
    setEditing(false);
  };

  if (!intention && !editing) {
    return (
      <button
        onClick={() => { setEditing(true); setDraft(''); }}
        className="w-full flex items-center gap-3 bg-card rounded-xl border border-dashed border-primary/30 px-4 py-3 hover:border-primary/60 transition-colors"
      >
        <Star className="h-4 w-4 text-primary/50" />
        <span className="text-sm text-muted-foreground italic">Set today&apos;s intention...</span>
      </button>
    );
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 bg-card rounded-xl border border-primary/30 px-3 py-2">
        <Star className="h-4 w-4 text-primary flex-shrink-0" />
        <input
          autoFocus
          className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder-muted-foreground"
          placeholder="Today I will focus on..."
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
          maxLength={80}
        />
<<<<<<< HEAD
        <button onClick={save} className="text-[10px] font-bold text-primary px-2 py-1 rounded-lg bg-primary/10">Save</button>
=======
        <button onClick={save} className="text-xs font-bold text-primary px-2 py-1 rounded-lg bg-primary/10">Save</button>
>>>>>>> 925ef42 (Initial commit)
      </div>
    );
  }

  return (
    <button
      onClick={() => { setEditing(true); setDraft(intention); }}
      className="w-full flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-left"
    >
      <Star className="h-4 w-4 text-primary flex-shrink-0" />
      <span className="text-sm text-foreground flex-1">&ldquo;{intention}&rdquo;</span>
      <Edit3 className="h-3 w-3 text-muted-foreground" />
    </button>
  );
}

// ── Weekly Performance Widget ────────────────────────────────────────────────
function WeeklyPerformanceWidget({ habits, today }: { habits: Habit[]; today: string }) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), 'yyyy-MM-dd'));
  const pastDays = days.filter(d => d <= today);

  const weeklyData = pastDays.map(date => {
    const completed = habits.filter(h => h.logs?.some(l => l.date === date && l.status === 'completed')).length;
    const total = habits.length;
    return { date, completed, total, pct: total > 0 ? Math.round(completed / total * 100) : 0 };
  });

  const avgPct = weeklyData.length > 0 ? Math.round(weeklyData.reduce((a, d) => a + d.pct, 0) / weeklyData.length) : 0;
  const perfectDays = weeklyData.filter(d => d.pct === 100).length;
  const bestDay = weeklyData.reduce((best, d) => d.pct > best.pct ? d : best, weeklyData[0] || { pct: 0, date: '' });

  return (
<<<<<<< HEAD
    <Card className="border-0 shadow-sm">
=======
    <Card className="border border-border/40 shadow-sm">
>>>>>>> 925ef42 (Initial commit)
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Weekly Performance</p>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center bg-primary/5 rounded-xl p-2.5">
            <p className="text-lg font-bold text-primary">{avgPct}%</p>
<<<<<<< HEAD
            <p className="text-[10px] text-muted-foreground">Avg Rate</p>
          </div>
          <div className="text-center bg-amber-50 dark:bg-amber-500/10 rounded-xl p-2.5">
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{perfectDays}</p>
            <p className="text-[10px] text-muted-foreground">Perfect Days</p>
          </div>
          <div className="text-center bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-2.5">
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{pastDays.length}</p>
            <p className="text-[10px] text-muted-foreground">Days Active</p>
=======
            <p className="text-xs text-muted-foreground">Avg Rate</p>
          </div>
          <div className="text-center bg-amber-50 dark:bg-amber-500/10 rounded-xl p-2.5">
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{perfectDays}</p>
            <p className="text-xs text-muted-foreground">Perfect Days</p>
          </div>
          <div className="text-center bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-2.5">
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{pastDays.length}</p>
            <p className="text-xs text-muted-foreground">Days Active</p>
>>>>>>> 925ef42 (Initial commit)
          </div>
        </div>
        <div className="flex gap-1 items-end h-10">
          {weeklyData.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5">
              <div
                className="w-full rounded-t-sm transition-all"
                style={{
                  height: `${Math.max(4, d.pct * 0.36)}px`,
                  backgroundColor: d.pct === 100 ? 'var(--primary)' : d.pct > 0 ? 'color-mix(in srgb, var(--primary) 50%, transparent)' : 'var(--muted)',
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {['M','T','W','T','F','S','S'].map((d, i) => (
<<<<<<< HEAD
            <span key={i} className="flex-1 text-center text-[9px] text-muted-foreground">{d}</span>
          ))}
        </div>
        {bestDay && bestDay.pct > 0 && (
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
=======
            <span key={i} className="flex-1 text-center text-xs text-muted-foreground">{d}</span>
          ))}
        </div>
        {bestDay && bestDay.pct > 0 && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
>>>>>>> 925ef42 (Initial commit)
            Best day: {format(parseISO(bestDay.date), 'EEE')} — {bestDay.pct}% done
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Productivity Score ───────────────────────────────────────────────────────
function ProductivityScoreWidget({ habits, today }: { habits: Habit[]; today: string }) {
  const [focusMinutes, setFocusMinutes] = useState(0);
  const [distractionMarks, setDistractionMarks] = useState(0);
  const [focusSessions, setFocusSessions] = useState(0);

  useEffect(() => {
    const loadLocalSignals = () => {
      try {
        const statsRaw = localStorage.getItem('habitflow-pomodoro-today');
        if (statsRaw) {
          const stats = JSON.parse(statsRaw);
          if (stats.date === today) {
            setFocusSessions(stats.completed || 0);
            setFocusMinutes((stats.completed || 0) * 25);
          }
        }
        const journalRaw = localStorage.getItem('nuviora-distraction-journal');
        const journal = journalRaw ? JSON.parse(journalRaw) : [];
        if (Array.isArray(journal)) {
          setDistractionMarks(journal.filter(entry => entry.date === today).reduce((sum, entry) => sum + (Number(entry.count) || 1), 0));
        }
      } catch { /* ignore */ }
    };
    loadLocalSignals();
    fetch('/api/focus-sessions?days=1')
      .then(res => res.ok ? res.json() : [])
      .then((sessions: { date: string; duration: number; completed?: boolean }[]) => {
        const todaysSessions = sessions.filter(session => session.date === today && session.completed !== false);
        if (todaysSessions.length > 0) {
          setFocusSessions(todaysSessions.length);
          setFocusMinutes(todaysSessions.reduce((sum, session) => sum + (session.duration || 0), 0));
        }
      })
      .catch(() => {});
    window.addEventListener('nuviora-distraction-journal-updated', loadLocalSignals);
    return () => window.removeEventListener('nuviora-distraction-journal-updated', loadLocalSignals);
  }, [today]);

  const completedToday = habits.filter(h => h.logs?.some(l => l.date === today && l.status === 'completed')).length;
  const habitScore = habits.length > 0 ? Math.round((completedToday / habits.length) * 45) : 0;
  const focusScore = Math.min(35, Math.round(focusMinutes / 150 * 35));
  const consistencyScore = Math.min(10, focusSessions * 3);
  const distractionPenalty = Math.min(15, distractionMarks * 3);
  const total = Math.max(0, Math.min(100, habitScore + focusScore + consistencyScore + 10 - distractionPenalty));

  const scoreLabel = total >= 90 ? 'Excellent' : total >= 70 ? 'Great' : total >= 50 ? 'Good' : total >= 30 ? 'Fair' : 'Getting started';
  const scoreColor = total >= 90 ? 'text-emerald-500' : total >= 70 ? 'text-primary' : total >= 50 ? 'text-amber-500' : 'text-muted-foreground';
  const nextAction = habits.length > 0 && completedToday < habits.length
    ? 'Finish one more habit for an instant boost.'
    : focusMinutes < 90
      ? 'Add one 25-min focus block to raise your score.'
      : distractionMarks > 0
        ? 'Reduce distractions next session to protect your score.'
        : 'Strong day. Keep the evening light and consistent.';

  return (
<<<<<<< HEAD
    <Card className="border-0 shadow-sm">
=======
    <Card className="border border-border/40 shadow-sm">
>>>>>>> 925ef42 (Initial commit)
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Zap className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">Productivity Score</p>
            </div>
            <p className="text-xs text-muted-foreground">Habits + Focus time combined</p>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${scoreColor}`}>{total}</p>
<<<<<<< HEAD
            <p className={`text-[10px] font-semibold ${scoreColor}`}>{scoreLabel}</p>
=======
            <p className={`text-xs font-semibold ${scoreColor}`}>{scoreLabel}</p>
>>>>>>> 925ef42 (Initial commit)
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-muted/40 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-amber-400"
            initial={{ width: 0 }}
            animate={{ width: `${total}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
<<<<<<< HEAD
        <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
=======
        <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
>>>>>>> 925ef42 (Initial commit)
          <span>Habits {habitScore}</span>
          <span>Focus {focusScore}</span>
          <span>Flow {consistencyScore + 10 - distractionPenalty}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="rounded-xl bg-muted/40 p-2 text-center">
            <p className="text-sm font-bold">{completedToday}/{habits.length}</p>
<<<<<<< HEAD
            <p className="text-[9px] text-muted-foreground">habits</p>
          </div>
          <div className="rounded-xl bg-primary/8 p-2 text-center">
            <p className="text-sm font-bold text-primary">{focusMinutes}m</p>
            <p className="text-[9px] text-muted-foreground">focus</p>
          </div>
          <div className="rounded-xl bg-amber-500/10 p-2 text-center">
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400">-{distractionPenalty}</p>
            <p className="text-[9px] text-muted-foreground">distraction</p>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 leading-snug">{nextAction}</p>
=======
            <p className="text-xs text-muted-foreground">habits</p>
          </div>
          <div className="rounded-xl bg-primary/8 p-2 text-center">
            <p className="text-sm font-bold text-primary">{focusMinutes}m</p>
            <p className="text-xs text-muted-foreground">focus</p>
          </div>
          <div className="rounded-xl bg-amber-500/10 p-2 text-center">
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400">-{distractionPenalty}</p>
            <p className="text-xs text-muted-foreground">distraction</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 leading-snug">{nextAction}</p>
>>>>>>> 925ef42 (Initial commit)
      </CardContent>
    </Card>
  );
}

interface TimetableBlock {
  id: string;
  day: number;
  start: string;
  end: string;
  subject: string;
  task: string;
}

function loadTimetableBlocks(): TimetableBlock[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem('nuviora-weekly-timetable') || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function minutesFromTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function NextTwoHoursTimetablePreview() {
  const [blocks, setBlocks] = useState<TimetableBlock[]>([]);

  useEffect(() => {
    const load = () => setBlocks(loadTimetableBlocks());
    load();
    window.addEventListener('storage', load);
    window.addEventListener('nuviora-weekly-timetable-updated', load);
    return () => {
      window.removeEventListener('storage', load);
      window.removeEventListener('nuviora-weekly-timetable-updated', load);
    };
  }, []);

  const upcoming = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const current = now.getHours() * 60 + now.getMinutes();
    return blocks
      .filter(block => block.day === day)
      .map(block => ({ ...block, startMin: minutesFromTime(block.start), endMin: minutesFromTime(block.end) }))
      .filter(block => block.endMin >= current && block.startMin <= current + 120)
      .sort((a, b) => a.startMin - b.startMin)
      .slice(0, 3);
  }, [blocks]);

  if (blocks.length === 0) return null;

  return (
<<<<<<< HEAD
    <Card className="border-0 shadow-sm">
=======
    <Card className="border border-border/40 shadow-sm">
>>>>>>> 925ef42 (Initial commit)
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Next 2 Hours</p>
          </div>
<<<<<<< HEAD
          <span className="text-[10px] text-muted-foreground">from timetable</span>
=======
          <span className="text-xs text-muted-foreground">from timetable</span>
>>>>>>> 925ef42 (Initial commit)
        </div>
        {upcoming.length > 0 ? (
          <div className="space-y-2">
            {upcoming.map(block => (
              <div key={block.id} className="flex items-center gap-2 rounded-xl bg-muted/40 border border-border/40 p-2.5">
<<<<<<< HEAD
                <div className="w-16 text-[10px] font-semibold text-primary">{block.start}-{block.end}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{block.subject}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{block.task || 'Study block'}</p>
=======
                <div className="w-16 text-xs font-semibold text-primary">{block.start}-{block.end}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{block.subject}</p>
                  <p className="text-xs text-muted-foreground truncate">{block.task || 'Study block'}</p>
>>>>>>> 925ef42 (Initial commit)
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No scheduled study block in the next 2 hours.</p>
        )}
      </CardContent>
    </Card>
  );
}

const STREAM_HOME_WIDGETS: Record<string, {
  title: string;
  focus: string;
  mock: string;
  revision: string;
  suggestions: { emoji: string; text: string }[];
}> = {
  PCM: {
    title: 'PCM Focus',
    focus: 'Physics + Maths numericals',
    mock: 'JEE mock weekly',
    revision: 'Formula sheet daily',
    suggestions: [
      { emoji: '⚛️', text: 'Physics 30 questions' },
      { emoji: '📐', text: 'Maths 40 problems' },
      { emoji: '🧪', text: 'Chemistry revision' },
    ],
  },
  PCB: {
    title: 'PCB Focus',
    focus: 'Biology NCERT + Physics',
    mock: 'NEET mock weekly',
    revision: 'NCERT highlights daily',
    suggestions: [
      { emoji: '🧬', text: 'Biology NCERT' },
      { emoji: '⚛️', text: 'Physics numericals' },
      { emoji: '🧪', text: 'Chemistry revision' },
    ],
  },
  PCMB: {
    title: 'PCMB Balance',
    focus: 'Bio + Maths rotation',
    mock: 'Mixed mock weekly',
    revision: 'Formula + NCERT review',
    suggestions: [
      { emoji: '🧬', text: 'Biology NCERT' },
      { emoji: '📐', text: 'Maths practice' },
      { emoji: '⚛️', text: 'Physics problems' },
    ],
  },
  Commerce: {
    title: 'Commerce Focus',
    focus: 'Accounts + Economics',
    mock: 'Sample paper weekly',
    revision: 'BST notes daily',
    suggestions: [
      { emoji: '📊', text: 'Accountancy practice' },
      { emoji: '🏦', text: 'Economics concepts' },
      { emoji: '📈', text: 'BST revision' },
    ],
  },
  Humanities: {
    title: 'Humanities Focus',
    focus: 'History + Polity notes',
    mock: 'CUET/Boards practice',
    revision: 'Map/current affairs',
    suggestions: [
      { emoji: '📜', text: 'History revision' },
      { emoji: '🌍', text: 'Geography maps' },
      { emoji: '⚖️', text: 'Political Science' },
    ],
  },
};

const getStreamKeyFromClass = (studentClass?: string) => {
  if (!studentClass) return '';
  const classNumber = Number(studentClass.match(/\d+/)?.[0]);
  if (classNumber !== 11 && classNumber !== 12) return '';
  if (studentClass.includes('PCMB')) return 'PCMB';
  if (studentClass.includes('PCM')) return 'PCM';
  if (studentClass.includes('PCB')) return 'PCB';
  if (studentClass.includes('Commerce')) return 'Commerce';
  if (studentClass.includes('Humanities')) return 'Humanities';
  return '';
};

interface SubjectProgressItem {
  id: string;
  subject: string;
  chapter: string;
  progress: number;
  status: string;
}

interface MockTestItem {
  id: string;
  subject: string;
  score: number;
  totalMarks: number;
}

function getSubjectsForStudent(studentClass?: string) {
  const streamKey = getStreamKeyFromClass(studentClass);
  if (streamKey === 'PCM') return ['Physics', 'Chemistry', 'Mathematics'];
  if (streamKey === 'PCB') return ['Physics', 'Chemistry', 'Biology'];
  if (streamKey === 'PCMB') return ['Physics', 'Chemistry', 'Mathematics', 'Biology'];
  if (streamKey === 'Commerce') return ['Accounts', 'Business Studies', 'Economics', 'Mathematics'];
  if (streamKey === 'Humanities') return ['History', 'Geography', 'Economics', 'Political Science'];
  return ['Physics', 'Chemistry', 'Mathematics'];
}

function SmartDailyStudyPlanner({ today, studentClass }: { today: string; studentClass?: string }) {
  const [availableHours, setAvailableHours] = useState(() => {
    try { return localStorage.getItem('nuviora-daily-study-hours') || '4'; } catch { return '4'; }
  });
  const [chapters, setChapters] = useState<SubjectProgressItem[]>([]);

  useEffect(() => {
    fetch('/api/subjects')
      .then(res => res.ok ? res.json() : [])
      .then((data: SubjectProgressItem[]) => setChapters(data))
      .catch(() => setChapters([]));
  }, []);

  const hours = Math.max(1, Math.min(14, Number(availableHours) || 4));
  const subjects = getSubjectsForStudent(studentClass);
  const pendingChapters = chapters.filter(ch => ch.status !== 'completed').sort((a, b) => a.progress - b.progress);
  const plan = useMemo(() => {
    const focusBlocks = Math.max(2, Math.min(6, Math.round(hours)));
    return Array.from({ length: Math.min(4, focusBlocks) }, (_, index) => {
      const chapter = pendingChapters[index];
      const subject = chapter?.subject || subjects[index % subjects.length];
      const task = chapter
        ? `${chapter.chapter} (${chapter.progress}% done)`
        : index === 0 ? 'Concept study' : index === 1 ? 'Question practice' : index === 2 ? 'Revision' : 'Mistake review';
      const minutes = index === 0 ? 90 : Math.max(35, Math.round((hours * 60 - 90) / Math.max(1, Math.min(3, focusBlocks - 1))));
      return { subject, task, minutes };
    });
  }, [hours, pendingChapters, subjects]);

  const saveHours = (value: string) => {
    setAvailableHours(value);
    try { localStorage.setItem('nuviora-daily-study-hours', value); } catch { /* ignore */ }
  };

  return (
<<<<<<< HEAD
    <Card className="border-0 shadow-sm overflow-hidden">
=======
    <Card className="border border-border/40 shadow-sm overflow-hidden">
>>>>>>> 925ef42 (Initial commit)
      <CardContent className="p-4 bg-gradient-to-br from-primary/8 via-background to-muted/50">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">Daily Study Planner</p>
            </div>
<<<<<<< HEAD
            <p className="text-[10px] text-muted-foreground mt-0.5">Auto plan for {today}</p>
=======
            <p className="text-xs text-muted-foreground mt-0.5">Auto plan for {today}</p>
>>>>>>> 925ef42 (Initial commit)
          </div>
          <label className="flex items-center gap-1 rounded-xl bg-background/75 border border-border/40 px-2 py-1">
            <input
              type="number"
              min={1}
              max={14}
              value={availableHours}
              onChange={e => saveHours(e.target.value)}
              className="w-8 bg-transparent text-xs font-bold outline-none text-right"
            />
<<<<<<< HEAD
            <span className="text-[10px] text-muted-foreground">hrs</span>
=======
            <span className="text-xs text-muted-foreground">hrs</span>
>>>>>>> 925ef42 (Initial commit)
          </label>
        </div>
        <div className="space-y-2">
          {plan.map((item, index) => (
            <div key={`${item.subject}-${index}`} className="flex items-center gap-2 rounded-xl bg-background/75 border border-border/40 p-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{index + 1}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{item.subject}</p>
<<<<<<< HEAD
                <p className="text-[10px] text-muted-foreground truncate">{item.task}</p>
              </div>
              <span className="text-[10px] font-semibold text-primary">{item.minutes}m</span>
=======
                <p className="text-xs text-muted-foreground truncate">{item.task}</p>
              </div>
              <span className="text-xs font-semibold text-primary">{item.minutes}m</span>
>>>>>>> 925ef42 (Initial commit)
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ExamRoadmapWidget({ examCountdown }: { examCountdown: number | null }) {
  if (examCountdown === null || examCountdown <= 0) return null;
  const phases = [
    { days: 90, label: 'Complete syllabus pass', active: examCountdown > 90, text: 'Finish the first full pass and close backlog.' },
    { days: 60, label: 'First revision', active: examCountdown <= 90 && examCountdown > 60, text: 'Revise notes and strengthen weak chapters.' },
    { days: 30, label: 'Mock tests only', active: examCountdown <= 60 && examCountdown > 10, text: 'Mocks, analysis, mistakes, and PYQs.' },
    { days: 10, label: 'Light revision + sleep', active: examCountdown <= 10, text: 'Protect sleep and revise formulas calmly.' },
  ];
  const activePhase = phases.find(p => p.active) || phases[0];

  return (
<<<<<<< HEAD
    <Card className="border-0 shadow-sm">
=======
    <Card className="border border-border/40 shadow-sm">
>>>>>>> 925ef42 (Initial commit)
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-semibold">Exam Milestone Roadmap</p>
          </div>
<<<<<<< HEAD
          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">{examCountdown} days left</span>
=======
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{examCountdown} days left</span>
>>>>>>> 925ef42 (Initial commit)
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {phases.map(phase => (
            <div
              key={phase.label}
              className={`rounded-xl border p-2 min-h-[74px] ${phase.active ? 'border-amber-400 bg-amber-50 dark:bg-amber-500/10' : 'border-border/40 bg-muted/30'}`}
            >
<<<<<<< HEAD
              <p className={`text-[10px] font-bold ${phase.active ? 'text-amber-700 dark:text-amber-300' : 'text-muted-foreground'}`}>{phase.days} days</p>
              <p className="text-[9px] text-muted-foreground mt-0.5 leading-snug">{phase.label}</p>
              <p className="text-[9px] leading-snug mt-1">{phase.text}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-3">
=======
              <p className={`text-xs font-bold ${phase.active ? 'text-amber-700 dark:text-amber-300' : 'text-muted-foreground'}`}>{phase.days} days</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{phase.label}</p>
              <p className="text-xs leading-snug mt-1">{phase.text}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
>>>>>>> 925ef42 (Initial commit)
          Current stage: <span className="font-semibold text-foreground">{activePhase.label}</span>
        </p>
      </CardContent>
    </Card>
  );
}

function WeakSubjectDetector({ studentClass }: { studentClass?: string }) {
  const [chapters, setChapters] = useState<SubjectProgressItem[]>([]);
  const [tests, setTests] = useState<MockTestItem[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/subjects').then(res => res.ok ? res.json() : []),
      fetch('/api/mock-tests').then(res => res.ok ? res.json() : []),
    ])
      .then(([subjectData, testData]: [SubjectProgressItem[], MockTestItem[]]) => {
        setChapters(subjectData);
        setTests(testData);
      })
      .catch(() => {
        setChapters([]);
        setTests([]);
      });
  }, []);

  const subjects = getSubjectsForStudent(studentClass);
  const scores = subjects.map(subject => {
    const subjectChapters = chapters.filter(ch => ch.subject === subject);
    const completion = subjectChapters.length
      ? subjectChapters.reduce((sum, ch) => sum + (ch.status === 'completed' ? 100 : ch.progress), 0) / subjectChapters.length
      : 50;
    const subjectTests = tests.filter(test => test.subject === subject);
    const mockAverage = subjectTests.length
      ? subjectTests.reduce((sum, test) => sum + (test.score / Math.max(1, test.totalMarks)) * 100, 0) / subjectTests.length
      : 50;
    const score = Math.round((completion * 0.55) + (mockAverage * 0.45));
    return { subject, score, completion: Math.round(completion), mockAverage: Math.round(mockAverage), tests: subjectTests.length };
  }).sort((a, b) => a.score - b.score);
  const weakest = scores[0];

  return (
<<<<<<< HEAD
    <Card className="border-0 shadow-sm">
=======
    <Card className="border border-border/40 shadow-sm">
>>>>>>> 925ef42 (Initial commit)
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-4 w-4 text-rose-500" />
          <p className="text-sm font-semibold">Weak Subject Detector</p>
        </div>
        {weakest ? (
          <>
            <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200/60 dark:border-rose-500/20 p-3 mb-2">
              <p className="text-xs text-muted-foreground">Needs attention first</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-base font-bold text-rose-600 dark:text-rose-300">{weakest.subject}</p>
                <p className="text-sm font-bold text-rose-600 dark:text-rose-300">{weakest.score}%</p>
              </div>
<<<<<<< HEAD
              <p className="text-[10px] text-muted-foreground mt-1">
=======
              <p className="text-xs text-muted-foreground mt-1">
>>>>>>> 925ef42 (Initial commit)
                Chapters {weakest.completion}% • Mocks {weakest.tests ? `${weakest.mockAverage}%` : 'not logged'}
              </p>
            </div>
            <div className="space-y-1.5">
              {scores.slice(0, 3).map(item => (
<<<<<<< HEAD
                <div key={item.subject} className="flex items-center gap-2 text-[10px]">
=======
                <div key={item.subject} className="flex items-center gap-2 text-xs">
>>>>>>> 925ef42 (Initial commit)
                  <span className="w-20 truncate text-muted-foreground">{item.subject}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary/70" style={{ width: `${item.score}%` }} />
                  </div>
                  <span className="w-8 text-right font-semibold">{item.score}%</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">Add chapters or mock tests to detect weak subjects.</p>
        )}
      </CardContent>
    </Card>
  );
}

function StreamMobileWidgets({
  studentClass,
  onOpenTemplates,
}: {
  studentClass?: string;
  onOpenTemplates: () => void;
}) {
  const streamKey = getStreamKeyFromClass(studentClass);
  const info = streamKey ? STREAM_HOME_WIDGETS[streamKey] : null;
  if (!info) return null;

  const widgets = [
    { label: 'Today focus', value: info.focus, icon: Target },
    { label: 'Mock plan', value: info.mock, icon: GraduationCap },
    { label: 'Revision', value: info.revision, icon: BookOpen },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }}>
<<<<<<< HEAD
      <Card className="border-0 shadow-sm overflow-hidden">
=======
      <Card className="border border-border/40 shadow-sm overflow-hidden">
>>>>>>> 925ef42 (Initial commit)
        <CardContent className="p-4 space-y-3 bg-gradient-to-br from-primary/8 via-background to-muted/60">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{info.title} Widgets</p>
<<<<<<< HEAD
              <p className="text-[10px] text-muted-foreground">Mobile home suggestions for {studentClass}</p>
            </div>
            <Button size="sm" variant="outline" className="h-8 rounded-xl text-[10px]" onClick={onOpenTemplates}>
=======
              <p className="text-xs text-muted-foreground">Mobile home suggestions for {studentClass}</p>
            </div>
            <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs" onClick={onOpenTemplates}>
>>>>>>> 925ef42 (Initial commit)
              <Package className="h-3 w-3 mr-1" />
              Templates
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {widgets.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-xl bg-background/75 border border-border/40 p-2.5">
                <Icon className="h-4 w-4 text-primary mb-1.5" />
<<<<<<< HEAD
                <p className="text-[9px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</p>
                <p className="text-[10px] font-semibold leading-snug mt-0.5">{value}</p>
=======
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{label}</p>
                <p className="text-xs font-semibold leading-snug mt-0.5">{value}</p>
>>>>>>> 925ef42 (Initial commit)
              </div>
            ))}
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar">
            {info.suggestions.map(item => (
<<<<<<< HEAD
              <span key={item.text} className="shrink-0 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-[10px] font-semibold">
                {item.text}
=======
<<<<<<< HEAD
              <span key={item.text} className="shrink-0 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-semibold">
                {item.emoji} {item.text}
=======
              <span key={item.text} className="shrink-0 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-[10px] font-semibold">
                {item.text}
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function HomeMoodInsight() {
  const [data, setData] = useState<{ yesterdayMood: number | null; highMoodRate: number; lowMoodRate: number; hasEnoughData: boolean }>({
    yesterdayMood: null, highMoodRate: 0, lowMoodRate: 0, hasEnoughData: false,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [moodRes, habitsRes] = await Promise.all([
          fetch('/api/mood?days=30'),
          fetch('/api/habits'),
        ]);
        if (!moodRes.ok || !habitsRes.ok) return;
        const moods: { date: string; mood: number }[] = await moodRes.json();
        const habitsData: { habits: { logs: { date: string; status: string }[] }[] } = await habitsRes.json();
        if (moods.length < 7) return;

        const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
        const yesterdayMoodLog = moods.find(m => m.date === yesterday);

        const allHabits = habitsData.habits || [];
        const allLogDates = new Set(
          allHabits.flatMap(h => (h.logs || []).filter(l => l.status === 'completed').map(l => l.date))
        );

        let highTotal = 0; let highDone = 0;
        let lowTotal = 0; let lowDone = 0;
        moods.slice(0, 30).forEach(m => {
          const done = allLogDates.has(m.date) ? 1 : 0;
          if (m.mood >= 4) { highTotal++; highDone += done; }
          else { lowTotal++; lowDone += done; }
        });

        setData({
          yesterdayMood: yesterdayMoodLog?.mood ?? null,
          highMoodRate: highTotal > 0 ? Math.round((highDone / highTotal) * 100) : 0,
          lowMoodRate: lowTotal > 0 ? Math.round((lowDone / lowTotal) * 100) : 0,
          hasEnoughData: moods.length >= 7 && highTotal > 0 && lowTotal > 0,
        });
      } catch { /* ignore */ }
    };
    load();
  }, []);

  if (!data.hasEnoughData) return null;

  const moodEmojis = ['', '😞', '😕', '😐', '🙂', '😄'];
  const diff = data.highMoodRate - data.lowMoodRate;
  const yesterdayLow = data.yesterdayMood !== null && data.yesterdayMood <= 2;
  if (diff < 10 && !yesterdayLow) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
<<<<<<< HEAD
      <Card className="border-0 shadow-sm bg-gradient-to-r from-violet-50/80 to-pink-50/80 dark:from-violet-500/8 dark:to-pink-500/8">
=======
      <Card className="border border-violet-200/40 dark:border-violet-800/20 shadow-sm bg-gradient-to-r from-violet-50/80 to-pink-50/80 dark:from-violet-500/8 dark:to-pink-500/8">
>>>>>>> 925ef42 (Initial commit)
        <CardContent className="p-3.5 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center flex-shrink-0 text-base mt-0.5">
            {data.yesterdayMood !== null ? moodEmojis[data.yesterdayMood] : '📊'}
          </div>
          <div className="flex-1 min-w-0">
<<<<<<< HEAD
            <p className="text-[11px] font-bold text-foreground">Mood × Habit Insight</p>
            {diff >= 10 && (
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
=======
            <p className="text-xs font-bold text-foreground">Mood × Habit Insight</p>
            {diff >= 10 && (
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
>>>>>>> 925ef42 (Initial commit)
                You complete <span className="font-semibold text-violet-600 dark:text-violet-400">{diff}% more habits</span> on high-mood days.
              </p>
            )}
            {yesterdayLow && (
<<<<<<< HEAD
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
=======
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
>>>>>>> 925ef42 (Initial commit)
                Yesterday felt tough {moodEmojis[data.yesterdayMood!]} — consider setting a lighter goal today.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

type StudyMode = 'pw' | 'normal';

export function HomeDashboard({
  examDate = '',
  studentClass = '',
  studyMode = 'pw',
}: {
  examDate?: string;
  studentClass?: string;
  studyMode?: StudyMode;
}) {
  const { habits, isLoading, stats, setAddHabitOpen, setEditingHabit, toggleHabit, deleteHabit, pauseHabit } = useHabitStore();
  const { todos, classes, fetchTodos, fetchClasses } = usePWStore();
  const [isRestDay, setIsRestDay] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [streakFreezeUsed, setStreakFreezeUsed] = useState(false);
  const [streakFreezeLoading, setStreakFreezeLoading] = useState(false);
  const [examGoal, setExamGoal] = useState('');
  const [showInsights, setShowInsights] = useState(false);
  const [mantra, setMantra] = useState('');
  const [vacationMode, setVacationMode] = useState(false);
  const [vacationEnd, setVacationEnd] = useState('');

  // Milestone celebration state
  const [celebration, setCelebration] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const prevCompletedRef = useRef(0);
  const prevStreakRef = useRef(0);

  // Motivational quote — changes every day, consistent throughout the day
  const quoteIndex = useMemo(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
    return dayOfYear % MOTIVATIONAL_QUOTES.length;
  }, []);

  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  const examCountdown = useMemo(() => {
    if (!examDate) return null;
    const target = new Date(`${examDate}T00:00:00`);
    if (Number.isNaN(target.getTime())) return null;
    return Math.max(0, differenceInCalendarDays(target, new Date()));
  }, [examDate]);

  // Daily study target based on countdown
  const dailyStudyTarget = useMemo(() => {
    if (examCountdown === null || examCountdown === 0) return null;
    if (examCountdown > 365) return '4 hrs/day';
    if (examCountdown > 180) return '5 hrs/day';
    if (examCountdown > 90) return '6 hrs/day';
    if (examCountdown > 30) return '8 hrs/day';
    if (examCountdown > 7) return '10 hrs/day';
    return '12 hrs/day';
  }, [examCountdown]);

  // Load streak freeze status
  useEffect(() => {
    const checkFreezeStatus = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const profile = await res.json();
          const freezeDate = profile.streakFreezeDate || '';
          const usedToday = freezeDate === today;
          setStreakFreezeUsed(profile.streakFreezeUsed && usedToday);
          if (profile.examGoal) setExamGoal(profile.examGoal);
          if (profile.mantra) setMantra(profile.mantra);
          if (profile.vacationMode) setVacationMode(profile.vacationMode);
          if (profile.vacationEnd) setVacationEnd(profile.vacationEnd);
        }
      } catch { /* ignore */ }
    };
    checkFreezeStatus();
  }, [today]);

  useEffect(() => {
    if (studyMode === 'pw') {
      fetchTodos();
      fetchClasses(today);
    }
  }, [fetchTodos, fetchClasses, today, studyMode]);

  const activeHabits = useMemo(() => habits.filter((h) => !h.isArchived && !h.isPaused), [habits]);
  const pausedHabits = useMemo(() => habits.filter((h) => !h.isArchived && h.isPaused), [habits]);

  // Drag-to-reorder
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    setOrderedIds(activeHabits.map(h => h.id));
  }, [activeHabits]);

  const orderedHabits = useMemo(
    () => orderedIds.map(id => activeHabits.find(h => h.id === id)).filter(Boolean) as Habit[],
    [orderedIds, activeHabits],
  );

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOrderedIds(prev => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        const newOrder = arrayMove(prev, oldIndex, newIndex);
        // Persist order to DB
        fetch('/api/habits', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reorder: newOrder }),
        }).catch(() => {});
        return newOrder;
      });
    }
  }, []);

  const isHabitDone = useCallback(
    (habitId: string, serverLogs: Habit['logs']) => {
      void habitId;
      return serverLogs?.some((l) => l.date === today && l.status === 'completed') ?? false;
    },
    [today],
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return;
    const checkReminders = () => {
      const now = new Date();
      const currentTime = format(now, 'HH:mm');
      const currentDate = format(now, 'yyyy-MM-dd');
      activeHabits.forEach((habit) => {
        if (!habit.reminderTime || habit.reminderTime !== currentTime) return;
        if (habit.logs?.some((log) => log.date === currentDate && log.status === 'completed')) return;
        const key = `habitflow-reminder-${habit.id}-${currentDate}-${currentTime}`;
        if (localStorage.getItem(key)) return;
        new Notification('Nuviora reminder', { body: `${habit.icon} ${habit.name} is waiting for you.` });
        localStorage.setItem(key, 'sent');
      });
    };
    checkReminders();
    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [activeHabits]);

  const completedToday = useMemo(
    () => activeHabits.filter((h) => isHabitDone(h.id, h.logs)).length,
    [activeHabits, isHabitDone],
  );

  const progressPercent = activeHabits.length ? Math.round((completedToday / activeHabits.length) * 100) : 0;
  const pendingTodos = useMemo(() => todos.filter((t) => !t.completed).length, [todos]);
  const todayClasses = useMemo(() => classes.length, [classes]);

  useEffect(() => {
    if (stats) {
      const streak = stats.currentStreak;
      const prev = prevStreakRef.current;
      if (streak !== prev) {
        if (streak === 7 && prev < 7) setCelebration({ show: true, message: '7-Day Streak — Week Warrior!' });
        else if (streak === 30 && prev < 30) setCelebration({ show: true, message: '30-Day Streak — Monthly Master!' });
        else if (streak === 100 && prev < 100) setCelebration({ show: true, message: '100-Day Streak — Century Club!' });
        prevStreakRef.current = streak;
      }
    }
  }, [stats]);

  useEffect(() => {
    const prev = prevCompletedRef.current;
    if (completedToday === activeHabits.length && activeHabits.length > 0 && prev < activeHabits.length) {
      setCelebration({ show: true, message: 'Perfect Day — All habits done!' });
    }
    prevCompletedRef.current = completedToday;
  }, [completedToday, activeHabits.length]);

  const handleToggle = useCallback(
    (habitId: string) => {
      toggleHabit(habitId, today);
    },
    [toggleHabit, today],
  );

  const handleStreakFreeze = async () => {
    if (streakFreezeUsed || streakFreezeLoading) return;
    setStreakFreezeLoading(true);
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streakFreezeUsed: true, streakFreezeDate: today }),
      });
      setStreakFreezeUsed(true);
      setCelebration({ show: true, message: 'Streak protected for today!' });
    } catch { /* ignore */ }
    setStreakFreezeLoading(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <Skeleton className="h-44 w-full rounded-3xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
        <div className="flex items-center justify-between px-1">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-3 w-16 rounded-full" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 bg-card rounded-xl p-3.5 border border-border/30">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-9 w-9 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-3/4 rounded-full" />
              <Skeleton className="h-2.5 w-1/2 rounded-full" />
            </div>
            <div className="flex gap-1">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-7 w-7 rounded-lg" />
            </div>
          </div>
        ))}
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (habits.length === 0) {
    const quote = MOTIVATIONAL_QUOTES[quoteIndex];
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-5"
        >
          <Sparkles className="h-10 w-10 text-primary" />
        </motion.div>
        <h2 className="text-xl font-bold text-foreground mb-2">Start Your Journey</h2>
        <p className="text-sm text-muted-foreground mb-3 max-w-[260px] leading-relaxed">
          Build better habits, one day at a time. Tap the + button to add your first habit!
        </p>
        <blockquote className="text-xs text-muted-foreground/70 italic mb-8 max-w-[240px] border-l-2 border-primary/30 pl-3 text-left">
          &ldquo;{quote.text}&rdquo;
          <br />
          <span className="not-italic text-muted-foreground/50">— {quote.author}</span>
        </blockquote>
        <div className="w-full max-w-xs mb-4">
          <StreamMobileWidgets studentClass={studentClass} onOpenTemplates={() => setShowTemplates(true)} />
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button onClick={() => setAddHabitOpen(true)} className="rounded-full px-8 h-12 text-sm font-semibold shadow-lg shadow-primary/25">
            <Sparkles className="h-4 w-4 mr-2" />
            Create First Habit
          </Button>
          <Button variant="outline" className="rounded-full px-8 h-12 text-sm font-semibold" onClick={() => setShowTemplates(true)}>
            <Package className="h-4 w-4 mr-2" />
            Use a Template Pack
          </Button>
        </div>
        <HabitTemplatesDialog open={showTemplates} onOpenChange={setShowTemplates} studentClass={studentClass} />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-4">
      <ConfettiCelebration show={celebration.show} message={celebration.message} onComplete={() => setCelebration({ show: false, message: '' })} />

      {/* ── HERO CARD ────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="relative rounded-3xl overflow-hidden border border-primary/10 p-5 shadow-elevated" style={{ background: 'var(--card)' }}>
          {/* Premium mesh background */}
          <div className="absolute inset-0 hero-mesh pointer-events-none" />
          {/* Subtle top sheen */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent pointer-events-none" />

          {/* Date + status + progress ring */}
          <div className="flex items-start justify-between relative">
            <div className="flex-1 min-w-0 pr-3">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground/60">
                {format(new Date(), 'EEEE, MMMM d')}
              </p>
              <p className="text-base font-bold mt-1.5 text-foreground leading-snug">
                {completedToday === activeHabits.length && activeHabits.length > 0
                  ? '✨ All habits complete — great day!'
                  : `${activeHabits.length - completedToday} habit${activeHabits.length - completedToday !== 1 ? 's' : ''} left to go`}
              </p>
<<<<<<< HEAD
              <p className="text-[11px] text-muted-foreground/70 mt-1 font-medium leading-snug">
=======
              <p className="text-xs text-muted-foreground/70 mt-1 font-medium leading-snug">
>>>>>>> 925ef42 (Initial commit)
                &ldquo;{MOTIVATIONAL_QUOTES[quoteIndex].text}&rdquo;
              </p>
            </div>

            {/* Progress ring */}
            <div className="relative w-[64px] h-[64px] flex-shrink-0">
              <svg className="w-[64px] h-[64px] -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" className="stroke-muted/50" strokeWidth="4.5" />
                <motion.circle
                  cx="32" cy="32" r="26" fill="none" className="stroke-primary"
                  strokeWidth="4.5" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - progressPercent / 100) }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {progressPercent === 100 ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </motion.div>
                ) : (
                  <>
<<<<<<< HEAD
                    <span className="text-[14px] font-black text-primary leading-none">{progressPercent}%</span>
                    <span className="text-[9px] text-muted-foreground leading-none mt-0.5 font-medium">{completedToday}/{activeHabits.length}</span>
=======
                    <span className="text-sm font-black text-primary leading-none">{progressPercent}%</span>
                    <span className="text-xs text-muted-foreground leading-none mt-0.5 font-medium">{completedToday}/{activeHabits.length}</span>
>>>>>>> 925ef42 (Initial commit)
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-1.5 rounded-full bg-muted/40 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-chart-2"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
            />
          </div>

          {/* Chips row: streak + level + xp + exam */}
          <div className="flex flex-wrap gap-1.5 mt-3.5">
            {stats && stats.currentStreak > 0 && (
              <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/15 rounded-full px-2.5 py-1">
<<<<<<< HEAD
                <Flame className="h-3 w-3 text-amber-500" />
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">{stats.currentStreak}d streak</span>
=======
<<<<<<< HEAD
                <span className="text-xs">🔥</span>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{stats.currentStreak}d streak</span>
=======
                <Flame className="h-3 w-3 text-amber-500" />
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">{stats.currentStreak}d streak</span>
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
                <button
                  onClick={handleStreakFreeze}
                  disabled={streakFreezeUsed || streakFreezeLoading}
                  title={streakFreezeUsed ? 'Streak freeze used today' : 'Protect streak'}
                  className={`ml-0.5 transition-opacity ${streakFreezeUsed ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-70 cursor-pointer'}`}
                >
                  <ShieldCheck className="h-2.5 w-2.5 text-sky-500" />
                </button>
              </div>
            )}
            {stats && (
              <div className="flex items-center gap-1 bg-primary/8 border border-primary/12 rounded-full px-2.5 py-1">
<<<<<<< HEAD
                <Zap className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-bold text-primary">Lv {stats.level} · {stats.xp} XP</span>
=======
<<<<<<< HEAD
                <span className="text-xs">⚡</span>
                <span className="text-xs font-bold text-primary">Lv {stats.level} · {stats.xp} XP</span>
=======
                <Zap className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-bold text-primary">Lv {stats.level} · {stats.xp} XP</span>
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
              </div>
            )}
            {examCountdown !== null && examCountdown >= 0 && (() => {
              const urgent = examCountdown <= 30;
              const warning = examCountdown <= 60;
              const bgClass = examCountdown === 0
                ? 'bg-rose-500 border-rose-500'
                : urgent ? 'bg-rose-100 dark:bg-rose-500/15 border-rose-200 dark:border-rose-500/20'
                : warning ? 'bg-amber-100 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/15'
                : 'bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/15';
              const textClass = examCountdown === 0 ? 'text-white'
                : urgent ? 'text-rose-700 dark:text-rose-400'
                : warning ? 'text-amber-700 dark:text-amber-400'
                : 'text-emerald-700 dark:text-emerald-400';
              const ExamIcon = examCountdown === 0 ? Target : urgent ? AlertCircle : CalendarDays;
              return (
                <motion.div
                  className={`flex items-center gap-1 ${bgClass} border rounded-full px-2.5 py-1`}
                  animate={urgent ? { scale: [1, 1.04, 1] } : {}}
                  transition={urgent ? { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } : {}}
                >
<<<<<<< HEAD
                  <ExamIcon className={`h-3 w-3 ${textClass}`} />
                  <span className={`text-[10px] font-bold ${textClass}`}>
=======
<<<<<<< HEAD
                  <span className="text-xs">{icon}</span>
                  <span className={`text-xs font-bold ${textClass}`}>
=======
                  <ExamIcon className={`h-3 w-3 ${textClass}`} />
                  <span className={`text-[10px] font-bold ${textClass}`}>
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
                    {examCountdown === 0 ? 'Exam today!' : `${examCountdown}d to ${examGoal || 'exam'}`}
                  </span>
                </motion.div>
              );
            })()}
          </div>
        </div>
      </motion.div>

      {/* ── MANTRA BANNER ───────────────────────────────────── */}
      <MantraBanner mantra={mantra} />

      {/* ── VACATION MODE BANNER ────────────────────────────── */}
      {vacationMode && <VacationModeBanner vacationEnd={vacationEnd} />}

      {/* ── MONDAY WEEKLY DEBRIEF ───────────────────────────── */}
      <WeeklyDebriefCard />

      {/* ── PW QUICK STATS (if PW mode) ─────────────────────── */}
      {studyMode === 'pw' && (
        <div className="grid grid-cols-2 gap-3">
<<<<<<< HEAD
          <Card className="border-0 shadow-sm">
=======
          <Card className="border border-border/40 shadow-sm">
>>>>>>> 925ef42 (Initial commit)
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ListTodo className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-primary leading-none">{pendingTodos}</p>
<<<<<<< HEAD
                <p className="text-[10px] text-muted-foreground mt-0.5">Pending tasks</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
=======
                <p className="text-xs text-muted-foreground mt-0.5">Pending tasks</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border/40 shadow-sm">
>>>>>>> 925ef42 (Initial commit)
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-4 w-4 text-chart-2" />
              </div>
              <div>
                <p className="text-xl font-bold text-chart-2 leading-none">{todayClasses}</p>
<<<<<<< HEAD
                <p className="text-[10px] text-muted-foreground mt-0.5">Today&apos;s classes</p>
=======
                <p className="text-xs text-muted-foreground mt-0.5">Today&apos;s classes</p>
>>>>>>> 925ef42 (Initial commit)
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── WEEKLY TIMETABLE PREVIEW ──────────────────────────── */}
      <NextTwoHoursTimetablePreview />

      {/* ── MOOD × HABIT INSIGHT ──────────────────────────────── */}
      <HomeMoodInsight />

      {/* ── TODAY'S HABITS ────────────────────────────────────── */}
      {!isRestDay && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <div className="flex items-center justify-between mb-3 px-0.5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-primary" />
              <h3 className="text-xs font-bold text-foreground/70 uppercase tracking-[0.08em]">
                Today&apos;s Habits
              </h3>
            </div>
<<<<<<< HEAD
            <button onClick={() => setShowTemplates(true)} className="text-[11px] text-primary/70 hover:text-primary flex items-center gap-1 transition-colors font-semibold">
=======
            <button onClick={() => setShowTemplates(true)} className="text-xs text-primary/70 hover:text-primary flex items-center gap-1 transition-colors font-semibold">
>>>>>>> 925ef42 (Initial commit)
              <Package className="h-3 w-3" /> Templates
            </button>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {orderedHabits.map((habit, index) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    today={today}
                    index={index}
                    isCompleted={isHabitDone(habit.id, habit.logs)}
                    onToggle={() => handleToggle(habit.id)}
                    onEdit={() => setEditingHabit(habit)}
                    onDelete={() => deleteHabit(habit.id)}
                    onPause={() => pauseHabit(habit.id, true)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Paused habits */}
          {pausedHabits.length > 0 && (
            <div className="mt-4">
<<<<<<< HEAD
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
=======
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
>>>>>>> 925ef42 (Initial commit)
                ⏸ Paused ({pausedHabits.length})
              </p>
              <div className="space-y-1.5 opacity-60">
                {pausedHabits.map((habit) => (
                  <div key={habit.id} className="flex items-center gap-2 bg-muted/40 rounded-xl px-3 py-2">
                    <span className="text-sm">{habit.icon}</span>
                    <p className="flex-1 text-xs text-muted-foreground line-through">{habit.name}</p>
                    <button
                      onClick={() => pauseHabit(habit.id, false)}
<<<<<<< HEAD
                      className="flex items-center gap-1 text-[10px] text-primary font-semibold hover:underline"
=======
                      className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
>>>>>>> 925ef42 (Initial commit)
                    >
                      <PlayCircle className="h-3.5 w-3.5" /> Resume
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── REST DAY CARD ─────────────────────────────────────── */}
      <AnimatePresence>
        {isRestDay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <div className="rounded-2xl bg-gradient-to-br from-secondary to-accent p-8 flex flex-col items-center text-center gap-3 border border-border/50">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                <Coffee className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-base font-semibold">Rest Day Mode</h3>
              <p className="text-sm text-muted-foreground max-w-[260px] leading-relaxed">
                Take it easy! Your habits are paused and streaks won&apos;t be affected.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TRACKING WIDGETS ──────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <div className="flex items-center justify-between px-0.5 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-primary" />
            <h3 className="text-xs font-bold text-foreground/70 uppercase tracking-[0.08em]">Quick Widgets</h3>
          </div>
<<<<<<< HEAD
          <span className="text-[11px] text-muted-foreground/60 font-medium">Track your day</span>
=======
          <span className="text-xs text-muted-foreground/60 font-medium">Track your day</span>
>>>>>>> 925ef42 (Initial commit)
        </div>
        <div className="space-y-3">
          <DailyStudyGoalWidget />
          <WaterTracker />
          <MoodTracker />
        </div>
      </motion.div>

      {/* ── ACTIONS ───────────────────────────────────────────── */}
      <div className="space-y-3">
        <QuickFocusWidget />
        <DailyMissionWidget />
        <BossChallengeWidget />
      </div>

      {/* ── INSIGHTS & PLANNING (collapsible) ─────────────────── */}
      <div>
        <button
          onClick={() => setShowInsights(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-card border border-border/50 hover:bg-muted/40 hover:border-border/70 transition-all duration-200 shadow-card group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="text-left">
              <span className="text-sm font-semibold text-foreground">Insights &amp; Planning</span>
<<<<<<< HEAD
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{showInsights ? 'Tap to collapse' : 'Tap to expand'}</p>
=======
              <p className="text-xs text-muted-foreground font-medium mt-0.5">{showInsights ? 'Tap to collapse' : 'Tap to expand'}</p>
>>>>>>> 925ef42 (Initial commit)
            </div>
          </div>
          <motion.div animate={{ rotate: showInsights ? 180 : 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }}>
            <ChevronDown className="h-4 w-4 text-muted-foreground/70" />
          </motion.div>
        </button>

        <AnimatePresence>
          {showInsights && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="space-y-3 pt-3">
                <SmartDailyStudyPlanner today={today} studentClass={studentClass} />
                <ExamRoadmapWidget examCountdown={examCountdown} />
                <WeakSubjectDetector studentClass={studentClass} />
                {studyMode === 'pw' && <StreamMobileWidgets studentClass={studentClass} onOpenTemplates={() => setShowTemplates(true)} />}
                <WeeklyPerformanceWidget habits={activeHabits} today={today} />
                <BurnoutDetector habits={activeHabits} today={today} />
                <ScreenTimeWidget />
                <MiniCalendarStrip habits={activeHabits} today={today} />
                <ProductivityScoreWidget habits={activeHabits} today={today} />
                <TodayIntentionWidget today={today} />
                <StatsWidgetCard today={today} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── FOOTER ROW ────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border/40 bg-card shadow-card">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center border border-border/30">
              <Coffee className="h-4 w-4 text-muted-foreground/70" />
            </div>
            <div>
<<<<<<< HEAD
              <p className="text-[13px] font-semibold text-foreground/90">Rest Day</p>
              <p className="text-[10px] text-muted-foreground/70 font-medium mt-0.5">
=======
              <p className="text-sm font-semibold text-foreground/90">Rest Day</p>
              <p className="text-xs text-muted-foreground/70 font-medium mt-0.5">
>>>>>>> 925ef42 (Initial commit)
                {isRestDay ? "Taking a break today" : 'Pause your habits'}
              </p>
            </div>
          </div>
          <Switch checked={isRestDay} onCheckedChange={setIsRestDay} />
        </div>
      </div>

      <HabitTemplatesDialog open={showTemplates} onOpenChange={setShowTemplates} studentClass={studentClass} />
    </div>
  );
}

// ── Habit card ──────────────────────────────────────────────────────
function calcHabitStreak(logs: { date: string; status: string }[], today: string): number {
  const completedDates = new Set(logs.filter(l => l.status === 'completed').map(l => l.date));
  let streak = 0;
  const dt = new Date(today + 'T00:00:00');
  while (true) {
    const ds = format(dt, 'yyyy-MM-dd');
    if (!completedDates.has(ds)) break;
    streak++;
    dt.setDate(dt.getDate() - 1);
  }
  return streak;
}

function FlameIndicator({ streak }: { streak: number }) {
  if (streak < 3) return null;
  const isInferno = streak >= 30;
  const isBig = streak >= 7;
  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      title={`${streak}-day streak!`}
      className="flex-shrink-0 flex items-center gap-0.5 select-none"
    >
      {isInferno ? (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          <Flame className="h-4 w-4 text-orange-600" />
        </motion.div>
      ) : isBig ? (
        <div className="flex">
          <Flame className="h-3.5 w-3.5 text-orange-500" />
          <Flame className="h-3.5 w-3.5 text-orange-500 -ml-1" />
        </div>
      ) : (
        <Flame className="h-3 w-3 text-orange-400 opacity-80" />
      )}
<<<<<<< HEAD
      <span className={`font-black leading-none ${isInferno ? 'text-[10px] text-orange-600 dark:text-orange-400' : isBig ? 'text-[9px] text-orange-500' : 'text-[9px] text-orange-400'}`}>
=======
      <span className={`font-black leading-none ${isInferno ? 'text-xs text-orange-600 dark:text-orange-400' : isBig ? 'text-xs text-orange-500' : 'text-xs text-orange-400'}`}>
>>>>>>> 925ef42 (Initial commit)
        {streak}
      </span>
    </motion.span>
  );
}

function calcHabitDifficulty(logs: { date: string; status: string }[], createdAt: string | Date, today: string): 'Easy' | 'Medium' | 'Hard' | null {
  const created = new Date(createdAt);
  const todayDate = new Date(today + 'T00:00:00');
  const daysSinceCreate = Math.floor((todayDate.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceCreate < 21) return null;
  const window21Days: string[] = [];
  for (let i = 0; i < 21; i++) {
    const d = new Date(todayDate);
    d.setDate(d.getDate() - i);
    window21Days.push(format(d, 'yyyy-MM-dd'));
  }
  const completedSet = new Set(logs.filter(l => l.status === 'completed').map(l => l.date));
  const completed = window21Days.filter(d => completedSet.has(d)).length;
  const rate = completed / 21;
  if (rate >= 0.8) return 'Easy';
  if (rate >= 0.5) return 'Medium';
  return 'Hard';
}

const DIFFICULTY_STYLE = {
  Easy:   { bg: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400', dot: '🟢' },
  Medium: { bg: 'bg-amber-500/12 text-amber-700 dark:text-amber-400',   dot: '🟡' },
  Hard:   { bg: 'bg-rose-500/12 text-rose-700 dark:text-rose-400',     dot: '🔴' },
};

function HabitCard({
  habit, today, index, isCompleted, onToggle, onEdit, onDelete, onPause,
}: {
  habit: Habit; today: string; index: number; isCompleted: boolean;
  onToggle: () => void; onEdit: () => void; onDelete: () => void; onPause: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: habit.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const category = (habit as { category?: { name: string; color: string; emoji: string } }).category;
  const deadline = (habit as { deadline?: string }).deadline;
  const streak = calcHabitStreak(habit.logs, today);
  const difficulty = calcHabitDifficulty(habit.logs, (habit as { createdAt: string | Date }).createdAt, today);

  return (
    <div ref={setNodeRef} style={style}>
      <div className={`
        relative rounded-2xl border transition-all duration-300 overflow-hidden
        ${isCompleted
          ? 'bg-primary/4 border-primary/15 shadow-card'
          : 'bg-card border-border/50 shadow-card hover:shadow-card-hover hover:-translate-y-px'}
        ${isDragging ? 'shadow-elevated ring-2 ring-primary/20 scale-[1.02]' : ''}
      `}>
        {/* Completed shimmer overlay */}
        {isCompleted && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/3 to-transparent pointer-events-none" />
        )}

        <div className="flex items-center gap-2 p-3.5">
          {/* Drag handle */}
          <button {...attributes} {...listeners} className="touch-none p-1 text-muted-foreground/25 hover:text-muted-foreground/60 cursor-grab active:cursor-grabbing transition-colors flex-shrink-0">
            <GripVertical className="h-3.5 w-3.5" />
          </button>

          {/* Completion toggle */}
          <motion.button
            key={isCompleted ? 'done' : 'pending'}
            initial={isCompleted ? { scale: 0.5 } : { scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 600, damping: 25 }}
            whileTap={{ scale: 0.78 }}
            onClick={onToggle}
            className={`relative w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
              isCompleted
                ? 'bg-primary shadow-sm shadow-primary/30'
                : 'border-2 border-dashed border-muted-foreground/25 hover:border-primary/60 bg-transparent hover:bg-primary/4'
            }`}
          >
            {isCompleted && (
              <motion.div
                initial={{ scale: 2.5, opacity: 0.6 }}
                animate={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 rounded-xl bg-primary pointer-events-none"
              />
            )}
            {isCompleted ? (
              <Check className="h-3.5 w-3.5 text-primary-foreground relative z-10" strokeWidth={3} />
            ) : (
              <div className="w-2.5 h-2.5 rounded-sm opacity-35" style={{ backgroundColor: habit.color }} />
            )}
          </motion.button>

          {/* Habit info */}
          <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggle}>
            <div className="flex items-center gap-1.5">
<<<<<<< HEAD
              <p className={`font-semibold text-[13px] transition-all duration-300 flex-1 min-w-0 leading-snug ${isCompleted ? 'line-through text-muted-foreground/60' : 'text-foreground'}`}>
=======
              <p className={`font-semibold text-sm transition-all duration-300 flex-1 min-w-0 leading-snug ${isCompleted ? 'line-through text-muted-foreground/60' : 'text-foreground'}`}>
>>>>>>> 925ef42 (Initial commit)
                <span className="mr-1.5 not-italic">{habit.icon}</span>
                {habit.name}
              </p>
              <FlameIndicator streak={streak} />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
<<<<<<< HEAD
              <p className="text-[10px] text-muted-foreground/70 font-medium">
                {habit.type === 'daily' ? 'Daily' : habit.type === 'weekly' ? 'Weekly' : `${habit.targetValue} ${habit.unit || ''}`}
              </p>
              {category && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold border" style={{ backgroundColor: category.color + '18', color: category.color, borderColor: category.color + '30' }}>
=======
              <p className="text-xs text-muted-foreground/70 font-medium">
                {habit.type === 'daily' ? 'Daily' : habit.type === 'weekly' ? 'Weekly' : `${habit.targetValue} ${habit.unit || ''}`}
              </p>
              {category && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold border" style={{ backgroundColor: category.color + '18', color: category.color, borderColor: category.color + '30' }}>
>>>>>>> 925ef42 (Initial commit)
                  {category.emoji} {category.name}
                </span>
              )}
              {deadline && !isCompleted && (
<<<<<<< HEAD
=======
<<<<<<< HEAD
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">📅 {deadline}</span>
              )}
              {difficulty && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${DIFFICULTY_STYLE[difficulty].bg}`}>
                  {difficulty === 'Easy' ? '🟢' : difficulty === 'Medium' ? '🟡' : '🔴'} {difficulty}
=======
>>>>>>> 925ef42 (Initial commit)
                <span className="text-[9px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-0.5"><CalendarDays className="h-2.5 w-2.5" /> {deadline}</span>
              )}
              {difficulty && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${DIFFICULTY_STYLE[difficulty].bg}`}>
                  {difficulty}
<<<<<<< HEAD
=======
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
                </span>
              )}
            </div>
          </div>

<<<<<<< HEAD
          {/* Action buttons — more refined reveal */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150"
            style={{ opacity: undefined }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '')}
            onFocus={(e) => (e.currentTarget.style.opacity = '1')}
            onBlur={(e) => (e.currentTarget.style.opacity = '')}
          >
=======
          {/* Action buttons — always visible at low opacity, full opacity on hover/touch */}
          <div className="flex items-center gap-0.5 opacity-40 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
>>>>>>> 925ef42 (Initial commit)
            <button
              onClick={(e) => { e.stopPropagation(); onPause(); }}
              title="Pause habit"
              className="w-7 h-7 rounded-xl flex items-center justify-center text-muted-foreground/50 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all"
            >
              <PauseCircle className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="w-7 h-7 rounded-xl flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-muted/70 transition-all"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-destructive/8 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Habit</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete &quot;{habit.name}&quot;? This will also remove all tracking data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="rounded-xl bg-destructive text-white hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
