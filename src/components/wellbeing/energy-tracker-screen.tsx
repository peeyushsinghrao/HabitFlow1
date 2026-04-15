'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Zap, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface EnergyLog {
  id: string;
  date: string;
  morning: number;
  evening: number;
}

const LEVELS = [
  { value: 1, emoji: '😴', label: 'Drained' },
  { value: 2, emoji: '😐', label: 'Low' },
  { value: 3, emoji: '😊', label: 'Okay' },
  { value: 4, emoji: '⚡', label: 'Good' },
  { value: 5, emoji: '🚀', label: 'Energised' },
];

export function EnergyTrackerScreen() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [morning, setMorning] = useState(3);
  const [evening, setEvening] = useState(3);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<EnergyLog[]>([]);

  useEffect(() => {
    fetch(`/api/energy?date=${today}`)
      .then(r => r.json())
      .then(data => {
        if (data.log) { setMorning(data.log.morning); setEvening(data.log.evening); }
        setHistory(data.history || []);
      })
      .catch(() => {});
  }, [today]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/energy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today, morning, evening }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setIsSaving(false);
  };

  const chartData = history.slice(0, 14).reverse().map(h => ({
    date: format(new Date(h.date + 'T12:00:00'), 'MMM d'),
    morning: h.morning,
    evening: h.evening,
  }));

  const avgMorning = history.length ? (history.reduce((a, h) => a + h.morning, 0) / history.length).toFixed(1) : '—';
  const avgEvening = history.length ? (history.reduce((a, h) => a + h.evening, 0) / history.length).toFixed(1) : '—';

  return (
    <div className="space-y-4 pt-2 pb-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center shadow-sm">
            <Zap className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-base font-bold leading-tight tracking-tight">Energy Tracker</h2>
<<<<<<< HEAD
            <p className="text-[10px] text-muted-foreground font-medium">Log morning &amp; evening energy</p>
          </div>
        </div>
        <span className="text-[11px] text-muted-foreground font-medium bg-muted/50 px-2.5 py-1 rounded-full">{format(new Date(), 'MMM d')}</span>
=======
            <p className="text-xs text-muted-foreground font-medium">Log morning &amp; evening energy</p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground font-medium bg-muted/50 px-2.5 py-1 rounded-full">{format(new Date(), 'MMM d')}</span>
>>>>>>> 925ef42 (Initial commit)
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: '☀️ Morning', value: morning, set: setMorning },
          { label: '🌙 Evening', value: evening, set: setEvening },
        ].map(({ label, value, set }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border/40 shadow-card p-4"
          >
            <p className="text-xs font-semibold mb-3 tracking-tight">{label}</p>
            <div className="flex justify-center mb-2">
              <span className="text-4xl">{LEVELS.find(l => l.value === value)?.emoji}</span>
            </div>
            <p className="text-center text-xs text-muted-foreground mb-3 font-medium">{LEVELS.find(l => l.value === value)?.label}</p>
            <div className="flex gap-1 justify-center">
              {LEVELS.map(l => (
                <button
                  key={l.value}
                  onClick={() => set(l.value)}
                  className={`w-8 h-8 rounded-full text-lg transition-all active:scale-90 ${value === l.value ? 'scale-125 ring-2 ring-primary/30' : 'opacity-50 hover:opacity-80'}`}
                >
                  {l.emoji}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="w-full rounded-xl h-11 font-semibold">
        {saved ? '✅ Saved!' : isSaving ? 'Saving...' : "Save Today's Energy"}
      </Button>

      {history.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border/40 shadow-card p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
            </div>
            <p className="text-sm font-semibold tracking-tight">Energy Trends</p>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3 text-center border border-amber-200/40 dark:border-amber-500/20">
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{avgMorning}</p>
<<<<<<< HEAD
              <p className="text-[10px] text-muted-foreground font-medium">Avg Morning</p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-200/40 dark:border-indigo-500/20">
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{avgEvening}</p>
              <p className="text-[10px] text-muted-foreground font-medium">Avg Evening</p>
=======
              <p className="text-xs text-muted-foreground font-medium">Avg Morning</p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-200/40 dark:border-indigo-500/20">
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{avgEvening}</p>
              <p className="text-xs text-muted-foreground font-medium">Avg Evening</p>
>>>>>>> 925ef42 (Initial commit)
            </div>
          </div>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                <YAxis domain={[1, 5]} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} ticks={[1, 2, 3, 4, 5]} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)' }}
                  formatter={(v: number, name: string) => [LEVELS.find(l => l.value === v)?.label || v, name === 'morning' ? '☀️ Morning' : '🌙 Evening']}
                />
                <Area type="monotone" dataKey="morning" stroke="#f59e0b" fill="#fef3c7" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="evening" stroke="#6366f1" fill="#e0e7ff" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
}
