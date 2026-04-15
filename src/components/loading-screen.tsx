'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { differenceInCalendarDays } from 'date-fns';

// Module-level: persists across Fast Refresh re-mounts within the same page session
let _loadingAlreadyCompleted = false;

const THEME_CLASSES: Record<string, string> = {
  'warm-brown': '',
  'forest-green': 'theme-forest-green',
  'sunset-orange': 'theme-sunset-orange',
  'midnight-purple': 'theme-midnight-purple',
  'rose-gold': 'theme-rose-gold',
  'cyber-dark': 'theme-cyber-dark',
  'mint-breeze': 'theme-mint-breeze',
  'classic-navy': 'theme-classic-navy',
  'blush-pink': 'theme-blush-pink',
  'deep-ocean': 'theme-deep-ocean',
};

interface LoadingScreenProps {
  onComplete: () => void;
}

function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

function getPersonalizedSubtitle(name: string, examDate: string): string {
  if (!name) return 'Track habits. Build streaks. Level up.';
  const greeting = getTimeGreeting();
  if (examDate) {
    const today = new Date();
    const exam = new Date(examDate);
    const daysLeft = differenceInCalendarDays(exam, today);
    if (daysLeft > 0 && daysLeft <= 365) {
      return `${greeting}, ${name.split(' ')[0]}! ${daysLeft} days until your exam. Let's go.`;
    }
  }
  return `${greeting}, ${name.split(' ')[0]}! Let's make today count.`;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'done'>('loading');
  const [greeting, setGreeting] = useState('Track habits. Build streaks. Level up.');

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    try {
      const root = document.documentElement;
      const savedColorTheme = localStorage.getItem('nuviora-color-theme');
      Object.values(THEME_CLASSES).forEach(className => {
        if (className) root.classList.remove(className);
      });
      const themeClass = savedColorTheme ? THEME_CLASSES[savedColorTheme] : '';
      if (themeClass) root.classList.add(themeClass);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('nuviora-user-cache');
      if (cached) {
        const { name, examDate } = JSON.parse(cached);
        if (name) setGreeting(getPersonalizedSubtitle(name, examDate));
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const SESSION_KEY = 'nuviora-loading-shown';

    // If the loading animation already ran this session (even if interrupted by HMR),
    // skip it and call onComplete immediately so the app renders right away.
    try {
      if (sessionStorage.getItem(SESSION_KEY)) {
        onCompleteRef.current();
        return;
      }
      // Mark immediately so any HMR re-mount skips straight to app
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch { /* ignore */ }

    const complete = () => {
      _loadingAlreadyCompleted = true;
      setPhase('done');
      setTimeout(() => onCompleteRef.current(), 420);
    };

    const steps = [
      { target: 30, delay: 120 },
      { target: 60, delay: 450 },
      { target: 85, delay: 850 },
      { target: 100, delay: 1200 },
    ];

    const timers: ReturnType<typeof setTimeout>[] = [];

    steps.forEach(({ target, delay }) => {
      timers.push(
        setTimeout(() => {
          if (_loadingAlreadyCompleted) return;
          setProgress(target);
          if (target === 100) {
            setTimeout(complete, 200);
          }
        }, delay)
      );
    });

    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {phase === 'loading' && (
        <motion.div
          initial={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.08, y: -20 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
        >
          {/* Background subtle pattern */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-64 h-64 rounded-full bg-primary/5"
                style={{
                  left: `${[10, 70, 30, 80, 5, 60][i]}%`,
                  top: `${[10, 20, 60, 70, 85, 45][i]}%`,
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.4,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
              className="relative"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="Nuviora"
                  className="w-32 h-32 object-contain drop-shadow-2xl"
                />
              </motion.div>
              {/* Glow ring */}
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/10"
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>

            {/* App name */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center px-6"
            >
              <h1 className="text-3xl font-bold gradient-text tracking-tight">Nuviora</h1>
              <motion.p
                key={greeting}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="text-sm text-muted-foreground mt-1 max-w-xs text-center leading-snug"
              >
                {greeting}
              </motion.p>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-48"
            >
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-chart-2 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
              <motion.p
<<<<<<< HEAD
                className="text-[10px] text-muted-foreground text-center mt-2"
=======
                className="text-xs text-muted-foreground text-center mt-2"
>>>>>>> 925ef42 (Initial commit)
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {progress < 40 ? 'Loading habits...' : progress < 80 ? 'Preparing your day...' : 'Almost ready...'}
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
