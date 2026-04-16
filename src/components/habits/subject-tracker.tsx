'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, BookOpen, ChevronRight, Edit3, Check, Flag, AlertTriangle, Clock } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

interface SubjectItem {
  id: string;
  subject: string;
  chapter: string;
  progress: number;
  status: string;
  notes: string;
  updatedAt?: string;
  createdAt?: string;
}

const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'History', 'Geography', 'Economics', 'Accounts', 'Business Studies'];
const STREAM_SUBJECTS: Record<string, string[]> = {
  PCM: ['Physics', 'Chemistry', 'Mathematics', 'English'],
  PCB: ['Physics', 'Chemistry', 'Biology', 'English'],
  PCMB: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English'],
  Commerce: ['Accounts', 'Business Studies', 'Economics', 'Mathematics', 'English'],
  Humanities: ['History', 'Geography', 'Economics', 'English'],
};
const STATUSES = [
  { value: 'not_started', label: 'Not Started', color: 'bg-muted text-muted-foreground' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' },
  { value: 'revision', label: 'Revised', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' },
  { value: 'completed', label: 'Mastered', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' },
];
const PRIORITIES = [
  { value: 'high', label: 'High', color: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400', rank: 0 },
  { value: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400', rank: 1 },
  { value: 'low', label: 'Low', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300', rank: 2 },
];

const STATUS_RING_COLORS: Record<string, string> = {
  not_started: 'var(--muted-foreground)',
  in_progress: '#f59e0b',
  revision: '#3b82f6',
  completed: '#10b981',
};

function CircleRing({ pct, status, size = 52 }: { pct: number; status: string; size?: number }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const filled = Math.max(0, Math.min(1, pct / 100)) * c;
  const color = STATUS_RING_COLORS[status] || 'var(--primary)';
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} className="flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${filled} ${c}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
    </svg>
  );
}

function daysAgo(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  try {
    const days = differenceInDays(new Date(), parseISO(dateStr));
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    return `${days}d ago`;
  } catch { return null; }
}

function getStatusConfig(status: string) {
  return STATUSES.find(s => s.value === status) || STATUSES[0];
}
function getPriority(notes: string) {
  const match = notes.match(/\[priority:(high|medium|low)\]/);
  return match?.[1] || 'medium';
}
function getPriorityConfig(priority: string) {
  return PRIORITIES.find(p => p.value === priority) || PRIORITIES[1];
}
function buildNotesWithPriority(notes: string, priority: string) {
  const cleanNotes = notes.replace(/\[priority:(high|medium|low)\]\s*/g, '').trim();
  return `[priority:${priority}]${cleanNotes ? ` ${cleanNotes}` : ''}`;
}
function groupBySubject(items: SubjectItem[]) {
  const map: Record<string, SubjectItem[]> = {};
  for (const item of items) {
    if (!map[item.subject]) map[item.subject] = [];
    map[item.subject].push(item);
  }
  return map;
}
const getStreamKeyFromClass = (studentClass?: string) => {
  if (!studentClass) return '';
  const classNumber = Number(studentClass.match(/\d+/)?.[0]);
  if (classNumber !== 11 && classNumber !== 12) return '';
  if (studentClass.includes('PCMB')) return 'PCMB';
  if (studentClass.includes('PCM')) return 'PCM';
  if (studentClass.includes('PCB')) return 'PCB';
  if (studentClass.includes('Commerce')) return 'Commerce';
  if (studentClass.includes('Humanities')) return 'Humanities';
  return '';
};

function getMasteredStatus(chapters: SubjectItem[]): string {
  const statuses = chapters.map(c => c.status);
  if (statuses.every(s => s === 'completed')) return 'completed';
  if (statuses.some(s => s === 'revision' || s === 'completed')) return 'revision';
  if (statuses.some(s => s === 'in_progress')) return 'in_progress';
  return 'not_started';
}

export function SubjectTracker({ studentClass = '' }: { studentClass?: string }) {
  const [items, setItems] = useState<SubjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editProgress, setEditProgress] = useState(0);
  const [editStatus, setEditStatus] = useState('in_progress');
  const [editPriority, setEditPriority] = useState('medium');
  const [form, setForm] = useState({ subject: 'Physics', chapter: '', status: 'not_started', progress: 0, notes: '', priority: 'medium' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const streamKey = getStreamKeyFromClass(studentClass);
  const subjectOptions = STREAM_SUBJECTS[streamKey] || SUBJECTS;

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/subjects');
      if (res.ok) { setItems(await res.json()); }
    } catch { } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  useEffect(() => {
    if (!subjectOptions.includes(form.subject)) {
      setForm(f => ({ ...f, subject: subjectOptions[0] || 'Physics' }));
    }
  }, [form.subject, subjectOptions]);

  const handleAdd = async () => {
    if (!form.chapter.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, notes: buildNotesWithPriority(form.notes, form.priority) }),
      });
      if (res.ok) {
        await fetchItems();
        setExpandedSubject(form.subject);
        setForm({ subject: form.subject, chapter: '', status: 'not_started', progress: 0, notes: '', priority: 'medium' });
        setShowAdd(false);
      }
    } catch { } finally { setIsSubmitting(false); }
  };

  const handleUpdate = async (id: string) => {
    try {
      await fetch(`/api/subjects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: editProgress, status: editStatus, notes: buildNotesWithPriority(items.find(i => i.id === id)?.notes || '', editPriority) }),
      });
      setItems(prev => prev.map(i => i.id === id ? { ...i, progress: editProgress, status: editStatus, notes: buildNotesWithPriority(i.notes, editPriority), updatedAt: new Date().toISOString() } : i));
      setEditingId(null);
    } catch { }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
      setItems(prev => prev.filter(i => i.id !== id));
    } catch { }
  };

  const grouped = groupBySubject(items);
  const backlog = items
    .filter(i => i.status !== 'completed')
    .sort((a, b) => {
      const priorityDiff = getPriorityConfig(getPriority(a.notes)).rank - getPriorityConfig(getPriority(b.notes)).rank;
      if (priorityDiff !== 0) return priorityDiff;
      return a.progress - b.progress;
    });

  const totalChapters = items.length;
  const masteredChapters = items.filter(i => i.status === 'completed').length;
  const revisedChapters = items.filter(i => i.status === 'revision').length;
  const overallPct = totalChapters > 0 ? Math.round((masteredChapters / totalChapters) * 100) : 0;

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl bg-muted/50 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="px-4 pb-4 space-y-4">
      {/* Overall progress summary */}
      {totalChapters > 0 && (
        <Card className="border border-border/40 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <CircleRing pct={overallPct} status="completed" size={60} />
                <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'rotate(0deg)' }}>
                  <span className="text-xs font-bold text-foreground">{overallPct}%</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold mb-1.5">Overall Syllabus Progress</p>
                <div className="grid grid-cols-4 gap-1">
                  {STATUSES.map(s => {
                    const count = items.filter(i => i.status === s.value).length;
                    return (
                      <div key={s.value} className={`rounded-lg p-1.5 text-center ${s.color}`}>
                        <p className="text-sm font-bold">{count}</p>
                        <p className="text-xs leading-tight">{s.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Chapter button */}
      <Button onClick={() => setShowAdd(v => !v)} className="w-full rounded-xl h-10 shadow-md shadow-primary/20" size="sm">
        <Plus className="h-4 w-4 mr-1" />
        Add Chapter
      </Button>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Card className="border border-border/40 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Subject</Label>
                    <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="mt-1 w-full h-9 px-2 rounded-lg border border-input bg-background text-xs">
                      {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Chapter Name</Label>
                    <Input value={form.chapter} onChange={e => setForm(f => ({ ...f, chapter: e.target.value }))} placeholder="e.g., Chapter 3" className="mt-1 h-9 rounded-lg text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Status</Label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="mt-1 w-full h-9 px-2 rounded-lg border border-input bg-background text-xs">
                      {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Progress %</Label>
                    <Input type="number" min={0} max={100} value={form.progress} onChange={e => setForm(f => ({ ...f, progress: Number(e.target.value) }))} className="mt-1 h-9 rounded-lg text-xs" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Priority</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {PRIORITIES.map(priority => (
                      <button key={priority.value} type="button" onClick={() => setForm(f => ({ ...f, priority: priority.value }))}
                        className={`rounded-lg border px-2 py-1.5 text-xs font-semibold transition-colors ${form.priority === priority.value ? 'border-primary bg-primary/10 text-primary' : 'border-border/60 text-muted-foreground'}`}>
                        {priority.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-lg" onClick={() => setShowAdd(false)}>Cancel</Button>
                  <Button size="sm" className="flex-1 rounded-lg" onClick={handleAdd} disabled={isSubmitting || !form.chapter.trim()}>
                    {isSubmitting ? 'Saving...' : 'Add Chapter'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {streamKey && (
        <Card className="border border-primary/10 shadow-sm bg-primary/5">
          <CardContent className="p-3">
            <p className="text-xs font-semibold text-primary">{streamKey} subjects only</p>
            <p className="text-xs text-muted-foreground mt-0.5">Add chapters from your selected class 11/12 stream.</p>
          </CardContent>
        </Card>
      )}

      {backlog.length > 0 && (
        <Card className="border border-border/40 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <div>
                <p className="text-xs font-semibold">Smart Backlog Tracker</p>
                <p className="text-xs text-muted-foreground">High priority unfinished chapters first</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {backlog.slice(0, 5).map(ch => {
                const priority = getPriorityConfig(getPriority(ch.notes));
                const sConf = getStatusConfig(ch.status);
                return (
                  <button key={ch.id} type="button" onClick={() => setExpandedSubject(ch.subject)}
                    className="w-full flex items-center gap-2 rounded-xl bg-muted/35 px-2.5 py-2 text-left">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${priority.color}`}>{priority.label}</span>
                    <span className="flex-1 min-w-0 text-xs font-medium truncate">{ch.subject}: {ch.chapter}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${sConf.color}`}>{sConf.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No chapters tracked yet</p>
          <p className="text-xs mt-1 opacity-70">Start by adding a chapter above</p>
        </div>
      ) : (
        <div className="space-y-2">
          {Object.entries(grouped).map(([subject, chapters]) => {
            const sortedChapters = chapters.slice().sort((a, b) => {
              const priorityDiff = getPriorityConfig(getPriority(a.notes)).rank - getPriorityConfig(getPriority(b.notes)).rank;
              if (priorityDiff !== 0) return priorityDiff;
              return a.progress - b.progress;
            });
            const mastered = chapters.filter(c => c.status === 'completed').length;
            const revised = chapters.filter(c => c.status === 'revision').length;
            const inProgress = chapters.filter(c => c.status === 'in_progress').length;
            const pct = Math.round((mastered / chapters.length) * 100);
            const dominantStatus = getMasteredStatus(chapters);
            const isOpen = expandedSubject === subject;

            const latestUpdated = chapters
              .map(c => c.updatedAt || c.createdAt)
              .filter(Boolean)
              .sort()
              .at(-1);
            const lastStudied = daysAgo(latestUpdated);

            return (
              <Card key={subject} className="border border-border/40 shadow-sm overflow-hidden">
                <button className="w-full p-3 flex items-center gap-3 text-left" onClick={() => setExpandedSubject(isOpen ? null : subject)}>
                  <div className="relative flex-shrink-0">
                    <CircleRing pct={pct} status={dominantStatus} size={48} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold">{pct}%</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold">{subject}</span>
                      {lastStudied && (
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-full">
                          <Clock className="h-2.5 w-2.5" />
                          {lastStudied}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs text-muted-foreground">{chapters.length} chapters</span>
                      {mastered > 0 && <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">{mastered} mastered</span>}
                      {revised > 0 && <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 px-1.5 py-0.5 rounded-full">{revised} revised</span>}
                      {inProgress > 0 && <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 px-1.5 py-0.5 rounded-full">{inProgress} in progress</span>}
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="border-t border-border/50 divide-y divide-border/30">
                        {sortedChapters.map(ch => {
                          const sConf = getStatusConfig(ch.status);
                          const priority = getPriorityConfig(getPriority(ch.notes));
                          return (
                            <div key={ch.id} className="px-3 py-2">
                              {editingId === ch.id ? (
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 space-y-1.5">
                                    <div className="flex items-center gap-2">
                                      <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="flex-1 h-7 px-1 rounded border border-input bg-background text-xs">
                                        {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                      </select>
                                      <Input type="number" min={0} max={100} value={editProgress} onChange={e => setEditProgress(Number(e.target.value))} className="w-16 h-7 text-xs rounded px-1" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-1">
                                      {PRIORITIES.map(priority => (
                                        <button key={priority.value} type="button" onClick={() => setEditPriority(priority.value)}
                                          className={`rounded border px-1.5 py-1 text-xs font-semibold ${editPriority === priority.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
                                          {priority.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <button onClick={() => handleUpdate(ch.id)} className="p-1.5 rounded-lg bg-primary text-primary-foreground">
                                    <Check className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-xs font-medium truncate">{ch.chapter}</p>
                                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${priority.color}`}>
                                        <Flag className="h-2.5 w-2.5" />{priority.label}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${sConf.color}`}>{sConf.label}</span>
                                      {ch.progress > 0 && (
                                        <div className="flex items-center gap-1 flex-1">
                                          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-primary/60 rounded-full" style={{ width: `${ch.progress}%` }} />
                                          </div>
                                          <span className="text-xs text-muted-foreground">{ch.progress}%</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-0.5 flex-shrink-0">
                                    <button onClick={() => { setEditingId(ch.id); setEditProgress(ch.progress); setEditStatus(ch.status); setEditPriority(getPriority(ch.notes)); }} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                                      <Edit3 className="h-3 w-3 text-muted-foreground" />
                                    </button>
                                    <button onClick={() => handleDelete(ch.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
