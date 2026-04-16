'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const CHANGELOG_VERSION = '2.4.0';
const SEEN_KEY = 'nuviora-changelog-seen';

const CHANGELOG = [
  {
    version: '2.4.0',
    date: 'This week',
    items: [
      { emoji: '✨', text: 'Meet Aria — your new AI Study Buddy with memory!' },
      { emoji: '📊', text: 'Auto Weekly Debrief every Monday morning' },
      { emoji: '🔬', text: 'Formula Vault now explains any formula in plain English' },
      { emoji: '📱', text: 'Home Widget Card — shareable stats snapshot' },
      { emoji: '🎯', text: 'Word of the Month banner on home screen' },
      { emoji: '🏖️', text: 'Vacation Mode — global streak-safe date-range freeze' },
      { emoji: '🎨', text: 'Subject Color Coding across all study tools' },
    ],
  },
  {
    version: '2.3.0',
    date: 'Last update',
    items: [
      { emoji: '🧠', text: 'AI Coach with daily study plans' },
      { emoji: '🎮', text: 'Boss Challenge & Daily Missions' },
      { emoji: '💧', text: 'Water & Energy trackers' },
    ],
  },
];

export function ChangelogBell() {
  const [hasNew, setHasNew] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(SEEN_KEY);
      if (seen !== CHANGELOG_VERSION) setHasNew(true);
    } catch {}
  }, []);

  const markSeen = () => {
    try { localStorage.setItem(SEEN_KEY, CHANGELOG_VERSION); } catch {}
    setHasNew(false);
    setOpen(true);
  };

  return (
    <>
      <button
        onClick={markSeen}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-muted/60 hover:bg-muted transition-colors"
        title="What's new"
      >
        <Bell className="h-4 w-4 text-foreground/70" />
        {hasNew && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"
          />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="fixed inset-x-4 top-[12%] z-50 max-w-sm mx-auto"
            >
              <Card className="border-0 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-br from-violet-500 to-purple-600 px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-white" />
                      <div>
                        <h2 className="text-base font-bold text-white">What&apos;s New</h2>
                        <p className="text-xs text-white/70">Nuviora keeps getting better</p>
                      </div>
                    </div>
                    <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <CardContent className="p-0 max-h-[60vh] overflow-y-auto">
                  {CHANGELOG.map((release, ri) => (
                    <div key={release.version} className={ri > 0 ? 'border-t border-border/30' : ''}>
                      <div className="px-4 pt-3 pb-1 flex items-center gap-2">
                        <span className="text-xs font-bold text-primary">v{release.version}</span>
                        <span className="text-xs text-muted-foreground">— {release.date}</span>
                      </div>
                      <div className="px-4 pb-3 space-y-2">
                        {release.items.map((item, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="flex items-start gap-2"
                          >
                            <span className="text-base leading-none mt-0.5">{item.emoji}</span>
                            <p className="text-sm text-foreground/85 leading-snug">{item.text}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
