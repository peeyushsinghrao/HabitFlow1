'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, Moon, Sun, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, parseISO } from 'date-fns';

interface SleepLog {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  duration: number;
  quality: number;
  notes: string;
}

const QUALITY_LABELS = ['', '😴 Poor', '😔 Fair', '😐 Okay', '😊 Good', '🌟 Great'];
const QUALITY_COLORS = ['', 'bg-red-100 text-red-700', 'bg-orange-100 text-orange-700', 'bg-amber-100 text-amber-700', 'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700'];

export function SleepTrackerScreen() {
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [bedtime, setBedtime] = useState('22:30');
  const [wakeTime, setWakeTime] = useState('06:30');
  const [quality, setQuality] = useState(4);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/sleep');
      if (res.ok) setLogs(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleSave = async () => {
    if (!bedtime || !wakeTime) return;
    setSaving(true);
    try {
      const res = await fetch('/api/sleep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, bedtime, wakeTime, quality, notes }),
      });
      if (res.ok) {
        fetchLogs();
        setShowAdd(false);
        setNotes('');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/sleep?id=${id}`, { method: 'DELETE' });
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  const avgDuration = logs.length ? Math.round(logs.reduce((s, l) => s + l.duration, 0) / logs.length * 10) / 10 : 0;
  const avgQuality = logs.length ? Math.round(logs.reduce((s, l) => s + l.quality, 0) / logs.length * 10) / 10 : 0;

  const chartData = logs.slice().reverse().slice(-14).map(l => ({
    date: format(parseISO(l.date), 'dd/MM'),
    hours: l.duration,
    quality: l.quality,
  }));

  const exportCSV = async () => {
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'sleep' }),
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'sleep.csv'; a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-4 pt-2 pb-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-500/15 flex items-center justify-center shadow-sm">
            <Moon className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-base font-bold leading-tight tracking-tight">Sleep Tracker</h2>
<<<<<<< HEAD
            <p className="text-[10px] text-muted-foreground font-medium">Track rest for better focus</p>
=======
            <p className="text-xs text-muted-foreground font-medium">Track rest for better focus</p>
>>>>>>> 925ef42 (Initial commit)
          </div>
        </div>
        <div className="flex gap-2">
          {logs.length > 0 && (
            <Button size="sm" variant="outline" onClick={exportCSV} className="rounded-xl h-9 px-3 text-xs">
              CSV
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => setShowAdd(true)}
            className="rounded-xl h-9 px-3.5 gap-1.5 text-xs shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" /> Log Sleep
          </Button>
        </div>
      </motion.div>

      {/* Add Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="bg-card rounded-2xl border border-border/40 shadow-card p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-500/15 flex items-center justify-center">
                  <Moon className="h-3.5 w-3.5 text-indigo-500" />
                </div>
                <p className="text-sm font-semibold tracking-tight">Log Sleep</p>
              </div>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl text-sm bg-muted/50 border border-border/60 text-foreground input-premium"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
<<<<<<< HEAD
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1"><Moon className="h-3 w-3" /> Bedtime</p>
=======
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1"><Moon className="h-3 w-3" /> Bedtime</p>
>>>>>>> 925ef42 (Initial commit)
                  <input
                    type="time"
                    value={bedtime}
                    onChange={e => setBedtime(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl text-sm bg-muted/50 border border-border/60 text-foreground input-premium"
                  />
                </div>
                <div>
<<<<<<< HEAD
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1"><Sun className="h-3 w-3" /> Wake time</p>
=======
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1"><Sun className="h-3 w-3" /> Wake time</p>
>>>>>>> 925ef42 (Initial commit)
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={e => setWakeTime(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl text-sm bg-muted/50 border border-border/60 text-foreground input-premium"
                  />
                </div>
              </div>
              <div>
<<<<<<< HEAD
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Sleep quality</p>
=======
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Sleep quality</p>
>>>>>>> 925ef42 (Initial commit)
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(q => (
                    <button
                      key={q}
                      onClick={() => setQuality(q)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                        quality === q ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-border/40'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
              <input
                className="w-full h-10 px-3 rounded-xl text-sm bg-muted/50 border border-border/60 text-foreground placeholder:text-muted-foreground/50 input-premium"
                placeholder="Notes (optional)..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowAdd(false)} className="flex-1 rounded-xl h-10">Cancel</Button>
                <Button size="sm" onClick={handleSave} disabled={saving} className="flex-1 rounded-xl h-10">
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats row */}
      {logs.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-primary">{avgDuration}h</p>
<<<<<<< HEAD
            <p className="text-[10px] text-muted-foreground">Avg sleep</p>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{avgQuality}/5</p>
            <p className="text-[10px] text-muted-foreground">Avg quality</p>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{logs.length}</p>
            <p className="text-[10px] text-muted-foreground">Nights logged</p>
=======
            <p className="text-xs text-muted-foreground">Avg sleep</p>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{avgQuality}/5</p>
            <p className="text-xs text-muted-foreground">Avg quality</p>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{logs.length}</p>
            <p className="text-xs text-muted-foreground">Nights logged</p>
>>>>>>> 925ef42 (Initial commit)
          </div>
        </div>
      )}

      {/* Sleep chart */}
      {chartData.length > 1 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border/40 shadow-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-500/15 flex items-center justify-center">
                <Moon className="h-3.5 w-3.5 text-indigo-500" />
              </div>
              <p className="text-sm font-semibold tracking-tight">Sleep Duration</p>
<<<<<<< HEAD
              <span className="ml-auto text-[10px] text-muted-foreground">last 14 nights</span>
=======
              <span className="ml-auto text-xs text-muted-foreground">last 14 nights</span>
>>>>>>> 925ef42 (Initial commit)
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} domain={[0, 12]} axisLine={false} tickLine={false} unit="h" />
                  <Tooltip formatter={(v) => `${v}h`} />
                  <ReferenceLine y={8} stroke="var(--primary)" strokeDasharray="3 3" opacity={0.4} label={{ value: '8h goal', fontSize: 9, fill: 'var(--muted-foreground)' }} />
                  <Bar dataKey="hours" fill="var(--primary)" radius={[4, 4, 0, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
        </motion.div>
      )}

      {/* Log list */}
      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-2xl bg-muted/40 animate-pulse" />)}
        </div>
      ) : logs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border/40 shadow-card p-8 text-center"
        >
          <div className="text-4xl mb-3">😴</div>
          <p className="text-sm font-semibold text-foreground">No sleep logged yet</p>
          <p className="text-xs text-muted-foreground mt-1">Track your sleep to optimise focus and energy</p>
        </motion.div>
      ) : (
        <div className="space-y-2.5">
          {logs.map((log, idx) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-card rounded-2xl border border-border/40 shadow-card p-3.5 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
                <Moon className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-foreground">{log.date}</p>
<<<<<<< HEAD
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${QUALITY_COLORS[log.quality]}`}>
=======
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${QUALITY_COLORS[log.quality]}`}>
>>>>>>> 925ef42 (Initial commit)
                    {QUALITY_LABELS[log.quality]}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                  <span>{log.bedtime} → {log.wakeTime}</span>
                  <span className="font-semibold text-foreground">{log.duration}h</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(log.id)}
                className="p-1.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors press-effect"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
