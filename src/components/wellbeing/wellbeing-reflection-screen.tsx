'use client';

import { useEffect, useMemo, useState } from 'react';
import { addDays, differenceInCalendarDays, format, getDaysInMonth, startOfMonth, startOfWeek } from 'date-fns';
import { motion } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BookHeart, CalendarDays, ChevronDown, ChevronUp, HeartPulse, Moon, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ReflectionLog {
  id: string;
  date: string;
  prompt: string;
  response: string;
}

interface StressCheckIn {
  id: string;
  weekStart: string;
  academicPressure: number;
  sleepQuality: number;
  socialTime: number;
  notes: string;
}

interface PeriodLog {
  id: string;
  startDate: string;
  endDate: string;
  flow: string;
  symptoms: string;
  notes: string;
}

const REFLECTION_PROMPTS = [
  'What was the hardest thing you studied today?',
  'What are you proud of?',
  'What felt easier today than it used to?',
  'What is one thing you want tomorrow-you to remember?',
  'Where did you show discipline today?',
  'What do you need to forgive yourself for today?',
  'What topic deserves one more honest attempt tomorrow?',
];

const ROADMAP_MILESTONES = [
  { days: 90, label: 'Complete syllabus pass', text: 'Finish the first full pass and close major backlog.' },
  { days: 60, label: 'First revision', text: 'Start structured revision and revisit weak chapters.' },
  { days: 30, label: 'Mock tests only', text: 'Prioritise mocks, analysis, mistakes, and PYQs.' },
  { days: 10, label: 'Light revision + sleep', text: 'Protect sleep, revise formulas, and keep confidence steady.' },
];

function promptForDate(date: Date) {
  const yearStart = new Date(date.getFullYear(), 0, 0);
  const day = Math.floor((date.getTime() - yearStart.getTime()) / 86400000);
  return REFLECTION_PROMPTS[day % REFLECTION_PROMPTS.length];
}

function SliderRow({
  label,
  helper,
  value,
  onChange,
}: {
  label: string;
  helper: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-background/70 p-3">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div>
          <p className="text-xs font-semibold">{label}</p>
          <p className="text-xs text-muted-foreground">{helper}</p>
        </div>
        <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={5}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span>5</span>
      </div>
    </div>
  );
}

function localDate(date: string) {
  return new Date(`${date}T12:00:00`);
}

