'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Timer, Play, Pause, RotateCcw, BookOpen, Plus } from 'lucide-react';

interface SubjectTotal { subject: string; minutes: number; }
interface TopicTotal { subject: string; topic: string; minutes: number; }

const SUBJECTS = ['Physics', 'Chemistry', 'Maths', 'Biology', 'English', 'History', 'Geography', 'Commerce', 'Economics', 'Other'];

function fmt(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function fmtSec(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return h > 0
    ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function TopicTimerScreen() {
  const [subject, setSubject] = useState('Physics');
  const [topic, setTopic] = useState('');
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [bySubject, setBySubject] = useState<SubjectTotal[]>([]);
  const [byTopic, setByTopic] = useState<TopicTotal[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/topic-timer');
      if (res.ok) {
        const data = await res.json();
        setBySubject(data.bySubject || []);
        setByTopic(data.bySubjectTopic || []);
      }
    } catch {}
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const handleStop = async () => {
    setRunning(false);
    if (elapsed < 60) return;
    setIsSaving(true);
    try {
      const mins = Math.floor(elapsed / 60);
      await fetch('/api/topic-timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, topic, minutes: mins, date: format(new Date(), 'yyyy-MM-dd') }),
      });
      await fetchData();
      setElapsed(0);
    } catch {}
    setIsSaving(false);
  };

  const maxMin = Math.max(...bySubject.map(s => s.minutes), 1);

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-2">
        <Timer className="h-5 w-5 text-primary" />
        <h2 className="text-base font-bold">Topic Timer</h2>
        <span className="ml-auto text-xs text-muted-foreground">Track hours per subject</span>
      </div>

      <Card className="border border-border/40 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Subject</p>
              <Select value={subject} onValueChange={setSubject} disabled={running}>
                <SelectTrigger className="rounded-xl h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Topic (optional)</p>
              <Input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Thermodynamics"
                className="rounded-xl h-9 text-sm"
                disabled={running}
              />
            </div>
          </div>

          <div className="flex flex-col items-center py-4">
            <motion.div
              className={`text-5xl font-mono font-bold ${running ? 'text-primary' : 'text-foreground/60'}`}
              animate={running ? { scale: [1, 1.02, 1] } : { scale: 1 }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {fmtSec(elapsed)}
            </motion.div>
            <p className="text-xs text-muted-foreground mt-1">
              {running ? `Studying ${subject}${topic ? ` • ${topic}` : ''}` : 'Timer paused'}
            </p>
          </div>

          <div className="flex gap-2">
            {!running ? (
              <Button className="flex-1 rounded-xl h-10" onClick={() => setRunning(true)}>
                <Play className="h-4 w-4 mr-2" /> Start
              </Button>
            ) : (
              <Button className="flex-1 rounded-xl h-10" variant="outline" onClick={() => setRunning(false)}>
                <Pause className="h-4 w-4 mr-2" /> Pause
              </Button>
            )}
            <Button
              variant="outline"
              className="rounded-xl h-10 px-4"
              onClick={running ? handleStop : () => setElapsed(0)}
              disabled={isSaving}
            >
              {running ? (isSaving ? '...' : 'Log & Stop') : <RotateCcw className="h-4 w-4" />}
            </Button>
          </div>
          {elapsed > 0 && elapsed < 60 && !running && (
            <p className="text-xs text-muted-foreground text-center">Sessions under 1 minute won't be logged</p>
          )}
        </CardContent>
      </Card>

      {bySubject.length > 0 && (
        <Card className="border border-border/40 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">Total Time by Subject</p>
            </div>
            <div className="space-y-2.5">
              {bySubject.sort((a, b) => b.minutes - a.minutes).map(s => (
                <div key={s.subject}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{s.subject}</span>
                    <span className="text-muted-foreground">{fmt(s.minutes)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.minutes / maxMin) * 100}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {byTopic.filter(t => t.topic).length > 0 && (
        <Card className="border border-border/40 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-3">By Topic</p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {byTopic.filter(t => t.topic).sort((a, b) => b.minutes - a.minutes).map((t, i) => (
                <div key={i} className="flex items-center justify-between text-xs bg-muted/40 rounded-lg px-3 py-2">
                  <span>{t.subject} • {t.topic}</span>
                  <span className="font-semibold text-primary">{fmt(t.minutes)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
