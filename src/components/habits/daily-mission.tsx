'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Target, CheckCircle2, Plus, Coins } from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  coinsReward: number;
  date: string;
}

export function DailyMissionWidget() {
  const [mission, setMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    fetch('/api/mission').then(r => r.json()).then(data => {
      setMission(data);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
    fetch('/api/coins').then(r => r.json()).then(data => setCoins(data.coins ?? 0)).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: desc }),
      });
      if (res.ok) {
        setMission(await res.json());
        setShowForm(false);
        setTitle(''); setDesc('');
      }
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  const handleComplete = async () => {
    if (!mission || mission.isCompleted) return;
    try {
      const res = await fetch('/api/mission', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: true }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMission(updated);
        setCoins(c => c + updated.coinsReward);
      }
    } catch { /* ignore */ }
  };

  if (isLoading) return null;

  return (
    <Card className="border border-border/40 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-border/30">
          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
            <Target className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Today's Mission</p>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">
            <span className="text-xs">🪙</span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{coins}</span>
          </div>
        </div>

        <div className="p-4">
          {!mission && !showForm && (
            <div className="text-center py-2">
              <p className="text-xs text-muted-foreground mb-3">Set your one big priority for today</p>
              <Button size="sm" onClick={() => setShowForm(true)} className="rounded-xl h-9 shadow-md shadow-primary/20">
                <Plus className="h-3.5 w-3.5 mr-1" /> Set Mission
              </Button>
            </div>
          )}

          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-2"
              >
                <Input
                  placeholder="e.g., Complete Current Electricity DPP + revise formulas"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="rounded-xl h-10 text-xs"
                  autoFocus
                />
                <Input
                  placeholder="Notes or sub-tasks (optional)"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  className="rounded-xl h-9 text-xs"
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-lg" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button size="sm" className="flex-1 rounded-lg" onClick={handleSave} disabled={saving || !title.trim()}>
                    {saving ? 'Saving...' : 'Set Mission (+20🪙)'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {mission && !showForm && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <button
                onClick={handleComplete}
                disabled={mission.isCompleted}
                className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  mission.isCompleted
                    ? 'bg-emerald-500 text-white'
                    : 'border-2 border-dashed border-primary/40 hover:border-primary'
                }`}
              >
                {mission.isCompleted && <CheckCircle2 className="h-4 w-4" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold leading-tight ${mission.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                  {mission.title}
                </p>
                {mission.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{mission.description}</p>
                )}
                {mission.isCompleted ? (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                    ✅ Mission complete! +{mission.coinsReward}🪙 earned
                  </p>
                ) : (
                  <button onClick={() => { setTitle(mission.title); setDesc(mission.description); setShowForm(true); }} className="text-xs text-primary hover:underline mt-1">
                    Edit mission
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
