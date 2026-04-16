'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ClipboardList,
  Coffee,
  Target,
  FileDown,
  CalendarDays,
  CheckCircle2,
  Circle,
  Loader2,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Types ────────────────────────────────────────────────────────

interface HistoryClass {
  subject: string;
  time: string;
  topic: string;
  teacher: string;
  attendedLive: boolean;
  attendedRecorded: boolean;
}

interface HistoryTodo {
  title: string;
  completed: boolean;
}

interface HistoryDaily {
  studyWork?: {
    theoryRevised?: boolean;
    dppSolved?: boolean;
    practiceSheet?: boolean;
    pyqPracticed?: boolean;
    formulaRevised?: boolean;
  };
  task?: {
    hasTask?: boolean;
    testName?: string;
    score?: string;
    accuracy?: string;
    mistakes?: string;
    improvedAt?: string;
  };
}

interface HistoryRecord {
  id: string;
  date: string;
  classesJson: string;
  todosJson: string;
  dailyJson: string;
  classesAttended: number;
  todosCompleted: number;
  todosTotal: number;
  hasTest: boolean;
  isRestDay: boolean;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────

function getTodayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateDisplay(dateStr: string): { dayName: string; full: string } {
  const d = new Date(dateStr + 'T00:00:00');
  return {
    dayName: d.toLocaleDateString('en-US', { weekday: 'long' }),
    full: d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isFutureDate(dateStr: string): boolean {
  return dateStr > getTodayLocal();
}

// ─── Component ────────────────────────────────────────────────────

interface PWHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PWHistorySheet({ open, onOpenChange }: PWHistorySheetProps) {
  const [selectedDate, setSelectedDate] = useState(getTodayLocal());
  const [record, setRecord] = useState<HistoryRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Parse record data
  const classes: HistoryClass[] = record ? JSON.parse(record.classesJson) : [];
  const todos: HistoryTodo[] = record ? JSON.parse(record.todosJson) : [];
  const daily: HistoryDaily = record ? JSON.parse(record.dailyJson) : {};
  const studyWork = daily.studyWork || {};
  const task = daily.task || {};

  const fetchHistory = useCallback(async (date: string) => {
    setLoading(true);
    setRecord(null);
    try {
      const res = await fetch(
        `/api/pw/history?date=${encodeURIComponent(date)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setRecord(data);
      } else {
        setRecord(null);
      }
    } catch {
      setRecord(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch when date changes or sheet opens
  useEffect(() => {
    if (open) {
      fetchHistory(selectedDate);
    }
  }, [selectedDate, open, fetchHistory]);

  const handlePrevDay = () => {
    setSelectedDate((prev) => addDays(prev, -1));
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1));
  };

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const res = await fetch(
        `/api/pw/history/pdf?date=${encodeURIComponent(selectedDate)}`,
      );
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nuviora-${selectedDate}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setExporting(false);
    }
  };

  const { dayName, full } = formatDateDisplay(selectedDate);
  const isFuture = isFutureDate(selectedDate);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 overflow-y-auto">
        <SheetHeader className="p-4 pb-2 sticky top-0 bg-background z-10 border-b">
          <SheetTitle className="flex items-center gap-2 text-warm-800 dark:text-warm-100">
            <Clock className="w-5 h-5 text-primary" />
            Classes History
          </SheetTitle>
          <SheetDescription>Browse your daily study records</SheetDescription>
        </SheetHeader>

        <div className="p-4 space-y-4">
          {/* ═══ Date Navigator ═══════════════════════════════════ */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 flex-shrink-0"
                  onClick={handlePrevDay}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex-1 text-center space-y-1">
                  <p className="text-sm font-bold text-warm-800 dark:text-warm-100">
                    {dayName}
                  </p>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateInput}
                    className="h-8 text-xs text-center border-muted-foreground/20"
                  />
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 flex-shrink-0"
                  onClick={handleNextDay}
                  disabled={isFuture}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Today indicator */}
              {selectedDate === getTodayLocal() && (
                <div className="flex justify-center mt-2">
                  <Badge className="text-xs px-2 py-0 border-none bg-primary/15 text-primary">
                    Today
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ═══ Loading Skeleton ════════════════════════════════ */}
          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          )}

          {/* ═══ Future Date Message ═════════════════════════════ */}
          {!loading && isFuture && (
            <Card className="border-none shadow-sm">
              <CardContent className="p-6 text-center">
                <CalendarDays className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">
                  This date is in the future.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  History data will be available after the day ends.
                </p>
              </CardContent>
            </Card>
          )}

          {/* ═══ No Data State ══════════════════════════════════ */}
          {!loading && !isFuture && !record && (
            <Card className="border-none shadow-sm">
              <CardContent className="p-6 text-center">
                <CalendarDays className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium text-warm-800 dark:text-warm-200">
                  No data for this date
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {full}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 text-xs"
                  onClick={() => {
                    fetchHistory(selectedDate);
                  }}
                >
                  Refresh
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ═══ History Content ════════════════════════════════ */}
          {!loading && record && (
            <div className="space-y-4">
              {/* Date Header */}
              <div className="text-center">
                <p className="text-sm font-bold text-warm-800 dark:text-warm-100">
                  {full}
                </p>
              </div>

              {/* Rest Day Badge */}
              {record.isRestDay && (
                <div className="flex justify-center">
                  <Badge className="text-xs px-3 py-1 border-none bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                    <Coffee className="w-3.5 h-3.5 mr-1.5" />
                    Rest Day
                  </Badge>
                </div>
              )}

              {/* Stats Summary */}
              <Card className="border-none shadow-sm">
                <CardContent className="p-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 rounded-lg bg-warm-100/60 dark:bg-warm-800/20">
                      <BookOpen className="w-4 h-4 mx-auto mb-1 text-primary" />
                      <p className="text-lg font-bold text-warm-800 dark:text-warm-100">
                        {record.classesAttended}
                      </p>
                      <p className="text-xs text-warm-600 dark:text-warm-400">
                        Classes
                      </p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-warm-100/60 dark:bg-warm-800/20">
                      <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-primary" />
                      <p className="text-lg font-bold text-warm-800 dark:text-warm-100">
                        {record.todosCompleted}/{record.todosTotal}
                      </p>
                      <p className="text-xs text-warm-600 dark:text-warm-400">
                        To-Dos
                      </p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-warm-100/60 dark:bg-warm-800/20">
                      <Target className="w-4 h-4 mx-auto mb-1 text-primary" />
                      <p className="text-lg font-bold text-warm-800 dark:text-warm-100">
                        {record.hasTest ? 'Yes' : 'No'}
                      </p>
                      <p className="text-xs text-warm-600 dark:text-warm-400">
                        Test
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Classes Table */}
              {classes.length > 0 && (
                <Card className="border-none shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-warm-800 dark:text-warm-100">
                        Classes ({classes.length})
                      </span>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                      {classes.map((cls, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-muted/40 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-warm-800 dark:text-warm-200">
                              {cls.subject || 'Untitled'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {cls.time || '—'}
                            </span>
                          </div>
                          {cls.topic && (
                            <p className="text-xs text-muted-foreground">
                              {cls.topic}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-warm-600 dark:text-warm-400">
                            {cls.teacher && <span>👩‍🏫 {cls.teacher}</span>}
                            {cls.attendedLive && (
                              <Badge className="text-xs px-1.5 py-0 border-none bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Live
                              </Badge>
                            )}
                            {cls.attendedRecorded && (
                              <Badge className="text-xs px-1.5 py-0 border-none bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                Recorded
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Study Work */}
              {Object.keys(studyWork).length > 0 && (
                <Card className="border-none shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-warm-800 dark:text-warm-100">
                        Study Work
                      </span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: 'Theory Revised', done: studyWork.theoryRevised },
                        { label: 'DPP Solved', done: studyWork.dppSolved },
                        { label: 'Practice Sheet', done: studyWork.practiceSheet },
                        { label: 'PYQ Practiced', done: studyWork.pyqPracticed },
                        { label: 'Formula Revised', done: studyWork.formulaRevised },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2">
                          {item.done ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                          )}
                          <span
                            className={`text-sm ${
                              item.done
                                ? 'text-warm-800 dark:text-warm-200'
                                : 'text-muted-foreground line-through'
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* To-Do List */}
              {todos.length > 0 && (
                <Card className="border-none shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <ClipboardList className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-warm-800 dark:text-warm-100">
                        To-Do List
                      </span>
                      <Badge className="ml-auto text-xs px-2 py-0 border-none bg-primary/15 text-primary">
                        {record.todosCompleted}/{record.todosTotal}
                      </Badge>
                    </div>
                    <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                      {todos.map((todo, idx) => (
                        <div key={idx} className="flex items-center gap-2 py-1">
                          {todo.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                          )}
                          <span
                            className={`text-sm ${
                              todo.completed
                                ? 'text-muted-foreground line-through'
                                : 'text-warm-800 dark:text-warm-200'
                            }`}
                          >
                            {todo.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Test Info */}
              {record.hasTest && task && (
                <Card className="border-none shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-warm-800 dark:text-warm-100">
                        Test Details
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      {task.testName && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Test Name</span>
                          <span className="font-medium text-warm-800 dark:text-warm-200">
                            {task.testName}
                          </span>
                        </div>
                      )}
                      {task.score && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Score</span>
                          <span className="font-medium text-warm-800 dark:text-warm-200">
                            {task.score}
                          </span>
                        </div>
                      )}
                      {task.accuracy && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Accuracy</span>
                          <span className="font-medium text-warm-800 dark:text-warm-200">
                            {task.accuracy}
                          </span>
                        </div>
                      )}
                      {task.mistakes && (
                        <div>
                          <span className="text-muted-foreground">Mistakes</span>
                          <p className="text-xs text-warm-800 dark:text-warm-200 mt-1">
                            {task.mistakes}
                          </p>
                        </div>
                      )}
                      {task.improvedAt && (
                        <div>
                          <span className="text-muted-foreground">Improved At</span>
                          <p className="text-xs text-warm-800 dark:text-warm-200 mt-1">
                            {task.improvedAt}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Separator />

              {/* ═══ Export PDF Button ════════════════════════════ */}
              <Button
                className="w-full h-11 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleExportPdf}
                disabled={exporting}
              >
                {exporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4 mr-2" />
                    Export as PDF
                  </>
                )}
              </Button>

              {/* Snapshot timestamp */}
              <p className="text-xs text-center text-muted-foreground pb-4">
                Snapshot taken: {new Date(record.createdAt).toLocaleString('en-IN')}
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