function keyForDate(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

function parseSymptoms(symptoms: string) {
  try {
    return JSON.parse(symptoms || '[]') as string[];
  } catch {
    return [];
  }
}

function estimatedCycleLength(logs: PeriodLog[], fallback: number, age: string) {
  const sorted = [...logs].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const gaps = sorted
    .slice(1)
    .map((log, index) => differenceInCalendarDays(localDate(log.startDate), localDate(sorted[index].startDate)))
    .filter(days => days >= 21 && days <= 45);

  if (gaps.length > 0) return Math.round(gaps.reduce((sum, days) => sum + days, 0) / gaps.length);

  const ageValue = Number(age);
  if (Number.isFinite(ageValue) && ageValue < 18) return Math.max(28, fallback || 30);
  if (Number.isFinite(ageValue) && ageValue >= 40) return Math.max(24, Math.min(fallback || 27, 30));
  return fallback || 28;
}

function phaseForDay(day: Date, periodStarts: string[], cycleLength: number) {
  const key = keyForDate(day);

  for (const start of periodStarts) {
    const startDate = localDate(start);
    const diff = differenceInCalendarDays(day, startDate);
    if (diff >= 0 && diff <= 5) return 'period';
    const ovulationStart = cycleLength - 17;
    const ovulationEnd = cycleLength - 12;
    if (diff >= ovulationStart && diff <= ovulationEnd) return 'ovulation';
  }

  return key ? 'safe' : 'safe';
}

function ExamMilestoneRoadmap({ examDate }: { examDate: string }) {
  const countdown = useMemo(() => {
    if (!examDate) return null;
    return differenceInCalendarDays(new Date(`${examDate}T12:00:00`), new Date());
  }, [examDate]);

  if (!examDate || countdown === null) {
    return (
      <Card className="border border-border/40 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-semibold">Exam Milestone Roadmap</p>
          </div>
          <p className="text-xs text-muted-foreground">Add your exam date in settings to generate your countdown timeline.</p>
        </CardContent>
      </Card>
    );
  }

  const currentMilestone = ROADMAP_MILESTONES.find(m => countdown > m.days) ?? ROADMAP_MILESTONES[ROADMAP_MILESTONES.length - 1];
  const progress = Math.max(0, Math.min(100, ((120 - countdown) / 120) * 100));

  return (
    <Card className="border border-border/40 shadow-sm overflow-hidden">
      <CardContent className="p-4 bg-gradient-to-br from-amber-50/70 to-orange-50/40 dark:from-amber-500/10 dark:to-orange-500/5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-amber-500" />
              <p className="text-sm font-semibold">Exam Milestone Roadmap</p>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {countdown <= 0 ? 'Exam day has arrived' : `${countdown} days left until exam`}
            </p>
          </div>
          <span className="text-xs font-bold rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-1">
            Now: {currentMilestone.label}
          </span>
        </div>

        <div className="relative mb-4">
          <div className="h-2 rounded-full bg-amber-100 dark:bg-amber-950 overflow-hidden">
            <div className="h-full rounded-full bg-amber-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="grid grid-cols-4 gap-1 mt-3">
            {ROADMAP_MILESTONES.map(milestone => {
              const isCurrent = milestone.label === currentMilestone.label;
              const passed = countdown <= milestone.days;
              return (
                <div key={milestone.days} className={`rounded-xl border p-2 ${isCurrent ? 'border-amber-400 bg-background/90' : passed ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/10' : 'border-border/40 bg-background/60'}`}>
                  <p className={`text-xs font-bold ${isCurrent ? 'text-amber-700 dark:text-amber-300' : 'text-foreground'}`}>{milestone.days}d</p>
                  <p className="text-xs leading-snug font-medium mt-1">{milestone.label}</p>
                  <p className="text-xs text-muted-foreground leading-snug mt-1">{milestone.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function WellbeingReflectionScreen() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const todaysPrompt = promptForDate(new Date());
  const reflectionUnlocked = new Date().getHours() >= 21;
  const [examDate, setExamDate] = useState('');
  const [gender, setGender] = useState('');
  const [response, setResponse] = useState('');
  const [reflectionHistory, setReflectionHistory] = useState<ReflectionLog[]>([]);
  const [showReflectionHistory, setShowReflectionHistory] = useState(false);
  const [academicPressure, setAcademicPressure] = useState(3);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [socialTime, setSocialTime] = useState(3);
  const [notes, setNotes] = useState('');
  const [stressHistory, setStressHistory] = useState<StressCheckIn[]>([]);
  const [savedReflection, setSavedReflection] = useState(false);
  const [savedStress, setSavedStress] = useState(false);
  const [savingReflection, setSavingReflection] = useState(false);
  const [savingStress, setSavingStress] = useState(false);
  const [periodStart, setPeriodStart] = useState(today);
  const [periodEnd, setPeriodEnd] = useState('');
  const [periodFlow, setPeriodFlow] = useState('medium');
  const [periodSymptoms, setPeriodSymptoms] = useState<string[]>([]);
  const [periodNotes, setPeriodNotes] = useState('');
  const [periodLogs, setPeriodLogs] = useState<PeriodLog[]>([]);
  const [savingPeriod, setSavingPeriod] = useState(false);
  const [savedPeriod, setSavedPeriod] = useState(false);
  const [periodAge, setPeriodAge] = useState('');
  const [cycleLengthInput, setCycleLengthInput] = useState('28');
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [periodReminderEnabled, setPeriodReminderEnabled] = useState(false);
  const [savingPeriodSettings, setSavingPeriodSettings] = useState(false);
  const [savedPeriodSettings, setSavedPeriodSettings] = useState(false);

  const loadReflection = async () => {
    const res = await fetch(`/api/reflections?date=${today}`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.log) setResponse(data.log.response || '');
    setReflectionHistory(data.history || []);
  };

  const loadStress = async () => {
    const res = await fetch(`/api/stress-checkins?weekStart=${weekStart}`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.checkIn) {
      setAcademicPressure(data.checkIn.academicPressure ?? 3);
      setSleepQuality(data.checkIn.sleepQuality ?? 3);
      setSocialTime(data.checkIn.socialTime ?? 3);
      setNotes(data.checkIn.notes || '');
    }
    setStressHistory(data.history || []);
  };

  const loadPeriod = async () => {
    const res = await fetch('/api/period');
    if (!res.ok) return;
    const data = await res.json();
    setPeriodLogs(data.logs || []);
    if (data.settings) {
      setPeriodAge(data.settings.age ? String(data.settings.age) : '');
      setCycleLengthInput(String(data.settings.cycleLength || 28));
      setLastPeriodDate(data.settings.lastPeriodDate || '');
      setPeriodReminderEnabled(Boolean(data.settings.reminderEnabled));
      if (data.settings.lastPeriodDate) setPeriodStart(data.settings.lastPeriodDate);
    }
  };

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.ok ? res.json() : null)
      .then(profile => {
        setExamDate(profile?.examDate || '');
        setGender(profile?.gender || '');
      })
      .catch(() => {});
    loadReflection().catch(() => {});
    loadStress().catch(() => {});
    loadPeriod().catch(() => {});
  }, []);

  const saveReflection = async () => {
    setSavingReflection(true);
    try {
      await fetch('/api/reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today, prompt: todaysPrompt, response }),
      });
      await loadReflection();
      setSavedReflection(true);
      setTimeout(() => setSavedReflection(false), 2000);
    } catch {}
    setSavingReflection(false);
  };

  const saveStress = async () => {
    setSavingStress(true);
    try {
      await fetch('/api/stress-checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStart, academicPressure, sleepQuality, socialTime, notes }),
      });
      await loadStress();
      setSavedStress(true);
      setTimeout(() => setSavedStress(false), 2000);
    } catch {}
    setSavingStress(false);
  };

  const savePeriod = async () => {
    setSavingPeriod(true);
    try {
      await fetch('/api/period', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate: periodStart, endDate: periodEnd, flow: periodFlow, symptoms: periodSymptoms, notes: periodNotes }),
      });
      await loadPeriod();
      setSavedPeriod(true);
      setTimeout(() => setSavedPeriod(false), 2000);
    } catch {}
    setSavingPeriod(false);
  };

  const savePeriodSettings = async () => {
    setSavingPeriodSettings(true);
    try {
      if (periodReminderEnabled && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission().catch(() => {});
      }
      const res = await fetch('/api/period', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: periodAge,
          cycleLength: cycleLengthInput,
          lastPeriodDate,
          reminderEnabled: periodReminderEnabled,
        }),
      });
      if (res.ok) {
        await loadPeriod();
        setSavedPeriodSettings(true);
        setTimeout(() => setSavedPeriodSettings(false), 2000);
      }
    } catch {}
    setSavingPeriodSettings(false);
  };

  const trendData = stressHistory.slice(0, 8).reverse().map(item => ({
    week: format(new Date(`${item.weekStart}T12:00:00`), 'MMM d'),
    pressure: item.academicPressure,
    sleep: item.sleepQuality,
    social: item.socialTime,
    balance: Number(((5 - item.academicPressure + item.sleepQuality + item.socialTime) / 3).toFixed(1)),
  }));

  const wellbeingScore = Math.round(((5 - academicPressure + sleepQuality + socialTime) / 15) * 100);
  const nextMonday = format(addDays(new Date(`${weekStart}T12:00:00`), 7), 'MMM d');
  const showPeriodTracker = gender === 'female';
  const cycleLength = estimatedCycleLength(periodLogs, Number(cycleLengthInput) || 28, periodAge);
  const lastPeriodStart = periodLogs[0]?.startDate || lastPeriodDate;
  const nextPeriodDate = lastPeriodStart ? addDays(localDate(lastPeriodStart), cycleLength) : null;
  const nextPeriodEstimate = nextPeriodDate ? format(nextPeriodDate, 'MMM d, yyyy') : '';
  const daysUntilPeriod = nextPeriodDate ? differenceInCalendarDays(nextPeriodDate, new Date()) : null;
  const ovulationStart = nextPeriodDate ? addDays(nextPeriodDate, -17) : null;
  const ovulationEnd = nextPeriodDate ? addDays(nextPeriodDate, -12) : null;
  const isOvulationPhase = ovulationStart && ovulationEnd ? differenceInCalendarDays(new Date(), ovulationStart) >= 0 && differenceInCalendarDays(new Date(), ovulationEnd) <= 0 : false;
  const periodPeriodStarts = useMemo(() => {
    if (!lastPeriodStart) return periodLogs.map(log => log.startDate);
    return [lastPeriodStart, format(addDays(localDate(lastPeriodStart), cycleLength), 'yyyy-MM-dd'), format(addDays(localDate(lastPeriodStart), cycleLength * 2), 'yyyy-MM-dd'), ...periodLogs.map(log => log.startDate)];
  }, [lastPeriodStart, cycleLength, periodLogs]);
  const calendarStart = startOfMonth(new Date());
  const calendarDays = Array.from({ length: getDaysInMonth(calendarStart) }, (_, index) => addDays(calendarStart, index));
  const periodSetupComplete = !showPeriodTracker || Boolean(periodAge);
  const symptomOptions = ['Cramps', 'Headache', 'Bloating', 'Mood swings', 'Fatigue', 'Acne', 'Back pain', 'Tender breasts'];

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-2">
        <HeartPulse className="h-5 w-5 text-pink-500" />
        <div>
          <h2 className="text-base font-bold">Wellbeing & Reflection</h2>
          <p className="text-xs text-muted-foreground">Reflection, exam roadmap, and weekly stress trends</p>
        </div>
      </div>

      {showPeriodTracker && (
        <Card className="border border-border/40 shadow-sm overflow-hidden">
          <CardContent className="p-4 bg-gradient-to-br from-rose-50/90 via-pink-50/80 to-violet-50/60 dark:from-rose-500/10 dark:via-pink-500/10 dark:to-violet-500/10">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-rose-500" />
                  <p className="text-sm font-semibold">Period Tracker</p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Private cycle tracking with gentle predictions and reminders.
                </p>
              </div>
              {nextPeriodEstimate && (
                <span className="rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-300 px-2 py-1 text-xs font-bold">
                  Next ~ {nextPeriodEstimate}
                </span>
              )}
            </div>

            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="rounded-2xl bg-background/85 border border-white/70 dark:border-border/50 p-3">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>
                    <p className="text-xs font-bold">{periodSetupComplete ? 'Cycle settings' : 'First, add your age'}</p>
                    <p className="text-xs text-muted-foreground">
                      Age is required so predictions can be adjusted safely. Your health data stays private to your account.
                    </p>
                  </div>
                  <span className="rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-300 px-2 py-1 text-xs font-bold">
                    Private
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Age *</label>
                    <input
                      type="number"
                      min={8}
                      max={60}
                      value={periodAge}
                      onChange={e => setPeriodAge(e.target.value)}
                      placeholder="Your age"
                      className="mt-1 w-full h-10 rounded-xl border border-border bg-background px-3 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Cycle length</label>
                    <input
                      type="number"
                      min={21}
                      max={45}
                      value={cycleLengthInput}
                      onChange={e => setCycleLengthInput(e.target.value)}
                      placeholder="28"
                      className="mt-1 w-full h-10 rounded-xl border border-border bg-background px-3 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Last period date</label>
                    <input
                      type="date"
                      value={lastPeriodDate}
                      onChange={e => setLastPeriodDate(e.target.value)}
                      className="mt-1 w-full h-10 rounded-xl border border-border bg-background px-3 text-xs"
                    />
                  </div>
                </div>
                <label className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-rose-50/70 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 px-3 py-2">
                  <span>
                    <span className="block text-xs font-semibold">Reminders</span>
                    <span className="block text-xs text-muted-foreground">Get a gentle reminder before your next period and to log changes.</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={periodReminderEnabled}
                    onChange={e => setPeriodReminderEnabled(e.target.checked)}
                    className="h-4 w-4 accent-rose-500"
                  />
                </label>
                <Button onClick={savePeriodSettings} disabled={savingPeriodSettings || !periodAge} className="mt-3 w-full rounded-xl">
                  {savedPeriodSettings ? 'Settings saved!' : savingPeriodSettings ? 'Saving...' : periodSetupComplete ? 'Save Settings' : 'Continue to Tracker'}
                </Button>
              </div>

              {periodSetupComplete && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="rounded-2xl bg-background/80 border border-border/40 p-3">
                      <p className="text-xs text-muted-foreground">Smart insight</p>
                      <p className="text-sm font-bold mt-1">
                        {isOvulationPhase ? 'You are in ovulation phase' : daysUntilPeriod !== null ? daysUntilPeriod <= 0 ? 'Your period may start soon' : `Your next period is in ${daysUntilPeriod} day${daysUntilPeriod === 1 ? '' : 's'}` : 'Add a period date to start predictions'}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-background/80 border border-border/40 p-3">
                      <p className="text-xs text-muted-foreground">Cycle length</p>
                      <p className="text-sm font-bold mt-1">{cycleLength} days</p>
                    </div>
                    <div className="rounded-2xl bg-background/80 border border-border/40 p-3">
                      <p className="text-xs text-muted-foreground">Ovulation window</p>
                      <p className="text-sm font-bold mt-1">
                        {ovulationStart && ovulationEnd ? `${format(ovulationStart, 'MMM d')} – ${format(ovulationEnd, 'MMM d')}` : 'Log a date first'}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-background/85 border border-border/40 p-3">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold">{format(calendarStart, 'MMMM yyyy')}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-400" />Period</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet-400" />Ovulation</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-300" />Safe</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-1 text-center text-xs font-semibold text-muted-foreground">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: calendarStart.getDay() }).map((_, index) => <span key={`blank-${index}`} />)}
                      {calendarDays.map(day => {
                        const phase = phaseForDay(day, periodPeriodStarts, cycleLength);
                        const isToday = keyForDate(day) === today;
                        const styles = phase === 'period'
                          ? 'bg-rose-400 text-white'
                          : phase === 'ovulation'
                            ? 'bg-violet-400 text-white'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300';
                        return (
                          <div
                            key={keyForDate(day)}
                            className={`h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${styles} ${isToday ? 'ring-2 ring-foreground/50' : ''}`}
                          >
                            {format(day, 'd')}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Start date</label>
                      <input
                        type="date"
                        value={periodStart}
                        onChange={e => setPeriodStart(e.target.value)}
                        className="mt-1 w-full h-10 rounded-xl border border-border bg-background px-3 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">End date</label>
                      <input
                        type="date"
                        value={periodEnd}
                        onChange={e => setPeriodEnd(e.target.value)}
                        className="mt-1 w-full h-10 rounded-xl border border-border bg-background px-3 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Flow</label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {['light', 'medium', 'heavy'].map(flow => (
                        <button
                          key={flow}
                          type="button"
                          onClick={() => setPeriodFlow(flow)}
                          className={`h-9 rounded-xl text-xs font-semibold capitalize border transition-all ${periodFlow === flow ? 'bg-rose-500 text-white border-rose-500 shadow-sm' : 'bg-background border-border text-muted-foreground'}`}
                        >
                          {flow}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Symptoms</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {symptomOptions.map(symptom => {
                        const active = periodSymptoms.includes(symptom);
                        return (
                          <button
                            key={symptom}
                            type="button"
                            onClick={() => setPeriodSymptoms(prev => active ? prev.filter(s => s !== symptom) : [...prev, symptom])}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-all ${active ? 'bg-rose-500 text-white border-rose-500' : 'bg-background border-border text-muted-foreground'}`}
                          >
                            {symptom}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Textarea
                    value={periodNotes}
                    onChange={e => setPeriodNotes(e.target.value)}
                    placeholder="Optional notes about cramps, energy, mood, or study load..."
                    className="resize-none rounded-xl min-h-[72px] bg-background/80"
                  />

                  <Button onClick={savePeriod} disabled={savingPeriod || !periodStart} className="w-full rounded-xl">
                    {savedPeriod ? 'Saved!' : savingPeriod ? 'Saving...' : 'Save Period Log'}
                  </Button>

                  {periodLogs.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recent cycles</p>
                      {periodLogs.slice(0, 4).map(log => {
                        const symptoms = parseSymptoms(log.symptoms);
                        return (
                          <div key={log.id} className="rounded-xl bg-background/80 border border-border/40 p-3">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-semibold">
                                {format(localDate(log.startDate), 'MMM d')} {log.endDate ? `– ${format(localDate(log.endDate), 'MMM d')}` : ''}
                              </p>
                              <span className="text-xs rounded-full bg-rose-500/10 text-rose-600 px-2 py-0.5 capitalize">{log.flow}</span>
                            </div>
                            {symptoms.length > 0 && <p className="text-xs text-muted-foreground mt-1">{symptoms.join(', ')}</p>}
                            {log.notes && <p className="text-xs text-foreground/80 mt-1">{log.notes}</p>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </CardContent>
        </Card>
      )}

      <Card className="border border-border/40 shadow-sm overflow-hidden">
        <CardContent className="p-4 bg-gradient-to-br from-indigo-50/70 to-pink-50/50 dark:from-indigo-500/10 dark:to-pink-500/10">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-indigo-500" />
                <p className="text-sm font-semibold">9 PM Reflection</p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                One rotating journal question appears each night.
              </p>
            </div>
            <span className="rounded-full bg-background/80 border border-border/40 px-2 py-1 text-xs font-semibold">
              {reflectionUnlocked ? 'Open now' : 'Unlocks 9 PM'}
            </span>
          </div>

          {reflectionUnlocked ? (
            <div className="space-y-3">
              <div className="rounded-2xl bg-background/80 border border-border/50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500 mb-1">Tonight’s prompt</p>
                <p className="text-sm font-semibold">{todaysPrompt}</p>
              </div>
              <Textarea
                value={response}
                onChange={e => setResponse(e.target.value)}
                placeholder="Write a few honest lines..."
                className="resize-none rounded-xl min-h-[96px] bg-background/80"
              />
              <Button onClick={saveReflection} disabled={savingReflection || !response.trim()} className="w-full rounded-xl">
                {savedReflection ? 'Saved!' : savingReflection ? 'Saving...' : 'Save Reflection'}
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl bg-background/80 border border-dashed border-border p-4 text-center">
              <Sparkles className="h-5 w-5 mx-auto text-indigo-500 mb-2" />
              <p className="text-sm font-semibold">Come back after 9 PM</p>
              <p className="text-xs text-muted-foreground mt-1">Your daily prompt will appear here tonight.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ExamMilestoneRoadmap examDate={examDate} />

      <Card className="border border-border/40 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <BookHeart className="h-4 w-4 text-rose-500" />
                <p className="text-sm font-semibold">Weekly Stress Review</p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Separate from mood logs. Resets for a new entry each Monday.</p>
            </div>
            <span className="rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-300 px-2 py-1 text-xs font-bold">
              {wellbeingScore}% balance
            </span>
          </div>

          <div className="space-y-3">
            <SliderRow label="Academic pressure" helper="0 calm, 5 very intense" value={academicPressure} onChange={setAcademicPressure} />
            <SliderRow label="Sleep quality" helper="0 poor, 5 restorative" value={sleepQuality} onChange={setSleepQuality} />
            <SliderRow label="Social time" helper="0 isolated, 5 connected" value={socialTime} onChange={setSocialTime} />
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Optional note about this week..."
              className="resize-none rounded-xl min-h-[72px]"
            />
            <Button onClick={saveStress} disabled={savingStress} className="w-full rounded-xl">
              {savedStress ? 'Saved!' : savingStress ? 'Saving...' : `Save This Week • next opens ${nextMonday}`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {trendData.length >= 2 && (
        <Card className="border border-border/40 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <HeartPulse className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">Stress Trend Graph</p>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: 'none', boxShadow: '0 6px 20px rgba(0,0,0,0.12)' }} />
                  <Area type="monotone" dataKey="pressure" name="Academic pressure" stroke="#f43f5e" fill="#fecdd3" strokeWidth={2} />
                  <Area type="monotone" dataKey="sleep" name="Sleep quality" stroke="#6366f1" fill="#c7d2fe" strokeWidth={2} />
                  <Area type="monotone" dataKey="social" name="Social time" stroke="#10b981" fill="#bbf7d0" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border border-border/40 shadow-sm">
        <CardContent className="p-4">
          <button
            className="flex items-center justify-between w-full"
            onClick={() => setShowReflectionHistory(v => !v)}
          >
            <span className="text-sm font-semibold">Personal Reflection Log ({reflectionHistory.length})</span>
            {showReflectionHistory ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>

          {showReflectionHistory && (
            <div className="mt-3 space-y-3 max-h-80 overflow-y-auto">
              {reflectionHistory.length > 0 ? reflectionHistory.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-muted/40 p-3"
                >
                  <p className="text-xs text-muted-foreground font-medium">
                    {format(new Date(`${item.date}T12:00:00`), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-xs font-semibold mt-1">{item.prompt}</p>
                  <p className="text-xs text-foreground/80 mt-1 whitespace-pre-wrap">{item.response}</p>
                </motion.div>
              )) : (
                <p className="text-xs text-muted-foreground">No reflections saved yet.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}