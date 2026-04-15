'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Trophy, Target, Flame, CheckCircle2, Sparkles, Zap } from 'lucide-react';
import { format, differenceInDays, parseISO, startOfWeek, getDay } from 'date-fns';

interface Challenge {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isCompleted: boolean;
  logs: string;
}

const PRESET_CHALLENGES = [
  { title: '30 Days No Social Media', description: 'Focus on studying without distractions' },
  { title: '30 Days of Daily Revision', description: 'Revise notes every single day' },
  { title: '30 Days Early Morning Study', description: 'Study before 7am every morning' },
  { title: '30 Days of PYQs', description: 'Solve at least 10 previous year questions daily' },
  { title: '30 Days of No Junk Food', description: 'Eat healthy to improve focus' },
  { title: '30 Days Meditation', description: '10 minutes of mindfulness each morning' },
];

const WEEKLY_CHALLENGE_POOL = [
  { title: 'Complete 5 Focus Sessions', description: 'Finish 5 Pomodoro sessions this week. Bonus XP reward!' },
  { title: 'Hit 100% Habits 4 Days', description: 'Complete all your habits on at least 4 days this week.' },
  { title: '3-Hour Study Marathon', description: 'Study for 3 continuous hours in one sitting this week.' },
  { title: 'Zero Missed Habits', description: 'Don\'t skip a single habit all week — perfect consistency!' },
  { title: 'Solve 20 Practice Questions', description: 'Work through 20 practice problems or PYQs this week.' },
  { title: 'Log a Doubt Every Day', description: 'Write down at least one study doubt or note each day.' },
  { title: 'Early Riser Week', description: 'Start studying before 8 AM on 5 days this week.' },
  { title: 'Revision Sprint', description: 'Revise at least 3 topics from memory every day this week.' },
  { title: 'No-Phone Study Block', description: 'Complete a 2-hour phone-free study session this week.' },
  { title: 'Formula Mastery', description: 'Add 5 new formulas to your vault and quiz yourself on them.' },
];

const WEEKLY_CHALLENGE_KEY = 'nuviora-weekly-challenge-week';

function getWeekKey() {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  return format(monday, 'yyyy-MM-dd');
}

function pickWeeklyChallenge(weekKey: string) {
  let hash = 0;
  for (let i = 0; i < weekKey.length; i++) hash = (hash * 31 + weekKey.charCodeAt(i)) >>> 0;
  return WEEKLY_CHALLENGE_POOL[hash % WEEKLY_CHALLENGE_POOL.length];
}

