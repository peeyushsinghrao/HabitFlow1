'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, getDay } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Flame,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  X,
  BarChart3,
  Heart,
} from 'lucide-react';

interface WeeklyReviewData {
  weekStart: string;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  totalFocusMinutes: number;
  avgMood: number | null;
  habitStats: { id: string; name: string; icon: string; completedDays: number }[];
  bestHabit: { name: string; icon: string; completedDays: number } | null;
  worstHabit: { name: string; icon: string; completedDays: number } | null;
  xp: number;
  level: number;
}

const MOOD_EMOJIS: Record<number, string> = { 1: '😢', 2: '😕', 3: '😐', 4: '😊', 5: '🤩' };

export function WeeklyReviewDialog() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<WeeklyReviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkSunday = async () => {
      const dayOfWeek = getDay(new Date()); // 0 = Sunday
      if (dayOfWeek !== 0) return;

      const today = format(new Date(), 'yyyy-MM-dd');
      const lastShown = localStorage.getItem('habitflow-weekly-review-shown');
      if (lastShown === today) return;

      setIsLoading(true);
      try {
        const res = await fetch('/api/weekly-review');
        if (res.ok) {
          const reviewData = await res.json();
          setData(reviewData);
          setOpen(true);
          localStorage.setItem('habitflow-weekly-review-shown', today);
        }
      } catch {}
      setIsLoading(false);
    };

    const timer = setTimeout(checkSunday, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => setOpen(false);
  const focusHours = Math.floor((data?.totalFocusMinutes ?? 0) / 60);
  const focusMins = (data?.totalFocusMinutes ?? 0) % 60;

  return (
    <AnimatePresence>
      {open && data && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl p-0 gap-0 overflow-hidden max-h-[90vh]">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary/90 to-chart-2/90 px-5 pt-5 pb-4 text-primary-foreground">
              <div className="flex items-center justify-between mb-1">
                <DialogTitle className="text-white font-bold text-base">
                  📋 Weekly Review
                </DialogTitle>
                <button onClick={handleClose} className="text-white/70 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-white/70 text-xs">Week of {data.weekStart}</p>

              {/* Big completion stat */}
              <div className="mt-4 flex items-end gap-2">
                <span className="text-5xl font-bold text-white">{data.completionRate}%</span>
                <span className="text-white/70 text-sm mb-2">habit completion</span>
              </div>

              {/* Progress bar */}
              <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${data.completionRate}%` }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                />
              </div>
            </div>

            <div className="px-5 py-4 overflow-y-auto custom-scrollbar max-h-[calc(90vh-180px)] space-y-4">
              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-muted/40 rounded-xl p-3 text-center">
                  <Flame className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">{data.currentStreak}</p>
<<<<<<< HEAD
                  <p className="text-[10px] text-muted-foreground">Streak</p>
=======
                  <p className="text-xs text-muted-foreground">Streak</p>
>>>>>>> 925ef42 (Initial commit)
                </div>
                <div className="bg-muted/40 rounded-xl p-3 text-center">
                  <Timer className="h-4 w-4 text-purple-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">{focusHours}h {focusMins}m</p>
<<<<<<< HEAD
                  <p className="text-[10px] text-muted-foreground">Focus</p>
=======
                  <p className="text-xs text-muted-foreground">Focus</p>
>>>>>>> 925ef42 (Initial commit)
                </div>
                <div className="bg-muted/40 rounded-xl p-3 text-center">
                  {data.avgMood !== null ? (
                    <span className="text-xl">{MOOD_EMOJIS[Math.round(data.avgMood)]}</span>
                  ) : (
                    <Heart className="h-4 w-4 text-rose-500 mx-auto mb-1" />
                  )}
                  <p className="text-lg font-bold">
                    {data.avgMood !== null ? data.avgMood.toFixed(1) : '—'}
                  </p>
<<<<<<< HEAD
                  <p className="text-[10px] text-muted-foreground">Avg Mood</p>
=======
                  <p className="text-xs text-muted-foreground">Avg Mood</p>
>>>>>>> 925ef42 (Initial commit)
                </div>
              </div>

              {/* Highlights */}
              {data.bestHabit && (
                <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                  <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-green-800 dark:text-green-300">Best Habit</p>
                    <p className="text-sm font-bold">
                      {data.bestHabit.icon} {data.bestHabit.name}
                      <span className="text-xs text-green-600 dark:text-green-400 ml-1 font-normal">
                        {data.bestHabit.completedDays}/7 days
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {data.worstHabit && data.worstHabit.completedDays < 5 && (
                <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Needs Attention</p>
                    <p className="text-sm font-bold">
                      {data.worstHabit.icon} {data.worstHabit.name}
                      <span className="text-xs text-amber-600 dark:text-amber-400 ml-1 font-normal">
                        {data.worstHabit.completedDays}/7 days
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Habit performance */}
              {data.habitStats.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BarChart3 className="h-3 w-3" />
                    Habit Performance
                  </p>
                  <div className="space-y-2">
                    {data.habitStats.map(h => (
                      <div key={h.id} className="flex items-center gap-2">
                        <span className="text-base w-6">{h.icon}</span>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-xs font-medium truncate">{h.name}</span>
<<<<<<< HEAD
                            <span className="text-[10px] text-muted-foreground ml-1 flex-shrink-0">{h.completedDays}/7</span>
=======
                            <span className="text-xs text-muted-foreground ml-1 flex-shrink-0">{h.completedDays}/7</span>
>>>>>>> 925ef42 (Initial commit)
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${(h.completedDays / 7) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* XP */}
              <div className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Level {data.level}</span>
                </div>
                <span className="text-sm font-bold gradient-text">{data.xp} XP total</span>
              </div>
            </div>

            <div className="px-5 pb-5">
              <Button className="w-full rounded-xl" onClick={handleClose}>
                Keep it up! 🚀
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
