'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CheckCircle, Lock, Sparkles } from 'lucide-react';

interface Reward {
  id: string;
  name: string;
  cost: number;
  emoji: string;
  category: string;
  kind: 'consumable' | 'collectible';
  description: string;
  requirement?: { type: string; value: string | number; label: string };
  locked?: boolean;
  owned?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  break: '☕ Breaks',
  reward: '🎁 Rewards',
  focus: '🌳 Focus',
  theme: '🎨 Themes',
  cosmetic: '✨ Cosmetics',
  boost: '⚡ Boosts',
};

export function RewardShop() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [coins, setCoins] = useState(0);
  const [freezes, setFreezes] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [recentlyRedeemed, setRecentlyRedeemed] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [confirmReward, setConfirmReward] = useState<Reward | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/rewards').then(r => r.json()),
      fetch('/api/coins').then(r => r.json()),
    ]).then(([r, c]) => {
      setRewards(r);
      setCoins(c.coins ?? 0);
      setFreezes(c.streakFreezes ?? 1);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const handleRedeem = async (reward: Reward) => {
    if (coins < reward.cost || redeeming || reward.locked || reward.owned) return;
    setRedeeming(reward.name);
    setConfirmReward(null);
    try {
      const res = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: reward.name, cost: reward.cost, emoji: reward.emoji, kind: reward.kind }),
      });
      if (res.ok) {
        const data = await res.json();
        setCoins(data.coins);
        setRecentlyRedeemed(reward.name);
        if (reward.kind === 'collectible') {
          setRewards(items => items.map(item => item.id === reward.id ? { ...item, owned: true } : item));
        }
        setTimeout(() => setRecentlyRedeemed(null), 3500);
      }
    } catch { /* ignore */ } finally { setRedeeming(null); }
  };

  const buyFreeze = async () => {
    const cost = 100;
    if (coins < cost) return;
    try {
      const res = await fetch('/api/coins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: -cost, reason: 'Bought streak freeze' }) });
      if (res.ok) {
        setCoins(c => c - cost);
        setFreezes(f => f + 1);
      }
    } catch { /* ignore */ }
  };

  const categories = ['all', ...Array.from(new Set(rewards.map(r => r.category)))];
  const filtered = activeCategory === 'all' ? rewards : rewards.filter(r => r.category === activeCategory);

  if (isLoading) return <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-muted/50 animate-pulse" />)}</div>;

  return (
    <div className="px-4 pb-4 space-y-4">
      {/* Fixed top success notification */}
      <AnimatePresence>
        {recentlyRedeemed && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl max-w-xs w-[90vw]"
          >
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-semibold">Redeemed: {recentlyRedeemed} 🎉</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet header */}
      <div className="grid grid-cols-2 gap-2">
<<<<<<< HEAD
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-500/10 dark:to-yellow-500/10">
=======
        <Card className="border border-amber-200/40 dark:border-amber-800/20 shadow-sm bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-500/10 dark:to-yellow-500/10">
>>>>>>> 925ef42 (Initial commit)
          <CardContent className="p-3 flex items-center gap-2">
            <span className="text-2xl">🪙</span>
            <div>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{coins}</p>
<<<<<<< HEAD
              <p className="text-[10px] text-muted-foreground">Coins earned</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-500/10 dark:to-blue-500/10">
=======
              <p className="text-xs text-muted-foreground">Coins earned</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-sky-200/40 dark:border-sky-800/20 shadow-sm bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-500/10 dark:to-blue-500/10">
>>>>>>> 925ef42 (Initial commit)
          <CardContent className="p-3 flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <div>
              <p className="text-xl font-bold text-sky-600 dark:text-sky-400">{freezes}</p>
<<<<<<< HEAD
              <p className="text-[10px] text-muted-foreground">Streak freezes</p>
=======
              <p className="text-xs text-muted-foreground">Streak freezes</p>
>>>>>>> 925ef42 (Initial commit)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coin info */}
<<<<<<< HEAD
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3">
          <p className="text-xs font-semibold mb-2">How this Store works 🪙</p>
          <div className="grid grid-cols-2 gap-1.5 text-[10px] text-muted-foreground">
=======
      <Card className="border border-border/40 shadow-sm">
        <CardContent className="p-3">
<<<<<<< HEAD
          <p className="text-xs font-semibold mb-2">How to earn coins 🪙</p>
          <div className="grid grid-cols-2 gap-1.5 text-xs text-muted-foreground">
=======
          <p className="text-xs font-semibold mb-2">How this Store works 🪙</p>
          <div className="grid grid-cols-2 gap-1.5 text-[10px] text-muted-foreground">
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
            <span>✅ Complete habit: +10</span>
            <span>📝 Log test: +15</span>
            <span>🎯 Daily mission: +20</span>
            <span>🔥 7-day streak: +50</span>
            <span>☕ Breaks: one-time use</span>
            <span>✨ Collectibles: owned, not equipped</span>
          </div>
        </CardContent>
      </Card>

      {/* Buy streak freeze */}
      <button
        onClick={buyFreeze}
        disabled={coins < 100}
        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
          coins >= 100
            ? 'border-sky-200 bg-sky-50 dark:border-sky-500/30 dark:bg-sky-500/10 hover:bg-sky-100'
            : 'border-border bg-muted/30 opacity-50 cursor-not-allowed'
        }`}
      >
        <span className="text-2xl">🛡️</span>
        <div className="flex-1 text-left">
          <p className="text-xs font-semibold">Buy Streak Freeze</p>
<<<<<<< HEAD
          <p className="text-[10px] text-muted-foreground">Protect your streak for 1 missed day</p>
=======
          <p className="text-xs text-muted-foreground">Protect your streak for 1 missed day</p>
>>>>>>> 925ef42 (Initial commit)
        </div>
        <span className="text-xs font-bold text-sky-600 dark:text-sky-400">100🪙</span>
      </button>

      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
<<<<<<< HEAD
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all ${
=======
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
>>>>>>> 925ef42 (Initial commit)
              activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            {cat === 'all' ? 'All' : CATEGORY_LABELS[cat] || cat}
          </button>
        ))}
      </div>

      {/* Rewards grid */}
      <div className="grid grid-cols-2 gap-2">
        {filtered.map(reward => {
          const canAfford = coins >= reward.cost;
          const canRedeem = canAfford && !reward.locked && !reward.owned;
          return (
            <motion.div key={reward.name} whileTap={{ scale: 0.97 }}>
              <Card className={`border-0 shadow-sm overflow-hidden ${!canRedeem ? 'opacity-70' : 'hover:shadow-md'}`}>
                <CardContent className="p-3 text-center">
                  <div className="relative">
                    <p className="text-2xl mb-1">{reward.emoji}</p>
                    {reward.locked && <Lock className="absolute -top-1 right-1 h-3.5 w-3.5 text-muted-foreground" />}
                    {reward.owned && <CheckCircle className="absolute -top-1 right-1 h-3.5 w-3.5 text-emerald-500" />}
                  </div>
                  <p className="text-xs font-semibold leading-tight">{reward.name}</p>
<<<<<<< HEAD
=======
<<<<<<< HEAD
                  <p className="text-xs text-muted-foreground mt-0.5">{CATEGORY_LABELS[reward.category] || reward.category}</p>
                  <button
                    onClick={() => canAfford && !redeeming && setConfirmReward(reward)}
                    disabled={!canAfford || !!redeeming}
                    className={`mt-2 w-full py-1.5 rounded-lg text-xs font-bold transition-all ${
                      canAfford
=======
>>>>>>> 925ef42 (Initial commit)
                  <p className="text-[10px] text-muted-foreground mt-0.5">{CATEGORY_LABELS[reward.category] || reward.category}</p>
                  <p className="text-[9px] text-muted-foreground/80 mt-1 leading-snug min-h-8">{reward.description}</p>
                  <div className="mt-1 flex justify-center">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                      reward.kind === 'consumable' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' : 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'
                    }`}>
                      {reward.kind === 'consumable' ? 'One-time use' : <><Sparkles className="h-2.5 w-2.5" /> Own only</>}
                    </span>
                  </div>
                  {reward.requirement && (
                    <p className={`text-[9px] mt-1 ${reward.locked ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {reward.locked ? `Requires ${reward.requirement.label}` : `${reward.requirement.label} unlocked`}
                    </p>
                  )}
                  <button
                    onClick={() => canRedeem && !redeeming && setConfirmReward(reward)}
                    disabled={!canRedeem || !!redeeming}
                    className={`mt-2 w-full py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      canRedeem
<<<<<<< HEAD
=======
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    {reward.owned ? 'Owned' : reward.locked ? 'Locked' : redeeming === reward.name ? '...' : `${reward.cost}🪙`}
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmReward} onOpenChange={open => { if (!open) setConfirmReward(null); }}>
        <AlertDialogContent className="rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {confirmReward?.emoji} Redeem Reward?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to redeem <span className="font-semibold text-foreground">{confirmReward?.name}</span> for <span className="font-semibold text-amber-600">{confirmReward?.cost}🪙</span>? {confirmReward?.kind === 'consumable' ? 'This is a one-time-use reward and will not be added to equipped items.' : 'This will be saved as owned only and will not be auto-equipped.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-primary hover:bg-primary/90"
              onClick={() => confirmReward && handleRedeem(confirmReward)}
            >
              Yes, Redeem!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
