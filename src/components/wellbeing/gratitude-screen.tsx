'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Sparkles, ChevronDown } from 'lucide-react';

interface GratitudeLog {
  id: string;
  date: string;
  entry1: string;
  entry2: string;
  entry3: string;
}

const PROMPTS = [
  'One good thing that happened today...',
  'Someone who helped me or made me smile...',
  'Something I learned or achieved today...',
  'A simple thing I am grateful for...',
  'A challenge that made me stronger...',
];

export function GratitudeScreen() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [entry1, setEntry1] = useState('');
  const [entry2, setEntry2] = useState('');
  const [entry3, setEntry3] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<GratitudeLog[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetch(`/api/gratitude?date=${today}`)
      .then(r => r.json())
      .then(data => {
        if (data.log) {
          setEntry1(data.log.entry1 || '');
          setEntry2(data.log.entry2 || '');
          setEntry3(data.log.entry3 || '');
        }
        setHistory((data.history || []).filter((h: GratitudeLog) => h.date !== today));
      })
      .catch(() => {});
  }, [today]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/gratitude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today, entry1, entry2, entry3 }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setIsSaving(false);
  };

  const prompts = PROMPTS;

  return (
    <div className="space-y-4 pt-2 pb-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center shadow-sm">
            <Heart className="h-5 w-5 text-rose-500" fill="currentColor" fillOpacity={0.2} />
          </div>
          <div>
            <h2 className="text-base font-bold leading-tight tracking-tight">Gratitude Journal</h2>
            <p className="text-xs text-muted-foreground font-medium">Three good things each day</p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground font-medium bg-muted/50 px-2.5 py-1 rounded-full">{format(new Date(), 'MMM d')}</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-rose-200/40 dark:border-rose-500/20 shadow-card overflow-hidden"
      >
        <div className="bg-gradient-to-br from-rose-50/80 via-card to-card dark:from-rose-500/8 dark:via-card dark:to-card p-4 space-y-3">
          <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Three things you&apos;re grateful for today
          </p>

          {[
            { value: entry1, set: setEntry1, label: '1.', placeholder: prompts[0] },
            { value: entry2, set: setEntry2, label: '2.', placeholder: prompts[2] },
            { value: entry3, set: setEntry3, label: '3.', placeholder: prompts[4] },
          ].map(({ value, set, label, placeholder }, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-sm font-bold text-rose-400 mt-2.5 w-5 flex-shrink-0">{label}</span>
              <Textarea
                value={value}
                onChange={e => set(e.target.value)}
                placeholder={placeholder}
                className="resize-none rounded-xl text-sm min-h-[60px] bg-white/80 dark:bg-muted/40 border-rose-200/50 dark:border-rose-500/20 focus:border-rose-400 input-premium"
                rows={2}
              />
            </div>
          ))}

          <Button
            onClick={handleSave}
            disabled={isSaving || (!entry1 && !entry2 && !entry3)}
            className="w-full rounded-xl bg-rose-500 hover:bg-rose-600 text-white h-11 font-semibold shadow-sm shadow-rose-500/25"
          >
            {saved ? '✅ Saved!' : isSaving ? 'Saving...' : "Save Today's Gratitude"}
          </Button>
        </div>
      </motion.div>

      {history.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-card rounded-2xl border border-border/40 shadow-card overflow-hidden"
        >
          <button
            className="flex items-center justify-between w-full p-4 hover:bg-muted/20 transition-colors press-effect"
            onClick={() => setShowHistory(v => !v)}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{history.length}</span>
              </div>
              <span className="text-sm font-semibold tracking-tight">Past Entries</span>
            </div>
            <motion.div animate={{ rotate: showHistory ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          </button>

          {showHistory && (
            <div className="px-4 pb-4 space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
              {history.map((h, idx) => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-muted/40 rounded-xl p-3 border border-border/30"
                >
                  <p className="text-xs text-muted-foreground mb-1.5 font-semibold uppercase tracking-wide">
                    {format(new Date(h.date + 'T12:00:00'), 'EEEE, MMMM d, yyyy')}
                  </p>
                  {[h.entry1, h.entry2, h.entry3].filter(Boolean).map((e, i) => (
                    <p key={i} className="text-xs text-foreground/80 mb-0.5 leading-relaxed">• {e}</p>
                  ))}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
