'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X, Download, Flame, Zap, CheckCircle2, Trophy, Calendar } from 'lucide-react';
import { format, startOfWeek, addDays } from 'date-fns';
import type { StatsData, Habit } from '@/stores/habit-store';

interface ShareCardProps {
  stats: StatsData | null;
  habits: Habit[];
  userName?: string;
}

interface FocusStat {
  duration: number;
  completed: boolean;
  date: string;
}

function ShareCardContent({
  stats,
  habits,
  userName,
  weekMinutes,
}: ShareCardProps & { weekMinutes: number }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), 'yyyy-MM-dd'));

  const weeklyCompletions = days.map(date => {
    const count = habits.filter(h => h.logs?.some(l => l.date === date && l.status === 'completed')).length;
    return habits.length > 0 ? Math.round((count / habits.length) * 100) : 0;
  });

  const completedToday = habits.filter(h =>
    h.logs?.some(l => l.date === today && l.status === 'completed')
  ).length;

  const weeklyHours = Math.round(weekMinutes / 60 * 10) / 10;

  return (
    <div
      className="w-full bg-gradient-to-br from-background via-background to-primary/5 border border-border/60 rounded-3xl overflow-hidden"
      style={{ fontFamily: 'system-ui, sans-serif' }}
    >
      {/* Header stripe */}
      <div className="h-1.5 bg-gradient-to-r from-primary via-chart-2 to-amber-400" />

      <div className="p-6 space-y-5">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest">Nuviora</p>
            <h3 className="text-lg font-black text-foreground mt-0.5">
              {userName ? `${userName.split(' ')[0]}'s Week` : 'My Progress'}
            </h3>
<<<<<<< HEAD
            <p className="text-[11px] text-muted-foreground">{format(new Date(), 'MMMM d, yyyy')}</p>
=======
            <p className="text-xs text-muted-foreground">{format(new Date(), 'MMMM d, yyyy')}</p>
>>>>>>> 925ef42 (Initial commit)
          </div>
          <div className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-500/15 px-3 py-2 rounded-2xl">
            <Flame className="h-5 w-5 text-amber-500" />
            <span className="text-xl font-black text-amber-600 dark:text-amber-400">{stats?.currentStreak ?? 0}</span>
            <span className="text-xs font-semibold text-amber-600/70 dark:text-amber-400/60">days</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-primary/8 dark:bg-primary/10 rounded-2xl p-3 text-center">
            <Zap className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-xl font-black text-primary">{stats?.xp ?? 0}</p>
<<<<<<< HEAD
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Total XP</p>
=======
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total XP</p>
>>>>>>> 925ef42 (Initial commit)
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-3 text-center">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{completedToday}/{habits.length}</p>
<<<<<<< HEAD
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Today</p>
=======
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Today</p>
>>>>>>> 925ef42 (Initial commit)
          </div>
          <div className="bg-violet-50 dark:bg-violet-500/10 rounded-2xl p-3 text-center">
            <Calendar className="h-4 w-4 text-violet-600 dark:text-violet-400 mx-auto mb-1" />
            <p className="text-xl font-black text-violet-600 dark:text-violet-400">{weeklyHours}h</p>
<<<<<<< HEAD
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">This Week</p>
=======
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">This Week</p>
>>>>>>> 925ef42 (Initial commit)
          </div>
        </div>

        {/* Weekly bar chart */}
        <div>
<<<<<<< HEAD
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Weekly Habit Rate</p>
=======
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Weekly Habit Rate</p>
>>>>>>> 925ef42 (Initial commit)
          <div className="flex items-end gap-1 h-14">
            {weeklyCompletions.map((pct, i) => {
              const dayLabel = ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i];
              const isToday = days[i] === today;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${Math.max(4, pct * 0.44)}px`,
                      background: pct === 100
                        ? 'var(--primary)'
                        : pct > 0
                          ? 'color-mix(in srgb, var(--primary) 50%, transparent)'
                          : 'var(--muted)',
                    }}
                  />
<<<<<<< HEAD
                  <span className={`text-[9px] font-semibold ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
=======
                  <span className={`text-xs font-semibold ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
>>>>>>> 925ef42 (Initial commit)
                    {dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Level badge */}
        <div className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-chart-2/10 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs font-bold text-foreground">Level {stats?.level ?? 1}</p>
<<<<<<< HEAD
              <p className="text-[10px] text-muted-foreground">Longest streak: {stats?.longestStreak ?? 0} days</p>
=======
              <p className="text-xs text-muted-foreground">Longest streak: {stats?.longestStreak ?? 0} days</p>
>>>>>>> 925ef42 (Initial commit)
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Next level</p>
            <p className="text-xs font-bold text-primary">{stats?.xpProgress ?? 0}% XP</p>
          </div>
        </div>

        {/* Footer */}
<<<<<<< HEAD
        <p className="text-center text-[10px] text-muted-foreground/60">
=======
        <p className="text-center text-xs text-muted-foreground/60">
>>>>>>> 925ef42 (Initial commit)
          Track habits · Build streaks · Level up · nuviora.app
        </p>
      </div>
    </div>
  );
}

export function ProgressShareCard({ stats, habits, userName }: ShareCardProps) {
  const [open, setOpen] = useState(false);
  const [weekMinutes, setWeekMinutes] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      try {
        const res = await fetch('/api/focus-sessions?days=7');
        if (res.ok) {
          const sessions: FocusStat[] = await res.json();
          const total = sessions.filter(s => s.completed).reduce((sum, s) => sum + s.duration, 0);
          setWeekMinutes(total);
        }
      } catch { /* ignore */ }
    };
    load();
  }, [open]);

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Nuviora Progress',
          text: `🔥 ${stats?.currentStreak ?? 0} day streak · ⚡ ${stats?.xp ?? 0} XP · Level ${stats?.level ?? 1} | Check out Nuviora for habit tracking!`,
        });
      } else {
        await navigator.clipboard.writeText(
          `🔥 ${stats?.currentStreak ?? 0} day streak · ⚡ ${stats?.xp ?? 0} XP · Level ${stats?.level ?? 1} | Track habits with Nuviora!`
        );
        alert('Progress text copied to clipboard!');
      }
    } catch { /* ignore */ }
  }, [stats]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full bg-gradient-to-r from-primary/10 to-chart-2/10 hover:from-primary/15 hover:to-chart-2/15 border border-primary/20 rounded-2xl px-4 py-3 transition-colors"
      >
        <Share2 className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Share Progress Card</span>
<<<<<<< HEAD
        <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">Screenshot to share</span>
=======
        <span className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">Screenshot to share</span>
>>>>>>> 925ef42 (Initial commit)
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto"
            >
              <div className="bg-background rounded-3xl shadow-2xl overflow-hidden">
                {/* Dialog Header */}
                <div className="flex items-center justify-between px-5 pt-4 pb-3">
                  <h3 className="text-base font-bold">Progress Card</h3>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="px-4 pb-4" ref={cardRef}>
                  <ShareCardContent
                    stats={stats}
                    habits={habits}
                    userName={userName}
                    weekMinutes={weekMinutes}
                  />
                </div>

                <div className="px-4 pb-5 flex gap-2">
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                  <p className="self-center text-xs text-muted-foreground text-center flex-1">
                    Or screenshot this card to share anywhere
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
