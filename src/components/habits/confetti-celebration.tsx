'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiCelebrationProps {
  show: boolean;
  message?: string;
  onComplete?: () => void;
}

const COLORS = ['#C08552', '#D4A373', '#FFE0B2', '#2D7A3E', '#3282B8', '#FF9494', '#7C3AED', '#E86F2D', '#00ADB5', '#71C9CE'];

function createPiece() {
  return {
    id: Math.random(),
    x: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 8,
    duration: 2 + Math.random() * 2,
    delay: Math.random() * 0.8,
    shape: Math.random() > 0.5 ? 'circle' : 'rect',
    rotate: Math.random() * 360,
  };
}

export function ConfettiCelebration({ show, message, onComplete }: ConfettiCelebrationProps) {
  const pieces = useRef(Array.from({ length: 60 }, createPiece));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (show) {
      pieces.current = Array.from({ length: 60 }, createPiece);
      timerRef.current = setTimeout(() => {
        onComplete?.();
      }, 4000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
        >
          {pieces.current.map(piece => (
            <motion.div
              key={piece.id}
              className="absolute top-0"
              style={{
                left: `${piece.x}%`,
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
                borderRadius: piece.shape === 'circle' ? '50%' : '2px',
              }}
              initial={{ y: -20, opacity: 1, rotate: piece.rotate }}
              animate={{
                y: '110vh',
                opacity: [1, 1, 0],
                rotate: piece.rotate + 540,
                x: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200],
              }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: 'easeIn',
              }}
            />
          ))}

          {message && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="bg-background/90 backdrop-blur-sm rounded-2xl px-8 py-6 text-center shadow-2xl border border-border">
                <div className="text-4xl mb-2">🎉</div>
                <h2 className="text-xl font-bold gradient-text">{message}</h2>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
