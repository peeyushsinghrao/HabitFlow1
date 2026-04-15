'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, CheckCircle2, Trash2, Clock, AlertCircle, BookMarked, CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, isToday, parseISO, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth } from 'date-fns';

interface RevisionItem {
  id: string;
  subject: string;
  topic: string;
  notes: string;
  studiedDate: string;
  nextReview1: string;
  nextReview3: string;
  nextReview7: string;
  doneReview1: boolean;
  doneReview3: boolean;
  doneReview7: boolean;
  createdAt: string;
}

type CalendarBookings = Record<string, string[]>;

const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'History', 'Geography', 'Economics', 'Accounts', 'Business Studies'];

function getDueReviews(item: RevisionItem) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const due: { label: string; key: 'doneReview1' | 'doneReview3' | 'doneReview7'; date: string; done: boolean }[] = [];
  if (!item.doneReview1) due.push({ label: '+1 day', key: 'doneReview1', date: item.nextReview1, done: item.doneReview1 });
  if (!item.doneReview3) due.push({ label: '+3 days', key: 'doneReview3', date: item.nextReview3, done: item.doneReview3 });
  if (!item.doneReview7) due.push({ label: '+7 days', key: 'doneReview7', date: item.nextReview7, done: item.doneReview7 });
  return due.filter(d => d.date <= today);
}

function isOverdue(date: string) {
  return date < format(new Date(), 'yyyy-MM-dd');
}

