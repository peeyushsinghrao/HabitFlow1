'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabitStore } from '@/stores/habit-store';
import { usePWStore } from '@/stores/pw-store';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Target,
  Zap,
  TrendingUp,
  Award,
  Lightbulb,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  Flame,
  MonitorPlay,
  Radio,
  CalendarDays,
  Activity,
  Trophy,
  Sparkles,
  CheckCircle2,
  Star,
  ChevronRight,
  Gem,
  Sprout,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SubjectFocusChart } from '@/components/pomodoro/subject-focus-chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { AnalyticsData, StatsData } from '@/stores/habit-store';
import type { PWAnalytics } from '@/stores/pw-store';

// ─── Constants ────────────────────────────────────────────────────────────────

const WARM_PRIMARY   = '#C08552';
const WARM_SECONDARY = '#D4A373';
const PW_COLORS      = ['#8C5A3C', '#C08552'];
const ATTENDANCE_COLORS = [WARM_PRIMARY, WARM_SECONDARY];

// ─── Design tokens ────────────────────────────────────────────────────────────

const CARD_BASE = 'border border-border/40 shadow-sm rounded-2xl overflow-hidden';

// ─── Primitives ───────────────────────────────────────────────────────────────

function SectionLabel({
  icon,
  title,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-primary">{icon}</span>
      <p className="text-[13px] font-bold text-foreground flex-1">{title}</p>
      {badge && (
<<<<<<< HEAD
        <span className="text-[10px] font-semibold text-muted-foreground bg-muted/70 px-2.5 py-1 rounded-full border border-border/30">
=======
<<<<<<< HEAD
        <span className="flex-shrink-0 text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
=======
        <span className="text-[10px] font-semibold text-muted-foreground bg-muted/70 px-2.5 py-1 rounded-full border border-border/30">
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
          {badge}
        </span>
      )}
    </div>
  );
}

