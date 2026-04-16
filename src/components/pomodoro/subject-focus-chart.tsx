'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart2, Clock } from 'lucide-react';

interface FocusSession {
  id: string;
  duration: number;
  notes: string | null;
  date: string;
  xpEarned: number;
}

interface SubjectStat {
  subject: string;
  minutes: number;
  sessions: number;
  color: string;
}

const SUBJECT_COLORS: Record<string, string> = {
  physics:    'bg-blue-500',
  chemistry:  'bg-emerald-500',
  maths:      'bg-violet-500',
  math:       'bg-violet-500',
  biology:    'bg-green-500',
  english:    'bg-amber-500',
  history:    'bg-orange-500',
  revision:   'bg-teal-500',
  'mock test':'bg-rose-500',
  default:    'bg-primary',
};

function getColor(subject: string): string {
  const key = subject.toLowerCase();
  for (const [k, v] of Object.entries(SUBJECT_COLORS)) {
    if (key.includes(k)) return v;
  }
  return SUBJECT_COLORS.default;
}

function parseSubject(notes: string | null): string {
  if (!notes) return 'General';
  const parts = notes.split(' — ');
  const raw = parts[0].trim();
  return raw.length > 0 ? raw : 'General';
}

const RANGE_OPTIONS = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
];

export function SubjectFocusChart() {
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(7);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/focus-sessions?days=${range}`);
        if (res.ok) {
          const data = await res.json();
          setSessions(Array.isArray(data) ? data : []);
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [range]);

  const stats = useMemo<SubjectStat[]>(() => {
    const map: Record<string, { minutes: number; sessions: number }> = {};
    for (const s of sessions) {
      const sub = parseSubject(s.notes);
      if (!map[sub]) map[sub] = { minutes: 0, sessions: 0 };
      map[sub].minutes += s.duration;
      map[sub].sessions += 1;
    }
    return Object.entries(map)
      .map(([subject, { minutes, sessions }]) => ({
        subject,
        minutes,
        sessions,
        color: getColor(subject),
      }))
      .sort((a, b) => b.minutes - a.minutes);
  }, [sessions]);

  const totalMinutes = useMemo(() => stats.reduce((a, s) => a + s.minutes, 0), [stats]);
  const maxMinutes = useMemo(() => (stats.length > 0 ? stats[0].minutes : 1), [stats]);

  const formatTime = (m: number) => {
    if (m < 60) return `${m}m`;
    return `${Math.floor(m / 60)}h ${m % 60 > 0 ? `${m % 60}m` : ''}`.trim();
  };

  if (loading) {
    return (
      <Card className="border-none shadow-sm rounded-xl bg-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Focus by Subject</p>
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 rounded-lg bg-muted/40 animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (stats.length === 0) {
    return (
      <Card className="border-none shadow-sm rounded-xl bg-card">
        <CardContent className="p-4 text-center">
          <BarChart2 className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No focus sessions yet.</p>
          <p className="text-xs text-muted-foreground mt-0.5">Start a Pomodoro and select a subject to see your breakdown here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm rounded-xl bg-card">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Focus by Subject</p>
          </div>
          <div className="flex gap-1 bg-muted/50 rounded-lg p-0.5">
            {RANGE_OPTIONS.map(opt => (
              <button
                key={opt.days}
                onClick={() => setRange(opt.days)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  range === opt.days
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Total summary */}
        <div className="flex items-center gap-2 mb-3 px-1">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{formatTime(totalMinutes)}</span> total across{' '}
            <span className="font-semibold text-foreground">{sessions.length}</span> session{sessions.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Subject bars */}
        <div className="space-y-3">
          {stats.map((stat, i) => {
            const pct = Math.max(6, Math.round((stat.minutes / maxMinutes) * 100));
            return (
              <motion.div
                key={stat.subject}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground">{stat.subject}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{stat.sessions} session{stat.sessions !== 1 ? 's' : ''}</span>
                    <span className="text-xs font-semibold text-foreground tabular-nums">{formatTime(stat.minutes)}</span>
                  </div>
                </div>
                <div className="h-2.5 w-full bg-muted/40 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${stat.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Percentage breakdown */}
        {totalMinutes > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-border/30">
            {stats.slice(0, 5).map(stat => (
              <div
                key={stat.subject}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50 text-xs font-medium"
              >
                <div className={`w-1.5 h-1.5 rounded-full ${stat.color}`} />
                <span>{stat.subject}</span>
                <span className="text-muted-foreground">{Math.round((stat.minutes / totalMinutes) * 100)}%</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
