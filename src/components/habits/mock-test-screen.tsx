'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, TrendingUp, TrendingDown, Minus, Trophy, Flame, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface MockTest {
  id: string;
  testName: string;
  subject: string;
  date: string;
  marksObtained: number;
  maxMarks: number;
  accuracy: number;
  sillyMistakes: number;
  timeTaken: number;
  notes: string;
}

const SUBJECTS = ['Mixed', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'History', 'Geography', 'Economics', 'Accounts'];

function encodeTopics(topics: string[], notes: string): string {
  const cleanNotes = notes.replace(/\[topics:[^\]]*\]\s*/g, '').trim();
  if (!topics.length) return cleanNotes;
  return `[topics:${topics.join(',')}]${cleanNotes ? ` ${cleanNotes}` : ''}`;
}

function extractTopics(notes: string): string[] {
  const match = notes.match(/\[topics:([^\]]*)\]/);
  if (!match || !match[1].trim()) return [];
  return match[1].split(',').map(t => t.trim()).filter(Boolean);
}

function extractNotes(notes: string): string {
  return notes.replace(/\[topics:[^\]]*\]\s*/g, '').trim();
}

function getHeatColor(count: number, max: number): string {
  if (max === 0) return 'bg-muted text-muted-foreground';
  const ratio = count / max;
  if (ratio >= 0.75) return 'bg-rose-500 text-white';
  if (ratio >= 0.5) return 'bg-rose-300 text-rose-900 dark:bg-rose-700 dark:text-rose-100';
  if (ratio >= 0.25) return 'bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-100';
  return 'bg-muted text-muted-foreground';
}

