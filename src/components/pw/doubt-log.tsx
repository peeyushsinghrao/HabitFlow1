'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HelpCircle, CheckCircle2, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface Doubt {
  id: string;
  subject: string;
  doubt: string;
  isResolved: boolean;
  resolution: string;
  createdAt: string;
}

const SUBJECTS = ['Physics', 'Chemistry', 'Maths', 'Biology', 'English', 'History', 'Other'];

export function DoubtLog() {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [subject, setSubject] = useState('Physics');
  const [doubt, setDoubt] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [resolution, setResolution] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  const fetchDoubts = useCallback(async () => {
    try {
      const res = await fetch('/api/doubts');
      if (res.ok) setDoubts(await res.json());
    } catch {}
  }, []);

  useEffect(() => { fetchDoubts(); }, [fetchDoubts]);

  const handleAdd = async () => {
    if (!doubt.trim()) return;
    setIsSaving(true);
    try {
      await fetch('/api/doubts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, doubt }),
      });
      setDoubt('');
      setIsAdding(false);
      await fetchDoubts();
    } catch {}
    setIsSaving(false);
  };

  const handleResolve = async (id: string) => {
    try {
      await fetch(`/api/doubts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isResolved: true, resolution }),
      });
      setExpandedId(null);
      setResolution('');
      await fetchDoubts();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/doubts/${id}`, { method: 'DELETE' });
      await fetchDoubts();
    } catch {}
  };

  const filtered = doubts.filter(d =>
    filter === 'all' ? true : filter === 'pending' ? !d.isResolved : d.isResolved
  );

  const pendingCount = doubts.filter(d => !d.isResolved).length;
  const resolvedCount = doubts.filter(d => d.isResolved).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Doubt Log</p>
        </div>
        <Button size="sm" className="h-8 rounded-xl text-xs gap-1" onClick={() => setIsAdding(v => !v)}>
          <Plus className="h-3.5 w-3.5" /> Add Doubt
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { id: 'all', label: 'All', count: doubts.length },
          { id: 'pending', label: 'Pending', count: pendingCount },
          { id: 'resolved', label: 'Resolved', count: resolvedCount },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as typeof filter)}
            className={`rounded-xl py-2 text-xs font-medium transition-all ${filter === f.id ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-muted-foreground'}`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border border-primary/10 shadow-sm bg-primary/5">
              <CardContent className="p-4 space-y-3">
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="rounded-xl h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Textarea
                  value={doubt}
                  onChange={e => setDoubt(e.target.value)}
                  placeholder="What's the doubt? e.g. Why does entropy increase in irreversible processes?"
                  className="resize-none rounded-xl text-sm min-h-[80px]"
                />
                <div className="flex gap-2">
                  <Button onClick={handleAdd} disabled={isSaving || !doubt.trim()} className="flex-1 rounded-xl h-9 text-sm">
                    {isSaving ? 'Saving...' : 'Log Doubt'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsAdding(false)} className="rounded-xl h-9 text-sm">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">
            {filter === 'resolved' ? 'No resolved doubts yet' : 'No doubts logged. Keep it clear! 🧠'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(d => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <Card className={`border-0 shadow-sm ${d.isResolved ? 'opacity-60' : ''}`}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${d.isResolved ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-primary">{d.subject}</span>
                        {d.isResolved && <span className="text-xs text-emerald-600 font-medium">✓ Resolved</span>}
                      </div>
                      <p className="text-xs text-foreground leading-relaxed">{d.doubt}</p>
                      {d.isResolved && d.resolution && (
                        <p className="text-xs text-muted-foreground mt-1 italic">→ {d.resolution}</p>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {!d.isResolved && (
                        <button
                          onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
                          className="text-muted-foreground hover:text-primary p-1 rounded transition-colors"
                        >
                          {expandedId === d.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedId === d.id && !d.isResolved && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 space-y-2"
                      >
                        <Textarea
                          value={resolution}
                          onChange={e => setResolution(e.target.value)}
                          placeholder="How did you resolve this doubt?"
                          className="resize-none rounded-xl text-xs min-h-[60px]"
                        />
                        <Button size="sm" className="w-full rounded-xl h-8 text-xs gap-1" onClick={() => handleResolve(d.id)}>
                          <CheckCircle2 className="h-3 w-3" /> Mark Resolved
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
