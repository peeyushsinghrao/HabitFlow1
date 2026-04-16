'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X, Download, Flame, Zap, Target, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useHabitStore } from '@/stores/habit-store';
import { format } from 'date-fns';

interface StatsWidgetCardProps {
  today: string;
}

export function StatsWidgetCard({ today }: StatsWidgetCardProps) {
  const { habits, stats } = useHabitStore();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<{ name?: string; examGoal?: string } | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !profile) {
      fetch('/api/profile').then(r => r.json()).then(setProfile).catch(() => {});
    }
  }, [open, profile]);

  const completedToday = habits.filter(h => h.logs?.some(l => l.date === today && l.status === 'completed')).length;
  const totalHabits = habits.length;
  const todayPct = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const streak = stats?.currentStreak ?? 0;
  const level = stats?.level ?? 1;
  const xp = stats?.xp ?? 0;
  const day = format(new Date(), 'EEE, MMM d');

  const handleShare = async () => {
    const text = `📊 My Nuviora Stats — ${day}\n🔥 Streak: ${streak} days\n✅ Today: ${todayPct}% habits done\n⚡ Level ${level} · ${xp} XP\n\nTracking habits with Nuviora 🚀`;
    if (navigator.share) {
      try { await navigator.share({ title: 'My Nuviora Stats', text }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(text);
      alert('Stats copied to clipboard! Paste it anywhere.');
    } catch {}
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 bg-gradient-to-r from-primary/10 to-violet-500/10 border border-primary/20 rounded-xl px-4 py-3 hover:from-primary/15 hover:to-violet-500/15 transition-colors text-left"
      >
        <Share2 className="h-4 w-4 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Share My Stats</p>
          <p className="text-xs text-muted-foreground">Widget-style card · Perfect for WhatsApp status</p>
        </div>
        <div className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">{todayPct}%</div>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              className="fixed inset-x-6 top-[8%] z-50 max-w-sm mx-auto"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-white text-sm font-semibold">Your Stats Widget</p>
                  <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* The widget card itself */}
                <div
                  ref={widgetRef}
                  className="rounded-3xl overflow-hidden shadow-2xl"
                  style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
                >
                  <div className="p-5">
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-white/50 text-xs font-medium uppercase tracking-widest">Nuviora</p>
                        <p className="text-white text-lg font-bold mt-0.5">{profile?.name || 'Student'}</p>
                        <p className="text-white/40 text-xs">{day}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/40 text-xs uppercase tracking-wide">Level</p>
                        <p className="text-white text-2xl font-black">{level}</p>
                      </div>
                    </div>

                    {/* Big completion ring */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative w-20 h-20">
                        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                          <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                          <circle
                            cx="40" cy="40" r="34" fill="none"
                            stroke={todayPct === 100 ? '#10B981' : '#C08552'}
                            strokeWidth="6" strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 34}`}
                            strokeDashoffset={`${2 * Math.PI * 34 * (1 - todayPct / 100)}`}
                            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <p className="text-white text-xl font-black">{todayPct}%</p>
                          <p className="text-white/40 text-[8px]">Today</p>
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="bg-white/5 rounded-xl px-3 py-2 flex items-center gap-2">
                          <Flame className="h-4 w-4 text-orange-400" />
                          <div>
                            <p className="text-white text-sm font-bold">{streak} days</p>
                            <p className="text-white/40 text-xs">Streak</p>
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-xl px-3 py-2 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-400" />
                          <div>
                            <p className="text-white text-sm font-bold">{xp.toLocaleString()} XP</p>
                            <p className="text-white/40 text-xs">Total XP</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Habits done */}
                    <div className="bg-white/5 rounded-xl px-3 py-2.5 flex items-center gap-2 mb-3">
                      <Target className="h-4 w-4 text-primary" style={{ color: '#C08552' }} />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <p className="text-white/60 text-xs">Habits today</p>
                          <p className="text-white text-xs font-bold">{completedToday}/{totalHabits}</p>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${todayPct}%`,
                              backgroundColor: todayPct === 100 ? '#10B981' : '#C08552',
                              transition: 'width 0.8s ease-out',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Goal */}
                    {profile?.examGoal && (
                      <div className="text-center pt-1 pb-0.5">
                        <p className="text-white/30 text-xs font-medium uppercase tracking-widest">Goal</p>
                        <p className="text-white/60 text-xs font-medium mt-0.5">{profile.examGoal}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 font-semibold text-sm"
                  >
                    <Share2 className="h-4 w-4" />
                    Share Stats
                  </button>
                  <p className="text-center text-white/50 text-xs">Take a screenshot to save as wallpaper</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
