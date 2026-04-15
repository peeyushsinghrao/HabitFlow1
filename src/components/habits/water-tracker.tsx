'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Plus, Minus, Settings2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

export function WaterTracker() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [glasses, setGlasses] = useState(0);
  const [goal, setGoal] = useState(8);
  const [goalInput, setGoalInput] = useState('8');
  const [isLoading, setIsLoading] = useState(true);
  const confirmedGlassesRef = useRef(0);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [waterRes, profileRes] = await Promise.all([
        fetch(`/api/water?date=${today}`),
        fetch('/api/profile'),
      ]);
      if (waterRes.ok) {
        const water = await waterRes.json();
        const g = water.glasses || 0;
        setGlasses(g);
        confirmedGlassesRef.current = g;
      }
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setGoal(profile.waterGoal || 8);
        setGoalInput(String(profile.waterGoal || 8));
      }
    } catch {}
    setIsLoading(false);
  }, [today]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const syncGlasses = useCallback((newGlasses: number) => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      fetch('/api/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today, glasses: newGlasses }),
      })
        .then(res => {
          if (res.ok) {
            confirmedGlassesRef.current = newGlasses;
          } else {
            setGlasses(confirmedGlassesRef.current);
          }
        })
        .catch(() => {
          setGlasses(confirmedGlassesRef.current);
        });
    }, 300);
  }, [today]);

  const add = () => {
    const next = Math.min(glasses + 1, 20);
    setGlasses(next);
    syncGlasses(next);
  };

  const remove = () => {
    const next = Math.max(glasses - 1, 0);
    setGlasses(next);
    syncGlasses(next);
  };

  const saveGoal = async () => {
    const newGoal = Math.max(1, Math.min(20, parseInt(goalInput) || 8));
    setGoal(newGoal);
    setGoalInput(String(newGoal));
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waterGoal: newGoal }),
      });
    } catch {}
  };

  const percent = Math.min((glasses / goal) * 100, 100);
  const isDone = glasses >= goal;

  if (isLoading) {
    return (
<<<<<<< HEAD
      <Card className="border-0 shadow-sm">
=======
      <Card className="border border-border/40 shadow-sm">
>>>>>>> 925ef42 (Initial commit)
        <CardContent className="p-4">
          <div className="h-16 bg-muted animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
<<<<<<< HEAD
    <Card className="border-0 shadow-sm overflow-hidden">
=======
    <Card className="border border-border/40 shadow-sm overflow-hidden">
>>>>>>> 925ef42 (Initial commit)
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-14 flex-shrink-0">
            <div className="w-full h-full border-2 border-blue-300 dark:border-blue-700 rounded-b-lg rounded-t-sm overflow-hidden bg-blue-50 dark:bg-blue-950/30">
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-400"
                initial={{ height: 0 }}
                animate={{ height: `${percent}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Droplets className={`h-5 w-5 ${isDone ? 'text-white' : 'text-blue-400'} drop-shadow`} />
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold">
                Water Intake
                {isDone && (
                  <AnimatePresence>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-1.5 text-xs"
                    >
                      ✅
                    </motion.span>
                  </AnimatePresence>
                )}
              </p>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                    <Settings2 className="h-3.5 w-3.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 rounded-xl p-3" align="end">
                  <p className="text-xs font-medium mb-2">Daily Goal (glasses)</p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={goalInput}
                      onChange={e => setGoalInput(e.target.value)}
                      className="h-8 text-sm rounded-lg"
                      min={1}
                      max={20}
                    />
                    <Button size="sm" className="h-8 px-2 rounded-lg text-xs" onClick={saveGoal}>
                      Save
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-1.5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-500"
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
<<<<<<< HEAD
            <p className="text-[11px] text-muted-foreground">
=======
            <p className="text-xs text-muted-foreground">
>>>>>>> 925ef42 (Initial commit)
              {glasses} of {goal} glasses{isDone ? ' — goal reached! 💧' : ''}
            </p>
          </div>

          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <button
              onClick={add}
              disabled={glasses >= 20}
              className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors disabled:opacity-30"
            >
              <Plus className="h-4 w-4" />
            </button>
            <motion.span
              key={glasses}
              initial={{ scale: 1.3, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="text-base font-bold text-blue-600 dark:text-blue-400"
            >
              {glasses}
            </motion.span>
            <button
              onClick={remove}
              disabled={glasses === 0}
              className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors disabled:opacity-30"
            >
              <Minus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
