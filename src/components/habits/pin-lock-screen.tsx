'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Delete } from 'lucide-react';

interface PinLockScreenProps {
  correctPin: string;
  onUnlock: () => void;
}

export function PinLockScreen({ correctPin, onUnlock }: PinLockScreenProps) {
  const [entered, setEntered] = useState('');
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleDigit = (d: string) => {
    if (entered.length >= 4) return;
    const next = entered + d;
    setEntered(next);
    if (next.length === 4) {
      setTimeout(() => {
        if (next === correctPin) {
          onUnlock();
        } else {
          setShake(true);
          setAttempts(a => a + 1);
          setTimeout(() => { setEntered(''); setShake(false); }, 600);
        }
      }, 150);
    }
  };

  const handleDelete = () => setEntered(e => e.slice(0, -1));

  const digits = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center gap-8 px-6">
      <motion.div
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
          <Lock className="h-7 w-7 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-bold">Enter PIN</h2>
        <p className="text-xs text-muted-foreground">
          {attempts > 0 ? `Wrong PIN. Try again.` : 'Enter your 4-digit PIN to unlock'}
        </p>
      </motion.div>

      <motion.div
        className="flex gap-4"
        animate={shake ? { x: [-8, 8, -8, 8, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {[0,1,2,3].map(i => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
              i < entered.length
                ? 'bg-primary border-primary scale-110'
                : 'border-muted-foreground/40'
            }`}
          />
        ))}
      </motion.div>

      <div className="grid grid-cols-3 gap-3 w-64">
        {digits.map((d, i) => {
          if (d === '') return <div key={i} />;
          if (d === '⌫') return (
            <button
              key={i}
              onClick={handleDelete}
              className="h-16 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-muted transition-all active:scale-95"
            >
              <Delete className="h-5 w-5" />
            </button>
          );
          return (
            <button
              key={i}
              onClick={() => handleDigit(d)}
              className="h-16 rounded-2xl bg-muted/50 hover:bg-muted text-xl font-semibold transition-all active:scale-95 active:bg-primary active:text-primary-foreground"
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
