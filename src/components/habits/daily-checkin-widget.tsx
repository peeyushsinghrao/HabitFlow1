'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Flame, CheckCircle2, Zap } from 'lucide-react';

interface CheckInData {
  id: string;
  date: string;
  coinsEarned: number;
  checkInStreak: number;
}

export function DailyCheckInWidget() {
  const [checkin, setCheckin] = useState<CheckInData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [justCheckedIn, setJustCheckedIn] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/checkin');
      const data = await res.json();
      setCheckin(data.checkin ?? null);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleCheckIn = async () => {
    if (checking || checkin) return;
    setChecking(true);
    try {
      const res = await fetch('/api/checkin', { method: 'POST' });
      const data = await res.json();
      if (!data.alreadyDone) {
        setEarnedCoins(data.coinsEarned);
        setJustCheckedIn(true);
        setTimeout(() => setJustCheckedIn(false), 3000);
      }
      setCheckin(data.checkin);
    } catch {
    } finally {
      setChecking(false);
    }
  };

  if (loading) return null;

  const isDone = !!checkin;
  const streak = checkin?.checkInStreak ?? 0;
  const nextCoins = Math.min(10 + streak * 5, 50);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-200/60 dark:border-amber-500/20 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 p-3.5">
      <div className="absolute -top-6 -right-6 w-20 h-20 bg-amber-300/20 rounded-full pointer-events-none" />

      <div className="flex items-center gap-3 relative">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDone ? 'bg-amber-400/20' : 'bg-amber-400/30'}`}>
          {isDone ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
              <CheckCircle2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </motion.div>
          ) : (
            <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {isDone ? (
            <div>
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                Checked in! +{checkin!.coinsEarned} coins
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Flame className="h-3 w-3 text-orange-500" />
                <p className="text-xs text-amber-700/80 dark:text-amber-400/70">
                  Day {streak} streak — come back tomorrow for +{Math.min(10 + streak * 5, 50)} coins!
                </p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Daily Check-in</p>
              <p className="text-xs text-amber-700/70 dark:text-amber-400/60 mt-0.5">
                Log 1 thing today → earn +{nextCoins} coins
                {streak > 0 && <span className="ml-1">🔥 Day {streak + 1}</span>}
              </p>
            </div>
          )}
        </div>

        {!isDone ? (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleCheckIn}
            disabled={checking}
            className="flex-shrink-0 flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
          >
            <Coins className="h-3 w-3" />
            Check In
          </motion.button>
        ) : (
          <div className="flex-shrink-0 flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 rounded-xl px-2.5 py-1.5">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">✓ Done</span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {justCheckedIn && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute inset-0 flex items-center justify-center rounded-2xl bg-amber-400/90 dark:bg-amber-500/90 pointer-events-none z-10"
          >
            <div className="text-center">
              <div className="text-2xl mb-1">🪙</div>
              <p className="text-white font-black text-base">+{earnedCoins} coins!</p>
              <p className="text-white/80 text-xs">Day {checkin?.checkInStreak} streak</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
