'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Copy, Check, BookMarked, ChevronRight, Sparkles, X } from 'lucide-react';

interface FormulaEntry { id: string; subject: string; chapter: string; formula: string; desc: string; tags: string; }

const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Accounts', 'Economics'];

const SUBJECT_COLORS: Record<string, string> = {
  Physics: '#3B82F6',
  Chemistry: '#10B981',
  Mathematics: '#F59E0B',
  Biology: '#8B5CF6',
  Accounts: '#EF4444',
  Economics: '#06B6D4',
};

function ExplainModal({ formula, subject, chapter, onClose }: {
  formula: FormulaEntry;
  subject: string;
  chapter: string;
  onClose: () => void;
}) {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const explain = async () => {
      try {
        const res = await fetch('/api/formulas/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formula: formula.formula,
            title: formula.desc,
            subject,
            chapter,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setExplanation(data.explanation || 'Unable to generate explanation.');
        } else {
          setExplanation('Unable to generate explanation right now.');
        }
      } catch {
        setExplanation('Network error. Please try again.');
      }
      setLoading(false);
    };
    explain();
  }, [formula, subject, chapter]);

  const color = SUBJECT_COLORS[subject] || '#6B7280';

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="fixed inset-x-4 top-[15%] z-50 max-w-sm mx-auto"
      >
        <Card className="border-0 shadow-2xl overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between" style={{ background: color + '18', borderBottom: `2px solid ${color}30` }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
                <Sparkles className="h-4 w-4" style={{ color }} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Formula Explained</p>
                <p className="text-xs text-muted-foreground">{subject}{chapter ? ` · ${chapter}` : ''}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <CardContent className="p-4 space-y-3">
            <div className="p-3 rounded-xl font-mono text-sm text-foreground" style={{ backgroundColor: color + '10', borderLeft: `3px solid ${color}` }}>
              {formula.formula}
            </div>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-3.5 rounded-full bg-muted/60 animate-pulse" style={{ width: `${70 + i * 10}%` }} />
                ))}
                <p className="text-xs text-center text-muted-foreground mt-3">Aria is explaining this…</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-1"
              >
                {explanation.split('\n').filter(l => l.trim()).map((line, i) => (
                  <p key={i} className="text-sm text-foreground/85 leading-relaxed">{line}</p>
                ))}
              </motion.div>
            )}
            <p className="text-xs text-center text-muted-foreground">Powered by Aria · Your AI Study Buddy</p>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}

