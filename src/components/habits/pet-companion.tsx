'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfettiCelebration } from './confetti-celebration';

interface PetProfile { petName: string; petLevel: number; petXP: number; }

const TREE_STAGES = [
  { minLevel: 1,  maxLevel: 3,  name: 'Seed',        color: 'from-amber-50 to-amber-100',   desc: 'Just starting out…' },
  { minLevel: 4,  maxLevel: 7,  name: 'Sprout',       color: 'from-green-50 to-emerald-100', desc: 'Growing fast!' },
  { minLevel: 8,  maxLevel: 12, name: 'Sapling',      color: 'from-emerald-50 to-green-100', desc: 'Building habits!' },
  { minLevel: 13, maxLevel: 18, name: 'Tree',         color: 'from-green-100 to-teal-100',   desc: 'Steady & strong!' },
  { minLevel: 19, maxLevel: 25, name: 'Grand Tree',   color: 'from-teal-100 to-cyan-100',    desc: 'Fierce & consistent!' },
  { minLevel: 26, maxLevel: 99, name: 'Ancient Tree', color: 'from-violet-100 to-purple-100',desc: 'Legendary achiever!' },
];

const PET_MOODS = [
  { threshold: 0,  emoji: '😴', label: 'Sleepy',   desc: 'Complete some habits to wake me up!' },
  { threshold: 20, emoji: '😐', label: 'Bored',    desc: "Let's get moving together!" },
  { threshold: 40, emoji: '😊', label: 'Happy',    desc: "You're doing great, keep going!" },
  { threshold: 60, emoji: '😄', label: 'Excited',  desc: 'On fire! I love your energy!' },
  { threshold: 80, emoji: '🤩', label: 'Ecstatic', desc: "You're my hero! Unstoppable!" },
];

function getPetMood(p: number) { return PET_MOODS.slice().reverse().find(m => p >= m.threshold) || PET_MOODS[0]; }
function getStage(lvl: number) { return TREE_STAGES.find(s => lvl >= s.minLevel && lvl <= s.maxLevel) || TREE_STAGES[0]; }
function getStageIdx(lvl: number) { return TREE_STAGES.findIndex(s => lvl >= s.minLevel && lvl <= s.maxLevel); }

