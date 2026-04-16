'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, differenceInDays, addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Calendar, Heart, Droplets, Plus, ChevronLeft, ChevronRight, Info, X, Activity, Sparkles, Settings2, ChevronDown } from 'lucide-react';

interface PeriodLog {
  id: string;
  startDate: string;
  endDate: string;
  flow: string;
  symptoms: string;
  notes: string;
}

interface CycleSettings {
  age: string;
  cycleLength: number;
  periodDuration: number;
}

const DEFAULT_CYCLE_SETTINGS: CycleSettings = {
  age: '',
  cycleLength: 28,
  periodDuration: 5,
};

const SETTINGS_KEY = 'nuviora-period-settings';

const FLOW_OPTIONS = [
  { id: 'light', label: 'Light', color: '#fca5a5', emoji: '💧' },
  { id: 'medium', label: 'Medium', color: '#f87171', emoji: '🩸' },
  { id: 'heavy', label: 'Heavy', color: '#dc2626', emoji: '🔴' },
];

const SYMPTOM_OPTIONS = [
  'Cramps', 'Headache', 'Bloating', 'Mood swings', 'Back pain',
  'Fatigue', 'Nausea', 'Breast tenderness', 'Spotting', 'Cravings',
];

function getAgeAdvice(age: string): string | null {
  const n = parseInt(age, 10);
  if (!n || n < 10) return null;
  if (n < 18) return 'Teen cycles (21–45 days) are normal. Tracking helps spot patterns.';
  if (n < 25) return 'Young adult cycles can vary. Consistency builds over time.';
  if (n < 35) return 'Your mid-20s to 30s often show the most regular cycles.';
  if (n < 45) return 'Cycles may shift in your late 30s–40s. Patterns are still trackable.';
  return 'Perimenopause may cause variability. Track symptoms carefully.';
}

function getCycleInsights(logs: PeriodLog[], cycleLength: number, periodDuration = 5) {
  if (logs.length === 0) return null;
  const sorted = [...logs].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const lastPeriod = parseISO(sorted[0].startDate);
  const today = new Date();
  const daysSinceLast = differenceInDays(today, lastPeriod);
  const cycleDay = daysSinceLast + 1;
  const daysUntilNext = cycleLength - daysSinceLast;
  const nextPeriod = addDays(lastPeriod, cycleLength);
  const ovulation = addDays(lastPeriod, Math.round(cycleLength / 2) - 1);

  let avgCycle = cycleLength;
  if (sorted.length >= 2) {
    let total = 0;
    for (let i = 0; i < sorted.length - 1; i++) {
      const d = differenceInDays(parseISO(sorted[i].startDate), parseISO(sorted[i + 1].startDate));
      total += d;
    }
    avgCycle = Math.round(total / (sorted.length - 1));
  }

  const periodDays = sorted.map(log => {
    const start = parseISO(log.startDate);
    const end = log.endDate ? parseISO(log.endDate) : addDays(start, periodDuration - 1);
    return eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'));
  }).flat();

  const ovulationDays = sorted.map(log => {
    const ov = addDays(parseISO(log.startDate), 14);
    return [
      format(subDays(ov, 2), 'yyyy-MM-dd'),
      format(subDays(ov, 1), 'yyyy-MM-dd'),
      format(ov, 'yyyy-MM-dd'),
      format(addDays(ov, 1), 'yyyy-MM-dd'),
    ];
  }).flat();

  const inPeriod = daysSinceLast >= 0 && daysSinceLast <= 5;
  const inFertile = daysSinceLast >= 11 && daysSinceLast <= 17;
  const inOvulation = daysSinceLast >= 13 && daysSinceLast <= 15;

  return {
    cycleDay,
    daysSinceLast,
    daysUntilNext,
    nextPeriod,
    ovulation,
    avgCycle,
    periodDays,
    ovulationDays,
    inPeriod,
    inFertile,
    inOvulation,
    lastPeriodDate: lastPeriod,
  };
}

