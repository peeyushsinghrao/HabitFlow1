'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Battery, BatteryLow, BatteryMedium } from 'lucide-react';
import type { Habit } from '@/stores/habit-store';

interface BurnoutDetectorProps {
  habits: Habit[];
  today: string;
  avgMood?: number;
}

export function BurnoutDetector({ habits, today, avgMood }: BurnoutDetectorProps) {
  const score = useMemo(() => {
    // Check last 3 days completion rate
    const days: string[] = [];
    for (let i = 1; i <= 3; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }

    if (habits.length === 0) return null;

    let totalRate = 0;
    let dayCount = 0;
    for (const day of days) {
      const completedOnDay = habits.filter(h => h.logs?.some(l => l.date === day && l.status === 'completed')).length;
      totalRate += habits.length > 0 ? completedOnDay / habits.length : 0;
      dayCount++;
    }
    const avgCompletion = dayCount > 0 ? totalRate / dayCount : 1;

    // Score 0-100: higher = more burned out
    let burnout = 0;
    if (avgCompletion < 0.3) burnout += 40;
    else if (avgCompletion < 0.6) burnout += 20;

    if (avgMood !== undefined) {
      if (avgMood <= 2) burnout += 30;
      else if (avgMood <= 3) burnout += 15;
    }

    return Math.min(100, burnout);
  }, [habits, today, avgMood]);

  if (score === null) return null;

  const level = score >= 50 ? 'high' : score >= 25 ? 'medium' : 'low';

  const messages = {
    low: { icon: '⚡', title: 'Energy Strong', tip: 'Keep going! Your consistency has been excellent.', color: 'text-emerald-600 dark:text-emerald-400', bg: 'from-emerald-50 to-green-50 dark:from-emerald-500/5 dark:to-green-500/5' },
    medium: { icon: '🌤️', title: 'Slightly Tired', tip: 'Consider a lighter study session. Short breaks help!', color: 'text-amber-600 dark:text-amber-400', bg: 'from-amber-50 to-yellow-50 dark:from-amber-500/5 dark:to-yellow-500/5' },
    high: { icon: '🔋', title: 'Burnout Risk', tip: 'Take a rest day! Low mood + low completions = your body needs recovery.', color: 'text-rose-600 dark:text-rose-400', bg: 'from-rose-50 to-red-50 dark:from-rose-500/5 dark:to-red-500/5' },
  };

  const m = messages[level];
  const Icon = level === 'high' ? BatteryLow : level === 'medium' ? BatteryMedium : Battery;

  return (
<<<<<<< HEAD
    <Card className="border-0 shadow-sm overflow-hidden">
=======
    <Card className="border border-border/40 shadow-sm overflow-hidden">
>>>>>>> 925ef42 (Initial commit)
      <CardContent className={`p-3 bg-gradient-to-r ${m.bg}`}>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 text-xl">{m.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className={`text-xs font-bold ${m.color}`}>{m.title}</p>
              <Icon className={`h-3.5 w-3.5 ${m.color}`} />
            </div>
<<<<<<< HEAD
            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{m.tip}</p>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className={`text-xs font-bold ${m.color}`}>{score}<span className="text-[9px]">/100</span></div>
            <div className="text-[9px] text-muted-foreground">burnout</div>
=======
            <p className="text-xs text-muted-foreground leading-tight mt-0.5">{m.tip}</p>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className={`text-xs font-bold ${m.color}`}>{score}<span className="text-xs">/100</span></div>
            <div className="text-xs text-muted-foreground">burnout</div>
>>>>>>> 925ef42 (Initial commit)
          </div>
        </div>
        <div className="mt-2 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${level === 'high' ? 'bg-rose-500' : level === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