export function MockTestScreen() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ testName: '', subject: 'Mixed', marksObtained: '', maxMarks: '100', accuracy: '', sillyMistakes: '0', timeTaken: '180', notes: '' });
  const [topicInput, setTopicInput] = useState('');
  const [wrongTopics, setWrongTopics] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'tests' | 'heatmap'>('tests');

  const fetchTests = useCallback(async () => {
    const res = await fetch('/api/mock-tests');
    if (res.ok) setTests(await res.json());
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchTests(); }, [fetchTests]);

  const addTopic = () => {
    const t = topicInput.trim();
    if (t && !wrongTopics.includes(t)) setWrongTopics(prev => [...prev, t]);
    setTopicInput('');
  };

  const removeTopic = (t: string) => setWrongTopics(prev => prev.filter(x => x !== t));

  const handleAdd = async () => {
    if (!form.testName || !form.marksObtained || !form.maxMarks) return;
    setIsSubmitting(true);
    try {
      const notesWithTopics = encodeTopics(wrongTopics, form.notes);
      const res = await fetch('/api/mock-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          notes: notesWithTopics,
          marksObtained: parseFloat(form.marksObtained),
          maxMarks: parseFloat(form.maxMarks),
          accuracy: form.accuracy ? parseFloat(form.accuracy) : undefined,
          sillyMistakes: parseInt(form.sillyMistakes),
          timeTaken: parseInt(form.timeTaken),
        }),
      });
      if (res.ok) {
        await fetchTests();
        setForm({ testName: '', subject: 'Mixed', marksObtained: '', maxMarks: '100', accuracy: '', sillyMistakes: '0', timeTaken: '180', notes: '' });
        setWrongTopics([]);
        setTopicInput('');
        setShowForm(false);
      }
    } catch { } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/mock-tests?id=${id}`, { method: 'DELETE' });
    setTests(prev => prev.filter(t => t.id !== id));
  };

  const chartData = [...tests].reverse().slice(-10).map(t => ({
    name: t.testName.length > 8 ? t.testName.slice(0, 8) + '…' : t.testName,
    score: Math.round((t.marksObtained / t.maxMarks) * 100),
    accuracy: Math.round(t.accuracy),
  }));

  const avg = tests.length > 0 ? Math.round(tests.reduce((s, t) => s + (t.marksObtained / t.maxMarks) * 100, 0) / tests.length) : 0;
  const avgSilly = tests.length > 0 ? Math.round(tests.reduce((s, t) => s + t.sillyMistakes, 0) / tests.length) : 0;
  const best = tests.length > 0 ? Math.max(...tests.map(t => (t.marksObtained / t.maxMarks) * 100)) : 0;
  const trend = tests.length >= 2
    ? (tests[0].marksObtained / tests[0].maxMarks) > (tests[1].marksObtained / tests[1].maxMarks) ? 'up' : 'down'
    : 'neutral';

  const topicHeatmap = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of tests) {
      for (const topic of extractTopics(t.notes)) {
        counts[topic] = (counts[topic] || 0) + 1;
      }
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [tests]);

  const maxTopicCount = topicHeatmap[0]?.[1] || 0;

  if (isLoading) return <div className="p-4 space-y-3">{[1,2].map(i => <div key={i} className="h-20 rounded-2xl bg-muted/50 animate-pulse" />)}</div>;

  return (
    <div className="px-4 pb-4 space-y-4">
      {/* Stats row */}
      {tests.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
<<<<<<< HEAD
          <Card className="border-0 shadow-sm">
            <CardContent className="p-2.5 text-center">
              <p className="text-lg font-bold text-primary">{avg}%</p>
              <p className="text-[10px] text-muted-foreground">Avg Score</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
=======
          <Card className="border border-border/40 shadow-sm">
            <CardContent className="p-2.5 text-center">
              <p className="text-lg font-bold text-primary">{avg}%</p>
              <p className="text-xs text-muted-foreground">Avg Score</p>
            </CardContent>
          </Card>
          <Card className="border border-border/40 shadow-sm">
>>>>>>> 925ef42 (Initial commit)
            <CardContent className="p-2.5 text-center">
              <div className="flex items-center justify-center gap-1">
                <p className="text-lg font-bold">{Math.round(best)}%</p>
                <Trophy className="h-3.5 w-3.5 text-amber-500" />
              </div>
<<<<<<< HEAD
              <p className="text-[10px] text-muted-foreground">Best</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-2.5 text-center">
              <p className="text-lg font-bold text-rose-500">{avgSilly}</p>
              <p className="text-[10px] text-muted-foreground">Avg Silly</p>
=======
              <p className="text-xs text-muted-foreground">Best</p>
            </CardContent>
          </Card>
          <Card className="border border-border/40 shadow-sm">
            <CardContent className="p-2.5 text-center">
              <p className="text-lg font-bold text-rose-500">{avgSilly}</p>
              <p className="text-xs text-muted-foreground">Avg Silly</p>
>>>>>>> 925ef42 (Initial commit)
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trend chart */}
      {chartData.length >= 2 && (
<<<<<<< HEAD
        <Card className="border-0 shadow-sm">
=======
        <Card className="border border-border/40 shadow-sm">
>>>>>>> 925ef42 (Initial commit)
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold">Score Trend</p>
              <div className="flex items-center gap-1 text-xs">
                {trend === 'up' && <><TrendingUp className="h-3.5 w-3.5 text-emerald-500" /><span className="text-emerald-500">Improving!</span></>}
                {trend === 'down' && <><TrendingDown className="h-3.5 w-3.5 text-rose-500" /><span className="text-rose-500">Needs work</span></>}
                {trend === 'neutral' && <><Minus className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">Steady</span></>}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" tick={{ fontSize: 8 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 8 }} width={20} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Score" />
                <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={1.5} dot={{ r: 2 }} name="Accuracy" strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Tab switcher */}
      {tests.length > 0 && (
        <div className="flex gap-1.5 bg-muted/40 p-1 rounded-xl">
          {(['tests', 'heatmap'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${activeTab === tab ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>
              {tab === 'heatmap' ? '🔥 Weak Topics' : 'All Tests'}
            </button>
          ))}
        </div>
      )}

      {/* Weak Topic Heatmap */}
      {activeTab === 'heatmap' && (
        <AnimatePresence mode="wait">
          <motion.div key="heatmap" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
<<<<<<< HEAD
            <Card className="border-0 shadow-sm">
=======
            <Card className="border border-border/40 shadow-sm">
>>>>>>> 925ef42 (Initial commit)
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="h-4 w-4 text-rose-500" />
                  <div>
                    <p className="text-sm font-semibold">Weak Topic Heatmap</p>
<<<<<<< HEAD
                    <p className="text-[10px] text-muted-foreground">Built from actual mistakes across {tests.length} tests</p>
=======
                    <p className="text-xs text-muted-foreground">Built from actual mistakes across {tests.length} tests</p>
>>>>>>> 925ef42 (Initial commit)
                  </div>
                </div>
                {topicHeatmap.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">No topics tagged yet</p>
<<<<<<< HEAD
                    <p className="text-[11px] text-muted-foreground mt-1">Tag wrong-answer topics when logging tests</p>
=======
                    <p className="text-xs text-muted-foreground mt-1">Tag wrong-answer topics when logging tests</p>
>>>>>>> 925ef42 (Initial commit)
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {topicHeatmap.map(([topic, count]) => (
                      <motion.div
                        key={topic}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold ${getHeatColor(count, maxTopicCount)}`}
                      >
                        <span>{topic}</span>