export function ChallengesScreen() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [weeklyChallenge, setWeeklyChallenge] = useState<{ title: string; description: string } | null>(null);
  const [weeklyAccepted, setWeeklyAccepted] = useState(false);
  const [weeklyAccepting, setWeeklyAccepting] = useState(false);

  const fetchChallenges = useCallback(async () => {
    try {
      const res = await fetch('/api/challenges');
      if (res.ok) setChallenges(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const weekKey = getWeekKey();
    const saved = localStorage.getItem(WEEKLY_CHALLENGE_KEY);
    if (saved !== weekKey) {
      setWeeklyChallenge(pickWeeklyChallenge(weekKey));
      setWeeklyAccepted(false);
    } else {
      setWeeklyAccepted(true);
    }
  }, []);

  useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

  const handleAcceptWeekly = async () => {
    if (!weeklyChallenge) return;
    setWeeklyAccepting(true);
    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `⚡ Weekly: ${weeklyChallenge.title}`, description: weeklyChallenge.description }),
      });
      if (res.ok) {
        const c = await res.json();
        setChallenges(prev => [c, ...prev]);
        localStorage.setItem(WEEKLY_CHALLENGE_KEY, getWeekKey());
        setWeeklyAccepted(true);
      }
    } finally {
      setWeeklyAccepting(false);
    }
  };

  const handleAdd = async (t?: string, d?: string) => {
    const challengeTitle = t || title;
    const challengeDesc = d || description;
    if (!challengeTitle.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: challengeTitle, description: challengeDesc }),
      });
      if (res.ok) {
        const c = await res.json();
        setChallenges(prev => [c, ...prev]);
        setTitle(''); setDescription('');
        setShowAdd(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/challenges?id=${id}`, { method: 'DELETE' });
    setChallenges(prev => prev.filter(c => c.id !== id));
  };

  const handleLogProgress = async (challenge: Challenge) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const logs: string[] = JSON.parse(challenge.logs || '[]');
    if (logs.includes(today)) return;
    const newLogs = [...logs, today];
    const isDone = newLogs.length >= 30;

    await fetch('/api/challenges', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: challenge.id, logs: newLogs, isCompleted: isDone }),
    });
    setChallenges(prev => prev.map(c =>
      c.id === challenge.id ? { ...c, logs: JSON.stringify(newLogs), isCompleted: isDone } : c
    ));
  };

  const getProgress = (challenge: Challenge) => {
    const logs: string[] = JSON.parse(challenge.logs || '[]');
    const today = format(new Date(), 'yyyy-MM-dd');
    const loggedToday = logs.includes(today);
    const daysLeft = Math.max(0, differenceInDays(parseISO(challenge.endDate), new Date()));
    const streak = calculateStreak(logs);
    return { logs, loggedToday, daysLeft, streak, percent: Math.round((logs.length / 30) * 100) };
  };

  function calculateStreak(logs: string[]): number {
    if (!logs.length) return 0;
    const sorted = [...logs].sort().reverse();
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < sorted.length; i++) {
      const expected = format(new Date(today.getTime() - i * 86400000), 'yyyy-MM-dd');
      if (sorted[i] === expected) streak++;
      else break;
    }
    return streak;
  }

  const active = challenges.filter(c => !c.isCompleted);
  const completed = challenges.filter(c => c.isCompleted);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            30-Day Challenges
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {active.length} active · {completed.length} completed
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> New
        </Button>
      </div>

      {/* Weekly Challenge Banner */}
      {weeklyChallenge && !weeklyAccepted && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/10 via-primary/10 to-amber-500/10 border border-primary/20 p-4">
            <div className="absolute top-2 right-2">
<<<<<<< HEAD
              <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/15 text-primary px-2 py-0.5 rounded-full">
=======
              <span className="text-xs font-bold uppercase tracking-widest bg-primary/15 text-primary px-2 py-0.5 rounded-full">
>>>>>>> 925ef42 (Initial commit)
                This Week
              </span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0 pr-8">
<<<<<<< HEAD
                <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-0.5">⚡ Weekly Challenge</p>
=======
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">⚡ Weekly Challenge</p>
>>>>>>> 925ef42 (Initial commit)
                <p className="text-sm font-bold text-foreground">{weeklyChallenge.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{weeklyChallenge.description}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleAcceptWeekly}
                disabled={weeklyAccepting}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                <Zap className="h-3.5 w-3.5" />
                {weeklyAccepting ? 'Accepting...' : 'Accept Challenge'}
              </button>
<<<<<<< HEAD
              <span className="text-[10px] text-muted-foreground">+bonus XP on completion</span>
=======
              <span className="text-xs text-muted-foreground">+bonus XP on completion</span>
>>>>>>> 925ef42 (Initial commit)
            </div>
          </div>
        </motion.div>
      )}

      {weeklyAccepted && (
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl px-3 py-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Weekly challenge accepted! Check it in your active list.</p>
        </div>
      )}

      {/* Add Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="border-primary/20">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-semibold">New 30-Day Challenge</p>
                <input
                  className="w-full h-10 px-3 rounded-xl text-sm bg-muted/40 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Challenge title..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
                <input
                  className="w-full h-9 px-3 rounded-xl text-sm bg-muted/40 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Description (optional)..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowAdd(false)} className="flex-1">Cancel</Button>
                  <Button size="sm" onClick={() => handleAdd()} disabled={saving} className="flex-1">Start Challenge</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preset Challenges */}
      {challenges.length === 0 && !loading && (
        <div className="bg-muted/20 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Start Challenges</p>
          <div className="space-y-2">
            {PRESET_CHALLENGES.map((pc, i) => (
              <button
                key={i}
                onClick={() => handleAdd(pc.title, pc.description)}
                className="w-full flex items-center gap-3 p-2.5 bg-background rounded-xl border border-border text-left hover:border-primary/40 transition-colors"
              >
                <Target className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{pc.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{pc.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Challenges */}
      {active.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active</p>
          {active.map(challenge => {
            const { logs, loggedToday, daysLeft, streak, percent } = getProgress(challenge);
            return (
              <motion.div key={challenge.id} layout>
<<<<<<< HEAD
                <Card className="border-0 shadow-sm">
=======
                <Card className="border border-border/40 shadow-sm">
>>>>>>> 925ef42 (Initial commit)
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{challenge.title}</p>
                        {challenge.description && <p className="text-xs text-muted-foreground mt-0.5">{challenge.description}</p>}
                      </div>
                      <button
                        onClick={() => handleDelete(challenge.id)}
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
<<<<<<< HEAD
                        <span className="text-[11px] text-muted-foreground">{logs.length}/30 days</span>
                        <span className="text-[11px] font-semibold text-primary">{percent}%</span>
=======
                        <span className="text-xs text-muted-foreground">{logs.length}/30 days</span>
                        <span className="text-xs font-semibold text-primary">{percent}%</span>
>>>>>>> 925ef42 (Initial commit)
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3 text-orange-500" />
                        {streak} streak
                      </span>
                      <span>{daysLeft} days left</span>
                      <div className="ml-auto">
                        <button
                          onClick={() => handleLogProgress(challenge)}
                          disabled={loggedToday}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            loggedToday
                              ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-primary text-primary-foreground hover:bg-primary/90'
                          }`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {loggedToday ? 'Done today!' : 'Log today'}
                        </button>
                      </div>
                    </div>

                    {/* Day dots */}
                    <div className="flex flex-wrap gap-1">
                      {Array.from({ length: 30 }).map((_, i) => {
                        const dayDate = format(new Date(Date.now() - (challenge.logs ? 0 : 0) + i * 86400000 - (30 - 1) * 86400000 * 0), 'yyyy-MM-dd');
                        const allLogs: string[] = JSON.parse(challenge.logs || '[]');
                        const filled = i < allLogs.length;
                        return (
                          <div
                            key={i}
                            className={`w-5 h-5 rounded-sm transition-colors ${filled ? 'bg-primary' : 'bg-muted/50'}`}
                            title={`Day ${i + 1}`}
                          />
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Completed Challenges */}
      {completed.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Completed 🎉</p>
          {completed.map(challenge => (
<<<<<<< HEAD
            <Card key={challenge.id} className="border-0 shadow-sm bg-emerald-50 dark:bg-emerald-500/10">
=======
            <Card key={challenge.id} className="border border-emerald-200/40 dark:border-emerald-800/20 shadow-sm bg-emerald-50 dark:bg-emerald-500/10">
>>>>>>> 925ef42 (Initial commit)
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <p className="text-sm font-medium flex-1">{challenge.title}</p>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Completed!</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-32 rounded-xl bg-muted/40 animate-pulse" />)}
        </div>
      )}

      {!loading && challenges.length === 0 && (
        <div className="text-center py-8">
          <p className="text-4xl mb-3">🏆</p>
          <p className="text-sm font-medium">Start a challenge above</p>
          <p className="text-xs text-muted-foreground mt-1">30 days of consistency builds lifelong habits</p>
        </div>
      )}
    </div>
  );
}
