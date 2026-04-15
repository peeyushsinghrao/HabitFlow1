'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, TrendingUp, Award, Target, Zap } from 'lucide-react';
import { useHabitStore } from '@/stores/habit-store';
import { format } from 'date-fns';

export function ParentReport() {
  const { habits, stats } = useHabitStore();
  const [copied, setCopied] = useState(false);
  const [coins, setCoins] = useState(0);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    fetch('/api/coins').then(r => r.json()).then(d => setCoins(d.coins ?? 0)).catch(() => {});
  }, []);

  const data = useMemo(() => {
    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    let completed = 0; let total = 0;
    for (const h of habits) {
      for (const day of days) {
        total++;
        if (h.logs?.some((l: {date: string; status: string}) => l.date === day && l.status === 'completed')) completed++;
      }
    }
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, rate };
  }, [habits, today]);

  const grade = data.rate >= 90 ? { g: 'A+', l: 'Exceptional', c: 'text-emerald-600' }
    : data.rate >= 80 ? { g: 'A', l: 'Excellent', c: 'text-emerald-600' }
    : data.rate >= 70 ? { g: 'B+', l: 'Very Good', c: 'text-blue-600' }
    : data.rate >= 60 ? { g: 'B', l: 'Good', c: 'text-blue-500' }
    : data.rate >= 50 ? { g: 'C', l: 'Average', c: 'text-amber-500' }
    : { g: 'D', l: 'Needs Improvement', c: 'text-rose-500' };

  const today_str = new Date(today).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const xp = stats?.xp ?? 0;
  const streak = stats?.currentStreak ?? 0;
  const badges = stats?.badges?.length ?? 0;
  const activeHabits = habits.filter((h: {isPaused?: boolean}) => !h.isPaused);

  const generateReport = () =>
    `📋 NUVIORA WEEKLY STUDY REPORT
Prepared: ${today_str}

Student Performance Summary (Last 7 Days)

📊 Habit Completion: ${data.rate}% — ${grade.l}
🔥 Current Streak: ${streak} days
⭐ XP Earned: ${xp}
🏆 Badges Earned: ${badges}
🪙 Coins: ${coins}

Active Study Habits (${activeHabits.length}):
${activeHabits.map((h: {emoji?: string; name: string}) => `• ${h.emoji || ''} ${h.name}`).join('\n') || '• No habits tracked'}

Grade: ${grade.g} — ${grade.l}

${data.rate >= 80 ? '✅ Excellent discipline and consistency this week! Keep it up.'
  : data.rate >= 60 ? '📈 Good effort this week. Focus on improving daily consistency.'
  : '⚠️ Needs more focus. Please encourage regular study sessions.'}

Powered by Nuviora — Gamified Habit Tracker for Students`;

  const copyReport = () => {
    navigator.clipboard.writeText(generateReport()).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-4 pb-4 space-y-4">
<<<<<<< HEAD
      <Card className="border-0 shadow-sm overflow-hidden">
=======
      <Card className="border border-border/40 shadow-sm overflow-hidden">
>>>>>>> 925ef42 (Initial commit)
        <div className="h-1.5 bg-gradient-to-r from-primary via-violet-500 to-pink-500" />
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className={`text-4xl font-black ${grade.c}`}>{grade.g}</p>
<<<<<<< HEAD
              <p className="text-[10px] text-muted-foreground">{grade.l}</p>
=======
              <p className="text-xs text-muted-foreground">{grade.l}</p>
>>>>>>> 925ef42 (Initial commit)
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full transition-all duration-700" style={{ width: `${data.rate}%` }} />
              </div>
              <p className="text-sm font-bold">{data.rate}% weekly habit completion</p>
<<<<<<< HEAD
              <p className="text-[11px] text-muted-foreground">{data.completed} of {activeHabits.length} habits checked in last 7 days</p>
=======
              <p className="text-xs text-muted-foreground">{data.completed} of {activeHabits.length} habits checked in last 7 days</p>
>>>>>>> 925ef42 (Initial commit)
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: <Zap className="h-4 w-4 text-orange-500" />, val: `${streak} days`, label: 'Current streak', bg: 'bg-orange-100 dark:bg-orange-500/20' },
          { icon: <TrendingUp className="h-4 w-4 text-violet-500" />, val: `${xp} XP`, label: 'Total earned', bg: 'bg-violet-100 dark:bg-violet-500/20' },
          { icon: <Award className="h-4 w-4 text-amber-500" />, val: String(badges), label: 'Badges earned', bg: 'bg-amber-100 dark:bg-amber-500/20' },
          { icon: <span className="text-sm">🪙</span>, val: String(coins), label: 'Coins earned', bg: 'bg-yellow-100 dark:bg-yellow-500/20' },
        ].map(s => (
<<<<<<< HEAD
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-3 flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center`}>{s.icon}</div>
              <div><p className="text-base font-bold">{s.val}</p><p className="text-[10px] text-muted-foreground">{s.label}</p></div>
=======
          <Card key={s.label} className="border border-border/40 shadow-sm">
            <CardContent className="p-3 flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center`}>{s.icon}</div>
              <div><p className="text-base font-bold">{s.val}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
>>>>>>> 925ef42 (Initial commit)
            </CardContent>
          </Card>
        ))}
      </div>

<<<<<<< HEAD
      <Card className="border-0 shadow-sm">
=======
      <Card className="border border-border/40 shadow-sm">
>>>>>>> 925ef42 (Initial commit)
        <CardContent className="p-3">
          <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Target className="h-3.5 w-3.5 text-primary" />Active Study Habits</p>
          <div className="space-y-1">
            {activeHabits.map((h: {id: string; emoji?: string; name: string; category?: string}) => (
              <div key={h.id} className="flex items-center gap-2 text-xs">
                <span>{h.emoji || '📚'}</span>
                <span className="flex-1">{h.name}</span>
<<<<<<< HEAD
                <span className="text-[10px] text-muted-foreground">{h.category}</span>
=======
                <span className="text-xs text-muted-foreground">{h.category}</span>
>>>>>>> 925ef42 (Initial commit)
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

<<<<<<< HEAD
      <Card className="border-0 shadow-sm bg-muted/30">
        <CardContent className="p-3">
          <pre className="text-[10px] text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed line-clamp-10">{generateReport()}</pre>
=======
      <Card className="border border-border/40 shadow-sm bg-muted/30">
        <CardContent className="p-3">
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed line-clamp-10">{generateReport()}</pre>
>>>>>>> 925ef42 (Initial commit)
        </CardContent>
      </Card>

      <Button onClick={copyReport} className="w-full rounded-xl h-10" size="sm">
        {copied ? <><Check className="h-4 w-4 mr-1" /> Copied!</> : <><Copy className="h-4 w-4 mr-1" /> Copy Report for Parent/Mentor</>}
      </Button>
<<<<<<< HEAD
      <p className="text-center text-[10px] text-muted-foreground">Share via WhatsApp or email to parents/mentors</p>
=======
      <p className="text-center text-xs text-muted-foreground">Share via WhatsApp or email to parents/mentors</p>
>>>>>>> 925ef42 (Initial commit)
    </div>
  );
}
