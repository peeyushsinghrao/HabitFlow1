'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfettiCelebration } from './confetti-celebration';

interface PetProfile { petName: string; petLevel: number; petXP: number; }

const PET_STAGES = [
  { minLevel: 1, maxLevel: 3, emoji: '🥚', name: 'Egg', desc: 'Just starting out...', color: 'from-slate-100 to-slate-200' },
  { minLevel: 4, maxLevel: 7, emoji: '🐣', name: 'Hatchling', desc: 'Growing fast!', color: 'from-yellow-100 to-amber-100' },
  { minLevel: 8, maxLevel: 12, emoji: '🐥', name: 'Chick', desc: 'Building habits!', color: 'from-amber-100 to-yellow-200' },
  { minLevel: 13, maxLevel: 18, emoji: '🦊', name: 'Fox', desc: 'Clever & disciplined!', color: 'from-orange-100 to-amber-200' },
  { minLevel: 19, maxLevel: 25, emoji: '🦁', name: 'Lion', desc: 'Fierce & consistent!', color: 'from-amber-200 to-yellow-300' },
  { minLevel: 26, maxLevel: 99, emoji: '🐉', name: 'Dragon', desc: 'Legendary achiever!', color: 'from-purple-200 to-violet-300' },
];

const PET_MOODS = [
  { threshold: 0, emoji: '😴', label: 'Sleepy', desc: 'Complete some habits to wake me up!' },
  { threshold: 20, emoji: '😐', label: 'Bored', desc: 'Let\'s get moving together!' },
  { threshold: 40, emoji: '😊', label: 'Happy', desc: 'You\'re doing great, keep going!' },
  { threshold: 60, emoji: '😄', label: 'Excited', desc: 'On fire! I love your energy!' },
  { threshold: 80, emoji: '🤩', label: 'Ecstatic', desc: 'You\'re my hero! Unstoppable!' },
];

function getPetMood(todayProgress: number) {
  return PET_MOODS.slice().reverse().find(m => todayProgress >= m.threshold) || PET_MOODS[0];
}

function getPetStage(level: number) {
  return PET_STAGES.find(s => level >= s.minLevel && level <= s.maxLevel) || PET_STAGES[0];
}

const XP_PER_LEVEL = 50;
const LS_KEY = 'nuviora_last_pet_level';

interface PetCompanionProps { todayProgress: number; habitsCompleted: number; }

