'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  BookX,
  Filter,
} from 'lucide-react';

interface MistakeNote {
  id: string;
  subject: string;
  topic: string;
  mistake: string;
  correction: string;
  source: string;
  isResolved: boolean;
  createdAt: string;
}

const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'History', 'Geography', 'Economics', 'Accounts', 'Business Studies', 'Other'];

export function MistakeNotebook() {
  const [mistakes, setMistakes] = useState<MistakeNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'resolved'>('all');

  const [form, setForm] = useState({ subject: 'Physics', topic: '', mistake: '', correction: '', source: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMistakes = useCallback(async () => {
    try {
      const res = await fetch('/api/mistakes');
      if (res.ok) {
        const data = await res.json();
        setMistakes(data);
      }
    } catch { /* ignore */ } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchMistakes(); }, [fetchMistakes]);

  const handleAdd = async () => {
    if (!form.topic.trim() || !form.mistake.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/mistakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        await fetchMistakes();
        setForm({ subject: 'Physics', topic: '', mistake: '', correction: '', source: '' });
        setShowAdd(false);
      }
    } catch { /* ignore */ } finally {
      setIsSubmitting(false);
    }
  };

  const toggleResolved = async (id: string, isResolved: boolean) => {
    try {
      await fetch(`/api/mistakes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isResolved: !isResolved }),
      });
      setMistakes(prev => prev.map(m => m.id === id ? { ...m, isResolved: !isResolved } : m));
    } catch { /* ignore */ }
  };

  const deleteMistake = async (id: string) => {
    try {
      await fetch(`/api/mistakes/${id}`, { method: 'DELETE' });
      setMistakes(prev => prev.filter(m => m.id !== id));
    } catch { /* ignore */ }
  };

  const filtered = mistakes.filter(m => {
    const matchSearch = !search || m.topic.toLowerCase().includes(search.toLowerCase()) || m.mistake.toLowerCase().includes(search.toLowerCase());
    const matchSubject = !filterSubject || m.subject === filterSubject;
    const matchStatus = filterStatus === 'all' || (filterStatus === 'resolved' ? m.isResolved : !m.isResolved);
    return matchSearch && matchSubject && matchStatus;
  });

  const openCount = mistakes.filter(m => !m.isResolved).length;
  const resolvedCount = mistakes.filter(m => m.isResolved).length;

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1,2,3].map(i => (
          <div key={i} className="h-20 rounded-2xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="px-4 pb-4 space-y-4">
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`p-2.5 rounded-xl text-center transition-all ${filterStatus === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted/60'}`}
        >
          <p className="text-lg font-bold">{mistakes.length}</p>
          <p className="text-xs text-current opacity-80">Total</p>
        </button>
        <button
          onClick={() => setFilterStatus('open')}
          className={`p-2.5 rounded-xl text-center transition-all ${filterStatus === 'open' ? 'bg-rose-500 text-white' : 'bg-muted/60'}`}
        >
          <p className="text-lg font-bold">{openCount}</p>
          <p className="text-xs text-current opacity-80">Open</p>
        </button>
        <button
          onClick={() => setFilterStatus('resolved')}
          className={`p-2.5 rounded-xl text-center transition-all ${filterStatus === 'resolved' ? 'bg-emerald-500 text-white' : 'bg-muted/60'}`}
        >
          <p className="text-lg font-bold">{resolvedCount}</p>
          <p className="text-xs text-current opacity-80">Resolved</p>
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search mistakes..."
            className="pl-8 h-9 rounded-xl text-xs"
          />
        </div>
        <select
          value={filterSubject}
          onChange={e => setFilterSubject(e.target.value)}
          className="h-9 px-2 rounded-xl border border-input bg-background text-xs"
        >
          <option value="">All Subjects</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Add button */}
      <Button
        onClick={() => setShowAdd(v => !v)}
        className="w-full rounded-xl h-10 shadow-md shadow-primary/20"
        size="sm"
      >
        <Plus className="h-4 w-4 mr-1" />
        Log a Mistake
      </Button>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border border-border/40 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Subject</Label>
                    <select
                      value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      className="mt-1 w-full h-9 px-2 rounded-lg border border-input bg-background text-xs"
                    >
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Topic / Chapter</Label>
                    <Input
                      value={form.topic}
                      onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                      placeholder="e.g., Newton's Laws"
                      className="mt-1 h-9 rounded-lg text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Mistake / Error</Label>
                  <textarea
                    value={form.mistake}
                    onChange={e => setForm(f => ({ ...f, mistake: e.target.value }))}
                    placeholder="What did you get wrong?"
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Correction / Right Answer</Label>
                  <textarea
                    value={form.correction}
                    onChange={e => setForm(f => ({ ...f, correction: e.target.value }))}
                    placeholder="The correct answer is..."
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Source (optional)</Label>
                  <Input
                    value={form.source}
                    onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                    placeholder="e.g., Mock Test 3, Classes Sheet"
                    className="mt-1 h-9 rounded-lg text-xs"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" className="flex-1 rounded-lg" onClick={() => setShowAdd(false)}>Cancel</Button>
                  <Button size="sm" className="flex-1 rounded-lg" onClick={handleAdd} disabled={isSubmitting || !form.topic.trim() || !form.mistake.trim()}>
                    {isSubmitting ? 'Saving...' : 'Save Mistake'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mistakes list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookX className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">
            {mistakes.length === 0 ? "No mistakes logged yet" : "No results found"}
          </p>
          <p className="text-xs mt-1 opacity-70">
            {mistakes.length === 0 ? "Every mistake is a lesson learned!" : "Try a different filter"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`border-0 shadow-sm overflow-hidden transition-all ${m.isResolved ? 'opacity-60' : ''}`}>
                <CardContent className="p-0">
                  <div className="flex items-start gap-2 p-3">
                    <button
                      onClick={() => toggleResolved(m.id, m.isResolved)}
                      className="mt-0.5 flex-shrink-0 transition-transform active:scale-90"
                    >
                      {m.isResolved
                        ? <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                        : <Circle className="h-4.5 w-4.5 text-muted-foreground" />
                      }
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{m.subject}</span>
                        <span className="text-xs text-muted-foreground">{m.topic}</span>
                        {m.source && <span className="text-xs text-muted-foreground">• {m.source}</span>}
                      </div>
                      <p className={`text-xs mt-1 line-clamp-2 ${m.isResolved ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {m.mistake}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                      >
                        {expandedId === m.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => deleteMistake(m.id)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {expandedId === m.id && m.correction && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden border-t border-border/50"
                      >
                        <div className="px-3 py-2.5 bg-emerald-50 dark:bg-emerald-950/20">
                          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">Correction</p>
                          <p className="text-xs text-emerald-900 dark:text-emerald-300">{m.correction}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