export function FormulaVault() {
  const [formulas, setFormulas] = useState<FormulaEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filterSubject, setFilterSubject] = useState('');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [form, setForm] = useState({ subject: 'Physics', chapter: '', formula: '', desc: '', tags: '' });
  const [saving, setSaving] = useState(false);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [explainFormula, setExplainFormula] = useState<{ entry: FormulaEntry; subject: string; chapter: string } | null>(null);

  const fetchFormulas = useCallback(async () => {
    const url = filterSubject ? `/api/formulas?subject=${filterSubject}` : '/api/formulas';
    const res = await fetch(url);
    if (res.ok) setFormulas(await res.json());
    setIsLoading(false);
  }, [filterSubject]);

  useEffect(() => { fetchFormulas(); }, [fetchFormulas]);

  const handleAdd = async () => {
    if (!form.formula || !form.subject) return;
    setSaving(true);
    try {
      const res = await fetch('/api/formulas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { await fetchFormulas(); setForm({ subject: form.subject, chapter: '', formula: '', desc: '', tags: '' }); setShowAdd(false); }
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/formulas?id=${id}`, { method: 'DELETE' });
    setFormulas(prev => prev.filter(f => f.id !== id));
  };

  const copyFormula = (formula: FormulaEntry) => {
    navigator.clipboard.writeText(formula.formula).catch(() => {});
    setCopiedId(formula.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filtered = formulas.filter(f => {
    const q = search.toLowerCase();
    return !search || f.formula.toLowerCase().includes(q) || f.chapter.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q) || f.tags.toLowerCase().includes(q);
  });

  const grouped = filtered.reduce((acc, f) => {
    const key = f.subject;
    if (!acc[key]) acc[key] = [];
    acc[key].push(f);
    return acc;
  }, {} as Record<string, FormulaEntry[]>);

  if (isLoading) return <div className="p-4 space-y-3">{[1,2].map(i => <div key={i} className="h-16 rounded-2xl bg-muted/50 animate-pulse" />)}</div>;

  return (
    <div className="px-4 pb-4 space-y-4">
      <div className="flex gap-2">
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search formulas..." className="flex-1 h-9 rounded-xl text-xs" />
        <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="h-9 px-2 rounded-xl border border-input bg-background text-xs">
          <option value="">All</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <Button onClick={() => setShowAdd(v => !v)} className="w-full rounded-xl h-10 shadow-md shadow-primary/20" size="sm">
        <Plus className="h-4 w-4 mr-1" /> Add Formula
      </Button>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Card className="border border-border/40 shadow-sm">
              <CardContent className="p-4 space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs uppercase text-muted-foreground">Subject</Label>
                    <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="mt-1 w-full h-9 px-2 rounded-lg border border-input bg-background text-xs">{SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                  </div>
                  <div>
                    <Label className="text-xs uppercase text-muted-foreground">Chapter</Label>
                    <Input value={form.chapter} onChange={e => setForm(f => ({ ...f, chapter: e.target.value }))} placeholder="e.g., Kinematics" className="mt-1 h-9 rounded-lg text-xs" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">Formula</Label>
                  <textarea value={form.formula} onChange={e => setForm(f => ({ ...f, formula: e.target.value }))} rows={2} placeholder="v = u + at" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <Input value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="Description / what it means" className="h-9 rounded-lg text-xs" />
                <Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="Tags (e.g., motion, velocity)" className="h-9 rounded-lg text-xs" />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-lg" onClick={() => setShowAdd(false)}>Cancel</Button>
                  <Button size="sm" className="flex-1 rounded-lg" onClick={handleAdd} disabled={saving || !form.formula}>{saving ? 'Saving...' : 'Save Formula'}</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookMarked className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No formulas yet</p>
          <p className="text-xs opacity-70 mt-1">Add key formulas for quick revision before tests</p>
        </div>
      ) : (
        <div className="space-y-2">
          {Object.entries(grouped).map(([subject, items]) => {
            const color = SUBJECT_COLORS[subject] || '#6B7280';
            return (
              <Card key={subject} className="border border-border/40 shadow-sm overflow-hidden">
                <button
                  className="w-full flex items-center gap-2 p-3"
                  onClick={() => setExpandedSubject(expandedSubject === subject ? null : subject)}
                >
                  <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: color + '30', border: `2px solid ${color}60` }} />
                  <span className="flex-1 text-left text-xs font-semibold">{subject}</span>
                  <span className="text-xs text-muted-foreground">{items.length} formulas</span>
                  <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expandedSubject === subject ? 'rotate-90' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedSubject === subject && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-border/30">
                      <div className="divide-y divide-border/30">
                        {items.map(f => (
                          <div key={f.id} className="p-3">
                            <div className="flex items-start gap-2">
                              <div className="flex-1 min-w-0">
                                {f.chapter && <p className="text-xs text-muted-foreground mb-1">{f.chapter}</p>}
                                <p className="font-mono text-sm text-foreground bg-muted/40 px-2 py-1.5 rounded-lg">{f.formula}</p>
                                {f.desc && <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>}
                                {f.tags && <div className="flex gap-1 mt-1 flex-wrap">{f.tags.split(',').map(t => <span key={t} className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: color + '15', color }}>{t.trim()}</span>)}</div>}

                                {/* Explain this button */}
                                <button
                                  onClick={() => setExplainFormula({ entry: f, subject, chapter: f.chapter })}
                                  className="mt-2 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors"
                                  style={{ backgroundColor: color + '15', color }}
                                >
                                  <Sparkles className="h-3 w-3" />
                                  Explain this
                                </button>
                              </div>
                              <div className="flex flex-col gap-1 flex-shrink-0">
                                <button onClick={() => copyFormula(f)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                                  {copiedId === f.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                                </button>
                                <button onClick={() => handleDelete(f.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      )}

      {/* Explain Modal */}
      <AnimatePresence>
        {explainFormula && (
          <ExplainModal
            formula={explainFormula.entry}
            subject={explainFormula.subject}
            chapter={explainFormula.chapter}
            onClose={() => setExplainFormula(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