// ── SVG Tree stages ────────────────────────────────────────────────────────────
function TreeSVG({ stage, mood }: { stage: number; mood: string }) {
  const leafColor = stage >= 5 ? '#a78bfa' : stage >= 3 ? '#22c55e' : '#4ade80';
  const trunkColor = stage >= 5 ? '#7c3aed' : '#92400e';
  const glowColor = stage >= 5 ? 'rgba(167,139,250,0.25)' : stage >= 4 ? 'rgba(34,197,94,0.18)' : 'transparent';

  return (
    <svg viewBox="0 0 80 90" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Stage 0 — Seed */}
      {stage === 0 && (
        <>
          <ellipse cx="40" cy="75" rx="14" ry="5" fill="#92400e" opacity="0.25" />
          <ellipse cx="40" cy="68" rx="8" ry="9" fill={trunkColor} opacity="0.7" />
          <ellipse cx="40" cy="59" rx="5" ry="5" fill={leafColor} opacity="0.8" />
          <line x1="40" y1="54" x2="37" y2="50" stroke={leafColor} strokeWidth="1.5" strokeLinecap="round" />
          <ellipse cx="36" cy="49" rx="3" ry="3" fill={leafColor} opacity="0.9" />
        </>
      )}

      {/* Stage 1 — Sprout */}
      {stage === 1 && (
        <>
          <ellipse cx="40" cy="78" rx="16" ry="4" fill={trunkColor} opacity="0.2" />
          <rect x="37" y="55" width="6" height="22" rx="3" fill={trunkColor} />
          <motion.ellipse
            cx="40" cy="48" rx="14" ry="10"
            fill={leafColor} animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <ellipse cx="28" cy="56" rx="8" ry="6" fill={leafColor} opacity="0.85" />
          <ellipse cx="52" cy="56" rx="8" ry="6" fill={leafColor} opacity="0.85" />
        </>
      )}

      {/* Stage 2 — Sapling */}
      {stage === 2 && (
        <>
          <ellipse cx="40" cy="80" rx="18" ry="4" fill={trunkColor} opacity="0.2" />
          <path d="M37,80 L37,50 Q37,46 40,44 Q43,46 43,50 L43,80 Z" fill={trunkColor} />
          <line x1="37" y1="64" x2="26" y2="58" stroke={trunkColor} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="43" y1="64" x2="54" y2="58" stroke={trunkColor} strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="40" cy="39" rx="18" ry="13" fill={leafColor} opacity="0.9" />
          <ellipse cx="24" cy="53" rx="9" ry="7" fill={leafColor} opacity="0.85" />
          <ellipse cx="56" cy="53" rx="9" ry="7" fill={leafColor} opacity="0.85" />
        </>
      )}

      {/* Stage 3 — Tree */}
      {stage === 3 && (
        <>
          <ellipse cx="40" cy="81" rx="18" ry="3" fill={trunkColor} opacity="0.25" />
          <path d="M36,81 L36,46 Q36,41 40,39 Q44,41 44,46 L44,81 Z" fill={trunkColor} />
          <line x1="36" y1="60" x2="22" y2="52" stroke={trunkColor} strokeWidth="3" strokeLinecap="round" />
          <line x1="44" y1="60" x2="58" y2="52" stroke={trunkColor} strokeWidth="3" strokeLinecap="round" />
          <line x1="36" y1="53" x2="28" y2="45" stroke={trunkColor} strokeWidth="2" strokeLinecap="round" />
          <line x1="44" y1="53" x2="52" y2="45" stroke={trunkColor} strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="40" cy="31" rx="22" ry="16" fill={leafColor} />
          <ellipse cx="20" cy="48" rx="10" ry="8" fill={leafColor} opacity="0.8" />
          <ellipse cx="60" cy="48" rx="10" ry="8" fill={leafColor} opacity="0.8" />
          <ellipse cx="28" cy="38" rx="10" ry="7" fill={leafColor} opacity="0.85" />
          <ellipse cx="52" cy="38" rx="10" ry="7" fill={leafColor} opacity="0.85" />
          {/* Fruits */}
          <circle cx="30" cy="30" r="3" fill="#f87171" />
          <circle cx="50" cy="28" r="3" fill="#f87171" />
          <circle cx="40" cy="24" r="2.5" fill="#fbbf24" />
        </>
      )}

      {/* Stage 4 — Grand Tree */}
      {stage === 4 && (
        <>
          <ellipse cx="40" cy="82" rx="20" ry="4" fill={trunkColor} opacity="0.3" />
          <path d="M35,82 L35,44 Q35,38 40,36 Q45,38 45,44 L45,82 Z" fill={trunkColor} />
          <line x1="35" y1="62" x2="18" y2="50" stroke={trunkColor} strokeWidth="3.5" strokeLinecap="round" />
          <line x1="45" y1="62" x2="62" y2="50" stroke={trunkColor} strokeWidth="3.5" strokeLinecap="round" />
          <line x1="35" y1="54" x2="24" y2="44" stroke={trunkColor} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="45" y1="54" x2="56" y2="44" stroke={trunkColor} strokeWidth="2.5" strokeLinecap="round" />
          {/* Glow */}
          <ellipse cx="40" cy="28" rx="28" ry="22" fill={glowColor} />
          <ellipse cx="40" cy="28" rx="24" ry="19" fill={leafColor} opacity="0.9" />
          <ellipse cx="17" cy="46" rx="11" ry="9" fill={leafColor} opacity="0.85" />
          <ellipse cx="63" cy="46" rx="11" ry="9" fill={leafColor} opacity="0.85" />
          <ellipse cx="25" cy="35" rx="12" ry="9" fill={leafColor} opacity="0.8" />
          <ellipse cx="55" cy="35" rx="12" ry="9" fill={leafColor} opacity="0.8" />
          {/* Flowers */}
          {[[28,20],[40,15],[52,20],[22,30],[58,30]].map(([cx,cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.5" fill="#ec4899" opacity="0.85" />
              <circle cx={cx} cy={cy} r="1.5" fill="#fbbf24" />
            </g>
          ))}
        </>
      )}

      {/* Stage 5 — Ancient Tree (golden/purple) */}
      {stage >= 5 && (
        <>
          {/* Aura glow */}
          <ellipse cx="40" cy="30" rx="34" ry="28" fill="rgba(167,139,250,0.15)" />
          <ellipse cx="40" cy="82" rx="22" ry="4" fill={trunkColor} opacity="0.35" />
          <path d="M34,82 L34,42 Q34,35 40,33 Q46,35 46,42 L46,82 Z" fill={trunkColor} />
          <line x1="34" y1="64" x2="15" y2="50" stroke={trunkColor} strokeWidth="4" strokeLinecap="round" />
          <line x1="46" y1="64" x2="65" y2="50" stroke={trunkColor} strokeWidth="4" strokeLinecap="round" />
          <line x1="34" y1="55" x2="22" y2="42" stroke={trunkColor} strokeWidth="3" strokeLinecap="round" />
          <line x1="46" y1="55" x2="58" y2="42" stroke={trunkColor} strokeWidth="3" strokeLinecap="round" />
          <motion.ellipse cx="40" cy="24" rx="28" ry="21"
            fill={leafColor} animate={{ opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          <ellipse cx="14" cy="47" rx="12" ry="10" fill={leafColor} opacity="0.9" />
          <ellipse cx="66" cy="47" rx="12" ry="10" fill={leafColor} opacity="0.9" />
          <ellipse cx="24" cy="33" rx="13" ry="10" fill={leafColor} opacity="0.85" />
          <ellipse cx="56" cy="33" rx="13" ry="10" fill={leafColor} opacity="0.85" />
          {/* Gold/purple glowing orbs */}
          {[[28,16],[40,10],[52,16],[20,26],[60,26],[35,6],[45,8]].map(([cx,cy], i) => (
            <motion.circle key={i} cx={cx} cy={cy} r="4"
              fill={i % 2 === 0 ? '#fbbf24' : '#c4b5fd'}
              animate={{ opacity: [0.7, 1, 0.7], r: [3.5, 4.5, 3.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </>
      )}

      {/* Mood indicator */}
      <text x="40" y="88" textAnchor="middle" fontSize="10">{mood}</text>
    </svg>
  );
}

// ── Particle burst on level-up ─────────────────────────────────────────────────
function ParticleBurst({ show }: { show: boolean }) {
  const particles = Array.from({ length: 12 }, (_, i) => i);
  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-20">
          {particles.map(i => {
            const angle = (i / particles.length) * 360;
            const rad = (angle * Math.PI) / 180;
            const dx = Math.cos(rad) * 50;
            const dy = Math.sin(rad) * 50;
            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{ backgroundColor: i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#4ade80' : '#a78bfa' }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: dx, y: dy, opacity: 0, scale: 0 }}
                exit={{}}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
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
  const [showParticles, setShowParticles] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState<{ level: number; stageName: string } | null>(null);
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
          const stored = localStorage.getItem(LS_KEY);
          const lastLevel = stored ? parseInt(stored, 10) : 0;
          // Always update storage on mount first, then check
          localStorage.setItem(LS_KEY, String(level));
          if (!didMount.current && lastLevel > 0 && level > lastLevel) {
            const stage = getStage(level);
            setLevelUpInfo({ level, stageName: stage.name });
            setShowLevelUp(true);
            setShowParticles(true);
            setTimeout(() => { setShowLevelUp(false); setShowParticles(false); }, 4500);
          }
          didMount.current = true;
        }
      })
      .catch(() => {});
  }, []);

  const stage = getStage(pet.petLevel);
  const stageIdx = getStageIdx(pet.petLevel);
  const mood = getPetMood(todayProgress);
  const xpInLevel = pet.petXP % XP_PER_LEVEL;
  const xpProgress = (xpInLevel / XP_PER_LEVEL) * 100;

  // Progress within current stage
  const levelInStage = pet.petLevel - stage.minLevel + 1;
  const levelsInStage = stage.maxLevel - stage.minLevel + 1;

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
        message={levelUpInfo ? `🌳 Level ${levelUpInfo.level}! ${pet.petName} grew into ${levelUpInfo.stageName}!` : undefined}
        onComplete={() => setShowLevelUp(false)}
      />

      <Card className="border border-border/40 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <button className="w-full text-left" onClick={() => setIsOpen(v => !v)}>
            <div className={`bg-gradient-to-r ${stage.color} p-4 flex items-center gap-3`}>
              {/* SVG Tree */}
              <div className="relative flex-shrink-0 w-14 h-14">
                <ParticleBurst show={showParticles} />
                <motion.div
                  key={stageIdx}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className="w-full h-full"
                >
                  <TreeSVG stage={stageIdx} mood={mood.emoji} />
                </motion.div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-foreground/90">{pet.petName}</p>
                  <span className="text-xs bg-white/60 text-foreground/70 px-2 py-0.5 rounded-full font-medium">
                    Lv.{pet.petLevel} {stage.name}
                  </span>
                </div>
                <p className="text-xs text-foreground/60 mt-0.5">{mood.emoji} {mood.label} — {mood.desc}</p>

                {/* XP bar */}
                <div className="mt-1.5 h-1.5 rounded-full bg-white/40 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-white/80"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>

                {/* Stage progress indicator */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xs text-foreground/50">{xpInLevel}/{XP_PER_LEVEL} XP</p>
                  <span className="text-foreground/30 text-xs">·</span>
                  <p className="text-xs text-foreground/50">Stage {stageIdx + 1}: Lv {levelInStage}/{levelsInStage}</p>
                </div>
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

                  {/* Stage evolution path */}
                  <div className="bg-muted/30 rounded-xl p-2.5">
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Growth Path</p>
                    <div className="flex items-center gap-1 overflow-x-auto pb-1">
                      {TREE_STAGES.map((s, i) => (
                        <div key={i} className="flex items-center gap-0.5 flex-shrink-0">
                          <div className={`flex flex-col items-center px-1.5 py-1 rounded-lg ${pet.petLevel >= s.minLevel ? 'bg-primary/15' : 'opacity-30'}`}>
                            <div className="w-6 h-6">
                              <TreeSVG stage={i} mood="" />
                            </div>
                            <span className="text-[8px] text-muted-foreground mt-0.5">{s.name}</span>
                          </div>
                          {i < TREE_STAGES.length - 1 && <span className="text-[8px] text-muted-foreground">→</span>}
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
