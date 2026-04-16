'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Coins, Trophy, ChevronDown, ChevronUp } from 'lucide-react';

interface BossChallenge {
  id: string;
  title: string;
  description: string;
  requirementType: string;
  requirementValue: number;
  currentProgress: number;
  isCompleted: boolean;
  coinsReward: number;
  weekStart: string;
}

export function BossChallengeWidget() {
  const [challenge, setChallenge] = useState<BossChallenge | null>(null);
  const [weekStart, setWeekStart] = useState('');
  const [weekEnd, setWeekEnd] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const fetchChallenge = useCallback(async () => {
    try {
      const res = await fetch('/api/boss-challenge');
      const data = await res.json();
      const wasCompleted = challenge?.isCompleted ?? false;
      if (!wasCompleted && data.challenge?.isCompleted) {
        setJustCompleted(true);
        setTimeout(() => setJustCompleted(false), 4000);
      }
      setChallenge(data.challenge);
      setWeekStart(data.weekStart);
      setWeekEnd(data.weekEnd);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [challenge]);

  useEffect(() => { fetchChallenge(); }, []);

  if (loading || !challenge) return null;

  const progress = Math.min(challenge.currentProgress, challenge.requirementValue);
  const progressPct = Math.round((progress / challenge.requirementValue) * 100);
  const isDone = challenge.isCompleted;

  const progressLabel = (() => {
    if (challenge.requirementType === 'total_completions') return `${progress}/${challenge.requirementValue} completions`;
    if (challenge.requirementType === 'perfect_days') return `${progress}/${challenge.requirementValue} perfect days`;
    if (challenge.requirementType === 'daily_habit') return `${progress}/${challenge.requirementValue} days`;
    if (challenge.requirementType === 'habit_streak') return `${progress}/${challenge.requirementValue} day streak`;
    return `${progress}/${challenge.requirementValue}`;
  })();

  const formatDate = (d: string) => {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-colors ${isDone ? 'border-violet-300/60 dark:border-violet-500/30 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/20' : 'border-red-200/60 dark:border-red-500/20 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20'}`}>
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-current opacity-5 rounded-full pointer-events-none" />

      <button className="w-full p-3.5" onClick={() => setExpanded(v => !v)}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDone ? 'bg-violet-400/20' : 'bg-red-400/20'}`}>
            {isDone ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                <Trophy className={`h-5 w-5 text-violet-600 dark:text-violet-400`} />
              </motion.div>
            ) : (
              <Swords className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Weekly Boss</p>
              <span className="text-xs text-muted-foreground/60">{formatDate(weekStart)} – {formatDate(weekEnd)}</span>
            </div>
            <p className="text-xs font-bold text-foreground truncate">{challenge.title}</p>

            <div className="mt-1.5 h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${isDone ? 'bg-violet-500' : 'bg-red-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{progressLabel}</p>
          </div>

          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div className="flex items-center gap-1">
              <Coins className="h-3 w-3 text-amber-500" />
              <span className="text-xs font-black text-amber-600 dark:text-amber-400">{challenge.coinsReward}</span>
            </div>
            {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5">
              <div className={`rounded-xl p-3 text-center ${isDone ? 'bg-violet-100/60 dark:bg-violet-900/20' : 'bg-red-100/60 dark:bg-red-900/20'}`}>
                <p className="text-xs text-foreground/80 leading-relaxed">{challenge.description}</p>
                {isDone ? (
                  <p className="text-xs font-bold text-violet-600 dark:text-violet-400 mt-2">🏆 Challenge Conquered! +{challenge.coinsReward} coins earned!</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-2">Complete it before Sunday for <span className="font-bold text-amber-600">{challenge.coinsReward} coins</span>!</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {justCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 flex items-center justify-center rounded-2xl bg-violet-500/90 dark:bg-violet-600/90 pointer-events-none z-10"
          >
            <div className="text-center px-4">
              <div className="text-3xl mb-1">🏆</div>
              <p className="text-white font-black text-sm">Boss Defeated!</p>
              <p className="text-white/80 text-xs mt-0.5">+{challenge.coinsReward} coins earned!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
