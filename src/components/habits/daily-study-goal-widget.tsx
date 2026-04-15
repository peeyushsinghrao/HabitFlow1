'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Clock, Pencil, Check } from 'lucide-react';
import { format } from 'date-fns';

const GOAL_KEY = 'nuviora-daily-study-goal-hours';

export function DailyStudyGoalWidget() {
  const [goalHours, setGoalHours] = useState<number>(3);
  const [editing, setEditing] = useState(false);
  const [draftGoal, setDraftGoal] = useState('3');
  const [minutesLogged, setMinutesLogged] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(GOAL_KEY);
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed > 0) {
          setGoalHours(parsed);
          setDraftGoal(String(parsed));
        }
      }
    } catch { /* ignore */ }
  }, []);

  const fetchTodayMinutes = useCallback(async () => {
    setLoading(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const res = await fetch('/api/focus-sessions?days=1');
      if (res.ok) {
        const sessions: { date: string; duration: number; completed: boolean }[] = await res.json();
        const todayTotal = sessions
          .filter(s => s.date === today && s.completed)
          .reduce((sum, s) => sum + s.duration, 0);
        setMinutesLogged(todayTotal);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayMinutes();
    const interval = setInterval(fetchTodayMinutes, 60000);
    return () => clearInterval(interval);
  }, [fetchTodayMinutes]);

  const saveGoal = () => {
    const parsed = parseFloat(draftGoal);
    if (!isNaN(parsed) && parsed > 0) {
      const clamped = Math.min(14, Math.max(0.5, parsed));
      setGoalHours(clamped);
      try { localStorage.setItem(GOAL_KEY, String(clamped)); } catch { /* ignore */ }
    }
    setEditing(false);
  };

  const goalMins = goalHours * 60;
  const progress = Math.min(100, Math.round((minutesLogged / goalMins) * 100));
  const isGoalMet = minutesLogged >= goalMins;

  const formatTime = (m: number) => {
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
  };

  return (
<<<<<<< HEAD
    <Card className="border-0 shadow-sm overflow-hidden">
=======
    <Card className="border border-border/40 shadow-sm overflow-hidden">
>>>>>>> 925ef42 (Initial commit)
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isGoalMet ? 'bg-emerald-100 dark:bg-emerald-500/15' : 'bg-primary/10'}`}>
              {isGoalMet
                ? <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                : <Target className="h-4 w-4 text-primary" />
              }
            </div>
            <div>
              <p className="text-sm font-semibold">Daily Study Goal</p>
<<<<<<< HEAD
              <p className="text-[10px] text-muted-foreground">Focus sessions today</p>
=======
              <p className="text-xs text-muted-foreground">Focus sessions today</p>
>>>>>>> 925ef42 (Initial commit)
            </div>
          </div>

          {editing ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                type="number"
                min="0.5"
                max="14"
                step="0.5"
                value={draftGoal}
                onChange={e => setDraftGoal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveGoal(); if (e.key === 'Escape') setEditing(false); }}
                className="w-16 h-8 px-2 rounded-lg text-sm text-center bg-muted/50 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="text-xs text-muted-foreground">hrs</span>
              <button
                onClick={saveGoal}
                className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setEditing(true); setDraftGoal(String(goalHours)); }}
              className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Clock className="h-3 w-3" />
              {goalHours}h goal
              <Pencil className="h-3 w-3" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="h-2.5 rounded-full bg-muted/40 animate-pulse" />
        ) : (
          <>
            <div className="h-2.5 rounded-full bg-muted/40 overflow-hidden mb-2">
              <motion.div
                className={`h-full rounded-full ${isGoalMet ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary to-chart-2'}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
            </div>
<<<<<<< HEAD
            <div className="flex justify-between text-[11px]">
=======
            <div className="flex justify-between text-xs">
>>>>>>> 925ef42 (Initial commit)
              <span className={isGoalMet ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-muted-foreground'}>
                {isGoalMet ? '🎉 Goal reached!' : `${formatTime(minutesLogged)} studied`}
              </span>
              <span className="text-muted-foreground">
                {isGoalMet
                  ? `+${formatTime(minutesLogged - goalMins)} extra`
                  : `${formatTime(Math.max(0, goalMins - minutesLogged))} to go`
                }
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
