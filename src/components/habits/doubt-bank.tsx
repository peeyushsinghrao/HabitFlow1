'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, CheckCircle2, Circle, Trash2, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface DoubtNote { id: string; subject: string; topic: string; question: string; answer: string; source: string; isResolved: boolean; createdAt: string; }

const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'History', 'Geography', 'Economics', 'Accounts', 'Business Studies', 'Other'];

export function DoubtBank() {
  const [doubts, setDoubts] = useState<DoubtNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('open');
  const [form, setForm] = useState({ subject: 'Physics', topic: '', question: '', answer: '', source: '' });
  const [saving, setSaving] = useState(false);

  const fetchDoubts = useCallback(async () => {
    const res = await fetch('/api/doubts');
    if (res.ok) setDoubts(await res.json());
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchDoubts(); }, [fetchDoubts]);

  const handleAdd = async () => {
    if (!form.topic || !form.question) return;
    setSaving(true);
    try {
      const res = await fetch('/api/doubts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { await fetchDoubts(); setForm({ subject: 'Physics', topic: '', question: '', answer: '', source: '' }); setShowAdd(false); }
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  const toggleResolved = async (id: string, isResolved: boolean) => {
    await fetch(`/api/doubts/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isResolved: !isResolved }) });
    setDoubts(prev => prev.map(d => d.id === id ? { ...d, isResolved: !isResolved } : d));
  };

  const deleteDoubt = async (id: string) => {
    await fetch(`/api/doubts/${id}`, { method: 'DELETE' });
    setDoubts(prev => prev.filter(d => d.id !== id));
  };

  const filtered = doubts.filter(d => filter === 'all' || (filter === 'resolved' ? d.isResolved : !d.isResolved));
  const open = doubts.filter(d => !d.isResolved).length;
  const resolved = doubts.filter(d => d.isResolved).length;

  if (isLoading) return <div className="p-4 space-y-3">{[1,2].map(i => <div key={i} className="h-16 rounded-2xl bg-muted/50 animate-pulse" />)}</div>;

  return (
    <div className="px-4 pb-4 space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {(['all', 'open', 'resolved'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`p-2.5 rounded-xl text-center transition-all ${filter === f ? (f === 'open' ? 'bg-rose-500 text-white' : f === 'resolved' ? 'bg-emerald-500 text-white' : 'bg-primary text-primary-foreground') : 'bg-muted/60'}`}>
            <p className="text-lg font-bold">{f === 'all' ? doubts.length : f === 'open' ? open : resolved}</p>
<<<<<<< HEAD
            <p className="text-[10px] capitalize">{f}</p>
=======
            <p className="text-xs capitalize">{f}</p>
>>>>>>> 925ef42 (Initial commit)
          </button>
        ))}
      </div>

      <Button onClick={() => setShowAdd(v => !v)} className="w-full rounded-xl h-10 shadow-md shadow-primary/20" size="sm">
        <Plus className="h-4 w-4 mr-1" /> Add Doubt
      </Button>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
<<<<<<< HEAD
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] uppercase text-muted-foreground">Subject</Label>
                    <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="mt-1 w-full h-9 px-2 rounded-lg border border-input bg-background text-xs">{SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase text-muted-foreground">Topic</Label>
=======
            <Card className="border border-border/40 shadow-sm">
              <CardContent className="p-4 space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs uppercase text-muted-foreground">Subject</Label>
                    <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="mt-1 w-full h-9 px-2 rounded-lg border border-input bg-background text-xs">{SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                  </div>
                  <div>
                    <Label className="text-xs uppercase text-muted-foreground">Topic</Label>
>>>>>>> 925ef42 (Initial commit)
                    <Input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} placeholder="Chapter / concept" className="mt-1 h-9 rounded-lg text-xs" />
                  </div>
                </div>
                <div>
<<<<<<< HEAD
                  <Label className="text-[10px] uppercase text-muted-foreground">Your Doubt / Question</Label>
=======
                  <Label className="text-xs uppercase text-muted-foreground">Your Doubt / Question</Label>
>>>>>>> 925ef42 (Initial commit)
                  <textarea value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} rows={2} placeholder="What are you confused about?" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <Input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder="Source (e.g., Classes lecture, DPP Q.5)" className="h-9 rounded-lg text-xs" />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-lg" onClick={() => setShowAdd(false)}>Cancel</Button>
                  <Button size="sm" className="flex-1 rounded-lg" onClick={handleAdd} disabled={saving || !form.topic || !form.question}>{saving ? 'Saving...' : 'Save Doubt'}</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <HelpCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">{filter === 'open' ? 'No open doubts!' : 'No doubts yet'}</p>
          <p className="text-xs opacity-70 mt-1">{filter === 'open' ? 'All clear 🎉' : 'Add your first doubt'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((d, i) => (
            <motion.div key={d.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className={`border-0 shadow-sm overflow-hidden ${d.isResolved ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-2 p-3">
                  <button onClick={() => toggleResolved(d.id, d.isResolved)} className="mt-0.5 flex-shrink-0">
                    {d.isResolved ? <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" /> : <Circle className="h-4.5 w-4.5 text-muted-foreground" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
<<<<<<< HEAD
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{d.subject}</span>
                      <span className="text-[10px] text-muted-foreground">{d.topic}</span>
                    </div>
                    <p className={`text-xs mt-1 ${d.isResolved ? 'line-through text-muted-foreground' : ''}`}>{d.question}</p>
                    {d.source && <p className="text-[9px] text-muted-foreground mt-0.5">📌 {d.source}</p>}
=======
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{d.subject}</span>
                      <span className="text-xs text-muted-foreground">{d.topic}</span>
                    </div>
                    <p className={`text-xs mt-1 ${d.isResolved ? 'line-through text-muted-foreground' : ''}`}>{d.question}</p>
                    {d.source && <p className="text-xs text-muted-foreground mt-0.5">📌 {d.source}</p>}
>>>>>>> 925ef42 (Initial commit)
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button onClick={() => setExpandedId(expandedId === d.id ? null : d.id)} className="p-1.5 rounded-lg hover:bg-muted">
                      {expandedId === d.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                    <button onClick={() => deleteDoubt(d.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <AnimatePresence>
                  {expandedId === d.id && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-border/50">
                      <div className="p-3 bg-muted/30">
<<<<<<< HEAD
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Answer / Resolution</p>
=======
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Answer / Resolution</p>
>>>>>>> 925ef42 (Initial commit)
                        {d.answer ? (
                          <p className="text-xs">{d.answer}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No answer added yet. Ask a teacher or mark resolved when cleared!</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