<<<<<<< HEAD
                        <span className="opacity-70 text-[10px]">×{count}</span>
=======
                        <span className="opacity-70 text-xs">×{count}</span>
>>>>>>> 925ef42 (Initial commit)
                      </motion.div>
                    ))}
                  </div>
                )}
                {topicHeatmap.length > 0 && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
<<<<<<< HEAD
                    <p className="text-[10px] text-muted-foreground">Heat:</p>
                    {['Low', 'Mid', 'High', 'Critical'].map((l, i) => (
                      <span key={l} className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${['bg-muted text-muted-foreground', 'bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-100', 'bg-rose-300 text-rose-900 dark:bg-rose-700 dark:text-rose-100', 'bg-rose-500 text-white'][i]}`}>{l}</span>
=======
                    <p className="text-xs text-muted-foreground">Heat:</p>
                    {['Low', 'Mid', 'High', 'Critical'].map((l, i) => (
                      <span key={l} className={`text-xs px-2 py-0.5 rounded-full font-semibold ${['bg-muted text-muted-foreground', 'bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-100', 'bg-rose-300 text-rose-900 dark:bg-rose-700 dark:text-rose-100', 'bg-rose-500 text-white'][i]}`}>{l}</span>
>>>>>>> 925ef42 (Initial commit)
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Log button */}
      {(activeTab === 'tests' || !tests.length) && (
        <Button onClick={() => setShowForm(v => !v)} className="w-full rounded-xl h-10 shadow-md shadow-primary/20" size="sm">
          <Plus className="h-4 w-4 mr-1" /> Log Mock Test
        </Button>
      )}

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
<<<<<<< HEAD
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] uppercase text-muted-foreground">Test Name</Label>
                    <Input value={form.testName} onChange={e => setForm(f => ({ ...f, testName: e.target.value }))} placeholder="Mock Test 1" className="mt-1 h-9 rounded-lg text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase text-muted-foreground">Subject</Label>
=======
            <Card className="border border-border/40 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs uppercase text-muted-foreground">Test Name</Label>
                    <Input value={form.testName} onChange={e => setForm(f => ({ ...f, testName: e.target.value }))} placeholder="Mock Test 1" className="mt-1 h-9 rounded-lg text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs uppercase text-muted-foreground">Subject</Label>
>>>>>>> 925ef42 (Initial commit)
                    <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="mt-1 w-full h-9 px-2 rounded-lg border border-input bg-background text-xs">
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
<<<<<<< HEAD
                    <Label className="text-[10px] uppercase text-muted-foreground">Marks Got</Label>
                    <Input type="number" value={form.marksObtained} onChange={e => setForm(f => ({ ...f, marksObtained: e.target.value }))} placeholder="72" className="mt-1 h-9 rounded-lg text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase text-muted-foreground">Max Marks</Label>
                    <Input type="number" value={form.maxMarks} onChange={e => setForm(f => ({ ...f, maxMarks: e.target.value }))} className="mt-1 h-9 rounded-lg text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase text-muted-foreground">Silly ✗</Label>
=======
                    <Label className="text-xs uppercase text-muted-foreground">Marks Got</Label>
                    <Input type="number" value={form.marksObtained} onChange={e => setForm(f => ({ ...f, marksObtained: e.target.value }))} placeholder="72" className="mt-1 h-9 rounded-lg text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs uppercase text-muted-foreground">Max Marks</Label>
                    <Input type="number" value={form.maxMarks} onChange={e => setForm(f => ({ ...f, maxMarks: e.target.value }))} className="mt-1 h-9 rounded-lg text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs uppercase text-muted-foreground">Silly ✗</Label>
>>>>>>> 925ef42 (Initial commit)
                    <Input type="number" value={form.sillyMistakes} onChange={e => setForm(f => ({ ...f, sillyMistakes: e.target.value }))} className="mt-1 h-9 rounded-lg text-xs" />
                  </div>
                </div>

                {/* Wrong topic tags */}
                <div>
<<<<<<< HEAD
                  <Label className="text-[10px] uppercase text-muted-foreground">Wrong Answer Topics</Label>
                  <p className="text-[10px] text-muted-foreground mb-1.5">Tag each topic you got wrong — builds your heatmap</p>
=======
                  <Label className="text-xs uppercase text-muted-foreground">Wrong Answer Topics</Label>
                  <p className="text-xs text-muted-foreground mb-1.5">Tag each topic you got wrong — builds your heatmap</p>
>>>>>>> 925ef42 (Initial commit)
                  <div className="flex gap-1.5">
                    <Input
                      value={topicInput}
                      onChange={e => setTopicInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTopic(); } }}
                      placeholder="e.g. Thermodynamics"
                      className="flex-1 h-8 rounded-lg text-xs"
                    />
                    <Button size="sm" variant="outline" className="h-8 px-2.5 rounded-lg text-xs" onClick={addTopic}>Add</Button>
                  </div>
                  {wrongTopics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {wrongTopics.map(t => (
<<<<<<< HEAD
                        <span key={t} className="flex items-center gap-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
=======
                        <span key={t} className="flex items-center gap-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs font-semibold px-2 py-0.5 rounded-full">
>>>>>>> 925ef42 (Initial commit)
                          {t}
                          <button onClick={() => removeTopic(t)}><X className="h-2.5 w-2.5" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Other notes..." className="h-9 rounded-lg text-xs" />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-lg" onClick={() => { setShowForm(false); setWrongTopics([]); setTopicInput(''); }}>Cancel</Button>
                  <Button size="sm" className="flex-1 rounded-lg" onClick={handleAdd} disabled={isSubmitting || !form.testName || !form.marksObtained}>
                    {isSubmitting ? 'Saving...' : 'Save Test (+15🪙)'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test list */}
      {activeTab === 'tests' && (
        <div className="space-y-2">
          {tests.map((test, i) => {
            const pct = Math.round((test.marksObtained / test.maxMarks) * 100);
            const color = pct >= 80 ? 'text-emerald-600' : pct >= 60 ? 'text-amber-600' : 'text-rose-600';
            const topics = extractTopics(test.notes);
            const noteText = extractNotes(test.notes);
            return (
              <motion.div key={test.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
<<<<<<< HEAD
                <Card className="border-0 shadow-sm">
=======
                <Card className="border border-border/40 shadow-sm">
>>>>>>> 925ef42 (Initial commit)
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="text-center w-10 flex-shrink-0">
                        <p className={`text-base font-bold ${color}`}>{pct}%</p>
<<<<<<< HEAD
                        <p className="text-[9px] text-muted-foreground">{test.marksObtained}/{test.maxMarks}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{test.testName}</p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5 flex-wrap">
=======
                        <p className="text-xs text-muted-foreground">{test.marksObtained}/{test.maxMarks}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{test.testName}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
>>>>>>> 925ef42 (Initial commit)
                          <span>{test.subject}</span>
                          <span>• {test.date}</span>
                          {test.sillyMistakes > 0 && <span className="text-rose-500">• {test.sillyMistakes} silly</span>}
                          {test.timeTaken > 0 && <span>• {test.timeTaken}min</span>}
                        </div>
                        {topics.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {topics.map(t => (
<<<<<<< HEAD
                              <span key={t} className="text-[9px] bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-full font-medium">
=======
                              <span key={t} className="text-xs bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-full font-medium">
>>>>>>> 925ef42 (Initial commit)
                                ✗ {t}
                              </span>
                            ))}
                          </div>
                        )}
<<<<<<< HEAD
                        {noteText && <p className="text-[10px] text-muted-foreground mt-1 truncate">{noteText}</p>}
=======
                        {noteText && <p className="text-xs text-muted-foreground mt-1 truncate">{noteText}</p>}
>>>>>>> 925ef42 (Initial commit)
                      </div>
                      <button onClick={() => handleDelete(test.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          {tests.length === 0 && !showForm && (
            <div className="text-center py-10 text-muted-foreground">
              <p className="text-sm font-medium">No tests logged yet</p>
              <p className="text-xs mt-1 opacity-70">Log a mock test to start tracking your performance</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