export function PeriodTrackerScreen() {
  const [logs, setLogs] = useState<PeriodLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [cycleSettings, setCycleSettings] = useState<CycleSettings>(DEFAULT_CYCLE_SETTINGS);

  const [logStartDate, setLogStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [logEndDate, setLogEndDate] = useState('');
  const [logFlow, setLogFlow] = useState('medium');
  const [logSymptoms, setLogSymptoms] = useState<string[]>([]);
  const [logNotes, setLogNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load cycle settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) setCycleSettings({ ...DEFAULT_CYCLE_SETTINGS, ...JSON.parse(stored) });
    } catch { /* ignore */ }
  }, []);

  // Save cycle settings to localStorage whenever they change
  const updateSetting = useCallback(<K extends keyof CycleSettings>(key: K, val: CycleSettings[K]) => {
    setCycleSettings(prev => {
      const next = { ...prev, [key]: val };
      try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/period');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch { /* ignore */ }
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleSaveLog = async () => {
    if (!logStartDate) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/period', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: logStartDate,
          endDate: logEndDate,
          flow: logFlow,
          symptoms: logSymptoms,
          notes: logNotes,
        }),
      });
      if (res.ok) {
        await fetchLogs();
        setShowLogDialog(false);
        setLogSymptoms([]);
        setLogNotes('');
        toast({ title: 'Period log saved!' });
      } else {
        toast({ title: 'Failed to save', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Failed to save', variant: 'destructive' });
    }
    setIsSaving(false);
  };

  const toggleSymptom = (s: string) => {
    setLogSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const insights = getCycleInsights(logs, cycleSettings.cycleLength, cycleSettings.periodDuration);

  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  const periodDaySet = new Set(insights?.periodDays || []);
  const ovDaySet = new Set(insights?.ovulationDays || []);
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const phaseInfo = insights
    ? insights.inPeriod
      ? {
          label: 'Menstrual Phase',
          emoji: '🌸',
          gradient: 'from-rose-400/20 via-rose-300/10 to-transparent',
          accent: 'bg-rose-500',
          text: 'text-rose-600 dark:text-rose-400',
          badge: 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300',
          desc: 'Rest more, stay hydrated, use heat for cramps.',
        }
      : insights.inFertile
        ? {
            label: insights.inOvulation ? 'Ovulation Phase' : 'Fertile Window',
            emoji: '💜',
            gradient: 'from-violet-400/20 via-violet-300/10 to-transparent',
            accent: 'bg-violet-500',
            text: 'text-violet-600 dark:text-violet-400',
            badge: 'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300',
            desc: 'Energy levels are high — great time for activity.',
          }
        : insights.cycleDay <= 7
          ? {
              label: 'Late Menstrual',
              emoji: '🌙',
              gradient: 'from-rose-300/15 via-rose-200/8 to-transparent',
              accent: 'bg-rose-400',
              text: 'text-rose-500 dark:text-rose-400',
              badge: 'bg-rose-100 dark:bg-rose-500/20 text-rose-500 dark:text-rose-300',
              desc: 'End of period phase. Energy slowly returns.',
            }
          : insights.cycleDay <= 13
            ? {
                label: 'Follicular Phase',
                emoji: '✨',
                gradient: 'from-cyan-400/18 via-cyan-200/10 to-transparent',
                accent: 'bg-cyan-500',
                text: 'text-cyan-600 dark:text-cyan-400',
                badge: 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300',
                desc: 'Energy rising — great time to focus and study!',
              }
            : {
                label: 'Luteal Phase',
                emoji: '🌼',
                gradient: 'from-amber-400/18 via-amber-200/10 to-transparent',
                accent: 'bg-amber-500',
                text: 'text-amber-600 dark:text-amber-400',
                badge: 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300',
                desc: 'Wind down slowly. Practice self-care.',
              }
    : null;

  return (
    <div className="space-y-4 pt-2 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center shadow-sm">
            <Heart className="h-5 w-5 text-rose-500" fill="currentColor" fillOpacity={0.2} />
          </div>
          <div>
            <h2 className="text-base font-bold leading-tight tracking-tight">Period Tracker</h2>
            <p className="text-xs text-muted-foreground font-medium">Track your cycle · Private & secure</p>
          </div>
        </div>
        <Button
          size="sm"
          className="rounded-xl h-9 px-3.5 gap-1.5 text-xs bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-500/30 active:scale-95"
          onClick={() => {
            setLogStartDate(format(new Date(), 'yyyy-MM-dd'));
            setLogEndDate('');
            setLogFlow('medium');
            setLogSymptoms([]);
            setLogNotes('');
            setShowLogDialog(true);
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Log Period
        </Button>
      </motion.div>

      {/* Cycle Settings Panel */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <button
          onClick={() => setShowSettings(s => !s)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-card border border-border/40 shadow-card transition-all hover:bg-muted/30 active:scale-[0.98] press-effect"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings2 className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-foreground tracking-tight">Cycle Settings</p>
              <p className="text-xs text-muted-foreground">
                {cycleSettings.age ? `Age ${cycleSettings.age} · ` : ''}{cycleSettings.cycleLength}-day cycle · {cycleSettings.periodDuration}-day period
              </p>
            </div>
          </div>
          <motion.div animate={{ rotate: showSettings ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </button>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-2 bg-card rounded-2xl border border-border/40 shadow-card p-4 space-y-4">
                {/* Age */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Your Age</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="10"
                      max="60"
                      value={cycleSettings.age}
                      onChange={e => updateSetting('age', e.target.value)}
                      placeholder="e.g. 22"
                      className="w-24 h-10 px-3 rounded-xl bg-muted/50 border border-border/60 text-sm text-foreground input-premium text-center font-semibold"
                    />
                    {getAgeAdvice(cycleSettings.age) && (
                      <motion.p
                        key={cycleSettings.age}
                        initial={{ opacity: 0, x: 6 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-xs text-muted-foreground leading-relaxed flex-1"
                      >
                        {getAgeAdvice(cycleSettings.age)}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Cycle length */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                    Cycle Length <span className="text-primary normal-case font-semibold">{cycleSettings.cycleLength} days</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateSetting('cycleLength', Math.max(20, cycleSettings.cycleLength - 1))}
                      className="w-9 h-9 rounded-xl bg-muted/60 hover:bg-muted border border-border/50 flex items-center justify-center text-lg font-bold text-foreground transition-all active:scale-90"
                    >−</button>
                    <div className="flex-1 relative h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-primary rounded-full"
                        animate={{ width: `${((cycleSettings.cycleLength - 20) / 20) * 100}%` }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    </div>
                    <button
                      onClick={() => updateSetting('cycleLength', Math.min(40, cycleSettings.cycleLength + 1))}
                      className="w-9 h-9 rounded-xl bg-muted/60 hover:bg-muted border border-border/50 flex items-center justify-center text-lg font-bold text-foreground transition-all active:scale-90"
                    >+</button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">Typical range: 21–40 days. Adjusts next period & ovulation predictions.</p>
                </div>

                {/* Period duration */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                    Period Duration <span className="text-rose-500 normal-case font-semibold">{cycleSettings.periodDuration} days</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateSetting('periodDuration', Math.max(2, cycleSettings.periodDuration - 1))}
                      className="w-9 h-9 rounded-xl bg-muted/60 hover:bg-muted border border-border/50 flex items-center justify-center text-lg font-bold text-foreground transition-all active:scale-90"
                    >−</button>
                    <div className="flex-1 relative h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-rose-400 rounded-full"
                        animate={{ width: `${((cycleSettings.periodDuration - 2) / 8) * 100}%` }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    </div>
                    <button
                      onClick={() => updateSetting('periodDuration', Math.min(10, cycleSettings.periodDuration + 1))}
                      className="w-9 h-9 rounded-xl bg-muted/60 hover:bg-muted border border-border/50 flex items-center justify-center text-lg font-bold text-foreground transition-all active:scale-90"
                    >+</button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">Typical range: 3–7 days. Used for calendar shading.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-28 bg-muted/40 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 bg-muted/40 rounded-2xl animate-pulse" />
            <div className="h-20 bg-muted/40 rounded-2xl animate-pulse" />
          </div>
          <div className="h-64 bg-muted/40 rounded-2xl animate-pulse" />
        </div>
      ) : (
        <>
          {/* Cycle Overview */}
          {insights ? (
            <div className="space-y-3">
              {/* Phase Hero Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className={`relative overflow-hidden rounded-2xl border border-border/40 shadow-card bg-gradient-to-br ${phaseInfo?.gradient} bg-card`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-card via-card to-transparent" />
                  <div className="relative p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${phaseInfo?.badge}`}>
                          <Sparkles className="h-2.5 w-2.5" />
                          {phaseInfo?.label}
                        </span>
                        <p className="text-3xl font-black text-foreground mt-2 leading-none">
                          Day <span className={phaseInfo?.text}>{insights.cycleDay}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">of ~{insights.avgCycle}-day cycle</p>
                        <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed max-w-[200px]">{phaseInfo?.desc}</p>
                      </div>
                      <div className={`w-16 h-16 rounded-2xl ${phaseInfo?.accent} bg-opacity-15 flex items-center justify-center flex-shrink-0 shadow-sm`}
                        style={{ background: 'color-mix(in srgb, var(--card) 70%, currentColor 30%)' }}
                      >
                        <span className="text-3xl">{phaseInfo?.emoji}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Insight mini cards */}
              <div className="grid grid-cols-2 gap-3">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                  <div className="bg-card rounded-2xl border border-border/40 shadow-card p-3.5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center">
                        <Calendar className="h-3.5 w-3.5 text-rose-500" />
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Next Period</p>
                    </div>
                    <p className="text-sm font-bold text-foreground">{format(insights.nextPeriod, 'MMM d')}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {insights.daysUntilNext > 0 ? `in ${insights.daysUntilNext} days` : insights.daysUntilNext === 0 ? 'Today' : `${Math.abs(insights.daysUntilNext)}d overdue`}
                    </p>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                  <div className="bg-card rounded-2xl border border-border/40 shadow-card p-3.5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center">
                        <Activity className="h-3.5 w-3.5 text-violet-500" />
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ovulation</p>
                    </div>
                    <p className="text-sm font-bold text-foreground">{format(insights.ovulation, 'MMM d')}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">estimated</p>
                  </div>
                </motion.div>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden bg-card rounded-2xl border border-rose-200/50 dark:border-rose-500/20 shadow-card p-6 text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-50/80 via-transparent to-transparent dark:from-rose-500/5 dark:via-transparent" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🌸</span>
                </div>
                <p className="text-sm font-bold text-foreground">Start tracking your cycle</p>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed max-w-[220px] mx-auto">
                  Log your first period to see cycle predictions, ovulation windows, and personalized insights.
                </p>
                <Button
                  size="sm"
                  className="mt-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs shadow-sm shadow-rose-500/25"
                  onClick={() => setShowLogDialog(true)}
                >
                  Log First Period
                </Button>
              </div>
            </motion.div>
          )}

          {/* Calendar */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="bg-card rounded-2xl border border-border/40 shadow-card p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCalendarMonth(m => subDays(startOfMonth(m), 1))}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all active:scale-90 press-effect"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <p className="text-sm font-bold text-foreground tracking-tight">{format(calendarMonth, 'MMMM yyyy')}</p>
                <button
                  onClick={() => setCalendarMonth(m => addDays(endOfMonth(m), 1))}
                  disabled={isSameMonth(calendarMonth, new Date())}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all active:scale-90 disabled:opacity-30 press-effect"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-0.5 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} className="text-center text-xs font-bold text-muted-foreground/70 py-1 tracking-wide">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: startPadding }).map((_, i) => (
                  <div key={`pad-${i}`} />
                ))}
                {calendarDays.map(day => {
                  const dayStr = format(day, 'yyyy-MM-dd');
                  const isPeriod = periodDaySet.has(dayStr);
                  const isOv = ovDaySet.has(dayStr);
                  const isToday = dayStr === todayStr;
                  return (
                    <div
                      key={dayStr}
                      className={`relative aspect-square flex items-center justify-center rounded-xl text-xs font-medium transition-all ${
                        isPeriod
                          ? 'bg-rose-400 text-white font-bold shadow-sm'
                          : isOv
                            ? 'bg-violet-100 dark:bg-violet-500/25 text-violet-700 dark:text-violet-300 font-semibold'
                            : isToday
                              ? 'ring-2 ring-primary bg-primary/10 text-primary font-bold'
                              : 'text-foreground hover:bg-muted/60'
                      }`}
                    >
                      {format(day, 'd')}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-5 mt-4 justify-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="text-xs text-muted-foreground font-medium">Period</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-violet-300 dark:bg-violet-500/60" />
                  <span className="text-xs text-muted-foreground font-medium">Fertile / Ovulation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-primary" />
                  <span className="text-xs text-muted-foreground font-medium">Today</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Past logs */}
          {logs.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
              <div className="bg-card rounded-2xl border border-border/40 shadow-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center">
                    <Droplets className="h-3.5 w-3.5 text-rose-400" />
                  </div>
                  <p className="text-sm font-semibold tracking-tight">Period History</p>
                </div>
                <div className="space-y-2">
                  {logs.slice(0, 4).map((log, idx) => {
                    const symptoms = (() => { try { return JSON.parse(log.symptoms); } catch { return []; } })();
                    const flowOption = FLOW_OPTIONS.find(f => f.id === log.flow);
                    const duration = log.endDate
                      ? differenceInDays(parseISO(log.endDate), parseISO(log.startDate)) + 1
                      : null;
                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="flex items-center gap-3 bg-muted/40 hover:bg-muted/60 rounded-xl p-3 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center text-base flex-shrink-0">
                          {flowOption?.emoji || '🩸'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-foreground">
                              {format(parseISO(log.startDate), 'MMM d, yyyy')}
                            </p>
                            {duration && (
                              <span className="text-xs bg-muted rounded-full px-1.5 py-0.5 text-muted-foreground font-medium">{duration}d</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground capitalize">{log.flow} flow</span>
                            {symptoms.length > 0 && (
                              <span className="text-xs text-muted-foreground">· {symptoms.slice(0, 2).join(', ')}</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Privacy note */}
          <div className="flex items-start gap-2.5 bg-muted/40 rounded-2xl p-3.5">
            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Info className="h-3.5 w-3.5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your period data is private and stored securely. Only you can see your cycle information.
            </p>
          </div>
        </>
      )}

      {/* Log Period Dialog */}
      <AnimatePresence>
        {showLogDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setShowLogDialog(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              className="fixed inset-x-4 bottom-4 z-50 max-w-sm mx-auto"
            >
              <div className="bg-card rounded-2xl shadow-float border border-border/50 overflow-hidden">
                {/* Dialog header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center">
                      <Heart className="h-4 w-4 text-rose-500" />
                    </div>
                    <p className="text-sm font-bold tracking-tight">Log Period</p>
                  </div>
                  <button
                    onClick={() => setShowLogDialog(false)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {/* Date inputs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Start Date</label>
                      <input
                        type="date"
                        value={logStartDate}
                        onChange={e => setLogStartDate(e.target.value)}
                        max={format(new Date(), 'yyyy-MM-dd')}
                        className="w-full h-10 px-3 rounded-xl bg-muted/50 border border-border/60 text-sm text-foreground input-premium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">End Date</label>
                      <input
                        type="date"
                        value={logEndDate}
                        onChange={e => setLogEndDate(e.target.value)}
                        min={logStartDate}
                        max={format(new Date(), 'yyyy-MM-dd')}
                        className="w-full h-10 px-3 rounded-xl bg-muted/50 border border-border/60 text-sm text-foreground input-premium"
                      />
                    </div>
                  </div>

                  {/* Flow intensity */}
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Flow Intensity</label>
                    <div className="grid grid-cols-3 gap-2">
                      {FLOW_OPTIONS.map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setLogFlow(opt.id)}
                          className={`rounded-xl border py-3 text-xs font-semibold flex flex-col items-center gap-1.5 transition-all active:scale-95 ${
                            logFlow === opt.id
                              ? 'border-rose-400 bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 shadow-sm'
                              : 'border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/60'
                          }`}
                        >
                          <span className="text-lg leading-none">{opt.emoji}</span>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Symptoms */}
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Symptoms (optional)</label>
                    <div className="flex flex-wrap gap-1.5">
                      {SYMPTOM_OPTIONS.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSymptom(s)}
                          className={`text-xs px-2.5 py-1.5 rounded-full border font-medium transition-all active:scale-95 chip-hover ${
                            logSymptoms.includes(s)
                              ? 'border-rose-400 bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 shadow-sm'
                              : 'border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/60'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Notes (optional)</label>
                    <textarea
                      value={logNotes}
                      onChange={e => setLogNotes(e.target.value)}
                      placeholder="How are you feeling?"
                      rows={2}
                      className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border/60 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none input-premium"
                    />
                  </div>
                </div>

                {/* Save button */}
                <div className="px-5 pb-5 pt-1">
                  <Button
                    onClick={handleSaveLog}
                    disabled={isSaving || !logStartDate}
                    className="w-full h-11 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-sm shadow-rose-500/25"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : 'Save Period Log'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
