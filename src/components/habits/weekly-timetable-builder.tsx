'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarRange, Clock, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TimetableBlock {
  id: string;
  day: number;
  start: string;
  end: string;
  subject: string;
  task: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const STORAGE_KEY = 'nuviora-weekly-timetable';

function loadBlocks(): TimetableBlock[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveBlocks(blocks: TimetableBlock[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
  window.dispatchEvent(new Event('nuviora-weekly-timetable-updated'));
}

function sortBlocks(blocks: TimetableBlock[]) {
  return [...blocks].sort((a, b) => a.day - b.day || a.start.localeCompare(b.start));
}

export function WeeklyTimetableBuilder({ studentClass = '' }: { studentClass?: string }) {
  const [blocks, setBlocks] = useState<TimetableBlock[]>([]);
  const [day, setDay] = useState(new Date().getDay());
  const [subject, setSubject] = useState('');
  const [task, setTask] = useState('');
  const [start, setStart] = useState('17:00');
  const [end, setEnd] = useState('18:00');

  useEffect(() => {
    setBlocks(loadBlocks());
  }, []);

  const visibleBlocks = useMemo(() => sortBlocks(blocks).filter(block => block.day === day), [blocks, day]);
  const weeklyCount = blocks.length;

  const addBlock = () => {
    const cleanSubject = subject.trim() || (studentClass.includes('PCM') ? 'Physics' : 'Study');
    const cleanTask = task.trim() || 'Focused study';
    const next = sortBlocks([
      ...blocks,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        day,
        start,
        end,
        subject: cleanSubject,
        task: cleanTask,
      },
    ]);
    setBlocks(next);
    saveBlocks(next);
    setTask('');
  };

  const deleteBlock = (id: string) => {
    const next = blocks.filter(block => block.id !== id);
    setBlocks(next);
    saveBlocks(next);
  };

  const cloneToday = () => {
    const todayBlocks = blocks.filter(block => block.day === day);
    if (todayBlocks.length === 0) return;
    const nextDay = (day + 1) % 7;
    const cloned = todayBlocks.map(block => ({
      ...block,
      id: `${Date.now()}-${block.id}`,
      day: nextDay,
    }));
    const next = sortBlocks([...blocks, ...cloned]);
    setBlocks(next);
    saveBlocks(next);
    setDay(nextDay);
  };

  return (
    <div className="space-y-4">
<<<<<<< HEAD
      <Card className="border-0 shadow-sm overflow-hidden">
=======
      <Card className="border border-border/40 shadow-sm overflow-hidden">
>>>>>>> 925ef42 (Initial commit)
        <CardContent className="p-4 bg-gradient-to-br from-primary/8 via-background to-muted/40">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <CalendarRange className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-base font-bold">Weekly Timetable Builder</p>
              <p className="text-xs text-muted-foreground mt-0.5">Plan fixed study blocks and see the next 2 hours on Home.</p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-4">
            {DAYS.map((label, index) => (
              <button
                key={label}
                onClick={() => setDay(index)}
<<<<<<< HEAD
                className={`rounded-xl py-2 text-[10px] font-semibold transition-colors ${
=======
                className={`rounded-xl py-2 text-xs font-semibold transition-colors ${
>>>>>>> 925ef42 (Initial commit)
                  day === index ? 'bg-primary text-primary-foreground' : 'bg-background/70 text-muted-foreground hover:bg-muted'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Subject"
              className="h-10 rounded-xl bg-background/80 border border-border/50 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/25"
            />
            <input
              value={task}
              onChange={e => setTask(e.target.value)}
              placeholder="Task"
              className="h-10 rounded-xl bg-background/80 border border-border/50 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/25"
            />
            <input
              type="time"
              value={start}
              onChange={e => setStart(e.target.value)}
              className="h-10 rounded-xl bg-background/80 border border-border/50 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/25"
            />
            <input
              type="time"
              value={end}
              onChange={e => setEnd(e.target.value)}
              className="h-10 rounded-xl bg-background/80 border border-border/50 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/25"
            />
          </div>

          <div className="flex gap-2 mt-3">
            <Button onClick={addBlock} className="h-9 rounded-xl text-xs flex-1">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add block
            </Button>
            <Button onClick={cloneToday} variant="outline" className="h-9 rounded-xl text-xs" disabled={visibleBlocks.length === 0}>
              Copy to next day
            </Button>
          </div>
        </CardContent>
      </Card>

<<<<<<< HEAD
      <Card className="border-0 shadow-sm">
=======
      <Card className="border border-border/40 shadow-sm">
>>>>>>> 925ef42 (Initial commit)
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">{DAYS[day]} schedule</p>
            </div>
<<<<<<< HEAD
            <span className="text-[10px] text-muted-foreground">{weeklyCount} weekly blocks</span>
=======
            <span className="text-xs text-muted-foreground">{weeklyCount} weekly blocks</span>
>>>>>>> 925ef42 (Initial commit)
          </div>

          {visibleBlocks.length > 0 ? (
            <div className="space-y-2">
              {visibleBlocks.map((block, index) => (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center gap-3 rounded-2xl border border-border/40 bg-muted/30 p-3"
                >
<<<<<<< HEAD
                  <div className="w-16 text-[10px] font-bold text-primary">
=======
                  <div className="w-16 text-xs font-bold text-primary">
>>>>>>> 925ef42 (Initial commit)
                    {block.start}<br />{block.end}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{block.subject}</p>
<<<<<<< HEAD
                    <p className="text-[11px] text-muted-foreground truncate">{block.task}</p>
=======
                    <p className="text-xs text-muted-foreground truncate">{block.task}</p>
>>>>>>> 925ef42 (Initial commit)
                  </div>
                  <button
                    onClick={() => deleteBlock(block.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-5 text-center">
              <p className="text-sm font-semibold">No blocks for {DAYS[day]} yet</p>
              <p className="text-xs text-muted-foreground mt-1">Add your first study slot above.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}