export function PetCompanion({ todayProgress, habitsCompleted }: PetCompanionProps) {
  const [pet, setPet] = useState<PetProfile>({ petName: 'Buddy', petLevel: 1, petXP: 0 });
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState<{ level: number; stageName: string; stageEmoji: string } | null>(null);
  const didMount = useRef(false);

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        const level = data.petLevel || 1;
        const name = data.petName || 'Buddy';
        const xp = data.petXP || 0;
        setPet({ petName: name, petLevel: level, petXP: xp });
        setNewName(name);

        if (typeof window !== 'undefined') {
          const lastLevel = parseInt(localStorage.getItem(LS_KEY) ?? '0', 10);
          if (lastLevel > 0 && level > lastLevel && !didMount.current) {
            const stage = getPetStage(level);
            setLevelUpInfo({ level, stageName: stage.name, stageEmoji: stage.emoji });
            setShowLevelUp(true);
            setTimeout(() => setShowLevelUp(false), 4500);
          }
          localStorage.setItem(LS_KEY, String(level));
          didMount.current = true;
        }
      })
      .catch(() => {});
  }, []);

  const stage = getPetStage(pet.petLevel);
  const mood = getPetMood(todayProgress);
  const xpInLevel = pet.petXP % XP_PER_LEVEL;
  const xpProgress = (xpInLevel / XP_PER_LEVEL) * 100;

  const handleRename = async () => {
    if (!newName.trim()) return;
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petName: newName.trim() }),
      });
      setPet(p => ({ ...p, petName: newName.trim() }));
      setIsRenaming(false);
    } catch {}
  };

  const pet_messages = [
    `Keep going! You've done ${habitsCompleted} habit${habitsCompleted !== 1 ? 's' : ''} today! 🎯`,
    `I believe in you! Let's make today count! ✨`,
    `Every habit you complete makes me stronger! 💪`,
    `You're my favorite human! Don't give up! 🌟`,
    `Together we'll reach the top! 🏆`,
  ];

  return (
    <>
      <ConfettiCelebration
        show={showLevelUp}
        message={levelUpInfo ? `${levelUpInfo.stageEmoji} Level ${levelUpInfo.level}! ${pet.petName} evolved into a ${levelUpInfo.stageName}!` : undefined}
        onComplete={() => setShowLevelUp(false)}
      />

      <Card className="border border-border/40 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <button className="w-full text-left" onClick={() => setIsOpen(v => !v)}>
            <div className={`bg-gradient-to-r ${stage.color} p-4 flex items-center gap-3`}>
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-4xl flex-shrink-0"
              >
                {stage.emoji}
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-foreground/90">{pet.petName}</p>
                  <span className="text-xs bg-white/60 text-foreground/70 px-2 py-0.5 rounded-full font-medium">Lv.{pet.petLevel} {stage.name}</span>
                </div>
                <p className="text-xs text-foreground/60 mt-0.5">{mood.emoji} {mood.label} — {mood.desc}</p>
                <div className="mt-1.5 h-1.5 rounded-full bg-white/40 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-white/80"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <p className="text-xs text-foreground/50 mt-0.5">{xpInLevel}/{XP_PER_LEVEL} XP to next level</p>
              </div>
            </div>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-3">
                  <div className="bg-muted/40 rounded-xl p-3">
                    <p className="text-xs text-center text-foreground/70 italic">
                      &quot;{pet_messages[Math.floor(Date.now() / 86400000) % pet_messages.length]}&quot;
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-muted/40 rounded-xl p-2">
                      <p className="text-sm font-bold">{pet.petLevel}</p>
                      <p className="text-xs text-muted-foreground">Level</p>
                    </div>
                    <div className="bg-muted/40 rounded-xl p-2">
                      <p className="text-sm font-bold">{pet.petXP}</p>
                      <p className="text-xs text-muted-foreground">Total XP</p>
                    </div>
                    <div className="bg-muted/40 rounded-xl p-2">
                      <p className="text-sm font-bold">{todayProgress}%</p>
                      <p className="text-xs text-muted-foreground">Today</p>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-xl p-2.5">
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Evolution Path</p>
                    <div className="flex items-center gap-1 overflow-x-auto pb-1">
                      {PET_STAGES.map((s, i) => (
                        <div key={i} className="flex items-center gap-0.5 flex-shrink-0">
                          <div className={`flex flex-col items-center px-1.5 py-1 rounded-lg ${pet.petLevel >= s.minLevel ? 'bg-primary/15' : 'opacity-30'}`}>
                            <span className="text-sm">{s.emoji}</span>
                            <span className="text-[8px] text-muted-foreground mt-0.5">Lv{s.minLevel}</span>
                          </div>
                          {i < PET_STAGES.length - 1 && <span className="text-[8px] text-muted-foreground">→</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {!isRenaming ? (
                    <Button variant="outline" size="sm" className="w-full rounded-xl h-8 text-xs" onClick={() => setIsRenaming(true)}>
                      ✏️ Rename {pet.petName}
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="Pet name"
                        className="rounded-xl h-8 text-sm flex-1"
                        maxLength={20}
                      />
                      <Button size="sm" className="rounded-xl h-8 px-3" onClick={handleRename}>Save</Button>
                      <Button size="sm" variant="outline" className="rounded-xl h-8 px-3" onClick={() => setIsRenaming(false)}>✕</Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </>
  );
}
