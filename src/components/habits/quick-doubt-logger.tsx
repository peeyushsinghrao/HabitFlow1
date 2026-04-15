'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Trash2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface DoubtNote {
  id: string;
  subject: string;
  topic: string;
  question: string;
  isResolved: boolean;
  createdAt: string;
}

export function QuickDoubtLogger({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [listOpen, setListOpen] = useState(false);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [doubts, setDoubts] = useState<DoubtNote[]>([]);
  const [loadingDoubts, setLoadingDoubts] = useState(false);

  const fetchDoubts = useCallback(async () => {
    setLoadingDoubts(true);
    try {
      const res = await fetch('/api/doubts');
      if (res.ok) setDoubts(await res.json());
    } catch { /* ignore */ } finally {
      setLoadingDoubts(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchDoubts();
  }, [isOpen, fetchDoubts]);

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/doubts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'Quick Note',
          topic: 'General',
          question: text.trim(),
        }),
      });
      if (res.ok) {
        const newDoubt = await res.json();
        setDoubts(prev => [newDoubt, ...prev]);
        setText('');
      }
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await fetch(`/api/doubts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isResolved: true }),
      });
      setDoubts(prev => prev.map(d => d.id === id ? { ...d, isResolved: true } : d));
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/doubts/${id}`, { method: 'DELETE' });
      setDoubts(prev => prev.filter(d => d.id !== id));
    } catch { /* ignore */ }
  };

  const unresolved = doubts.filter(d => !d.isResolved);
  const resolved = doubts.filter(d => d.isResolved);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold">Quick Note / Doubt</h3>
                {unresolved.length > 0 && (
                  <span className="text-xs bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                    {unresolved.length} open
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Input */}
            <div className="px-5 py-4 border-b border-border/30">
              <div className="flex gap-2">
                <textarea
                  autoFocus
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave(); }}
                  placeholder="Jot down a doubt or quick note... (Ctrl+Enter to save)"
                  className="flex-1 bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-sm resize-none h-20 focus:outline-none focus:ring-1 focus:ring-primary"
                  maxLength={500}
                />
                <button
                  onClick={handleSave}
                  disabled={saving || !text.trim()}
                  className="self-end w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 transition-opacity shadow-md shadow-primary/20"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
<<<<<<< HEAD
              <p className="text-[10px] text-muted-foreground mt-1.5 text-right">{text.length}/500</p>
=======
              <p className="text-xs text-muted-foreground mt-1.5 text-right">{text.length}/500</p>
>>>>>>> 925ef42 (Initial commit)
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-5 pb-6">
              {loadingDoubts ? (
                <div className="py-6 text-center">
                  <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
                </div>
              ) : doubts.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No notes yet. Jot your first one above!</p>
                </div>
              ) : (
                <div className="space-y-2 pt-3">
                  {unresolved.map(d => (
                    <div
                      key={d.id}
                      className="flex items-start gap-2 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/15 rounded-xl p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-snug">{d.question}</p>
                        {d.subject !== 'Quick Note' && (
<<<<<<< HEAD
                          <p className="text-[10px] text-muted-foreground mt-0.5">{d.subject} · {d.topic}</p>
=======
                          <p className="text-xs text-muted-foreground mt-0.5">{d.subject} · {d.topic}</p>
>>>>>>> 925ef42 (Initial commit)
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleResolve(d.id)}
                          title="Mark resolved"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-500/10 transition-colors"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          title="Delete"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {resolved.length > 0 && (
                    <div className="mt-3">
                      <button
                        onClick={() => setListOpen(o => !o)}
                        className="flex items-center gap-2 text-xs text-muted-foreground font-medium w-full py-1"
                      >
                        {listOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        Resolved ({resolved.length})
                      </button>
                      <AnimatePresence>
                        {listOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-1.5 pt-1">
                              {resolved.map(d => (
                                <div
                                  key={d.id}
                                  className="flex items-start gap-2 bg-muted/30 border border-border/40 rounded-xl p-2.5 opacity-60"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                  <p className="text-xs text-muted-foreground line-through flex-1">{d.question}</p>
                                  <button
                                    onClick={() => handleDelete(d.id)}
                                    className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground/60 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