function loadBookings(): CalendarBookings {
  try {
    const raw = localStorage.getItem('revision-calendar-bookings');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveBookings(b: CalendarBookings) {
  try { localStorage.setItem('revision-calendar-bookings', JSON.stringify(b)); } catch { }
}

export function RevisionReminder() {
  const [items, setItems] = useState<RevisionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ subject: 'Physics', topic: '', notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<'due' | 'all' | 'plan'>('due');

  const [calMonth, setCalMonth] = useState(new Date());
  const [bookings, setBookings] = useState<CalendarBookings>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [bookingInput, setBookingInput] = useState('');

  useEffect(() => { setBookings(loadBookings()); }, []);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/revisions');
      if (res.ok) { setItems(await res.json()); }
    } catch { } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleAdd = async () => {
    if (!form.topic.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/revisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        await fetchItems();
        setForm({ subject: form.subject, topic: '', notes: '' });
        setShowAdd(false);
      }
    } catch { } finally { setIsSubmitting(false); }
  };

  const markDone = async (id: string, key: 'doneReview1' | 'doneReview3' | 'doneReview7') => {
    try {
      await fetch(`/api/revisions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: true }),
      });
      setItems(prev => prev.map(i => i.id === id ? { ...i, [key]: true } : i));
    } catch { }
  };

  const deleteItem = async (id: string) => {
    try {
      await fetch(`/api/revisions/${id}`, { method: 'DELETE' });
      setItems(prev => prev.filter(i => i.id !== id));
    } catch { }
  };

  const addBooking = () => {
    const t = bookingInput.trim();
    if (!t || !selectedDate) return;
    const next = { ...bookings, [selectedDate]: [...(bookings[selectedDate] || []), t] };
    setBookings(next);
    saveBookings(next);
    setBookingInput('');
  };

  const removeBooking = (date: string, topic: string) => {
    const next = { ...bookings, [date]: (bookings[date] || []).filter(t => t !== topic) };
    if (!next[date]?.length) delete next[date];
    setBookings(next);
    saveBookings(next);
  };

  const dueItems = items.filter(item => getDueReviews(item).length > 0);
  const displayed = filter === 'due' ? dueItems : items;

  const monthStart = startOfMonth(calMonth);
  const monthEnd = endOfMonth(calMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);

  const getDateDots = (dateStr: string) => {
    const hasBooking = (bookings[dateStr]?.length || 0) > 0;
    const hasRevision = items.some(item =>
      [item.nextReview1, item.nextReview3, item.nextReview7].some(d => d === dateStr) &&
      !(item.doneReview1 && item.doneReview3 && item.doneReview7)
    );
    return { hasBooking, hasRevision };
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl bg-muted/50 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="px-4 pb-4 space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2">
<<<<<<< HEAD
        <Card className="border-0 shadow-sm">
          <CardContent className="p-2.5 text-center">
            <p className="text-lg font-bold text-rose-500">{dueItems.length}</p>
            <p className="text-[10px] text-muted-foreground">Due Today</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-2.5 text-center">
            <p className="text-lg font-bold text-primary">{items.length}</p>
            <p className="text-[10px] text-muted-foreground">Total Topics</p>
=======
        <Card className="border border-border/40 shadow-sm">
          <CardContent className="p-2.5 text-center">
            <p className="text-lg font-bold text-rose-500">{dueItems.length}</p>
            <p className="text-xs text-muted-foreground">Due Today</p>
          </CardContent>
        </Card>
        <Card className="border border-border/40 shadow-sm">
          <CardContent className="p-2.5 text-center">
            <p className="text-lg font-bold text-primary">{items.length}</p>
            <p className="text-xs text-muted-foreground">Total Topics</p>
>>>>>>> 925ef42 (Initial commit)
          </CardContent>
        </Card>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 bg-muted/40 p-1 rounded-xl">
        {(['due', 'plan', 'all'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === f ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>
            {f === 'due' ? `Due (${dueItems.length})` : f === 'plan' ? '📅 Plan' : `All (${items.length})`}
          </button>
        ))}
      </div>

      {/* ── PLAN: Monthly calendar ── */}
      {filter === 'plan' && (
        <AnimatePresence mode="wait">
          <motion.div key="plan" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
<<<<<<< HEAD
            <Card className="border-0 shadow-sm">
=======
            <Card className="border border-border/40 shadow-sm">
>>>>>>> 925ef42 (Initial commit)
              <CardContent className="p-4">
                {/* Month header */}
                <div className="flex items-center justify-between mb-3">
                  <button onClick={() => setCalMonth(m => subMonths(m, 1))} className="p-1 rounded-lg hover:bg-muted">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <p className="text-sm font-semibold">{format(calMonth, 'MMMM yyyy')}</p>
                  <button onClick={() => setCalMonth(m => addMonths(m, 1))} className="p-1 rounded-lg hover:bg-muted">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 mb-1">
                  {['S','M','T','W','T','F','S'].map((d, i) => (
<<<<<<< HEAD
                    <div key={i} className="text-[10px] font-semibold text-muted-foreground text-center py-0.5">{d}</div>
=======
                    <div key={i} className="text-xs font-semibold text-muted-foreground text-center py-0.5">{d}</div>
>>>>>>> 925ef42 (Initial commit)
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
                  {monthDays.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const { hasBooking, hasRevision } = getDateDots(dateStr);
                    const isSelected = selectedDate === dateStr;
                    const todayDate = isToday(day);
                    const inMonth = isSameMonth(day, calMonth);
                    return (
                      <button
                        key={dateStr}
                        onClick={() => setSelectedDate(isSelected ? null : dateStr)}
<<<<<<< HEAD
                        className={`relative flex flex-col items-center py-1.5 rounded-lg text-[11px] font-medium transition-all ${
=======
                        className={`relative flex flex-col items-center py-1.5 rounded-lg text-xs font-medium transition-all ${
>>>>>>> 925ef42 (Initial commit)
                          isSelected ? 'bg-primary text-primary-foreground' :
                          todayDate ? 'bg-primary/10 text-primary font-bold' :
                          inMonth ? 'hover:bg-muted text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {day.getDate()}
                        <div className="flex gap-0.5 mt-0.5 h-1">
                          {hasBooking && <div className="w-1 h-1 rounded-full bg-blue-500" />}
                          {hasRevision && <div className="w-1 h-1 rounded-full bg-rose-500" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

<<<<<<< HEAD
                <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
=======
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
>>>>>>> 925ef42 (Initial commit)
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Planned</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />Spaced review</span>
                </div>
              </CardContent>
            </Card>

            {/* Selected date detail */}
            <AnimatePresence>
              {selectedDate && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}>
                  <Card className="border-0 shadow-sm border-primary/20">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{format(parseISO(selectedDate), 'EEE, d MMM yyyy')}</p>
                        <button onClick={() => setSelectedDate(null)} className="text-muted-foreground hover:text-foreground">
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Planned topics */}
                      {(bookings[selectedDate]?.length || 0) > 0 && (
                        <div className="space-y-1">
<<<<<<< HEAD
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase">Planned for this day</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(bookings[selectedDate] || []).map(topic => (
                              <span key={topic} className="flex items-center gap-1 text-[11px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full font-medium">
=======
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Planned for this day</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(bookings[selectedDate] || []).map(topic => (
                              <span key={topic} className="flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full font-medium">
>>>>>>> 925ef42 (Initial commit)
                                {topic}
                                <button onClick={() => removeBooking(selectedDate, topic)}>
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Spaced revision due */}
                      {(() => {
                        const due = items.flatMap(item => [
                          { item, label: '+1d', date: item.nextReview1, done: item.doneReview1 },
                          { item, label: '+3d', date: item.nextReview3, done: item.doneReview3 },
                          { item, label: '+7d', date: item.nextReview7, done: item.doneReview7 },
                        ]).filter(r => r.date === selectedDate && !r.done);
                        return due.length > 0 ? (
                          <div className="space-y-1">
<<<<<<< HEAD
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase">Spaced Reviews Due</p>
                            <div className="flex flex-wrap gap-1.5">
                              {due.map(r => (
                                <span key={`${r.item.id}-${r.label}`} className="text-[11px] bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-2.5 py-1 rounded-full font-medium">
=======
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Spaced Reviews Due</p>
                            <div className="flex flex-wrap gap-1.5">
                              {due.map(r => (
                                <span key={`${r.item.id}-${r.label}`} className="text-xs bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-2.5 py-1 rounded-full font-medium">
>>>>>>> 925ef42 (Initial commit)
                                  {r.item.subject}: {r.item.topic} {r.label}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : null;
                      })()}

                      {/* Add topic input */}
                      <div className="flex gap-1.5">
                        <Input
                          value={bookingInput}
                          onChange={e => setBookingInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') addBooking(); }}
                          placeholder="Plan a topic for this day..."
                          className="flex-1 h-8 rounded-lg text-xs"
                        />
                        <Button size="sm" variant="outline" className="h-8 px-3 rounded-lg text-xs" onClick={addBooking}>
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Add topic button */}
      {filter !== 'plan' && (
        <Button onClick={() => setShowAdd(v => !v)} className="w-full rounded-xl h-10 shadow-md shadow-primary/20" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Topic to Review
        </Button>
      )}

      {/* Add form */}
      <AnimatePresence>
        {showAdd && filter !== 'plan' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
<<<<<<< HEAD
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Subject</Label>
=======
            <Card className="border border-border/40 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Subject</Label>
>>>>>>> 925ef42 (Initial commit)
                    <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="mt-1 w-full h-9 px-2 rounded-lg border border-input bg-background text-xs">
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
<<<<<<< HEAD
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Topic Studied</Label>
=======
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Topic Studied</Label>
>>>>>>> 925ef42 (Initial commit)
                    <Input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} placeholder="e.g., Thermodynamics" className="mt-1 h-9 rounded-lg text-xs" />
                  </div>
                </div>
                <div>
<<<<<<< HEAD
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Notes (optional)</Label>
                  <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Key formulas or concepts..." className="mt-1 h-9 rounded-lg text-xs" />
                </div>
                <p className="text-[10px] text-muted-foreground bg-muted/40 px-2 py-1.5 rounded-lg">
=======
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Notes (optional)</Label>
                  <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Key formulas or concepts..." className="mt-1 h-9 rounded-lg text-xs" />
                </div>
                <p className="text-xs text-muted-foreground bg-muted/40 px-2 py-1.5 rounded-lg">
>>>>>>> 925ef42 (Initial commit)
                  📅 Revision reminders will be set for +1, +3, and +7 days from today
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-lg" onClick={() => setShowAdd(false)}>Cancel</Button>
                  <Button size="sm" className="flex-1 rounded-lg" onClick={handleAdd} disabled={isSubmitting || !form.topic.trim()}>
                    {isSubmitting ? 'Saving...' : 'Schedule'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Items list */}
      {filter !== 'plan' && displayed.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookMarked className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">{filter === 'due' ? 'No revisions due today!' : 'No topics added yet'}</p>
          <p className="text-xs mt-1 opacity-70">{filter === 'due' ? 'Great job! 🎉' : 'Add topics you studied to schedule revisions'}</p>
        </div>
      ) : filter !== 'plan' ? (
        <div className="space-y-2">
          {displayed.map(item => {
            const dueReviews = getDueReviews(item);
            const allDone = item.doneReview1 && item.doneReview3 && item.doneReview7;
            return (
              <motion.div key={item.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Card className={`border-0 shadow-sm ${allDone ? 'opacity-50' : ''}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
<<<<<<< HEAD
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{item.subject}</span>
                          <span className="text-xs font-medium">{item.topic}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Studied: {item.studiedDate}</p>
=======
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{item.subject}</span>
                          <span className="text-xs font-medium">{item.topic}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Studied: {item.studiedDate}</p>
>>>>>>> 925ef42 (Initial commit)
                        <div className="flex items-center gap-2 mt-2">
                          {[
                            { key: 'doneReview1' as const, label: '+1d', date: item.nextReview1, done: item.doneReview1 },
                            { key: 'doneReview3' as const, label: '+3d', date: item.nextReview3, done: item.doneReview3 },
                            { key: 'doneReview7' as const, label: '+7d', date: item.nextReview7, done: item.doneReview7 },
                          ].map(r => (
                            <button key={r.key} onClick={() => !r.done && markDone(item.id, r.key)} disabled={r.done} title={`Review on ${r.date}`}
<<<<<<< HEAD
                              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
=======
                              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
>>>>>>> 925ef42 (Initial commit)
                                r.done ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' :
                                isOverdue(r.date) ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 animate-pulse' : 'bg-muted text-muted-foreground'
                              }`}>
                              {r.done ? <CheckCircle2 className="h-3 w-3" /> : isOverdue(r.date) ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                              {r.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
