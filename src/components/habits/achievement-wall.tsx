'use client';

import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Trophy, Flame, Zap, Gem, Star, Target, Droplets, Heart,
  Package, Award, Moon, Sunrise, Brain, Lock, Sparkles,
  RotateCcw, Swords, HelpCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type BadgeIconEntry = { Icon: LucideIcon; color: string; bg: string };

const BADGE_ICONS: Record<string, BadgeIconEntry> = {
  first_habit:      { Icon: Sparkles,  color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-500/15' },
  week_streak:      { Icon: Flame,     color: 'text-orange-500',  bg: 'bg-orange-100 dark:bg-orange-500/15' },
  month_streak:     { Icon: Zap,       color: 'text-yellow-500',  bg: 'bg-yellow-100 dark:bg-yellow-500/15' },
  century_streak:   { Icon: Gem,       color: 'text-blue-500',    bg: 'bg-blue-100 dark:bg-blue-500/15' },
  perfect_day:      { Icon: Star,      color: 'text-amber-500',   bg: 'bg-amber-100 dark:bg-amber-500/15' },
  focus_master:     { Icon: Target,    color: 'text-primary',     bg: 'bg-primary/10' },
  water_champ:      { Icon: Droplets,  color: 'text-sky-500',     bg: 'bg-sky-100 dark:bg-sky-500/15' },
  mood_logger:      { Icon: Heart,     color: 'text-rose-500',    bg: 'bg-rose-100 dark:bg-rose-500/15' },
  habit_pack:       { Icon: Package,   color: 'text-violet-500',  bg: 'bg-violet-100 dark:bg-violet-500/15' },
  level_5:          { Icon: Award,     color: 'text-amber-500',   bg: 'bg-amber-100 dark:bg-amber-500/15' },
  level_10:         { Icon: Trophy,    color: 'text-amber-600',   bg: 'bg-amber-100 dark:bg-amber-500/15' },
  night_owl:        { Icon: Moon,      color: 'text-indigo-500',  bg: 'bg-indigo-100 dark:bg-indigo-500/15' },
  early_bird:       { Icon: Sunrise,   color: 'text-orange-400',  bg: 'bg-orange-100 dark:bg-orange-500/15' },
  deep_work:        { Icon: Brain,     color: 'text-teal-500',    bg: 'bg-teal-100 dark:bg-teal-500/15' },
  triple_focus:     { Icon: Lock,      color: 'text-slate-500',   bg: 'bg-slate-100 dark:bg-slate-500/15' },
  lucky_1111:       { Icon: Sparkles,  color: 'text-purple-500',  bg: 'bg-purple-100 dark:bg-purple-500/15' },
  comeback_kid:     { Icon: RotateCcw, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-500/15' },
  weekend_warrior:  { Icon: Swords,    color: 'text-rose-500',    bg: 'bg-rose-100 dark:bg-rose-500/15' },
};

const FALLBACK_ICON: BadgeIconEntry = { Icon: Award, color: 'text-muted-foreground', bg: 'bg-muted' };

const ALL_BADGES = [
  { type: 'first_habit',     name: 'First Step',       description: 'Created your first habit',            xp: 50,  hidden: false },
  { type: 'week_streak',     name: 'Week Warrior',     description: '7-day streak achieved',               xp: 100, hidden: false },
  { type: 'month_streak',    name: 'Monthly Master',   description: '30-day streak achieved',              xp: 200, hidden: false },
  { type: 'century_streak',  name: 'Century Club',     description: '100-day streak achieved',             xp: 500, hidden: false },
  { type: 'perfect_day',     name: 'Perfect Day',      description: 'All habits done in a day',            xp: 50,  hidden: false },
  { type: 'focus_master',    name: 'Focus Master',     description: 'Completed 10 focus sessions',         xp: 100, hidden: false },
  { type: 'water_champ',     name: 'Hydration Hero',   description: 'Hit water goal 7 days in a row',      xp: 75,  hidden: false },
  { type: 'mood_logger',     name: 'Mood Tracker',     description: 'Logged mood for 7 days',              xp: 50,  hidden: false },
  { type: 'habit_pack',      name: 'Pack Leader',      description: 'Used a habit template pack',          xp: 30,  hidden: false },
  { type: 'level_5',         name: 'Rising Star',      description: 'Reached Level 5',                     xp: 100, hidden: false },
  { type: 'level_10',        name: 'Legend',           description: 'Reached Level 10',                    xp: 300, hidden: false },
  { type: 'night_owl',       name: 'Night Owl',        description: 'Studied past midnight',               xp: 75,  hidden: true },
  { type: 'early_bird',      name: 'Early Bird',       description: 'Started a session before sunrise',    xp: 75,  hidden: true },
  { type: 'deep_work',       name: 'Deep Work Monk',   description: 'Completed a 90-min focus session',   xp: 100, hidden: true },
  { type: 'triple_focus',    name: 'Triple Lock-In',   description: '3 focus sessions in one day',        xp: 100, hidden: true },
  { type: 'lucky_1111',      name: '11:11 Wish',       description: 'Completed a habit at exactly 11:11', xp: 50,  hidden: true },
  { type: 'comeback_kid',    name: 'Comeback Kid',     description: 'Returned after a 7-day break',       xp: 75,  hidden: true },
  { type: 'weekend_warrior', name: 'Weekend Warrior',  description: 'Completed all habits Sat + Sun',     xp: 100, hidden: true },
];

interface AchievementWallProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  earnedBadgeTypes: string[];
  totalXP: number;
  level: number;
}

function BadgeIcon({ type, size = 'md' }: { type: string; size?: 'sm' | 'md' }) {
  const entry = BADGE_ICONS[type] ?? FALLBACK_ICON;
  const { Icon, color, bg } = entry;
  const boxSize = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  return (
    <div className={`${boxSize} rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
      <Icon className={`${iconSize} ${color}`} />
    </div>
  );
}

export function AchievementWall({ open, onOpenChange, earnedBadgeTypes, totalXP, level }: AchievementWallProps) {
  const earned = ALL_BADGES.filter(b => earnedBadgeTypes.includes(b.type));
  const locked = ALL_BADGES.filter(b => !earnedBadgeTypes.includes(b.type) && !b.hidden);
  const hiddenCount = ALL_BADGES.filter(b => b.hidden && !earnedBadgeTypes.includes(b.type)).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 gap-0 overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 px-5 pt-5 pb-4 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2 text-base">
              <Trophy className="h-5 w-5" /> Achievement Wall
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-4 mt-3">
            <div className="text-center">
              <p className="text-2xl font-bold">{earned.length}</p>
              <p className="text-xs text-white/70">Earned</p>
            </div>
            <div className="w-px h-8 bg-white/30" />
            <div className="text-center">
              <p className="text-2xl font-bold">{ALL_BADGES.length}</p>
              <p className="text-xs text-white/70">Total</p>
            </div>
            <div className="w-px h-8 bg-white/30" />
            <div className="text-center">
              <p className="text-2xl font-bold">{totalXP}</p>
              <p className="text-xs text-white/70">XP</p>
            </div>
            <div className="w-px h-8 bg-white/30" />
            <div className="text-center">
              <p className="text-2xl font-bold">Lv{level}</p>
              <p className="text-xs text-white/70">Level</p>
            </div>
          </div>
          {/* Progress */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-white/70 mb-1">
              <span>Progress</span>
              <span>{Math.round((earned.length / ALL_BADGES.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(earned.length / ALL_BADGES.length) * 100}%` }}
                transition={{ delay: 0.3, duration: 0.8 }}
              />
            </div>
          </div>
        </div>

        <div className="px-5 py-4 overflow-y-auto custom-scrollbar max-h-[calc(85vh-200px)] space-y-4">
          {/* Earned badges */}
          {earned.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-amber-400" /> Earned ({earned.length})
              </p>
              <div className="grid grid-cols-3 gap-2">
                {earned.map((badge, i) => (
                  <motion.div
                    key={badge.type}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-500/10 dark:to-yellow-500/10 border border-amber-200/50 dark:border-amber-500/20 rounded-xl p-3 text-center shadow-sm flex flex-col items-center"
                  >
<<<<<<< HEAD
=======
<<<<<<< HEAD
                    <div className="text-3xl mb-1.5">{badge.icon}</div>
                    <p className="text-xs font-bold text-foreground leading-tight">{badge.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{badge.description}</p>
                    <div className="mt-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
=======
>>>>>>> 925ef42 (Initial commit)
                    <div className="mb-1.5"><BadgeIcon type={badge.type} /></div>
                    <p className="text-[10px] font-bold text-foreground leading-tight">{badge.name}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{badge.description}</p>
                    <div className="mt-1.5 text-[9px] font-semibold text-amber-600 dark:text-amber-400">
<<<<<<< HEAD
=======
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
                      +{badge.xp} XP
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Locked badges */}
          {locked.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Lock className="h-3 w-3" /> Locked ({locked.length})
              </p>
              <div className="grid grid-cols-3 gap-2">
                {locked.map((badge, i) => (
                  <motion.div
                    key={badge.type}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: earned.length * 0.05 + i * 0.04 }}
                    className="bg-muted/40 border border-border/30 rounded-xl p-3 text-center grayscale opacity-50 flex flex-col items-center"
                  >
<<<<<<< HEAD
=======
<<<<<<< HEAD
                    <div className="text-3xl mb-1.5 blur-[1px]">{badge.icon}</div>
                    <p className="text-xs font-bold leading-tight">{badge.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{badge.description}</p>
                    <div className="mt-1.5 text-xs font-semibold text-muted-foreground">
=======
>>>>>>> 925ef42 (Initial commit)
                    <div className="mb-1.5 blur-[1px]"><BadgeIcon type={badge.type} /></div>
                    <p className="text-[10px] font-bold leading-tight">{badge.name}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{badge.description}</p>
                    <div className="mt-1.5 text-[9px] font-semibold text-muted-foreground">
<<<<<<< HEAD
=======
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
                      +{badge.xp} XP
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {earned.length === 0 && locked.length === 0 && (
            <div className="text-center py-8">
              <Trophy className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium">Start earning badges!</p>
              <p className="text-xs text-muted-foreground mt-1">Complete habits to unlock achievements</p>
            </div>
          )}

          {hiddenCount > 0 && (
            <div className="mt-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-violet-400" /> Secret Badges
              </p>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: Math.min(hiddenCount, 6) }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-muted/30 border border-dashed border-border/50 rounded-xl p-3 text-center flex flex-col items-center"
                  >
<<<<<<< HEAD
=======
<<<<<<< HEAD
                    <div className="text-3xl mb-1.5 grayscale opacity-40">❓</div>
                    <p className="text-xs font-bold leading-tight text-muted-foreground">Mystery</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5 leading-tight">Earn to reveal</p>
=======
>>>>>>> 925ef42 (Initial commit)
                    <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center mb-1.5">
                      <HelpCircle className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                    <p className="text-[10px] font-bold leading-tight text-muted-foreground">Mystery</p>
                    <p className="text-[9px] text-muted-foreground/60 mt-0.5 leading-tight">Earn to reveal</p>
<<<<<<< HEAD
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground/60 text-center mt-2">
=======
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground/60 text-center mt-2">
>>>>>>> 925ef42 (Initial commit)
                {hiddenCount} secret badge{hiddenCount > 1 ? 's' : ''} waiting to be discovered
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
