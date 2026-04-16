'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, TrendingUp, ClipboardList } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MockTest {
  id: string;
  date: string;
  testName: string;
  subject: string;
  score: number;
  totalMarks: number;
  timeTaken: number;
  mistakes: string;
  notes: string;
}

export function MockTestScreen() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [testName, setTestName] = useState('');
  const [subject, setSubject] = useState('');
  const [score, setScore] = useState('');
  const [totalMarks, setTotalMarks] = useState('100');
  const [timeTaken, setTimeTaken] = useState('180');
  const [mistakes, setMistakes] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('All');

  const fetchTests = useCallback(async () => {
    try {
      const res = await fetch('/api/mock-tests');
      if (res.ok) setTests(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTests(); }, [fetchTests]);

  const handleAdd = async () => {
    if (!testName.trim() || !score) return;
    setSaving(true);
    try {
      const res = await fetch('/api/mock-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testName, subject, score, totalMarks, timeTaken, mistakes, notes }),
      });
      if (res.ok) {
        const t = await res.json();
        setTests(prev => [t, ...prev]);
        setTestName(''); setSubject(''); setScore(''); setMistakes(''); setNotes('');
        setShowAdd(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/mock-tests?id=${id}`, { method: 'DELETE' });
    setTests(prev => prev.filter(t => t.id !== id));
  };

  const subjects = ['All', ...Array.from(new Set(tests.map(t => t.subject).filter(Boolean)))];
  const filtered = selectedSubject === 'All' ? tests : tests.filter(t => t.subject === selectedSubject);

  const chartData = filtered.slice().reverse().slice(-10).map(t => ({
    name: t.testName.substring(0, 6),
    pct: Math.round((t.score / t.totalMarks) * 100),
    date: t.date,
  }));

  const avgPct = filtered.length ? Math.round(filtered.reduce((s, t) => s + (t.score / t.totalMarks) * 100, 0) / filtered.length) : 0;
  const bestPct = filtered.length ? Math.round(Math.max(...filtered.map(t => (t.score / t.totalMarks) * 100))) : 0;

  const getGradeColor = (pct: number) => {
    if (pct >= 90) return 'text-emerald-500';
    if (pct >= 75) return 'text-blue-500';
    if (pct >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const exportCSV = async () => {
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'mock-tests' }),
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'mock-tests.csv'; a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Mock Test Log
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">{tests.length} tests recorded</p>
        </div>
        <div className="flex gap-2">
          {tests.length > 0 && (
            <Button size="sm" variant="outline" onClick={exportCSV}>CSV</Button>
          )}
          <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add Test
          </Button>
        </div>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="border-primary/20">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-semibold">Log Mock Test</p>
                <input
                  className="w-full h-9 px-3 rounded-lg text-sm bg-muted/40 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Test name (e.g. JEE Mock #5)..."
                  value={testName}
                  onChange={e => setTestName(e.target.value)}
                />
                <input
                  className="w-full h-9 px-3 rounded-lg text-sm bg-muted/40 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Subject (optional)..."
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    className="h-9 px-3 rounded-lg text-sm bg-muted/40 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Score"
                    type="number"
                    value={score}
                    onChange={e => setScore(e.target.value)}
                  />
                  <input
                    className="h-9 px-3 rounded-lg text-sm bg-muted/40 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Total"
                    type="number"
                    value={totalMarks}
                    onChange={e => setTotalMarks(e.target.value)}
                  />
                  <input
                    className="h-9 px-3 rounded-lg text-sm bg-muted/40 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Mins"
                    type="number"
                    value={timeTaken}
                    onChange={e => setTimeTaken(e.target.value)}
                  />
                </div>
                <textarea
                  className="w-full p-3 rounded-xl text-sm bg-muted/40 border border-border resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Mistakes / weak areas..."
                  rows={2}
                  value={mistakes}
                  onChange={e => setMistakes(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowAdd(false)} className="flex-1">Cancel</Button>
                  <Button size="sm" onClick={handleAdd} disabled={saving} className="flex-1">
                    {saving ? 'Saving...' : 'Save Test'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats row */}
      {tests.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
            <p className={`text-2xl font-bold ${getGradeColor(avgPct)}`}>{avgPct}%</p>
            <p className="text-xs text-muted-foreground">Average</p>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
            <p className={`text-2xl font-bold ${getGradeColor(bestPct)}`}>{bestPct}%</p>
            <p className="text-xs text-muted-foreground">Best</p>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{tests.length}</p>
            <p className="text-xs text-muted-foreground">Tests</p>
          </div>
        </div>
      )}

      {/* Progress Chart */}
      {chartData.length > 1 && (
        <Card className="border border-border/40 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">Score Trend</p>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="testGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} domain={[0, 100]} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Area type="monotone" dataKey="pct" stroke="var(--primary)" fill="url(#testGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subject filter */}
      {subjects.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {subjects.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSubject(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
                selectedSubject === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Test list */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-muted/40 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm font-medium">No tests logged yet</p>
          <p className="text-xs text-muted-foreground mt-1">Log your first mock test to track progress</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(t => {
            const pct = Math.round((t.score / t.totalMarks) * 100);
            return (
              <Card key={t.id} className="border border-border/40 shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{t.testName}</p>
                        {t.subject && <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground flex-shrink-0">{t.subject}</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-sm font-bold ${getGradeColor(pct)}`}>{pct}%</span>
                        <span className="text-xs text-muted-foreground">{t.score}/{t.totalMarks}</span>
                        <span className="text-xs text-muted-foreground">{t.date}</span>
                      </div>
                      {t.mistakes && <p className="text-xs text-muted-foreground mt-1 truncate">⚠ {t.mistakes}</p>}
                      {/* Score bar */}
                      <div className="h-1 bg-muted rounded-full mt-2 overflow-hidden">
                        <div className={`h-full rounded-full ${pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
