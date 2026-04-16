'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, CloudRain, CloudDrizzle, Cloud, Sun, Sparkles } from 'lucide-react';

const MOODS = [
  {
    value: 1,
    Icon: CloudRain,
    label: 'Rough',
    iconColor: 'text-blue-500',
    color: 'text-blue-500',
    bg: 'bg-blue-100 dark:bg-blue-900/40',
  },
  {
    value: 2,
    Icon: CloudDrizzle,
    label: 'Meh',
    iconColor: 'text-orange-400',
    color: 'text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-900/40',
  },
  {
    value: 3,
    Icon: Cloud,
    label: 'Okay',
    iconColor: 'text-yellow-500',
    color: 'text-yellow-500',
    bg: 'bg-yellow-100 dark:bg-yellow-900/40',
  },
  {
    value: 4,
    Icon: Sun,
    label: 'Good',
    iconColor: 'text-green-500',
    color: 'text-green-500',
    bg: 'bg-green-100 dark:bg-green-900/40',
  },
  {
    value: 5,
    Icon: Sparkles,
    label: 'Amazing',
    iconColor: 'text-purple-500',
    color: 'text-purple-500',
    bg: 'bg-purple-100 dark:bg-purple-900/40',
  },
];

export function MoodTracker() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchMood = useCallback(async () => {
    try {
      const res = await fetch(`/api/mood?days=1`);
      if (res.ok) {
        const data = await res.json();
        const todayLog = data.find((m: { date: string; mood: number }) => m.date === today);
        if (todayLog) setCurrentMood(todayLog.mood);
      }
    } catch {}
    setIsLoading(false);
  }, [today]);

  useEffect(() => { fetchMood(); }, [fetchMood]);

  const saveMood = async (mood: number) => {
    setCurrentMood(mood);
    setIsSaving(true);
    try {
      await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today, mood }),
      });
    } catch {}
    setIsSaving(false);
  };

  const selected = MOODS.find(m => m.value === currentMood);

  return (
    <Card className="border border-border/40 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-400" />
            <p className="text-sm font-semibold">How are you feeling?</p>
          </div>
          <AnimatePresence>
            {selected && (
              <motion.div
                key={selected.value}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${selected.bg} ${selected.color}`}
              >
                {selected.label}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between gap-1">
          {MOODS.map(mood => (
            <motion.button
              key={mood.value}
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => !isSaving && saveMood(mood.value)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${
                currentMood === mood.value
                  ? `${mood.bg} ring-2 ring-offset-1 ring-primary/50 shadow-sm`
                  : 'hover:bg-muted/60'
              }`}
            >
              <span className={`text-2xl transition-all ${currentMood === mood.value ? 'scale-110' : ''}`}>
                {mood.emoji}
              </span>
              <span className={`text-xs font-medium ${currentMood === mood.value ? mood.color : 'text-muted-foreground/60'}`}>
                {mood.label}
              </span>
            </motion.button>
          ))}
          {MOODS.map(mood => {
            const MoodIcon = mood.Icon;
            const isSelected = currentMood === mood.value;
            return (
              <motion.button
                key={mood.value}
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.1 }}
                onClick={() => !isSaving && saveMood(mood.value)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all ${
                  isSelected
                    ? `${mood.bg} ring-2 ring-offset-1 ring-primary/50 shadow-sm`
                    : 'hover:bg-muted/60'
                }`}
              >
                <motion.div
                  animate={isSelected ? { scale: 1.2 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <MoodIcon
                    className={`h-6 w-6 transition-colors ${isSelected ? mood.iconColor : 'text-muted-foreground/50'}`}
                    strokeWidth={isSelected ? 2.2 : 1.6}
                  />
                </motion.div>
                <span className={`text-[9px] font-semibold leading-none ${isSelected ? mood.color : 'text-muted-foreground/60'}`}>
                  {mood.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {isLoading && (
          <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-primary/30 animate-pulse rounded-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
