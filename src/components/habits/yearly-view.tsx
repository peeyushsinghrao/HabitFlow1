'use client';

import { useState, useEffect } from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { motion } from 'framer-motion';
import { useHabitStore } from '@/stores/habit-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Trophy, TrendingUp, Calendar } from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function YearlyView() {
  const { habits, isLoading, analytics, fetchAnalytics } = useHabitStore();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  useEffect(() => {
    fetchAnalytics('yearly');
  }, [fetchAnalytics, currentYear]);

  const activeHabits = habits.filter((h) => !h.isArchived);

  // Generate monthly data for the year
  const monthlyData = MONTHS.map((month, index) => {
    const monthStr = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
    let totalCompleted = 0;

    activeHabits.forEach((habit) => {
      habit.logs?.forEach((log) => {
        if (log.date.startsWith(monthStr) && log.status === 'completed') {
          totalCompleted++;
        }
      });
    });

    // Calculate days in this month
    const monthDate = new Date(currentYear, index, 1);
    const daysInMonth = eachDayOfInterval({
      start: startOfMonth(monthDate),
      end: endOfMonth(monthDate),
    }).length;
    const maxPossible = activeHabits.length * daysInMonth;
    const rate = maxPossible > 0 ? Math.min(totalCompleted / maxPossible, 1) : 0;

    // Calculate perfect days
    let perfectDays = 0;
    const daysList = eachDayOfInterval({
      start: startOfMonth(monthDate),
      end: endOfMonth(monthDate),
    });
    daysList.forEach((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayCompleted = activeHabits.filter((h) =>
        h.logs?.some((l) => l.date === dateStr && l.status === 'completed')
      ).length;
      if (dayCompleted === activeHabits.length && activeHabits.length > 0) {
        perfectDays++;
      }
    });

    return { month, monthShort: format(monthDate, 'MMM'), rate, totalCompleted, perfectDays, daysInMonth, index };
  });

  const maxRate = Math.max(...monthlyData.map((m) => m.rate), 0.01);
  const totalCompletions = monthlyData.reduce((sum, m) => sum + m.totalCompleted, 0);
  const avgRate = monthlyData.reduce((sum, m) => sum + m.rate, 0) / 12;
  const bestMonth = monthlyData.reduce((best, m) => m.rate > best.rate ? m : best, monthlyData[0]);
  const worstMonth = monthlyData.reduce((worst, m) => m.rate < worst.rate ? m : worst, monthlyData[0]);

  if (isLoading && !analytics) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32 rounded-lg" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Year header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{currentYear}</h2>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => { setCurrentYear((y) => y - 1); setSelectedMonth(null); }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 rounded-lg text-xs"
            onClick={() => { setCurrentYear(new Date().getFullYear()); setSelectedMonth(null); }}
          >
            This Year
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => { setCurrentYear((y) => y + 1); setSelectedMonth(null); }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Yearly summary */}
      <Card className="border border-border/40 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-violet-50 dark:from-rose-500/10 dark:via-pink-500/10 dark:to-violet-500/5 p-5">
          <p className="text-sm font-medium text-muted-foreground mb-4">
            {currentYear} Overview
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center mx-auto mb-2">
                <Trophy className="h-4 w-4 text-rose-500" />
              </div>
              <p className="text-xl font-bold">{Math.round(avgRate * 100)}%</p>
              <p className="text-xs text-muted-foreground">Avg Rate</p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-xl font-bold">{totalCompletions}</p>
              <p className="text-xs text-muted-foreground">Completions</p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center mx-auto mb-2">
                <Calendar className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-xl font-bold">
                {monthlyData.reduce((sum, m) => sum + m.perfectDays, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Perfect Days</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Monthly mini heatmaps */}
      <Card className="border border-border/40 shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm font-semibold mb-4">Monthly Activity</p>
          <div className="grid grid-cols-4 gap-3">
            {monthlyData.map((data, index) => {
              const isSelected = selectedMonth === index;
              const isCurrentMonth = index === new Date().getMonth() && currentYear === new Date().getFullYear();

              return (
                <motion.button
                  key={data.month}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMonth(isSelected ? null : index)}
                  className={`rounded-xl p-3 text-left transition-all border-2 ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-transparent bg-muted/40 hover:bg-muted/60'
                  } ${isCurrentMonth ? 'ring-1 ring-primary/30' : ''}`}
                >
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                    {data.monthShort}
                  </p>
                  {/* Mini bar */}
                  <div className="h-12 flex items-end gap-[2px] mb-2">
                    {Array.from({ length: 7 }).map((_, weekIdx) => {
                      const weekStart = weekIdx * 4 + 1;
                      const weekEnd = Math.min(weekStart + 4, data.daysInMonth);
                      let weekCompleted = 0;
                      let weekTotal = 0;
                      for (let d = weekStart; d <= weekEnd; d++) {
                        const dateStr = `${currentYear}-${String(index + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                        const dayCompleted = activeHabits.filter((h) =>
                          h.logs?.some((l) => l.date === dateStr && l.status === 'completed')
                        ).length;
                        weekCompleted += dayCompleted > 0 ? 1 : 0;
                        weekTotal++;
                      }
                      const weekRate = weekTotal > 0 ? weekCompleted / weekTotal : 0;
                      const height = Math.max(weekRate * 100, 8);

                      let barColor = '#fecdd3';
                      if (weekRate >= 0.8) barColor = '#34d399';
                      else if (weekRate >= 0.5) barColor = '#fbbf24';
                      else if (weekRate > 0) barColor = '#fda4af';

                      return (
                        <div
                          key={weekIdx}
                          className="flex-1 rounded-t-[2px] transition-all duration-300"
                          style={{
                            height: `${height}%`,
                            backgroundColor: barColor,
                            opacity: weekRate > 0 ? 1 : 0.3,
                          }}
                        />
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {Math.round(data.rate * 100)}%
                    </span>
                    {data.perfectDays > 0 && (
                      <span className="text-xs text-amber-500 font-medium">
                        {data.perfectDays}⭐
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Chain visualization */}
      <Card className="border border-border/40 shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm font-semibold mb-1">🔗 Activity Chain</p>
          <p className="text-xs text-muted-foreground mb-4">Consecutive months of activity</p>
          <div className="flex items-center">
            {monthlyData.map((data, i) => {
              const isActive = data.rate > 0;
              const prevActive = i > 0 && monthlyData[i - 1].rate > 0;
              const nextActive = i < 11 && monthlyData[i + 1]?.rate > 0;
              const isBroken = !isActive && prevActive;
              return (
                <div key={i} className="flex items-center flex-1">
                  {i > 0 && (
                    <div
                      className={`flex-1 h-[3px] ${prevActive && isActive ? 'bg-emerald-400' : isBroken ? 'bg-rose-300' : 'bg-border'}`}
                    />
                  )}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 20 }}
                    title={`${data.monthShort}: ${Math.round(data.rate * 100)}%`}
                    className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm ${
                      isActive
                        ? data.rate >= 0.7
                          ? 'bg-emerald-500 text-white shadow-emerald-200'
                          : 'bg-amber-400 text-white shadow-amber-200'
                        : isBroken
                        ? 'bg-rose-100 border-2 border-dashed border-rose-300 text-rose-400'
                        : 'bg-muted text-muted-foreground/40'
                    }`}
                  >
                    {isActive ? (data.rate >= 0.7 ? '🔗' : '〰') : isBroken ? '💔' : data.monthShort[0]}
                  </motion.div>
                  {i < 11 && (
                    <div
                      className={`flex-1 h-[3px] ${isActive && nextActive ? 'bg-emerald-400' : isActive && !nextActive && i < 11 && monthlyData[i + 1]?.rate === 0 ? 'bg-rose-300' : 'bg-border'}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex mt-2">
            {monthlyData.map((d) => (
              <span key={d.monthShort} className="flex-1 text-center text-[8px] text-muted-foreground">
                {d.monthShort[0]}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/40">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-muted-foreground">Active (&ge;70%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-xs text-muted-foreground">Partial</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span>💔</span>
              <span className="text-muted-foreground">Chain break</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected month detail */}
      {selectedMonth !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border border-border/40 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold">
                  {MONTHS[selectedMonth]} Detail
                </p>
                <span className="text-xs text-muted-foreground">
                  {monthlyData[selectedMonth].totalCompleted} completions
                </span>
              </div>

              {/* Per-habit breakdown for selected month */}
              <div className="space-y-2.5">
                {activeHabits.map((habit) => {
                  const monthStr = `${currentYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
                  const completedDays = habit.logs?.filter(
                    (l) => l.date.startsWith(monthStr) && l.status === 'completed'
                  ).length || 0;
                  const rate = monthlyData[selectedMonth].daysInMonth > 0
                    ? completedDays / monthlyData[selectedMonth].daysInMonth
                    : 0;

                  return (
                    <div key={habit.id} className="flex items-center gap-3">
                      <span className="text-sm">{habit.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium truncate">{habit.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {completedDays}/{monthlyData[selectedMonth].daysInMonth}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: habit.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${rate * 100}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Best and worst months */}
              <div className="mt-4 pt-3 border-t border-border/50 grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">Best Month</p>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    🏆 {bestMonth.monthShort} ({Math.round(bestMonth.rate * 100)}%)
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">Needs Work</p>
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                    💪 {worstMonth.monthShort} ({Math.round(worstMonth.rate * 100)}%)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Full year bar chart */}
      <Card className="border border-border/40 shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm font-semibold mb-4">Year Progress</p>
          <div className="flex items-end justify-between gap-1 h-32">
            {monthlyData.map((data) => (
              <div key={data.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex-1 flex items-end">
                  <motion.div
                    className="w-full rounded-t-md min-h-[3px]"
                    style={{
                      background: data.rate === 0
                        ? 'linear-gradient(to top, transparent, transparent)'
                        : `linear-gradient(to top, ${data.rate > 0.7 ? '#10b981' : data.rate > 0.4 ? '#fbbf24' : '#fda4af'}, ${data.rate > 0.7 ? '#34d399' : data.rate > 0.4 ? '#fde68a' : '#fecdd3'})`,
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max((data.rate / maxRate) * 100, 3)}%` }}
                    transition={{ duration: 0.5, delay: data.index * 0.03 }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  {data.monthShort}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
