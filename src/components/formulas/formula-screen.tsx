'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Search, BookOpenCheck, Brain, ChevronLeft, ChevronRight, RotateCcw, X } from 'lucide-react';

interface FormulaEntry {
  id: string;
  subject: string;
  chapter: string;
  formula: string;
  desc: string;
  tags: string;
}

const SUBJECTS = ['All', 'Physics', 'Chemistry', 'Maths', 'Biology', 'Other'];

const STARTER_FORMULAS = [
  { subject: 'Physics', chapter: 'Mechanics', formula: 'F = ma', desc: "Newton's second law" },
  { subject: 'Physics', chapter: 'Energy', formula: 'KE = ½mv²', desc: 'Kinetic energy' },
  { subject: 'Physics', chapter: 'Waves', formula: 'v = fλ', desc: 'Wave speed = frequency × wavelength' },
  { subject: 'Maths', chapter: 'Algebra', formula: 'x = (-b ± √(b²-4ac)) / 2a', desc: 'Quadratic formula' },
  { subject: 'Maths', chapter: 'Calculus', formula: 'd/dx (xⁿ) = nxⁿ⁻¹', desc: 'Power rule' },
  { subject: 'Chemistry', chapter: 'Gas Laws', formula: 'PV = nRT', desc: 'Ideal gas law' },
];