function RangePill({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
<<<<<<< HEAD
=======
<<<<<<< HEAD
    <Card className="border border-border/40 shadow-sm overflow-hidden rounded-2xl">
      <div className={`p-4 h-full bg-gradient-to-br ${gradient}`}>
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-7 h-7 rounded-xl ${accent} flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
        </div>
        <p className="text-3xl font-black text-foreground leading-none tracking-tight">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1.5 font-medium leading-snug">{sub}</p>}
        {progress !== undefined && (
          <div className="mt-3 h-1 rounded-full bg-black/8 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Tooltip Components ──────────────────────────────────────────────────────

function HabitTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-xl px-3.5 py-2.5 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-muted-foreground">
          {entry.dataKey === 'rate' ? `${entry.value}% rate` : `${entry.value} completed`}
        </p>
=======
>>>>>>> 925ef42 (Initial commit)
    <div className="flex gap-0.5 p-1 bg-muted/60 rounded-xl border border-border/25">
      {options.map(o => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`h-6 px-3 rounded-lg text-[11px] font-semibold transition-all ${
            value === o.id
              ? 'bg-background shadow-sm text-foreground border border-border/30'
              : 'text-muted-foreground hover:text-foreground/80'
          }`}
        >
          {o.label}
        </button>
<<<<<<< HEAD
=======
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
      ))}
    </div>
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
  isRate,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey?: string }>;
  label?: string;
  isRate?: boolean;
}) {
  if (!active || !payload?.length) return null;
  return (
<<<<<<< HEAD
=======
<<<<<<< HEAD
    <div className="bg-popover border border-border rounded-xl px-3.5 py-2.5 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="text-muted-foreground">{payload[0].value}% completion</p>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function AnalyticsScreen() {
  const { analytics, fetchAnalytics: fetchHabitAnalytics, stats } = useHabitStore();
  const { analytics: pwAnalytics, fetchAnalytics: fetchPWAnalytics } = usePWStore();

  const [activeTab, setActiveTab] = useState<'habits' | 'pw'>('habits');
  const [habitRange, setHabitRange] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [pwRange, setPwRange] = useState<'weekly' | 'monthly'>('weekly');
  const [loading, setLoading] = useState(true);
  const [pwLoading, setPwLoading] = useState(false);
  const pwFetched = useRef(false);

  useEffect(() => {
    if (activeTab === 'habits') {
      fetchHabitAnalytics(habitRange).finally(() => setLoading(false));
    }
  }, [fetchHabitAnalytics, habitRange, activeTab]);

  useEffect(() => {
    if (activeTab === 'pw') {
      if (!pwFetched.current) pwFetched.current = true;
      fetchPWAnalytics(pwRange).finally(() => setPwLoading(false));
    }
  }, [fetchPWAnalytics, pwRange, activeTab]);

  const handleTabChange = useCallback((tab: 'habits' | 'pw') => {
    if (tab === 'habits') setLoading(true);
    else setPwLoading(true);
    setActiveTab(tab);
  }, []);

  const handleHabitRangeChange = useCallback((r: 'weekly' | 'monthly' | 'yearly') => {
    setLoading(true);
    setHabitRange(r);
  }, []);

  const handlePwRangeChange = useCallback((r: 'weekly' | 'monthly') => {
    setPwLoading(true);
    setPwRange(r);
  }, []);

  const habitChartData = analytics?.chartData.map((d, i) => ({
    ...d,
    label: analytics.labels[i] || d.date,
  }));

  const pwChartData = pwAnalytics?.studyData.map((d) => ({
    ...d,
    label: d.date,
  })) ?? [];

  const attendancePieData = pwAnalytics?.classStats
    ? [
        { name: 'Live', value: pwAnalytics.classStats.attendedLive },
        { name: 'Recorded', value: pwAnalytics.classStats.attendedRecorded },
      ]
    : [];

  return (
    <div className="space-y-4 pt-1 pb-8">

      {/* ── Tab Bar ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-1.5 p-1.5 bg-muted/60 rounded-2xl border border-border/30">
        {([
          { id: 'habits', label: 'Habits', icon: <Activity className="h-3.5 w-3.5" /> },
          { id: 'pw', label: 'Classes', icon: <GraduationCap className="h-3.5 w-3.5" /> },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors duration-200 ${
              activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="analytics-tab-bg"
                className="absolute inset-0 bg-background rounded-xl shadow-sm border border-border/30"
                transition={{ type: 'spring', stiffness: 500, damping: 36 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── Tab Content ──────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === 'habits' ? (
          <motion.div
            key="habits"
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 14 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="space-y-4"
          >
            {/* Range pill */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                {habitRange === 'weekly' ? 'This Week' : habitRange === 'monthly' ? 'This Month' : 'This Year'}
              </p>
              <div className="flex gap-0.5 p-1 bg-muted/70 rounded-xl border border-border/30">
                {(['weekly', 'monthly', 'yearly'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleHabitRangeChange(r)}
                    className={`h-7 px-3.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      habitRange === r
                        ? 'bg-background shadow-sm text-foreground border border-border/30'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {r === 'weekly' ? 'Week' : r === 'monthly' ? 'Month' : 'Year'}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <HabitTabSkeleton />
            ) : analytics ? (
              <>
                {/* ── Today's Hero ──────────────────────────────────────────── */}
                <HabitHeroCard analytics={analytics} />

                {/* ── Overview Cards ────────────────────────────────────────── */}
                <HabitStatsCards analytics={analytics} stats={stats} />

                {/* ── Progress Chart ────────────────────────────────────────── */}
                <HabitMainChart chartData={habitChartData ?? []} range={habitRange} />

                {/* ── Activity Heatmap ──────────────────────────────────────── */}
                <HabitHeatmap analytics={analytics} />

                {/* ── Mood Insight ──────────────────────────────────────────── */}
                <MoodHabitInsight analytics={analytics} />

                {/* ── Habit Rankings ────────────────────────────────────────── */}
                <HabitRankings analytics={analytics} />

                {/* ── Trend (weekly only) ───────────────────────────────────── */}
                {habitRange === 'weekly' && (
                  <HabitTrendChart chartData={habitChartData ?? []} />
                )}

                {/* ── Smart Insights ────────────────────────────────────────── */}
                {analytics.insights.length > 0 && (
                  <HabitInsights insights={analytics.insights} />
                )}

                {/* ── Weekly Report ─────────────────────────────────────────── */}
                <WeeklyReportCard analytics={analytics} />

                {/* ── Achievements ──────────────────────────────────────────── */}
                <AchievementsSection
                  xp={stats?.xp ?? 0}
                  level={stats?.level ?? 1}
                  streak={stats?.longestStreak ?? 0}
                  completionRate={analytics.todayRate ?? 0}
                />

                {/* ── Subject Focus ─────────────────────────────────────────── */}
                <SubjectFocusChart />
              </>
            ) : (
              <EmptyState
                icon={<Activity className="h-10 w-10 text-muted-foreground/30" />}
                title="No analytics data yet"
                sub="Start tracking habits to see your stats here."
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="pw"
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="space-y-4"
          >
            {/* Range pill */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                {pwRange === 'weekly' ? 'This Week' : 'This Month'}
              </p>
              <div className="flex gap-0.5 p-1 bg-muted/70 rounded-xl border border-border/30">
                {(['weekly', 'monthly'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handlePwRangeChange(r)}
                    className={`h-7 px-3.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      pwRange === r
                        ? 'bg-background shadow-sm text-foreground border border-border/30'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {r === 'weekly' ? 'Week' : 'Month'}
                  </button>
                ))}
              </div>
            </div>

            {pwLoading ? (
              <PWTabSkeleton />
            ) : pwAnalytics ? (
              <>
                <PWStatsCards analytics={pwAnalytics} />
                <PWStudyChart chartData={pwChartData} range={pwRange} />
                <PWAttendanceBreakdown
                  classStats={pwAnalytics.classStats}
                  pieData={attendancePieData}
                />
              </>
            ) : (
              <EmptyState
                icon={<GraduationCap className="h-10 w-10 text-muted-foreground/30" />}
                title="No Classes data yet"
                sub="Log your classes to see attendance analytics here."
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
=======
>>>>>>> 925ef42 (Initial commit)
    <div className="bg-popover/95 backdrop-blur-sm border border-border/50 rounded-xl px-3.5 py-2.5 shadow-xl text-xs">
      <p className="font-bold text-foreground mb-1">{label}</p>
      <p className="text-muted-foreground">
        {isRate ? `${payload[0].value}% completion` : `${payload[0].value} completed`}
      </p>
<<<<<<< HEAD
=======
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="py-20 flex flex-col items-center gap-3 text-center">
      {icon}
      <p className="text-sm font-semibold text-muted-foreground">{title}</p>
      <p className="text-xs text-muted-foreground/60 max-w-[200px]">{sub}</p>
    </div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function HabitTabSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-36 w-full rounded-2xl" />
      <div className="grid grid-cols-4 gap-2">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="h-52 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );
}

function PWTabSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );
}

// ─── Hero Banner ──────────────────────────────────────────────────────────────

function HabitHeroCard({
  analytics,
  stats,
}: {
  analytics: AnalyticsData;
  stats: StatsData | null;
}) {
  const pct = analytics.todayRate ?? 0;
  const ringColor = pct >= 80 ? '#22c55e' : pct >= 50 ? WARM_PRIMARY : '#f59e0b';
  const statusLabel =
    pct >= 100 ? 'Perfect day!' : pct >= 80 ? 'Great progress' : pct >= 50 ? 'Keep going' : 'Getting started';

  const r = 26;
  const circ = 2 * Math.PI * r;

  const weekCompleted = analytics.chartData.slice(-7).reduce((s, d) => s + d.completed, 0);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/40 shadow-sm bg-gradient-to-br from-primary/10 via-primary/5 to-background p-5">
      {/* Background blob */}
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-primary/6 pointer-events-none" />

      <div className="relative z-10 flex items-center gap-5">
        {/* Ring progress */}
        <div className="relative flex-shrink-0 w-20 h-20">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r={r} fill="none" stroke="var(--muted)" strokeWidth="5" />
            <circle
              cx="32" cy="32" r={r} fill="none"
              stroke={ringColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct / 100)}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[11px] font-black text-foreground">{pct}%</span>
          </div>
        </div>

        {/* Text block */}
        <div className="flex-1 min-w-0">
<<<<<<< HEAD
=======
<<<<<<< HEAD
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Today's Completion</p>
          <p className="text-3xl font-black text-foreground leading-tight mt-0.5">
            {pct}%
          </p>
          <p className="text-xs font-medium text-muted-foreground mt-0.5">
            {label} · {analytics.todayCompleted}/{analytics.todayTotal} habits
=======
>>>>>>> 925ef42 (Initial commit)
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Today</p>
          <p className="text-lg font-black text-foreground leading-tight">{statusLabel}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {analytics.todayCompleted}/{analytics.todayTotal} habits done
<<<<<<< HEAD
=======
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
          </p>

          {/* Mini stats */}
          <div className="flex gap-3 mt-3">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span className="font-bold text-foreground">{stats?.currentStreak ?? 0}</span>
              <span>streak</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span className="font-bold text-foreground">{stats?.xp ?? 0}</span>
              <span>XP</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span className="font-bold text-foreground">{weekCompleted}</span>
              <span>this wk</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Compact Stat Chips (4-up row) ────────────────────────────────────────────

function HabitStatChips({
  analytics,
  stats,
}: {
  analytics: AnalyticsData;
  stats: StatsData | null;
}) {
  const chips = [
    {
      icon: <Target className="h-4 w-4 text-primary" />,
      value: String(analytics.habitsCount),
      label: 'Active',
      bg: 'bg-primary/8',
    },
    {
      icon: <Flame className="h-4 w-4 text-orange-500" />,
      value: String(stats?.currentStreak ?? 0),
      label: 'Streak',
      bg: 'bg-orange-500/8',
    },
    {
      icon: <Trophy className="h-4 w-4 text-amber-500" />,
      value: String(stats?.longestStreak ?? 0),
      label: 'Best',
      bg: 'bg-amber-500/8',
    },
    {
      icon: <Star className="h-4 w-4 text-violet-500" />,
      value: String(stats?.level ?? 1),
      label: 'Level',
      bg: 'bg-violet-500/8',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {chips.map(chip => (
        <div
          key={chip.label}
          className={`${chip.bg} rounded-xl p-3 flex flex-col items-center gap-1.5 border border-border/30`}
        >
          {chip.icon}
          <span className="text-[17px] font-black text-foreground leading-none">{chip.value}</span>
          <span className="text-[10px] text-muted-foreground font-semibold">{chip.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Chart ───────────────────────────────────────────────────────────────

function HabitMainChart({
  chartData,
  range,
}: {
  chartData: Array<{ date: string; completed: number; total: number; rate: number; label?: string }>;
  range: string;
}) {
  return (
    <Card className={CARD_BASE}>
      <CardContent className="p-5">
        <SectionLabel
          icon={<TrendingUp className="h-4 w-4" />}
          title={range === 'yearly' ? 'Yearly Completion Rate' : `${range === 'weekly' ? 'Weekly' : 'Monthly'} Habits Completed`}
        />
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            {range === 'yearly' ? (
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                <defs>
                  <linearGradient id="gradHabitRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={WARM_PRIMARY} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={WARM_PRIMARY} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  axisLine={false} tickLine={false} dy={6}
                  interval={Math.ceil(chartData.length / 6) - 1}
                />
                <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  axisLine={false} tickLine={false} domain={[0, 100]}
                  tickFormatter={v => `${v}%`} width={34}
                />
                <Tooltip content={<ChartTooltip isRate />} cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="rate" stroke={WARM_PRIMARY} strokeWidth={2.5}
                  fill="url(#gradHabitRate)" dot={false}
                  activeDot={{ r: 5, fill: WARM_PRIMARY, stroke: 'white', strokeWidth: 2 }}
                />
              </AreaChart>
            ) : (
              <BarChart data={chartData} barSize={range === 'monthly' ? 7 : 20}
                margin={{ top: 4, right: 4, bottom: 0, left: -18 }}
              >
                <defs>
                  <linearGradient id="gradHabitBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor={WARM_SECONDARY} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={WARM_PRIMARY}  stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  axisLine={false} tickLine={false} dy={6}
                  interval={range === 'monthly' ? Math.ceil(chartData.length / 6) - 1 : 0}
                />
                <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  axisLine={false} tickLine={false} allowDecimals={false} width={26}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.3 }} />
                <Bar dataKey="completed" fill="url(#gradHabitBar)" radius={[5, 5, 0, 0]} maxBarSize={26} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Activity Heatmap ─────────────────────────────────────────────────────────

function HabitHeatmap({ analytics }: { analytics: AnalyticsData }) {
  const weeks = 12;
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - weeks * 7 + 1);

  const rateByDate: Record<string, number> = {};
  analytics.chartData.forEach(d => { rateByDate[d.date] = d.rate; });

  const cells: { date: string; rate: number; dayLabel: string }[] = [];
  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const s = d.toISOString().split('T')[0];
    cells.push({ date: s, rate: rateByDate[s] ?? 0, dayLabel: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }) });
  }

  const getColor = (rate: number) => {
    if (rate === 0)   return 'bg-muted/40';
    if (rate < 25)    return 'bg-primary/15';
    if (rate < 50)    return 'bg-primary/35';
    if (rate < 75)    return 'bg-primary/60';
    return 'bg-primary/90';
  };

  const gridCols: { cell: typeof cells[0] }[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    gridCols.push(cells.slice(i, Math.min(i + 7, cells.length)).map(cell => ({ cell })));
  }

  const monthLabels: { label: string; colIdx: number }[] = [];
  gridCols.forEach((week, wi) => {
    const label = new Date(week[0].cell.date).toLocaleDateString('en', { month: 'short' });
    if (wi === 0 || label !== monthLabels[monthLabels.length - 1]?.label) {
      monthLabels.push({ label, colIdx: wi });
    }
  });

  return (
    <Card className={CARD_BASE}>
      <CardContent className="p-5">
        <SectionLabel
          icon={<CalendarDays className="h-4 w-4" />}
          title="Activity Heatmap"
          badge="12 weeks"
        />

        {/* Month row */}
        <div className="flex gap-1.5 mb-1.5">
          {gridCols.map((_, wi) => {
            const entry = monthLabels.find(m => m.colIdx === wi);
            return (
<<<<<<< HEAD
              <div key={wi} className="flex-shrink-0 text-[9px] text-muted-foreground font-semibold" style={{ width: 18 }}>
=======
<<<<<<< HEAD
              <div key={wi} className="flex-shrink-0 text-xs text-muted-foreground font-medium" style={{ width: '18px' }}>
=======
              <div key={wi} className="flex-shrink-0 text-[9px] text-muted-foreground font-semibold" style={{ width: 18 }}>
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
                {entry ? entry.label : ''}
              </div>
            );
          })}
        </div>

        {/* Grid */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {gridCols.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1.5 flex-shrink-0">
              {week.map(({ cell }, di) => (
                <div
                  key={di}
                  title={`${cell.dayLabel}: ${Math.round(cell.rate)}%`}
                  className={`w-[18px] h-[18px] rounded-[4px] transition-all cursor-default ${getColor(cell.rate)}`}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
<<<<<<< HEAD
=======
<<<<<<< HEAD
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm ring-1 ring-amber-400/70 bg-primary/65 inline-block" />
              Streak
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
              Break
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Less</span>
            {[0, 30, 55, 75, 100].map(rate => (
              <div key={rate} className={`w-3 h-3 rounded-sm ${getColor(rate)}`} />
            ))}
            <span>More</span>
          </div>
=======
>>>>>>> 925ef42 (Initial commit)
        <div className="flex items-center justify-end gap-1.5 mt-3 pt-3 border-t border-border/25">
          <span className="text-[10px] text-muted-foreground mr-0.5">Less</span>
          {[0, 20, 45, 70, 100].map(r => (
            <div key={r} className={`w-3.5 h-3.5 rounded-[3px] ${getColor(r)}`} />
          ))}
          <span className="text-[10px] text-muted-foreground ml-0.5">More</span>
<<<<<<< HEAD
=======
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Mood Insight ─────────────────────────────────────────────────────────────

function MoodHabitInsight({ analytics }: { analytics: AnalyticsData }) {
  const [insight, setInsight] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  useEffect(() => {
    const compute = async () => {
      try {
        const res = await fetch('/api/mood?days=30');
        if (!res.ok) return;
        const moods: { date: string; mood: number }[] = await res.json();
        if (moods.length < 5) return;

        const rateByDate: Record<string, number> = {};
        analytics.chartData.forEach(d => { rateByDate[d.date] = d.rate; });

        let goodTotal = 0, goodCount = 0, lowTotal = 0, lowCount = 0;
        let lastMood: number | null = null, lastDate = '';

        moods.forEach(({ date, mood }) => {
          const rate = rateByDate[date];
          if (rate === undefined) return;
          if (mood >= 4) { goodTotal += rate; goodCount++; }
          else { lowTotal += rate; lowCount++; }
          if (!lastDate || date > lastDate) { lastMood = mood; lastDate = date; }
        });

        if (goodCount < 3 || lowCount < 2) return;
        const goodAvg = Math.round(goodTotal / goodCount);
        const lowAvg  = Math.round(lowTotal  / lowCount);
        const diff = goodAvg - lowAvg;

        if (diff >= 10) {
          setInsight(`You complete ${diff}% more habits on good-mood days (${goodAvg}% vs ${lowAvg}%).`);
          if (lastMood !== null && (lastMood as number) < 4) {
            setSuggestion('Yesterday felt rough — start with one easy habit today.');
          }
        }
      } catch { /* silent */ }
    };
    compute();
  }, [analytics]);

  if (!insight) return null;

  return (
    <div className="rounded-2xl border border-violet-200/50 dark:border-violet-800/25 bg-gradient-to-br from-violet-50/70 to-rose-50/50 dark:from-violet-900/10 dark:to-rose-900/5 p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-violet-500/12 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Lightbulb className="h-4 w-4 text-violet-500" />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground">Mood × Habits</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{insight}</p>
          {suggestion && (
            <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold mt-2 leading-relaxed">
              {suggestion}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Habit Rankings ───────────────────────────────────────────────────────────

function HabitRankings({ analytics }: { analytics: AnalyticsData }) {
  if (analytics.habitPerformance.length === 0) return null;

  const medalColors = [
    'bg-amber-400 text-white',
    'bg-slate-400 text-white',
    'bg-amber-700 text-white',
  ];

  return (
    <Card className={CARD_BASE}>
      <CardContent className="p-5">
        <SectionLabel
          icon={<Award className="h-4 w-4" />}
          title="Habit Rankings"
          badge="30 days"
        />
        <div className="space-y-3">
          {analytics.habitPerformance.map((habit, index) => (
            <div key={habit.id} className="flex items-center gap-3">
<<<<<<< HEAD
=======
<<<<<<< HEAD
              {/* Medal / rank */}
              <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 bg-muted/50 text-sm">
                {index < 3 ? RANK_MEDALS[index] : (
                  <span className="text-xs font-bold text-muted-foreground">{index + 1}</span>
=======
>>>>>>> 925ef42 (Initial commit)
              {/* Rank */}
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                {index < 3 ? (
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${medalColors[index]}`}>
                    {index + 1}
                  </div>
                ) : (
                  <span className="text-[11px] font-bold text-muted-foreground">{index + 1}</span>
<<<<<<< HEAD
=======
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
                )}
              </div>
              {/* Icon */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                style={{ backgroundColor: `${habit.color}1A` }}
              >
                {habit.icon}
              </div>
              {/* Bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[13px] font-semibold truncate pr-2 leading-none">{habit.name}</p>
                  <span className="text-[13px] font-black flex-shrink-0 leading-none" style={{ color: habit.color }}>
                    {habit.rate}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ backgroundColor: habit.color, width: `${habit.rate}%` }}
                  />
                </div>
<<<<<<< HEAD
                <p className="text-[10px] text-muted-foreground/70 mt-1">{habit.completedDays}/30 days</p>
=======
<<<<<<< HEAD
                <p className="text-xs text-muted-foreground mt-1">{habit.completedDays} of 30 days</p>
=======
                <p className="text-[10px] text-muted-foreground/70 mt-1">{habit.completedDays}/30 days</p>
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Smart Insights ───────────────────────────────────────────────────────────

function HabitInsights({ insights }: { insights: string[] }) {
  if (insights.length === 0) return null;
  return (
    <Card className={CARD_BASE}>
      <div className="bg-gradient-to-br from-primary/6 to-primary/2 p-5">
        <SectionLabel icon={<Lightbulb className="h-4 w-4" />} title="Smart Insights" />
        <div className="space-y-2">
          {insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-2.5 bg-background/60 backdrop-blur-sm rounded-xl p-3.5">
              <ChevronRight className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-foreground leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─── Weekly Report ────────────────────────────────────────────────────────────

function WeeklyReportCard({ analytics }: { analytics: AnalyticsData }) {
  const weekData    = analytics.chartData.slice(-7);
  const avgRate     = weekData.length ? Math.round(weekData.reduce((s, d) => s + d.rate, 0) / weekData.length) : 0;
  const perfectDays = weekData.filter(d => d.rate >= 100).length;
  const bestDay     = weekData.reduce((best, d) => (d.rate > best.rate ? d : best), { date: '', rate: 0 });

  const grade = avgRate >= 90 ? 'A+' : avgRate >= 80 ? 'A' : avgRate >= 70 ? 'B+' : avgRate >= 60 ? 'B' : avgRate >= 50 ? 'C+' : 'C';

  const [gradeColor, gradeBg] =
    avgRate >= 80
      ? ['text-emerald-600 dark:text-emerald-400', 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200/60 dark:border-emerald-800/30']
      : avgRate >= 60
      ? ['text-amber-600 dark:text-amber-400', 'bg-amber-50 dark:bg-amber-900/20 border-amber-200/60 dark:border-amber-800/30']
      : ['text-rose-500 dark:text-rose-400', 'bg-rose-50 dark:bg-rose-900/20 border-rose-200/60 dark:border-rose-800/30'];

  return (
    <Card className={CARD_BASE}>
      <CardContent className="p-5">
        <SectionLabel icon={<ClipboardCheck className="h-4 w-4" />} title="Weekly Report" />

        <div className="flex items-center gap-4 mb-4">
          <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center flex-shrink-0 ${gradeBg}`}>
            <span className={`text-3xl font-black ${gradeColor}`}>{grade}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">
              {avgRate >= 80 ? 'Excellent week!' : avgRate >= 60 ? 'Solid effort' : 'Room to grow'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{avgRate}% avg · {perfectDays} perfect day{perfectDays !== 1 ? 's' : ''}</p>
            {bestDay.rate > 0 && (
<<<<<<< HEAD
              <p className="text-[11px] text-muted-foreground mt-1">
                Best: <span className="font-semibold text-foreground">{bestDay.date}</span> at {Math.round(bestDay.rate)}%
=======
<<<<<<< HEAD
              <p className="text-xs text-muted-foreground mt-1">
                Best: <span className="font-semibold text-foreground">{bestDay.date}</span> · {Math.round(bestDay.rate)}%
=======
              <p className="text-[11px] text-muted-foreground mt-1">
                Best: <span className="font-semibold text-foreground">{bestDay.date}</span> at {Math.round(bestDay.rate)}%
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { value: `${avgRate}%`,                    label: 'Avg Rate' },
            { value: String(perfectDays),              label: 'Perfect Days' },
            { value: String(analytics.habitsCount),   label: 'Active Habits' },
          ].map(item => (
            <div key={item.label} className="bg-muted/40 rounded-xl p-3 text-center">
<<<<<<< HEAD
              <p className="text-[17px] font-black text-foreground leading-none">{item.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1.5 font-semibold">{item.label}</p>
=======
<<<<<<< HEAD
              <p className="text-lg font-black text-foreground leading-none">{item.value}</p>
              <p className="text-xs text-muted-foreground mt-1.5 font-medium">{item.label}</p>
=======
              <p className="text-[17px] font-black text-foreground leading-none">{item.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1.5 font-semibold">{item.label}</p>
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Achievements ─────────────────────────────────────────────────────────────

const STREAM_BADGES: { id: string; label: string; Icon: LucideIcon; color: string; desc: string; threshold: (xp: number, s?: number, r?: number) => boolean }[] = [
  { id: 'xp_100',    label: 'First 100 XP',  Icon: Zap,       color: 'text-yellow-500', desc: '100 XP',        threshold: (xp) => xp >= 100 },
  { id: 'xp_500',    label: 'XP Hustler',    Icon: Flame,     color: 'text-orange-500', desc: '500 XP',        threshold: (xp) => xp >= 500 },
  { id: 'xp_1000',   label: 'XP Legend',     Icon: Star,      color: 'text-amber-500',  desc: '1000 XP',       threshold: (xp) => xp >= 1000 },
  { id: 'streak_7',  label: '7-Day Warrior', Icon: Flame,     color: 'text-rose-500',   desc: '7-day streak',  threshold: (_xp, s = 0) => s >= 7 },
  { id: 'streak_30', label: 'Month Master',  Icon: Trophy,    color: 'text-amber-600',  desc: '30-day streak', threshold: (_xp, s = 0) => s >= 30 },
  { id: 'streak_100',label: 'Century',       Icon: Gem,       color: 'text-blue-500',   desc: '100-day streak',threshold: (_xp, s = 0) => s >= 100 },
  { id: 'rate_80',   label: 'Consistent',    Icon: Target,    color: 'text-primary',    desc: '80%+ today',    threshold: (_xp, _s, r = 0) => r >= 80 },
  { id: 'rate_100',  label: 'Perfect Day',   Icon: Sparkles,  color: 'text-violet-500', desc: '100% today',    threshold: (_xp, _s, r = 0) => r >= 100 },
];

function AchievementsSection({
  xp,
  level,
  streak,
  completionRate,
}: {
  xp: number;
  level: number;
  streak: number;
  completionRate: number;
}) {
  const xpInLevel = xp - (level - 1) * 100;
  const pct = Math.min(100, Math.round((xpInLevel / 100) * 100));

  const milestones: { label: string; level: number; Icon: LucideIcon; color: string }[] = [
    { label: 'Beginner', level: 1,   Icon: Sprout,       color: 'text-emerald-500' },
    { label: 'Learner',  level: 5,   Icon: BookOpen,     color: 'text-sky-500' },
    { label: 'Hustler',  level: 10,  Icon: Flame,        color: 'text-orange-500' },
    { label: 'Scholar',  level: 20,  Icon: GraduationCap,color: 'text-violet-500' },
    { label: 'Master',   level: 50,  Icon: Zap,          color: 'text-yellow-500' },
    { label: 'Legend',   level: 100, Icon: Star,         color: 'text-amber-500' },
  ];
  const current = milestones.filter(m => m.level <= level).pop() ?? milestones[0];
  const next = milestones.find(m => m.level > level);

  const earned = STREAM_BADGES.filter(b => b.threshold(xp, streak, completionRate));
  const locked = STREAM_BADGES.filter(b => !b.threshold(xp, streak, completionRate));

  return (
    <Card className={CARD_BASE}>
      <CardContent className="p-5">
        <SectionLabel icon={<Trophy className="h-4 w-4 text-amber-500" />} title="Achievements" />

        {/* XP / Level */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex flex-col items-center justify-center text-white shadow-md flex-shrink-0">
<<<<<<< HEAD
            <span className="text-[9px] font-bold opacity-75 uppercase tracking-wide">LVL</span>
=======
<<<<<<< HEAD
            <span className="text-xs font-semibold opacity-80 uppercase tracking-wide">LVL</span>
=======
            <span className="text-[9px] font-bold opacity-75 uppercase tracking-wide">LVL</span>
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
            <span className="text-2xl font-black leading-tight">{level}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold flex items-center gap-1">
                <current.Icon className={`h-3.5 w-3.5 ${current.color}`} /> {current.label}
              </span>
              {next && (
<<<<<<< HEAD
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  {100 - xpInLevel} XP <ChevronRight className="h-3 w-3" /> <next.Icon className={`h-3 w-3 ${next.color}`} />
                </span>
=======
<<<<<<< HEAD
                <span className="text-xs text-muted-foreground">{xpNeeded - xpInLevel} XP to {next.icon}</span>
=======
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  {100 - xpInLevel} XP <ChevronRight className="h-3 w-3" /> <next.Icon className={`h-3 w-3 ${next.color}`} />
                </span>
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
              )}
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
<<<<<<< HEAD
            <p className="text-[10px] text-muted-foreground mt-1.5">{xpInLevel}/100 XP · {xp} total</p>
=======
<<<<<<< HEAD
            <p className="text-xs text-muted-foreground mt-1.5">{xpInLevel}/{xpNeeded} XP this level · {xp} total</p>
=======
            <p className="text-[10px] text-muted-foreground mt-1.5">{xpInLevel}/100 XP · {xp} total</p>
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
          </div>
        </div>

        {/* Milestone chips */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {milestones.map(m => (
            <div
              key={m.level}
<<<<<<< HEAD
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border ${
=======
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border ${
>>>>>>> 925ef42 (Initial commit)
                level >= m.level
                  ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/30'
                  : 'bg-muted/30 text-muted-foreground border-transparent opacity-50'
              }`}
            >
              <m.Icon className={`h-3 w-3 ${level >= m.level ? m.color : ''}`} /> Lv{m.level}
            </div>
          ))}
        </div>

        {/* Badges header */}
        <div className="flex items-center gap-2 mb-3">
          <Award className="h-3.5 w-3.5 text-primary" />
<<<<<<< HEAD
          <p className="text-[12px] font-bold text-foreground">Badges</p>
          <span className="text-[10px] text-muted-foreground ml-auto bg-muted px-2 py-0.5 rounded-full">
            {earned.length}/{STREAM_BADGES.length}
=======
<<<<<<< HEAD
          <p className="text-xs font-bold text-foreground">Badges</p>
          <span className="text-xs text-muted-foreground ml-auto bg-muted px-2 py-0.5 rounded-full">
            {earned.length}/{STREAM_BADGES.length} earned
=======
          <p className="text-[12px] font-bold text-foreground">Badges</p>
          <span className="text-[10px] text-muted-foreground ml-auto bg-muted px-2 py-0.5 rounded-full">
            {earned.length}/{STREAM_BADGES.length}
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
          </span>
        </div>

        {/* Badge grid */}
        <div className="grid grid-cols-4 gap-2">
          {STREAM_BADGES.map(badge => {
            const isEarned = earned.includes(badge);
            return (
              <div
                key={badge.id}
                title={badge.desc}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition-all ${
                  isEarned
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-muted/15 border-transparent opacity-30 grayscale'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isEarned ? 'bg-primary/10' : 'bg-muted/30'}`}>
                  <badge.Icon className={`h-4 w-4 ${isEarned ? badge.color : 'text-muted-foreground'}`} />
                </div>
                <span className="text-[9px] text-muted-foreground font-semibold leading-tight">{badge.label}</span>
              </div>
            );
          })}
        </div>

        {locked.length > 0 && (
<<<<<<< HEAD
          <p className="text-[10px] text-muted-foreground/70 text-center mt-3">
            <Sparkles className="h-3 w-3 inline mr-1" />
=======
<<<<<<< HEAD
          <p className="text-xs text-muted-foreground text-center mt-3">
            <Sparkles className="h-3 w-3 inline mr-1 opacity-60" />
=======
          <p className="text-[10px] text-muted-foreground/70 text-center mt-3">
            <Sparkles className="h-3 w-3 inline mr-1" />
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
            Next: {locked[0].desc}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── PW Stat Cards ────────────────────────────────────────────────────────────

function PWStatsCards({ analytics }: { analytics: PWAnalytics }) {
  const { studyCompletionRate, classStats, taskStats, restDays } = analytics;
  const totalClasses = classStats.attendedLive + classStats.attendedRecorded;
  const studyStreak  = Math.max(0, analytics.studyData.length - restDays);
  const pct          = Math.round(studyCompletionRate * 100);

  const cards = [
    {
      icon: <BookOpen className="h-4 w-4 text-primary" />,
      label: 'Completion',
      value: `${pct}%`,
      sub: 'Study rate',
      bg: 'bg-primary/8',
      progress: pct,
    },
    {
      icon: <GraduationCap className="h-4 w-4 text-amber-500" />,
      label: 'Classes',
      value: String(totalClasses),
      sub: `${classStats.attendedLive}L · ${classStats.attendedRecorded}R`,
      bg: 'bg-amber-500/8',
    },
    {
      icon: <ClipboardCheck className="h-4 w-4 text-emerald-500" />,
      label: 'Tests',
      value: String(taskStats.totalTasks),
      sub: 'Logged',
      bg: 'bg-emerald-500/8',
    },
    {
      icon: <Flame className="h-4 w-4 text-orange-500" />,
      label: 'Streak',
      value: String(studyStreak),
      sub: restDays > 0 ? `${restDays} rest` : 'No rest',
      bg: 'bg-orange-500/8',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map(card => (
        <div key={card.label} className={`${card.bg} rounded-2xl border border-border/30 p-4`}>
          <div className="flex items-center gap-2 mb-2.5">
            {card.icon}
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{card.label}</span>
          </div>
          <p className="text-3xl font-black text-foreground leading-none">{card.value}</p>
          <p className="text-[11px] text-muted-foreground mt-1.5 font-medium">{card.sub}</p>
          {card.progress !== undefined && (
            <div className="mt-3 h-1 rounded-full bg-black/8 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${Math.min(100, card.progress)}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── PW Study Chart ───────────────────────────────────────────────────────────

function PWStudyChart({ chartData, range }: { chartData: Array<{ date: string; rate: number; label: string }>; range: string }) {
  return (
    <Card className={CARD_BASE}>
      <CardContent className="p-5">
        <SectionLabel icon={<TrendingUp className="h-4 w-4" />} title={`${range === 'weekly' ? 'Weekly' : 'Monthly'} Study Rate`} />
        <div className="h-52">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={range === 'monthly' ? 9 : 20} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                <defs>
                  <linearGradient id="gradPW" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor={PW_COLORS[1]} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={PW_COLORS[0]} stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  axisLine={false} tickLine={false} dy={6}
                  interval={range === 'monthly' ? Math.ceil(chartData.length / 6) - 1 : 0}
                />
                <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  axisLine={false} tickLine={false} domain={[0, 100]}
                  tickFormatter={v => `${v}%`} width={34}
                />
                <Tooltip content={<ChartTooltip isRate />} cursor={{ fill: 'var(--muted)', opacity: 0.3 }} />
                <Bar dataKey="rate" fill="url(#gradPW)" radius={[5, 5, 0, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-2">
              <BookOpen className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No study data yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Class Attendance ─────────────────────────────────────────────────────────

function PWAttendanceBreakdown({
  classStats,
  pieData,
}: {
  classStats: PWAnalytics['classStats'];
  pieData: Array<{ name: string; value: number }>;
}) {
  const hasData = classStats.attendedLive > 0 || classStats.attendedRecorded > 0;
  const total = classStats.attendedLive + classStats.attendedRecorded;
  const livePct = hasData ? Math.round((classStats.attendedLive / total) * 100) : 0;
  const recPct  = 100 - livePct;

  return (
    <Card className={CARD_BASE}>
      <CardContent className="p-5">
        <SectionLabel icon={<GraduationCap className="h-4 w-4" />} title="Class Attendance" />
        {hasData ? (
          <div className="flex items-center gap-5">
            <div className="w-28 h-28 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={28} outerRadius={50}
                    paddingAngle={4} dataKey="value" stroke="none">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={ATTENDANCE_COLORS[i]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-4">
              {[
                { color: WARM_PRIMARY,   label: 'Live',     icon: <Radio className="h-3 w-3" />,       count: classStats.attendedLive,      pct: livePct },
                { color: WARM_SECONDARY, label: 'Recorded', icon: <MonitorPlay className="h-3 w-3" />, count: classStats.attendedRecorded,  pct: recPct  },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      {item.icon}
                      {item.label}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-black">{item.count}</span>
<<<<<<< HEAD
                      <span className="text-[10px] text-muted-foreground">({item.pct}%)</span>
=======
<<<<<<< HEAD
                      <span className="text-xs text-muted-foreground font-medium">({item.pct}%)</span>
=======
                      <span className="text-[10px] text-muted-foreground">({item.pct}%)</span>
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ backgroundColor: item.color, width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
<<<<<<< HEAD
              <p className="text-[10px] text-muted-foreground font-medium">{total} total classes</p>
=======
              <p className="text-xs text-muted-foreground font-medium">{total} total classes</p>
>>>>>>> 925ef42 (Initial commit)
            </div>
          </div>
        ) : (
          <div className="py-10 flex flex-col items-center gap-2.5">
            <GraduationCap className="h-9 w-9 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground font-medium">No class data yet</p>
            <p className="text-xs text-muted-foreground/60">Start tracking classes to see attendance</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function AnalyticsScreen() {
  const { analytics, fetchAnalytics: fetchHabitAnalytics, stats } = useHabitStore();
  const { analytics: pwAnalytics, fetchAnalytics: fetchPWAnalytics } = usePWStore();

  const [activeTab, setActiveTab]     = useState<'habits' | 'pw'>('habits');
  const [habitRange, setHabitRange]   = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [pwRange, setPwRange]         = useState<'weekly' | 'monthly'>('weekly');
  const [loading, setLoading]         = useState(true);
  const [pwLoading, setPwLoading]     = useState(false);
  const pwFetched = useRef(false);

  useEffect(() => {
    if (activeTab === 'habits') fetchHabitAnalytics(habitRange).finally(() => setLoading(false));
  }, [fetchHabitAnalytics, habitRange, activeTab]);

  useEffect(() => {
    if (activeTab === 'pw') {
      if (!pwFetched.current) pwFetched.current = true;
      fetchPWAnalytics(pwRange).finally(() => setPwLoading(false));
    }
  }, [fetchPWAnalytics, pwRange, activeTab]);

  const handleTabChange = useCallback((tab: 'habits' | 'pw') => {
    if (tab === 'habits') setLoading(true);
    else setPwLoading(true);
    setActiveTab(tab);
  }, []);

  const habitChartData = analytics?.chartData.map((d, i) => ({
    ...d,
    label: analytics.labels[i] || d.date,
  }));

  const pwChartData = pwAnalytics?.studyData.map(d => ({ ...d, label: d.date })) ?? [];
  const attendancePieData = pwAnalytics?.classStats
    ? [
        { name: 'Live',     value: pwAnalytics.classStats.attendedLive },
        { name: 'Recorded', value: pwAnalytics.classStats.attendedRecorded },
      ]
    : [];

  return (
    <div className="space-y-4 pt-1 pb-8">

      {/* ── Tab Bar ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-2xl border border-border/25">
        {([
          { id: 'habits', label: 'Habits',  icon: <Activity className="h-3.5 w-3.5" /> },
          { id: 'pw',     label: 'Classes', icon: <GraduationCap className="h-3.5 w-3.5" /> },
        ] as const).map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            className={`relative flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-[13px] font-semibold transition-colors duration-200 ${
              activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/75'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="analytics-tab"
                className="absolute inset-0 bg-background rounded-xl shadow-sm border border-border/30"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── Tab Content ─────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === 'habits' ? (
          <motion.div
            key="habits"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className="space-y-4"
          >
            {/* Range control */}
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {habitRange === 'weekly' ? 'This Week' : habitRange === 'monthly' ? 'This Month' : 'This Year'}
              </p>
              <RangePill
                value={habitRange}
                onChange={v => { setLoading(true); setHabitRange(v as typeof habitRange); }}
                options={[
                  { id: 'weekly',  label: 'Week' },
                  { id: 'monthly', label: 'Month' },
                  { id: 'yearly',  label: 'Year' },
                ]}
              />
            </div>

            {loading ? (
              <HabitTabSkeleton />
            ) : analytics ? (
              <>
                <HabitHeroCard analytics={analytics} stats={stats} />
                <HabitStatChips analytics={analytics} stats={stats} />
                <HabitMainChart chartData={habitChartData ?? []} range={habitRange} />
                <HabitHeatmap analytics={analytics} />
                <MoodHabitInsight analytics={analytics} />
                <HabitRankings analytics={analytics} />
                {analytics.insights.length > 0 && <HabitInsights insights={analytics.insights} />}
                <WeeklyReportCard analytics={analytics} />
                <AchievementsSection
                  xp={stats?.xp ?? 0}
                  level={stats?.level ?? 1}
                  streak={stats?.longestStreak ?? 0}
                  completionRate={analytics.todayRate ?? 0}
                />
                <SubjectFocusChart />
              </>
            ) : (
              <EmptyState
                icon={<Activity className="h-10 w-10 text-muted-foreground/30" />}
                title="No analytics data yet"
                sub="Start tracking habits to see your stats here."
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="pw"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className="space-y-4"
          >
            {/* Range control */}
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {pwRange === 'weekly' ? 'This Week' : 'This Month'}
              </p>
              <RangePill
                value={pwRange}
                onChange={v => { setPwLoading(true); setPwRange(v as typeof pwRange); }}
                options={[
                  { id: 'weekly',  label: 'Week' },
                  { id: 'monthly', label: 'Month' },
                ]}
              />
            </div>

            {pwLoading ? (
              <PWTabSkeleton />
            ) : pwAnalytics ? (
              <>
                <PWStatsCards analytics={pwAnalytics} />
                <PWStudyChart chartData={pwChartData} range={pwRange} />
                <PWAttendanceBreakdown classStats={pwAnalytics.classStats} pieData={attendancePieData} />
              </>
            ) : (
              <EmptyState
                icon={<GraduationCap className="h-10 w-10 text-muted-foreground/30" />}
                title="No class data yet"
                sub="Log your classes to see attendance analytics here."
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
