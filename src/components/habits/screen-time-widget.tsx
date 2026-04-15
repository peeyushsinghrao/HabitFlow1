'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Smartphone, BookOpen, Check } from 'lucide-react';

interface ScreenLog { phoneGoalMins: number; phoneActualMins: number; studyGoalMins: number; studyActualMins: number; }

function TimeInput({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex items-center gap-1">
<<<<<<< HEAD
      <span className="text-[10px] text-muted-foreground w-8">{label}</span>
=======
      <span className="text-xs text-muted-foreground w-8">{label}</span>
>>>>>>> 925ef42 (Initial commit)
      <input
        type="number"
        min={0}
        max={1440}
        value={value}
        onChange={e => onChange(Math.max(0, parseInt(e.target.value) || 0))}
        className="w-14 h-7 rounded-lg border border-input bg-background px-1.5 text-xs text-center"
      />
<<<<<<< HEAD
      <span className="text-[10px] text-muted-foreground">min</span>
=======
      <span className="text-xs text-muted-foreground">min</span>
>>>>>>> 925ef42 (Initial commit)
    </div>
  );
}

export function ScreenTimeWidget() {
  const [log, setLog] = useState<ScreenLog>({ phoneGoalMins: 120, phoneActualMins: 0, studyGoalMins: 360, studyActualMins: 0 });
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/screen-time').then(r => r.json()).then(data => {
      if (data) setLog({ phoneGoalMins: data.phoneGoalMins, phoneActualMins: data.phoneActualMins, studyGoalMins: data.studyGoalMins, studyActualMins: data.studyActualMins });
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      await fetch('/api/screen-time', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(log) });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ }
  };

  const phoneRatio = log.phoneGoalMins > 0 ? Math.min(1, log.phoneActualMins / log.phoneGoalMins) : 0;
  const studyRatio = log.studyGoalMins > 0 ? Math.min(1, log.studyActualMins / log.studyGoalMins) : 0;
  const phoneOver = log.phoneActualMins > log.phoneGoalMins;
  const studyGood = log.studyActualMins >= log.studyGoalMins;

  return (
<<<<<<< HEAD
    <Card className="border-0 shadow-sm">
=======
    <Card className="border border-border/40 shadow-sm">
>>>>>>> 925ef42 (Initial commit)
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Screen vs Study Time</p>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
<<<<<<< HEAD
            className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1"
=======
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
>>>>>>> 925ef42 (Initial commit)
          >
            {saved ? <><Check className="h-3 w-3 text-emerald-500" /> Saved!</> : editing ? 'Save' : 'Update'}
          </button>
        </div>

        <div className="space-y-3">
          {/* Phone time */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Smartphone className={`h-3.5 w-3.5 ${phoneOver ? 'text-rose-500' : 'text-muted-foreground'}`} />
                <span className="text-xs font-medium">Phone Time</span>
              </div>
              <span className={`text-xs font-bold ${phoneOver ? 'text-rose-500' : 'text-muted-foreground'}`}>
                {log.phoneActualMins}m / {log.phoneGoalMins}m limit
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${phoneOver ? 'bg-rose-500' : 'bg-amber-400'}`}
                animate={{ width: `${Math.min(100, phoneRatio * 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
<<<<<<< HEAD
            {phoneOver && <p className="text-[10px] text-rose-500 mt-0.5">⚠️ {log.phoneActualMins - log.phoneGoalMins}min over limit</p>}
=======
            {phoneOver && <p className="text-xs text-rose-500 mt-0.5">⚠️ {log.phoneActualMins - log.phoneGoalMins}min over limit</p>}
>>>>>>> 925ef42 (Initial commit)
          </div>

          {/* Study time */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <BookOpen className={`h-3.5 w-3.5 ${studyGood ? 'text-emerald-500' : 'text-primary'}`} />
                <span className="text-xs font-medium">Study Time</span>
              </div>
              <span className={`text-xs font-bold ${studyGood ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                {log.studyActualMins}m / {log.studyGoalMins}m goal
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${studyGood ? 'bg-emerald-500' : 'bg-primary'}`}
                animate={{ width: `${Math.min(100, studyRatio * 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
<<<<<<< HEAD
            {studyGood && <p className="text-[10px] text-emerald-500 mt-0.5">🎯 Daily goal reached!</p>}
=======
            {studyGood && <p className="text-xs text-emerald-500 mt-0.5">🎯 Daily goal reached!</p>}
>>>>>>> 925ef42 (Initial commit)
          </div>

          {editing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2 border-t border-border/30 space-y-2">
<<<<<<< HEAD
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Update Today's Actual</p>
=======
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Update Today's Actual</p>
>>>>>>> 925ef42 (Initial commit)
              <div className="grid grid-cols-2 gap-2">
                <TimeInput value={log.phoneActualMins} onChange={v => setLog(l => ({ ...l, phoneActualMins: v }))} label="📱" />
                <TimeInput value={log.studyActualMins} onChange={v => setLog(l => ({ ...l, studyActualMins: v }))} label="📚" />
              </div>
<<<<<<< HEAD
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Goals</p>
=======
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Goals</p>
>>>>>>> 925ef42 (Initial commit)
              <div className="grid grid-cols-2 gap-2">
                <TimeInput value={log.phoneGoalMins} onChange={v => setLog(l => ({ ...l, phoneGoalMins: v }))} label="📱 max" />
                <TimeInput value={log.studyGoalMins} onChange={v => setLog(l => ({ ...l, studyGoalMins: v }))} label="📚 goal" />
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
