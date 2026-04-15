'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Map, Plus, Trash2 } from 'lucide-react';

interface SubjectProgress {
  id: string;
  subject: string;
  chapter: string;
  progress: number;
  status: string;
  notes: string;
}

const SUBJECTS = ['Physics', 'Chemistry', 'Maths', 'Biology', 'English', 'History', 'Other'];
const STATUSES = ['not_started', 'in_progress', 'done'] as const;
const STATUS_CONFIG = {
  not_started: { label: 'Not Started', color: 'bg-muted', dot: 'bg-muted-foreground/40', textClass: 'text-muted-foreground' },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 dark:bg-amber-900/20', dot: 'bg-amber-500', textClass: 'text-amber-700 dark:text-amber-400' },
  done: { label: 'Done', color: 'bg-emerald-100 dark:bg-emerald-900/20', dot: 'bg-emerald-500', textClass: 'text-emerald-700 dark:text-emerald-400' },
};

const CYCLE: Record<string, typeof STATUSES[number]> = {
  not_started: 'in_progress',
  in_progress: 'done',
  done: 'not_started',
};

export function ChapterCompletionMap() {
  const [chapters, setChapters] = useState<SubjectProgress[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newSubject, setNewSubject] = useState('Physics');
  const [newChapter, setNewChapter] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchChapters = useCallback(async () => {
    try {
      const res = await fetch('/api/subjects');
      if (res.ok) setChapters(await res.json());
    } catch {}
  }, []);

  useEffect(() => { fetchChapters(); }, [fetchChapters]);

  const handleAdd = async () => {
    if (!newChapter.trim()) return;
    setIsSaving(true);
    try {
      await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: newSubject, chapter: newChapter, status: 'not_started', progress: 0 }),
      });
      setNewChapter('');
      setIsAdding(false);
      await fetchChapters();
    } catch {}
    setIsSaving(false);
  };

  const handleCycleStatus = async (chapter: SubjectProgress) => {
    const nextStatus = CYCLE[chapter.status] || 'not_started';
    const progress = nextStatus === 'done' ? 100 : nextStatus === 'in_progress' ? 50 : 0;
    try {
      await fetch(`/api/subjects/${chapter.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, progress }),
      });
      setChapters(prev => prev.map(c => c.id === chapter.id ? { ...c, status: nextStatus, progress } : c));
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
      setChapters(prev => prev.filter(c => c.id !== id));
    } catch {}
  };

  const subjects = ['all', ...Array.from(new Set(chapters.map(c => c.subject)))];
  const filtered = selectedSubject === 'all' ? chapters : chapters.filter(c => c.subject === selectedSubject);

  const bySubject = filtered.reduce<Record<string, SubjectProgress[]>>((acc, c) => {
    if (!acc[c.subject]) acc[c.subject] = [];
    acc[c.subject].push(c);
    return acc;
  }, {});

  const totalDone = chapters.filter(c => c.status === 'done').length;
  const totalChapters = chapters.length;
  const overallProgress = totalChapters > 0 ? Math.round((totalDone / totalChapters) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Map className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Chapter Completion Map</p>
        </div>
        <Button size="sm" className="h-8 rounded-xl text-xs gap-1" onClick={() => setIsAdding(v => !v)}>
          <Plus className="h-3.5 w-3.5" /> Add Chapter
        </Button>
      </div>

      {totalChapters > 0 && (
        <div className="bg-muted/40 rounded-xl p-3">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-semibold">Overall Syllabus Progress</span>
            <span className="text-primary font-bold">{overallProgress}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <div className="flex gap-3 mt-2">
            {(['not_started', 'in_progress', 'done'] as const).map(s => {
              const count = chapters.filter(c => c.status === s).length;
              return (
                <div key={s} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s].dot}`} />
<<<<<<< HEAD
                  <span className="text-[10px] text-muted-foreground">{STATUS_CONFIG[s].label}: {count}</span>
=======
                  <span className="text-xs text-muted-foreground">{STATUS_CONFIG[s].label}: {count}</span>
>>>>>>> 925ef42 (Initial commit)
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isAdding && (
<<<<<<< HEAD
        <Card className="border-0 shadow-sm bg-primary/5">
=======
        <Card className="border border-primary/10 shadow-sm bg-primary/5">
>>>>>>> 925ef42 (Initial commit)
          <CardContent className="p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Select value={newSubject} onValueChange={setNewSubject}>
                <SelectTrigger className="rounded-xl h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input
                value={newChapter}
                onChange={e => setNewChapter(e.target.value)}
                placeholder="Chapter name"
                className="rounded-xl h-9 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={isSaving || !newChapter.trim()} className="flex-1 rounded-xl h-8 text-xs">
                {isSaving ? '...' : 'Add'}
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)} className="rounded-xl h-8 text-xs">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {subjects.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {subjects.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSubject(s)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedSubject === s ? 'bg-primary text-primary-foreground' : 'bg-muted/60 text-muted-foreground'}`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      )}

      {Object.keys(bySubject).length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <Map className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No chapters yet. Add your first chapter!</p>
          <p className="text-xs mt-1 opacity-70">Tap a chapter to cycle: Not Started → In Progress → Done</p>
        </div>
      ) : (
        Object.entries(bySubject).map(([subj, chs]) => {
          const subjDone = chs.filter(c => c.status === 'done').length;
          const subjTotal = chs.length;
          const subjPct = subjTotal > 0 ? Math.round((subjDone / subjTotal) * 100) : 0;
          return (
<<<<<<< HEAD
            <Card key={subj} className="border-0 shadow-sm">
=======
            <Card key={subj} className="border border-border/40 shadow-sm">
>>>>>>> 925ef42 (Initial commit)
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">{subj}</p>
                  <span className="text-xs text-primary font-bold">{subjPct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${subjPct}%` }} />
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {chs.map(ch => {
                    const cfg = STATUS_CONFIG[ch.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.not_started;
                    return (
                      <div key={ch.id} className={`flex items-center justify-between rounded-xl px-3 py-2 ${cfg.color} group cursor-pointer`} onClick={() => handleCycleStatus(ch)}>
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
<<<<<<< HEAD
                          <p className="text-[11px] font-medium truncate">{ch.chapter}</p>
=======
                          <p className="text-xs font-medium truncate">{ch.chapter}</p>
>>>>>>> 925ef42 (Initial commit)
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(ch.id); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive ml-1 flex-shrink-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
<<<<<<< HEAD
                <p className="text-[10px] text-muted-foreground mt-2 text-center">Tap a chapter to update its status</p>
=======
                <p className="text-xs text-muted-foreground mt-2 text-center">Tap a chapter to update its status</p>
>>>>>>> 925ef42 (Initial commit)
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
