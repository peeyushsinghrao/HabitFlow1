'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, ChevronLeft, BookOpen, Check, X, Brain, Zap, Timer } from 'lucide-react';
import { getSubjectColors } from '@/lib/subject-colors';

interface FlashCard {
  id: string;
  front: string;
  back: string;
  subject: string;
  box: number;
  tags: string;
}

type ScreenView = 'list' | 'study' | 'blitz';

const SUBJECTS = ['Physics', 'Chemistry', 'Maths', 'Biology', 'English', 'History', 'Custom'];
const BOX_LABELS = ['', 'New', 'Learning', 'Review', 'Mastered'];
const BOX_COLORS = ['', 'bg-red-100 text-red-700', 'bg-orange-100 text-orange-700', 'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700'];

const BLITZ_CARD_COUNT = 15;
const BLITZ_SECONDS_PER_CARD = 45;

export function FlashCardScreen() {
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ScreenView>('list');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [saving, setSaving] = useState(false);

  // Study mode
  const [studyCards, setStudyCards] = useState<FlashCard[]>([]);
  const [studyIdx, setStudyIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyComplete, setStudyComplete] = useState(false);

  // Blitz mode
  const [blitzCards, setBlitzCards] = useState<FlashCard[]>([]);
  const [blitzIdx, setBlitzIdx] = useState(0);
  const [blitzFlipped, setBlitzFlipped] = useState(false);
  const [blitzScore, setBlitzScore] = useState(0);
  const [blitzMissed, setBlitzMissed] = useState(0);
  const [blitzDone, setBlitzDone] = useState(false);
  const [blitzTimeLeft, setBlitzTimeLeft] = useState(BLITZ_SECONDS_PER_CARD);
  const blitzTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCards = useCallback(async () => {
    try {
      const res = await fetch('/api/flashcards');
      if (res.ok) setCards(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const filteredCards = selectedSubject === 'All' ? cards : cards.filter(c => c.subject === selectedSubject);

  const handleAdd = async () => {
    if (!front.trim() || !back.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ front, back, subject }),
      });
      if (res.ok) {
        const card = await res.json();
        setCards(prev => [card, ...prev]);
        setFront(''); setBack('');
        setShowAddForm(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/flashcards?id=${id}`, { method: 'DELETE' });
    setCards(prev => prev.filter(c => c.id !== id));
  };

  const startStudy = () => {
    const toStudy = filteredCards.filter(c => c.box < 4);
    if (!toStudy.length) return;
    setStudyCards(toStudy.sort(() => Math.random() - 0.5));
    setStudyIdx(0);
    setIsFlipped(false);
    setStudyComplete(false);
    setView('study');
  };

  const handleAnswer = async (knew: boolean) => {
    const card = studyCards[studyIdx];
    const newBox = knew ? Math.min(card.box + 1, 4) : Math.max(card.box - 1, 1);
    await fetch('/api/flashcards', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: card.id, box: newBox }),
    });
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, box: newBox } : c));
    if (studyIdx + 1 >= studyCards.length) {
      setStudyComplete(true);
    } else {
      setStudyIdx(i => i + 1);
      setIsFlipped(false);
    }
  };

  // ── Blitz Mode ──
  const startBlitz = () => {
    const pool = filteredCards.length ? filteredCards : cards;
    if (!pool.length) return;
    const shuffled = pool.slice().sort(() => Math.random() - 0.5).slice(0, BLITZ_CARD_COUNT);
    setBlitzCards(shuffled);
    setBlitzIdx(0);
    setBlitzFlipped(false);
    setBlitzScore(0);
    setBlitzMissed(0);
    setBlitzDone(false);
    setBlitzTimeLeft(BLITZ_SECONDS_PER_CARD);
    setView('blitz');
  };

  useEffect(() => {
    if (view !== 'blitz' || blitzDone) return;
    if (blitzTimerRef.current) clearInterval(blitzTimerRef.current);
    blitzTimerRef.current = setInterval(() => {
      setBlitzTimeLeft(t => {
        if (t <= 1) {
          clearInterval(blitzTimerRef.current!);
          blitzAdvance(false, true);
          return BLITZ_SECONDS_PER_CARD;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (blitzTimerRef.current) clearInterval(blitzTimerRef.current); };
  }, [view, blitzIdx, blitzDone]);

  const blitzAdvance = (knew: boolean, timedOut = false) => {
    if (blitzTimerRef.current) clearInterval(blitzTimerRef.current);
    if (knew) setBlitzScore(s => s + 1);
    else setBlitzMissed(m => m + 1);
    const nextIdx = blitzIdx + 1;
    if (nextIdx >= blitzCards.length) {
      setBlitzDone(true);
    } else {
      setBlitzIdx(nextIdx);
      setBlitzFlipped(false);
      setBlitzTimeLeft(BLITZ_SECONDS_PER_CARD);
    }
  };

  // ── Study View ──
  if (view === 'study') {
    const card = studyCards[studyIdx];
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('list')} className="p-2 rounded-full hover:bg-muted transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-bold flex-1">Study Mode</h2>
          <span className="text-sm text-muted-foreground">{studyIdx + 1}/{studyCards.length}</span>
        </div>

        {studyComplete ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 space-y-4">
            <div className="text-5xl">🎉</div>
            <h3 className="text-xl font-bold">Session Complete!</h3>
            <p className="text-muted-foreground">You reviewed {studyCards.length} cards</p>
            <Button onClick={() => setView('list')}>Back to Cards</Button>
          </motion.div>
        ) : (
          <>
            <div className="relative h-56 cursor-pointer" onClick={() => setIsFlipped(f => !f)} style={{ perspective: '1000px' }}>
              <motion.div animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.4 }} style={{ transformStyle: 'preserve-3d', position: 'absolute', inset: 0 }}>
                <div className="absolute inset-0 rounded-2xl bg-card border border-border shadow-sm flex flex-col items-center justify-center p-6" style={{ backfaceVisibility: 'hidden' }}>
                  <Badge className="mb-3 text-xs">{card?.subject}</Badge>
                  <p className="text-lg font-semibold text-center text-foreground">{card?.front}</p>
<<<<<<< HEAD
                  <p className="text-[11px] text-muted-foreground mt-4">Tap to reveal answer</p>
=======
                  <p className="text-xs text-muted-foreground mt-4">Tap to reveal answer</p>
>>>>>>> 925ef42 (Initial commit)
                </div>
                <div className="absolute inset-0 rounded-2xl bg-primary/5 border border-primary/20 shadow-sm flex flex-col items-center justify-center p-6" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <p className="text-base text-center text-foreground">{card?.back}</p>
                </div>
              </motion.div>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${(studyIdx / studyCards.length) * 100}%` }} />
            </div>
            {isFlipped && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                <button onClick={() => handleAnswer(false)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-200 transition-colors">
                  <X className="h-4 w-4" /> Again
                </button>
                <button onClick={() => handleAnswer(true)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-sm hover:bg-emerald-200 transition-colors">
                  <Check className="h-4 w-4" /> Got it!
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    );
  }

  // ── Blitz View ──
  if (view === 'blitz') {
    const card = blitzCards[blitzIdx];
    const timerPct = (blitzTimeLeft / BLITZ_SECONDS_PER_CARD) * 100;
    const timerColor = blitzTimeLeft > 20 ? '#10b981' : blitzTimeLeft > 10 ? '#f59e0b' : '#ef4444';

    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => { if (blitzTimerRef.current) clearInterval(blitzTimerRef.current); setView('list'); }} className="p-2 rounded-full hover:bg-muted transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Revision Blitz
            </h2>
            {!blitzDone && <p className="text-xs text-muted-foreground">Card {blitzIdx + 1} of {blitzCards.length}</p>}
          </div>
          {!blitzDone && (
            <div className="flex items-center gap-1.5 bg-muted/60 rounded-full px-3 py-1">
              <Timer className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-bold tabular-nums" style={{ color: timerColor }}>{blitzTimeLeft}s</span>
            </div>
          )}
        </div>

        {blitzDone ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-4">
            <div className="text-5xl">{blitzScore >= blitzCards.length * 0.8 ? '🏆' : blitzScore >= blitzCards.length * 0.5 ? '🎯' : '💪'}</div>
            <h3 className="text-2xl font-bold">{blitzScore}/{blitzCards.length}</h3>
            <p className="text-muted-foreground">
              {blitzScore >= blitzCards.length * 0.8 ? "Excellent! You're revision-ready!" :
               blitzScore >= blitzCards.length * 0.5 ? 'Good effort! Keep going!' : "Keep practising — you'll get there!"}
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-emerald-600">{blitzScore}</p>
<<<<<<< HEAD
                <p className="text-[11px] text-muted-foreground">Known</p>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/30 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-rose-500">{blitzMissed}</p>
                <p className="text-[11px] text-muted-foreground">Missed</p>
=======
                <p className="text-xs text-muted-foreground">Known</p>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/30 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-rose-500">{blitzMissed}</p>
                <p className="text-xs text-muted-foreground">Missed</p>
>>>>>>> 925ef42 (Initial commit)
              </div>
            </div>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => setView('list')}>Exit</Button>
              <Button onClick={startBlitz} className="gap-1.5">
                <Zap className="h-3.5 w-3.5" /> Try Again
              </Button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Progress bar (timer) */}
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000 ease-linear" style={{ width: `${timerPct}%`, backgroundColor: timerColor }} />
            </div>

            {/* Progress dots */}
            <div className="flex gap-1 flex-wrap">
              {blitzCards.map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < blitzIdx ? 'bg-primary' : i === blitzIdx ? 'bg-primary/50' : 'bg-muted'}`} />
              ))}
            </div>

            {/* Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={blitzIdx}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
                className="relative h-56 cursor-pointer"
                onClick={() => setBlitzFlipped(f => !f)}
                style={{ perspective: '1000px' }}
              >
                <motion.div
                  animate={{ rotateY: blitzFlipped ? 180 : 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ transformStyle: 'preserve-3d', position: 'absolute', inset: 0 }}
                >
                  <div className="absolute inset-0 rounded-2xl bg-card border border-border shadow-sm flex flex-col items-center justify-center p-6" style={{ backfaceVisibility: 'hidden' }}>
                    <Badge className="mb-3 text-xs">{card?.subject}</Badge>
                    <p className="text-lg font-semibold text-center">{card?.front}</p>
<<<<<<< HEAD
                    <p className="text-[11px] text-muted-foreground mt-4">Tap to reveal · {blitzTimeLeft}s remaining</p>
=======
                    <p className="text-xs text-muted-foreground mt-4">Tap to reveal · {blitzTimeLeft}s remaining</p>
>>>>>>> 925ef42 (Initial commit)
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 shadow-sm flex flex-col items-center justify-center p-6" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    <p className="text-base text-center text-foreground">{card?.back}</p>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {blitzFlipped ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                <button onClick={() => blitzAdvance(false)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-200 transition-colors">
                  <X className="h-4 w-4" /> Missed
                </button>
                <button onClick={() => blitzAdvance(true)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-sm hover:bg-emerald-200 transition-colors">
                  <Check className="h-4 w-4" /> Knew it!
                </button>
              </motion.div>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => setBlitzFlipped(true)} className="flex-1 py-3 rounded-xl bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition-colors">
                  Reveal Answer
                </button>
              </div>
            )}

            {/* Score live */}
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="text-emerald-600 font-semibold">✓ {blitzScore} known</span>
              <span>·</span>
              <span className="text-rose-500 font-semibold">✗ {blitzMissed} missed</span>
            </div>
          </>
        )}
      </div>
    );
  }

  // ── List View ──
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Flashcards
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">{cards.length} cards · Spaced repetition</p>
        </div>
        <div className="flex gap-2">
          {cards.length > 0 && (
            <Button size="sm" variant="outline" onClick={startBlitz} className="gap-1.5 border-amber-300 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20">
              <Zap className="h-3.5 w-3.5" /> Blitz
            </Button>
          )}
          {filteredCards.some(c => c.box < 4) && (
            <Button size="sm" variant="outline" onClick={startStudy} className="gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> Study
            </Button>
          )}
          <Button size="sm" onClick={() => setShowAddForm(true)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
      </div>

      {/* Blitz callout */}
      {cards.length > 0 && (
        <button onClick={startBlitz} className="w-full rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700/40 p-3 flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
            <Zap className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Quick Revision Blitz</p>
<<<<<<< HEAD
            <p className="text-[11px] text-amber-700/70 dark:text-amber-400/70">
=======
            <p className="text-xs text-amber-700/70 dark:text-amber-400/70">
>>>>>>> 925ef42 (Initial commit)
              {Math.min(BLITZ_CARD_COUNT, cards.length)} cards · {BLITZ_SECONDS_PER_CARD}s each · Test yourself now
            </p>
          </div>
          <span className="text-amber-500 text-lg">→</span>
        </button>
      )}

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="border-primary/20 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-semibold">New Flashcard</p>
                <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full h-9 px-3 rounded-lg text-sm bg-muted/40 border border-border">
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
                <textarea className="w-full p-3 rounded-xl text-sm bg-muted/40 border border-border resize-none focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Front (question / concept)..." rows={2} value={front} onChange={e => setFront(e.target.value)} />
                <textarea className="w-full p-3 rounded-xl text-sm bg-muted/40 border border-border resize-none focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Back (answer / explanation)..." rows={2} value={back} onChange={e => setBack(e.target.value)} />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">Cancel</Button>
                  <Button size="sm" onClick={handleAdd} disabled={saving} className="flex-1">{saving ? 'Adding...' : 'Add Card'}</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subject Filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {['All', ...SUBJECTS.slice(0, 6)].map(s => {
          const colors = getSubjectColors();
          const dotColor = s !== 'All' ? (colors[s] || '#6366f1') : undefined;
          const isActive = selectedSubject === s;
          return (
            <button key={s} onClick={() => setSelectedSubject(s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                isActive ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'
              }`}>
              {dotColor && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: isActive ? 'white' : dotColor }} />}
              {s}
            </button>
          );
        })}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map(box => {
          const count = filteredCards.filter(c => c.box === box).length;
          return (
            <div key={box} className={`rounded-xl p-2.5 text-center ${BOX_COLORS[box]}`}>
              <p className="text-lg font-bold">{count}</p>
<<<<<<< HEAD
              <p className="text-[10px]">{BOX_LABELS[box]}</p>
=======
              <p className="text-xs">{BOX_LABELS[box]}</p>
>>>>>>> 925ef42 (Initial commit)
            </div>
          );
        })}
      </div>

      {/* Card List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-muted/40 animate-pulse" />)}</div>
      ) : filteredCards.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🃏</div>
          <p className="text-sm font-medium text-foreground">No flashcards yet</p>
          <p className="text-xs text-muted-foreground mt-1">Add cards to start learning</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredCards.map(card => (
            <motion.div key={card.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
<<<<<<< HEAD
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
=======
              <Card className="border border-border/40 shadow-sm hover:shadow-md transition-shadow">
>>>>>>> 925ef42 (Initial commit)
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{card.front}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{card.back}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
<<<<<<< HEAD
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${BOX_COLORS[card.box]}`}>{BOX_LABELS[card.box]}</span>
=======
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BOX_COLORS[card.box]}`}>{BOX_LABELS[card.box]}</span>
>>>>>>> 925ef42 (Initial commit)
                      <button onClick={() => handleDelete(card.id)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