function FlipCard({ formula, onClose }: { formula: FormulaEntry; onClose: () => void }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="relative w-full" style={{ perspective: '1000px' }}>
      <motion.div
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
        className="relative w-full"
        onClick={() => setFlipped(f => !f)}
      >
        {/* Front */}
        <div
          style={{ backfaceVisibility: 'hidden' }}
          className="w-full min-h-[200px] bg-gradient-to-br from-primary/5 to-chart-2/5 border border-primary/20 rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer select-none"
        >
<<<<<<< HEAD
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3">Formula</p>
          <p className="text-3xl font-black font-mono text-center text-foreground leading-tight">{formula.formula}</p>
          {formula.chapter && (
            <span className="mt-3 text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{formula.subject} · {formula.chapter}</span>
=======
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Formula</p>
          <p className="text-3xl font-black font-mono text-center text-foreground leading-tight">{formula.formula}</p>
          {formula.chapter && (
            <span className="mt-3 text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{formula.subject} · {formula.chapter}</span>
>>>>>>> 925ef42 (Initial commit)
          )}
          <p className="text-xs text-muted-foreground mt-4">Tap to reveal description</p>
        </div>

        {/* Back */}
        <div
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', position: 'absolute', inset: 0 }}
          className="w-full min-h-[200px] bg-gradient-to-br from-emerald-500/5 to-primary/5 border border-emerald-500/20 rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer select-none"
        >
<<<<<<< HEAD
          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">Description</p>
=======
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">Description</p>
>>>>>>> 925ef42 (Initial commit)
          <p className="text-xl font-mono font-bold text-center text-primary mb-2">{formula.formula}</p>
          <p className="text-base text-center text-foreground font-medium leading-relaxed">{formula.desc || 'No description added'}</p>
          <p className="text-xs text-muted-foreground mt-4">Tap to flip back</p>
        </div>
      </motion.div>
    </div>
  );
}

function QuizMode({ formulas, onClose }: { formulas: FormulaEntry[]; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [unknown, setUnknown] = useState<Set<string>>(new Set());

  const current = formulas[index];
  const total = formulas.length;
  const progress = Math.round(((known.size + unknown.size) / total) * 100);

  const next = () => {
    setFlipped(false);
    setTimeout(() => setIndex(i => Math.min(i + 1, total - 1)), 200);
  };

  const prev = () => {
    setFlipped(false);
    setTimeout(() => setIndex(i => Math.max(i - 1, 0)), 200);
  };

  const markKnown = () => {
    setKnown(s => new Set([...s, current.id]));
    setUnknown(s => { const n = new Set(s); n.delete(current.id); return n; });
    if (index < total - 1) next();
  };

  const markUnknown = () => {
    setUnknown(s => new Set([...s, current.id]));
    setKnown(s => { const n = new Set(s); n.delete(current.id); return n; });
    if (index < total - 1) next();
  };

  const reset = () => {
    setIndex(0);
    setFlipped(false);
    setKnown(new Set());
    setUnknown(new Set());
  };

  const isDone = known.size + unknown.size >= total;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="text-base font-bold">Formula Quiz</h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>{index + 1} / {total}</span>
          <span className="flex gap-3">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ {known.size}</span>
            <span className="text-rose-500 font-semibold">✗ {unknown.size}</span>
          </span>
        </div>
        <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
          <div className="flex h-full">
            <div className="bg-emerald-500 transition-all duration-300" style={{ width: `${(known.size / total) * 100}%` }} />
            <div className="bg-rose-400 transition-all duration-300" style={{ width: `${(unknown.size / total) * 100}%` }} />
          </div>
        </div>
      </div>

      {isDone ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8 space-y-3"
        >
          <div className="text-5xl">🎉</div>
          <p className="text-lg font-bold">Quiz Complete!</p>
          <p className="text-sm text-muted-foreground">
            <span className="text-emerald-600 font-semibold">{known.size} known</span>
            {' · '}
            <span className="text-rose-500 font-semibold">{unknown.size} to review</span>
          </p>
          <button
            onClick={reset}
            className="flex items-center gap-2 mx-auto bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-primary/20"
          >
            <RotateCcw className="h-4 w-4" />
            Quiz Again
          </button>
        </motion.div>
      ) : (
        <>
          {/* Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18 }}
            >
              <div
                style={{ perspective: '1000px' }}
                onClick={() => setFlipped(f => !f)}
                className="cursor-pointer"
              >
                <motion.div
                  style={{ transformStyle: 'preserve-3d' }}
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative w-full"
                >
                  {/* Front */}
                  <div
                    style={{ backfaceVisibility: 'hidden' }}
                    className="w-full min-h-[180px] bg-gradient-to-br from-primary/5 to-chart-2/5 border-2 border-primary/15 rounded-2xl flex flex-col items-center justify-center p-5 select-none"
                  >
<<<<<<< HEAD
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">What does this formula describe?</p>
                    <p className="text-2xl font-black font-mono text-center text-foreground">{current.formula}</p>
                    {current.chapter && (
                      <span className="mt-3 text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{current.subject} · {current.chapter}</span>
=======
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">What does this formula describe?</p>
                    <p className="text-2xl font-black font-mono text-center text-foreground">{current.formula}</p>
                    {current.chapter && (
                      <span className="mt-3 text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{current.subject} · {current.chapter}</span>
>>>>>>> 925ef42 (Initial commit)
                    )}
                    <p className="text-xs text-muted-foreground mt-3 opacity-60">Tap to reveal</p>
                  </div>

                  {/* Back */}
                  <div
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', position: 'absolute', inset: 0 }}
                    className="w-full min-h-[180px] bg-gradient-to-br from-emerald-500/5 to-primary/5 border-2 border-emerald-400/20 rounded-2xl flex flex-col items-center justify-center p-5 select-none"
                  >
<<<<<<< HEAD
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">Answer</p>
=======
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">Answer</p>
>>>>>>> 925ef42 (Initial commit)
                    <p className="text-base text-center font-semibold text-foreground">{current.desc || 'No description'}</p>
                    <p className="text-lg font-mono font-bold text-primary mt-2">{current.formula}</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Action Buttons */}
          {flipped && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-3"
            >
              <button
                onClick={markUnknown}
                className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-sm border border-rose-200 dark:border-rose-500/20"
              >
                <X className="h-4 w-4" /> Still learning
              </button>
              <button
                onClick={markKnown}
                className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-sm border border-emerald-200 dark:border-emerald-500/20"
              >
                <BookOpenCheck className="h-4 w-4" /> Got it!
              </button>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prev}
              disabled={index === 0}
              className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <p className="text-xs text-muted-foreground">Tap card to flip</p>
            <button
              onClick={next}
              disabled={index === total - 1}
              className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function FormulaScreen() {
  const [formulas, setFormulas] = useState<FormulaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [subject, setSubject] = useState('Physics');
  const [chapter, setChapter] = useState('');
  const [formula, setFormula] = useState('');
  const [desc, setDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [quizMode, setQuizMode] = useState(false);

  const fetchFormulas = useCallback(async () => {
    try {
      const res = await fetch('/api/formulas');
      if (res.ok) setFormulas(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFormulas(); }, [fetchFormulas]);

  const handleAdd = async () => {
    if (!formula.trim() || !subject) return;
    setSaving(true);
    try {
      const res = await fetch('/api/formulas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, chapter, formula, desc }),
      });
      if (res.ok) {
        const entry = await res.json();
        setFormulas(prev => [entry, ...prev]);
        setFormula(''); setChapter(''); setDesc('');
        setShowAddForm(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/formulas?id=${id}`, { method: 'DELETE' });
    setFormulas(prev => prev.filter(f => f.id !== id));
  };

  const filtered = formulas
    .filter(f => selectedSubject === 'All' || f.subject === selectedSubject)
    .filter(f => !search || f.formula.toLowerCase().includes(search.toLowerCase()) || f.desc.toLowerCase().includes(search.toLowerCase()) || f.chapter.toLowerCase().includes(search.toLowerCase()));

  const grouped: Record<string, FormulaEntry[]> = {};
  for (const f of filtered) {
    if (!grouped[f.subject]) grouped[f.subject] = [];
    grouped[f.subject].push(f);
  }

  if (quizMode) {
    return (
      <div className="space-y-5">
        <QuizMode formulas={filtered.length > 0 ? filtered : formulas} onClose={() => setQuizMode(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpenCheck className="h-5 w-5 text-primary" />
            Formula Sheet
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">{formulas.length} formulas saved</p>
        </div>
        <div className="flex gap-2">
          {formulas.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setQuizMode(true)}
              className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
            >
              <Brain className="h-3.5 w-3.5" /> Quiz Me
            </Button>
          )}
          <Button size="sm" onClick={() => setShowAddForm(true)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="border-primary/20 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-semibold">New Formula</p>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="h-9 px-3 rounded-lg text-sm bg-muted/40 border border-border"
                  >
                    {SUBJECTS.slice(1).map(s => <option key={s}>{s}</option>)}
                  </select>
                  <input
                    className="h-9 px-3 rounded-lg text-sm bg-muted/40 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Chapter..."
                    value={chapter}
                    onChange={e => setChapter(e.target.value)}
                  />
                </div>
                <input
                  className="w-full h-10 px-3 rounded-xl text-base bg-muted/40 border border-border font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Formula (e.g. F = ma)..."
                  value={formula}
                  onChange={e => setFormula(e.target.value)}
                />
                <input
                  className="w-full h-9 px-3 rounded-xl text-sm bg-muted/40 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Description (optional)..."
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">Cancel</Button>
                  <Button size="sm" onClick={handleAdd} disabled={saving} className="flex-1">
                    {saving ? 'Saving...' : 'Save Formula'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          className="w-full pl-9 pr-4 h-10 rounded-xl text-sm bg-muted/40 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Search formulas..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Subject Filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {SUBJECTS.map(s => (
          <button
            key={s}
            onClick={() => setSelectedSubject(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
              selectedSubject === s
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-primary/40'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Starter hints */}
      {formulas.length === 0 && !loading && (
        <div className="bg-muted/20 border border-border rounded-2xl p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick-add starters</p>
          <div className="flex flex-wrap gap-2">
            {STARTER_FORMULAS.map((sf, i) => (
              <button
                key={i}
                onClick={async () => {
                  const res = await fetch('/api/formulas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(sf),
                  });
                  if (res.ok) fetchFormulas();
                }}
                className="px-2.5 py-1 bg-background border border-border rounded-lg text-xs hover:border-primary/40 transition-colors"
              >
                {sf.formula}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Formula list grouped by subject */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-3">🧮</div>
          <p className="text-sm font-medium">No formulas found</p>
          <p className="text-xs text-muted-foreground mt-1">Add your first formula above</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([subj, items]) => (
            <div key={subj} className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{subj}</p>
              <div className="space-y-2">
                {items.map(f => (
                  <motion.div key={f.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
<<<<<<< HEAD
                    <Card className="border-0 shadow-sm">
=======
                    <Card className="border border-border/40 shadow-sm">
>>>>>>> 925ef42 (Initial commit)
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-base font-mono font-bold text-primary">{f.formula}</span>
                              {f.chapter && (
<<<<<<< HEAD
                                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{f.chapter}</span>
=======
                                <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{f.chapter}</span>
>>>>>>> 925ef42 (Initial commit)
                              )}
                            </div>
                            {f.desc && <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>}
                          </div>
                          <button
                            onClick={() => handleDelete(f.id)}
                            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
