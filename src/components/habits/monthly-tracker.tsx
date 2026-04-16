'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  subMonths,
  addMonths,
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabitStore } from '@/stores/habit-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function MonthlyTracker() {
  const { habits, isLoading, fetchHabits, analytics, fetchAnalytics, toggleHabit } = useHabitStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [togglingCell, setTogglingCell] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics('monthly');
  }, [fetchAnalytics, currentDate]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const activeHabits = habits.filter((h) => !h.isArchived);

  const handleToggle = useCallback((habitId: string, dateStr: string) => {
    setTogglingCell(`${habitId}-${dateStr}`);
    toggleHabit(habitId, dateStr);
    setTimeout(() => setTogglingCell(null), 400);
  }, [toggleHabit]);

  if (isLoading && !analytics) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Month header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 rounded-lg text-xs"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Spreadsheet-style grid */}
      <Card className="border border-border/40 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto custom-scrollbar">
            <div className="min-w-[600px]">
              {/* Header row */}
              <div className="flex sticky top-0 z-10 bg-background/95 glass">
                {/* Habit name column */}
                <div className="w-[100px] flex-shrink-0 px-3 py-2.5 border-b border-r border-border/50">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Habit
                  </span>
                </div>
                {/* Day number columns */}
                <div className="flex flex-1">
                  {days.map((day) => {
                    const isTodayDate = isToday(day);
                    return (
                      <div
                        key={format(day, 'yyyy-MM-dd')}
                        className={`flex-1 min-w-[26px] text-center py-2.5 border-b border-r border-border/30 last:border-r-0 ${
                          isTodayDate
                            ? 'bg-primary/10'
                            : format(day, 'EEE') === 'Sun' || format(day, 'EEE') === 'Sat'
                              ? 'bg-muted/30'
                              : ''
                        }`}
                      >
                        <span
                          className={`text-xs font-medium inline-flex items-center justify-center w-5 h-5 rounded-full ${
                            isTodayDate
                              ? 'bg-primary text-primary-foreground text-xs font-bold'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {format(day, 'd')}
                        </span>
                        <div className="text-[8px] text-muted-foreground/60 mt-0.5">
                          {format(day, 'EEE').charAt(0)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Habit rows */}
              {activeHabits.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    No habits to track yet.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add habits from the Home tab.
                  </p>
                </div>
              ) : (
                activeHabits.map((habit, rowIndex) => {
                  const monthlyGrid = analytics?.monthlyGrid?.find(
                    (g) => g.habitId === habit.id
                  );

                  return (
                    <motion.div
                      key={habit.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: rowIndex * 0.04 }}
                      className="flex group hover:bg-muted/20 transition-colors"
                    >
                      {/* Habit name cell */}
                      <div className="w-[100px] flex-shrink-0 px-2 py-2 border-b border-r border-border/50 flex items-center gap-1.5">
                        <span className="text-sm">{habit.icon}</span>
                        <span className="text-xs font-medium text-foreground truncate">
                          {habit.name}
                        </span>
                      </div>

                      {/* Day cells */}
                      <div className="flex flex-1">
                        {days.map((day) => {
                          const dateStr = format(day, 'yyyy-MM-dd');
                          const log = monthlyGrid?.logs?.[dateStr];
                          const isCompleted = log?.status === 'completed';
                          const isTodayDate = isToday(day);
                          const cellKey = `${habit.id}-${dateStr}`;
                          const isToggling = togglingCell === cellKey;
                          const isWeekend = format(day, 'EEE') === 'Sun' || format(day, 'EEE') === 'Sat';

                          // Determine cell color intensity
                          let cellStyle = '';
                          if (isCompleted) {
                            cellStyle = habit.color;
                          }

                          return (
                            <button
                              key={dateStr}
                              onClick={() => handleToggle(habit.id, dateStr)}
                              className={`flex-1 min-w-[26px] aspect-square flex items-center justify-center border-b border-r border-border/20 last:border-r-0 transition-all duration-150 hover:scale-110 relative ${
                                isTodayDate
                                  ? 'ring-1 ring-primary/30 ring-inset'
                                  : ''
                              } ${isWeekend ? 'bg-muted/10' : ''}`}
                            >
                              <AnimatePresence mode="wait">
                                {isToggling ? (
                                  <motion.div
                                    key="loading"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                    className="w-4 h-4 rounded-sm bg-muted animate-pulse"
                                  />
                                ) : isCompleted ? (
                                  <motion.div
                                    key="completed"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="w-4 h-4 rounded-sm cell-pop"
                                    style={{ backgroundColor: cellStyle }}
                                  />
                                ) : (
                                  <motion.div
                                    key="empty"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="w-4 h-4 rounded-sm opacity-0 group-hover:opacity-20 transition-opacity"
                                    style={{ backgroundColor: habit.color }}
                                  />
                                )}
                              </AnimatePresence>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })
              )}

              {/* Summary row */}
              {activeHabits.length > 0 && (
                <div className="flex sticky bottom-0 z-10 bg-background/95 glass border-t border-border/50">
                  <div className="w-[100px] flex-shrink-0 px-3 py-2 flex items-center">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                      Rate
                    </span>
                  </div>
                  <div className="flex flex-1">
                    {days.map((day) => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const dayCompleted = activeHabits.filter((h) => {
                        const grid = analytics?.monthlyGrid?.find((g) => g.habitId === h.id);
                        return grid?.logs?.[dateStr]?.status === 'completed';
                      }).length;
                      const rate = activeHabits.length > 0 ? dayCompleted / activeHabits.length : 0;
                      const isTodayDate = isToday(day);

                      let summaryColor = 'transparent';
                      if (rate === 1) summaryColor = '#10b981';
                      else if (rate >= 0.7) summaryColor = '#6ee7b7';
                      else if (rate >= 0.4) summaryColor = '#fbbf24';
                      else if (rate > 0) summaryColor = '#fca5a5';

                      return (
                        <div
                          key={`summary-${dateStr}`}
                          className={`flex-1 min-w-[26px] aspect-square flex items-center justify-center ${
                            isTodayDate ? 'ring-1 ring-primary/30 ring-inset' : ''
                          }`}
                        >
                          <div
                            className="w-4 h-4 rounded-sm transition-all duration-300"
                            style={{ backgroundColor: summaryColor }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground py-1">
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <div className="flex gap-0.5">
            <div className="w-3 h-3 rounded-sm bg-transparent border border-border/50" />
            <div className="w-3 h-3 rounded-sm bg-[#fca5a5]" />
            <div className="w-3 h-3 rounded-sm bg-[#fbbf24]" />
            <div className="w-3 h-3 rounded-sm bg-[#6ee7b7]" />
            <div className="w-3 h-3 rounded-sm bg-[#10b981]" />
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Monthly stats */}
      {activeHabits.length > 0 && analytics && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="border border-emerald-200/40 dark:border-emerald-800/20 shadow-sm bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-500/10 dark:to-green-500/10">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold">
                {days.filter((d) => {
                  const dateStr = format(d, 'yyyy-MM-dd');
                  const count = activeHabits.filter((h) => {
                    const grid = analytics.monthlyGrid?.find((g) => g.habitId === h.id);
                    return grid?.logs?.[dateStr]?.status === 'completed';
                  }).length;
                  return count === activeHabits.length;
                }).length}
              </p>
              <p className="text-xs text-muted-foreground">Perfect Days</p>
            </CardContent>
          </Card>
          <Card className="border border-amber-200/40 dark:border-amber-800/20 shadow-sm bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-500/10 dark:to-yellow-500/10">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold">
                {Math.round(
                  (days.reduce((acc, d) => {
                    const dateStr = format(d, 'yyyy-MM-dd');
                    const count = activeHabits.filter((h) => {
                      const grid = analytics.monthlyGrid?.find((g) => g.habitId === h.id);
                      return grid?.logs?.[dateStr]?.status === 'completed';
                    }).length;
                    return acc + (count / activeHabits.length);
                  }, 0) / days.length) * 100
                )}%
              </p>
              <p className="text-xs text-muted-foreground">Avg Completion</p>
            </CardContent>
          </Card>
          <Card className="border border-rose-200/40 dark:border-rose-800/20 shadow-sm bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-500/10 dark:to-pink-500/10">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold">
                {activeHabits.reduce((acc, h) => {
                  const grid = analytics.monthlyGrid?.find((g) => g.habitId === h.id);
                  const completedDays = Object.values(grid?.logs || {}).filter(l => l.status === 'completed').length;
                  return acc + completedDays;
                }, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Done</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
