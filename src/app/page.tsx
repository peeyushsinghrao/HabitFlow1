'use client';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { format, differenceInCalendarDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import {
  LayoutDashboard,
  Calendar,
  CalendarRange,
  BarChart3,
  Settings,
  Plus,
  GraduationCap,
  Monitor,
  Moon,
  Sun,
  CheckCircle2,
  ListTodo,
  BookOpen,
  Timer,
  FlaskConical,
  Brain,
  BookOpenCheck,
  Trophy,
  ClipboardList,
  MessageCircle,
  Share2,
  Keyboard,
  X,
  Users,
  AtSign,
  Flame,
} from 'lucide-react';
import { toast } from 'sonner';
import { useHabitStore } from '@/stores/habit-store';
import type { TabType } from '@/stores/habit-store';
import { Button } from '@/components/ui/button';
import { AddHabitDialog } from '@/components/habits/add-habit-dialog';
import { HomeDashboard } from '@/components/habits/home-dashboard';
import { OnboardingScreen } from '@/components/habits/onboarding-screen';
import { SplashLoginScreen } from '@/components/habits/splash-login-screen';
import { LoadingScreen } from '@/components/loading-screen';
import { WeeklyReviewDialog } from '@/components/habits/weekly-review-dialog';
import { QuickDoubtLogger } from '@/components/habits/quick-doubt-logger';

// ── Lazy-loaded heavy tabs (only loaded when first visited) ──────────────────
const PWSection          = dynamic(() => import('@/components/pw/pw-section').then(m => ({ default: m.PWSection })), { ssr: false });
const MonthlyTracker     = dynamic(() => import('@/components/habits/monthly-tracker').then(m => ({ default: m.MonthlyTracker })), { ssr: false });
const YearlyView         = dynamic(() => import('@/components/habits/yearly-view').then(m => ({ default: m.YearlyView })), { ssr: false });
const AnalyticsScreen    = dynamic(() => import('@/components/habits/analytics-screen').then(m => ({ default: m.AnalyticsScreen })), { ssr: false });
const SettingsScreen     = dynamic(() => import('@/components/habits/settings-screen').then(m => ({ default: m.SettingsScreen })), { ssr: false });
const PomodoroScreen     = dynamic(() => import('@/components/pomodoro/pomodoro-screen').then(m => ({ default: m.PomodoroScreen })), { ssr: false });
const StudyToolsScreen   = dynamic(() => import('@/components/habits/study-tools-screen').then(m => ({ default: m.StudyToolsScreen })), { ssr: false });
const FlashCardScreen    = dynamic(() => import('@/components/flashcards/flashcard-screen').then(m => ({ default: m.FlashCardScreen })), { ssr: false });
const FormulaScreen      = dynamic(() => import('@/components/formulas/formula-screen').then(m => ({ default: m.FormulaScreen })), { ssr: false });
const ChallengesScreen   = dynamic(() => import('@/components/challenges/challenges-screen').then(m => ({ default: m.ChallengesScreen })), { ssr: false });
const MockTestScreen     = dynamic(() => import('@/components/tests/mock-test-screen').then(m => ({ default: m.MockTestScreen })), { ssr: false });
const SleepTrackerScreen = dynamic(() => import('@/components/sleep/sleep-tracker-screen').then(m => ({ default: m.SleepTrackerScreen })), { ssr: false });
const GratitudeScreen    = dynamic(() => import('@/components/wellbeing/gratitude-screen').then(m => ({ default: m.GratitudeScreen })), { ssr: false });
const EnergyTrackerScreen = dynamic(() => import('@/components/wellbeing/energy-tracker-screen').then(m => ({ default: m.EnergyTrackerScreen })), { ssr: false });
const WellbeingReflectionScreen = dynamic(() => import('@/components/wellbeing/wellbeing-reflection-screen').then(m => ({ default: m.WellbeingReflectionScreen })), { ssr: false });
const TopicTimerScreen   = dynamic(() => import('@/components/wellbeing/topic-timer-screen').then(m => ({ default: m.TopicTimerScreen })), { ssr: false });
const AISummaryScreen    = dynamic(() => import('@/components/habits/ai-summary-screen').then(m => ({ default: m.AISummaryScreen })), { ssr: false });
const PinLockScreen      = dynamic(() => import('@/components/habits/pin-lock-screen').then(m => ({ default: m.PinLockScreen })), { ssr: false });
const ChangelogBell      = dynamic(() => import('@/components/habits/changelog-modal').then(m => ({ default: m.ChangelogBell })), { ssr: false });
const PeriodTrackerScreen = dynamic(() => import('@/components/period/period-tracker-screen').then(m => ({ default: m.PeriodTrackerScreen })), { ssr: false });
const FriendsScreen       = dynamic(() => import('@/components/friends/friends-screen').then(m => ({ default: m.FriendsScreen })), { ssr: false });

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Home', icon: LayoutDashboard },
  { id: 'study', label: 'Study', icon: FlaskConical },
  { id: 'focus', label: 'Focus', icon: Timer },
  { id: 'pw', label: 'Classes', icon: GraduationCap },
  { id: 'friends', label: 'Friends', icon: Users },
  { id: 'analytics', label: 'Stats', icon: BarChart3 },
  { id: 'settings', label: 'More', icon: Settings },
];

const THEME_CYCLE = ['system', 'light', 'dark'] as const;
type ThemeOption = typeof THEME_CYCLE[number];
type StudyMode = 'pw' | 'normal';
type ProfileSummary = {
  examDate: string;
  studentClass: string;
  studyMode: StudyMode;
};

function ThemeToggleButton({ theme, setTheme }: { theme: string | undefined; setTheme: (t: string) => void }) {
  const [showPicker, setShowPicker] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowPicker(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentIcon = theme === 'dark'
    ? <Moon className="h-4 w-4 text-sky-400" />
    : theme === 'system'
      ? <Monitor className="h-4 w-4 text-muted-foreground" />
      : <Sun className="h-4 w-4 text-amber-500" />;

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full hover:bg-muted/80 transition-colors"
        onClick={() => setShowPicker(p => !p)}
        aria-label="Toggle theme"
      >
        <motion.div
          key={theme}
          initial={{ rotate: -20, opacity: 0, scale: 0.8 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {currentIcon}
        </motion.div>
      </Button>

      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="absolute top-full right-0 mt-2 bg-popover border border-border rounded-xl shadow-xl overflow-hidden z-50 min-w-[140px]"
          >
            {(THEME_CYCLE as unknown as ThemeOption[]).map((option) => {
              const icons = {
                system: <Monitor className="h-3.5 w-3.5" />,
                light: <Sun className="h-3.5 w-3.5" />,
                dark: <Moon className="h-3.5 w-3.5" />,
              };
              const labels = { system: 'System', light: 'Light', dark: 'Dark' };
              const isActive = theme === option;
              return (
                <button
                  key={option}
                  onClick={() => { setTheme(option); setShowPicker(false); }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-foreground hover:bg-muted/70'
                  }`}
                >
                  {icons[option]}
                  {labels[option]}
                  {isActive && (
                    <motion.div
                      layoutId="theme-check"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                    />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FloatingActionMenu({
  onAddHabit,
  onAddDoubt,
  stats,
}: {
  onAddHabit: () => void;
  onAddDoubt: () => void;
  stats: { currentStreak?: number; xp?: number; level?: number; totalCompleted?: number } | null;
}) {
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    const streak = stats?.currentStreak ?? 0;
    const xp = stats?.xp ?? 0;
    const level = stats?.level ?? 1;
    const done = stats?.totalCompleted ?? 0;
    const text = `My Nuviora Stats\n\nCurrent Streak: ${streak} days\nXP Earned: ${xp}\nLevel: ${level}\nTotal Habits Done: ${done}\n\nTracking my habits & studies with Nuviora.`;
    if (navigator.share) {
      try { await navigator.share({ title: 'My Nuviora Stats', text }); } catch { /* dismissed */ }
    } else {
      await navigator.clipboard.writeText(text).catch(() => {});
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28, delay: 0.2 }}
      className="fixed bottom-[82px] left-1/2 -translate-x-1/2 z-20"
    >
      <div className="flex items-center gap-1.5 bg-background/85 backdrop-blur-2xl border border-border/40 rounded-2xl px-2.5 py-2 shadow-elevated">
        <motion.button
          whileHover={{ scale: 1.04, y: -1 }}
          whileTap={{ scale: 0.93 }}
          onClick={onAddHabit}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-xl px-3.5 py-2 text-xs font-bold shadow-sm shadow-primary/30 transition-shadow hover:shadow-md hover:shadow-primary/30"
        >
          <Plus className="h-3.5 w-3.5" />
          Habit
        </motion.button>

        <div className="w-px h-5 bg-border/50 mx-0.5" />

        <motion.button
          whileHover={{ scale: 1.04, y: -1 }}
          whileTap={{ scale: 0.93 }}
          onClick={onAddDoubt}
          className="flex items-center gap-1.5 bg-amber-500 text-white rounded-xl px-3.5 py-2 text-xs font-bold shadow-sm shadow-amber-500/30 transition-shadow hover:shadow-md hover:shadow-amber-500/30"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Doubt
        </motion.button>

        <div className="w-px h-5 bg-border/50 mx-0.5" />

        <motion.button
          whileHover={{ scale: 1.04, y: -1 }}
          whileTap={{ scale: 0.93 }}
          onClick={handleShare}
          className="flex items-center gap-1.5 bg-violet-500 text-white rounded-xl px-3.5 py-2 text-xs font-bold shadow-sm shadow-violet-500/30 transition-shadow hover:shadow-md hover:shadow-violet-500/30"
        >
          <Share2 className="h-3.5 w-3.5" />
          {shared ? 'Copied!' : 'Share'}
        </motion.button>
      </div>
    </motion.div>
  );
}

function renderScreen(tab: TabType, profile: ProfileSummary, onProfileUpdate: (profile: Partial<ProfileSummary>) => void) {
  switch (tab) {
    case 'home':       return <HomeDashboard examDate={profile.examDate} studentClass={profile.studentClass} studyMode={profile.studyMode} />;
    case 'pw':         return <PWSection />;
    case 'focus':      return <PomodoroScreen studentClass={profile.studentClass} />;
    case 'study':      return <StudyToolsScreen studentClass={profile.studentClass} />;
    case 'monthly':    return <MonthlyTracker />;
    case 'yearly':     return <YearlyView />;
    case 'analytics':  return <AnalyticsScreen />;
    case 'settings':   return <SettingsScreen onProfileUpdate={onProfileUpdate} />;
    case 'flashcards':   return <FlashCardScreen />;
    case 'formulas':     return <FormulaScreen />;
    case 'challenges':   return <ChallengesScreen />;
    case 'mock-tests':   return <MockTestScreen />;
    case 'sleep':        return <SleepTrackerScreen />;
    case 'gratitude':    return <GratitudeScreen />;
    case 'energy':       return <EnergyTrackerScreen />;
    case 'wellbeing':    return <WellbeingReflectionScreen />;
    case 'topic-timer':  return <TopicTimerScreen />;
    case 'ai-summary':      return <AISummaryScreen />;
    case 'period-tracker':  return <PeriodTrackerScreen />;
    case 'friends':         return <FriendsScreen />;
    case 'pin-lock':     return <HomeDashboard examDate={profile.examDate} studentClass={profile.studentClass} studyMode={profile.studyMode} />;
    default:             return <HomeDashboard examDate={profile.examDate} studentClass={profile.studentClass} studyMode={profile.studyMode} />;
  }
}

// Tab order for directional transitions
const TAB_ORDER: TabType[] = ['home', 'study', 'focus', 'pw', 'friends', 'analytics', 'settings'];

function getTabIndex(tab: TabType): number {
  const idx = TAB_ORDER.indexOf(tab);
  return idx === -1 ? 0 : idx;
}

export default function Page() {
  const {
    activeTab, setActiveTab,
    isAddHabitOpen, setAddHabitOpen,
    fetchHabits, fetchStats,
    stats, habits,
  } = useHabitStore();

  const { theme, setTheme } = useTheme();

  // App state
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [userName, setUserName] = useState('');
  const [studyMode, setStudyMode] = useState<StudyMode>('pw');
  const [examDate, setExamDate] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [examGoal, setExamGoal] = useState('');
  const [pendingSignupName, setPendingSignupName] = useState('');
  const [pendingSignupGender, setPendingSignupGender] = useState('');
  const [userGender, setUserGender] = useState('');
  const [appReady, setAppReady] = useState(false);
  const [pinLock, setPinLock] = useState<{ enabled: boolean; code: string } | null>(null);
  const [doubtOpen, setDoubtOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [userUsername, setUserUsername] = useState<string | null>(null);
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [promptUsername, setPromptUsername] = useState('');
  const [promptUsernameAvailable, setPromptUsernameAvailable] = useState<boolean | null>(null);
  const [promptUsernameChecking, setPromptUsernameChecking] = useState(false);
  const [promptUsernameLoading, setPromptUsernameLoading] = useState(false);
  const [promptUsernameError, setPromptUsernameError] = useState('');

  // Directional transition tracking
  const prevTabRef = useRef<TabType>(activeTab);
  const [slideDir, setSlideDir] = useState<1 | -1>(1);

  // Wrap setActiveTab to compute slide direction
  const navigateTo = useCallback((tab: TabType) => {
    const fromIdx = getTabIndex(prevTabRef.current);
    const toIdx = getTabIndex(tab);
    setSlideDir(toIdx >= fromIdx ? 1 : -1);
    prevTabRef.current = tab;
    setActiveTab(tab);
  }, [setActiveTab]);

  // Track previous streak for milestone toasts
  const prevStreakRef = useRef<number | null>(null);

  // Dark mode schedule
  const darkScheduleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Swipe gesture refs (defined here, handlers added after availableTabs)
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // Attach user headers to all API calls so the backend knows which account is active
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      try {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
        if (url.startsWith('/api')) {
          let userId = '';
          let email = '';
          try {
            userId = localStorage.getItem('nuviora-user-id') || '';
            email = localStorage.getItem('nuviora-user-email') || '';
          } catch { /* localStorage blocked */ }
          if (userId || email) {
            const headers = new Headers(init?.headers);
            if (userId) headers.set('x-nuviora-user-id', userId);
            if (email) headers.set('x-nuviora-email', email);
            return originalFetch(input, { ...init, headers });
          }
        }
      } catch { /* safety net */ }
      return originalFetch(input, init);
    };
    return () => { window.fetch = originalFetch; };
  }, []);

  // Apply saved color theme from localStorage immediately (before profile API resolves)
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('nuviora-color-theme');
      if (savedTheme) {
        const THEMES_MAP: Record<string, string> = {
          'warm-brown': '', 'forest-green': 'theme-forest-green',
          'sunset-orange': 'theme-sunset-orange', 'midnight-purple': 'theme-midnight-purple',
          'rose-gold': 'theme-rose-gold', 'cyber-dark': 'theme-cyber-dark',
          'mint-breeze': 'theme-mint-breeze', 'classic-navy': 'theme-classic-navy',
          'blush-pink': 'theme-blush-pink', 'deep-ocean': 'theme-deep-ocean',
        };
        const themeClass = THEMES_MAP[savedTheme];
        Object.values(THEMES_MAP).forEach(cls => { if (cls) document.documentElement.classList.remove(cls); });
        if (themeClass) document.documentElement.classList.add(themeClass);
      }
    } catch { /* ignore */ }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (!appReady) return;
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
      switch (e.key.toLowerCase()) {
        case 'h': navigateTo('home'); break;
        case 'f': navigateTo('focus'); break;
        case 'a': navigateTo('analytics'); break;
        case '?': setShowShortcuts(p => !p); break;
        case 'escape': setShowShortcuts(false); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [appReady, navigateTo]);

  // Streak milestone toasts
  useEffect(() => {
    if (!appReady || stats?.currentStreak == null) return;
    const streak = stats.currentStreak;
    const MILESTONES = [3, 7, 14, 30];
    const prev = prevStreakRef.current;
    if (prev !== null && MILESTONES.includes(streak) && streak !== prev) {
      const storageKey = `nuviora-streak-toast-${streak}`;
      try {
        if (localStorage.getItem(storageKey)) return;
        localStorage.setItem(storageKey, '1');
      } catch { /* ignore */ }
      const messages: Record<number, string> = {
        3:  `3 days in a row — momentum is building!`,
        7:  `A full week! You're not just trying, you're becoming.`,
        14: `14 days straight. This is now a part of who you are.`,
        30: `30 days. Legendary. Most people quit by day 3.`,
      };
      const msg = messages[streak];
      if (msg) {
        toast(`Studied ${streak} days in a row`, {
          description: msg,
          duration: 5000,
        });
      }
    }
    prevStreakRef.current = streak;
  }, [appReady, stats?.currentStreak]);

  // Always start on Home — no tab restore from localStorage

  // Fetch data and check onboarding
  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchHabits(), fetchStats()]);
    };
    init();
  }, [fetchHabits, fetchStats]);

<<<<<<< HEAD
  // Loading screen completes → check onboarding
  const handleLoadingComplete = async () => {
    let storedUserId = '';
    let storedEmail = '';
    try {
      storedUserId = localStorage.getItem('nuviora-user-id') || '';
      storedEmail = localStorage.getItem('nuviora-user-email') || '';
    } catch { /* blocked */ }

    // If localStorage keys are missing, try to recover from the session cookie (client-side first)
    if (!storedUserId && !storedEmail) {
      try {
        const cookieMatch = document.cookie.match(/(?:^|;\s*)nuviora-session=([^;]*)/);
        if (cookieMatch) {
          const cookieUserId = decodeURIComponent(cookieMatch[1]);
          if (cookieUserId && cookieUserId !== 'default-user') {
            storedUserId = cookieUserId;
            try { localStorage.setItem('nuviora-user-id', cookieUserId); } catch { /* ignore */ }
          }
=======
  // ─── Helpers ────────────────────────────────────────────────────────────────
  type SessionV2 = {
    userId: string; email: string; name: string; studyMode: string;
    onboardingDone: boolean; studentClass: string; examDate: string;
    examGoal: string; gender: string; timestamp: number;
  };

  const writeSessionV2 = (data: Omit<SessionV2, 'timestamp'>) => {
    try {
      localStorage.setItem('nuviora-session-v2', JSON.stringify({ ...data, timestamp: Date.now() }));
      if (data.userId) localStorage.setItem('nuviora-user-id', data.userId);
      if (data.email) localStorage.setItem('nuviora-user-email', data.email);
      localStorage.setItem('nuviora-user-cache', JSON.stringify({ name: data.name, examDate: data.examDate }));
    } catch { /* storage blocked */ }
  };

  const clearSession = () => {
    try {
      ['nuviora-user-id','nuviora-user-email','nuviora-user-cache','nuviora-session-v2'].forEach(k => localStorage.removeItem(k));
    } catch { /* ignore */ }
    try { document.cookie = 'nuviora-session=; Max-Age=0; path=/; SameSite=None; Secure'; } catch { /* ignore */ }
  };

  const readSessionV2 = (): SessionV2 | null => {
    try {
      const raw = localStorage.getItem('nuviora-session-v2');
      if (!raw) return null;
      const sess = JSON.parse(raw) as SessionV2;
      const MAX_AGE = 60 * 24 * 60 * 60 * 1000; // 60 days
      if (!sess.userId || typeof sess.timestamp !== 'number' || Date.now() - sess.timestamp > MAX_AGE) return null;
      return sess;
    } catch { return null; }
  };

  const applyTheme = (theme: string) => {
    const THEMES_MAP: Record<string, string> = {
      'warm-brown': '', 'forest-green': 'theme-forest-green',
      'sunset-orange': 'theme-sunset-orange', 'midnight-purple': 'theme-midnight-purple',
      'rose-gold': 'theme-rose-gold', 'cyber-dark': 'theme-cyber-dark',
      'mint-breeze': 'theme-mint-breeze', 'classic-navy': 'theme-classic-navy',
      'blush-pink': 'theme-blush-pink', 'deep-ocean': 'theme-deep-ocean',
    };
    Object.values(THEMES_MAP).forEach(cls => { if (cls) document.documentElement.classList.remove(cls); });
    const cls = THEMES_MAP[theme];
    if (cls) document.documentElement.classList.add(cls);
    try { localStorage.setItem('nuviora-color-theme', theme); } catch { /* ignore */ }
  };

  // Loading screen completes → resolve session and enter the app
  const handleLoadingComplete = async () => {
    let storedUserId = '';
    let storedEmail = '';

    // Priority 1 — comprehensive session cache (survives tab closes, browser restarts)
    const cachedSession = readSessionV2();
    if (cachedSession) {
      storedUserId = cachedSession.userId;
      storedEmail = cachedSession.email || '';
    }

    // Priority 2 — legacy individual localStorage keys
    if (!storedUserId) {
      try {
        storedUserId = localStorage.getItem('nuviora-user-id') || '';
        storedEmail = storedEmail || localStorage.getItem('nuviora-user-email') || '';
      } catch { /* storage blocked */ }
    }

    // Priority 3 — client-readable cookie (same-site contexts)
    if (!storedUserId) {
      try {
        const m = document.cookie.match(/(?:^|;\s*)nuviora-session=([^;]*)/);
        if (m) {
          const v = decodeURIComponent(m[1]);
          if (v && v !== 'default-user') storedUserId = v;
>>>>>>> 925ef42 (Initial commit)
        }
      } catch { /* ignore */ }
    }

<<<<<<< HEAD
    // If still no session, ask the server — it can read the HTTP cookie reliably
    // even when document.cookie is restricted (cross-origin iframes, browser policies, etc.)
    if (!storedUserId && !storedEmail) {
      try {
        const sessionRes = await fetch('/api/auth/session');
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData.authenticated && sessionData.userId) {
            storedUserId = sessionData.userId;
            if (sessionData.email) storedEmail = sessionData.email;
            try {
              localStorage.setItem('nuviora-user-id', sessionData.userId);
              if (sessionData.email) localStorage.setItem('nuviora-user-email', sessionData.email);
            } catch { /* ignore */ }
          }
        }
      } catch { /* ignore */ }
    }

    // No session at all → hide loader and show login
=======
    // Priority 4 — server-side cookie verification (handles cross-origin iframe restrictions)
    if (!storedUserId && !storedEmail) {
      try {
        const r = await fetch('/api/auth/session');
        if (r.ok) {
          const d = await r.json();
          if (d.authenticated && d.userId) {
            storedUserId = d.userId;
            storedEmail = d.email || '';
          }
        }
      } catch { /* network failure */ }
    }

    // No session anywhere → show login
>>>>>>> 925ef42 (Initial commit)
    if (!storedUserId && !storedEmail) {
      setIsLoading(false);
      setShowSplash(true);
      return;
    }

<<<<<<< HEAD
=======
<<<<<<< HEAD
    // Session found — ALWAYS send explicit headers so the profile call succeeds
    // regardless of whether the fetch-wrapper useEffect has been installed yet
    const profileHeaders: Record<string, string> = {};
    if (storedUserId) profileHeaders['x-nuviora-user-id'] = storedUserId;
    if (storedEmail) profileHeaders['x-nuviora-email'] = storedEmail;

    try {
      const res = await fetch('/api/profile', { headers: profileHeaders });

=======
>>>>>>> 925ef42 (Initial commit)
    // Session exists → verify silently without ever showing the login screen.
    // Build auth headers explicitly — the window.fetch interceptor runs in a
    // useEffect and may not be attached yet when this function fires.
    const authHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (storedUserId) authHeaders['x-nuviora-user-id'] = storedUserId;
    if (storedEmail)  authHeaders['x-nuviora-email']   = storedEmail;

    try {
      const res = await fetch('/api/profile', { headers: authHeaders });
<<<<<<< HEAD
      if (res.ok) {
        const profile = await res.json();
=======
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
      if (res.ok) {
        const profile = await res.json();

        // Apply theme before unhiding the app to avoid a flash
        if (profile.theme) applyTheme(profile.theme);

        // Dark-mode schedule
        if (profile.darkModeSchedule && profile.darkModeStart && profile.darkModeEnd) {
          const checkDark = () => {
            const now = new Date();
            const cur = now.getHours() * 60 + now.getMinutes();
            const [sh, sm] = (profile.darkModeStart as string).split(':').map(Number);
            const [eh, em] = (profile.darkModeEnd as string).split(':').map(Number);
            const start = sh * 60 + sm, end = eh * 60 + em;
            const dark = start <= end ? cur >= start && cur < end : cur >= start || cur < end;
            setTheme(dark ? 'dark' : 'light');
          };
          checkDark();
          darkScheduleRef.current = setInterval(checkDark, 60000);
        }

        if (profile.pinEnabled && profile.pinCode) setPinLock({ enabled: true, code: profile.pinCode });

        // Hydrate UI state
>>>>>>> 925ef42 (Initial commit)
        setUserName(profile.name || '');
        setStudyMode(profile.studyMode === 'normal' ? 'normal' : 'pw');
        setExamDate(profile.examDate || '');
        setStudentClass(profile.studentClass || '');
        setExamGoal(profile.examGoal || '');
        setUserGender(profile.gender || '');
        setUserUsername(profile.username || null);

<<<<<<< HEAD
        // Restore saved theme and sync to localStorage
        if (profile.theme) {
          const THEMES_MAP: Record<string, string> = {
            'warm-brown': '', 'forest-green': 'theme-forest-green',
            'sunset-orange': 'theme-sunset-orange', 'midnight-purple': 'theme-midnight-purple',
            'rose-gold': 'theme-rose-gold', 'cyber-dark': 'theme-cyber-dark',
            'mint-breeze': 'theme-mint-breeze', 'classic-navy': 'theme-classic-navy',
            'blush-pink': 'theme-blush-pink', 'deep-ocean': 'theme-deep-ocean',
          };
          const themeClass = THEMES_MAP[profile.theme];
          Object.values(THEMES_MAP).forEach(cls => { if (cls) document.documentElement.classList.remove(cls); });
          if (themeClass) document.documentElement.classList.add(themeClass);
          try { localStorage.setItem('nuviora-color-theme', profile.theme); } catch { /* ignore */ }
        }

        // Dark mode scheduling
        if (profile.darkModeSchedule && profile.darkModeStart && profile.darkModeEnd) {
          const checkDarkSchedule = () => {
            const now = new Date();
            const h = now.getHours(), m = now.getMinutes();
            const currentMins = h * 60 + m;
            const [startH, startM] = (profile.darkModeStart as string).split(':').map(Number);
            const [endH, endM] = (profile.darkModeEnd as string).split(':').map(Number);
            const startMins = startH * 60 + startM;
            const endMins = endH * 60 + endM;
            let isDarkTime: boolean;
            if (startMins <= endMins) {
              isDarkTime = currentMins >= startMins && currentMins < endMins;
            } else {
              isDarkTime = currentMins >= startMins || currentMins < endMins;
            }
            setTheme(isDarkTime ? 'dark' : 'light');
          };
          checkDarkSchedule();
          darkScheduleRef.current = setInterval(checkDarkSchedule, 60000);
        }

        if (profile.pinEnabled && profile.pinCode) {
          setPinLock({ enabled: true, code: profile.pinCode });
        }

        try {
          localStorage.setItem('nuviora-user-cache', JSON.stringify({
            name: profile.name || '',
            examDate: profile.examDate || '',
          }));
        } catch { /* ignore */ }

        // Now that we have all data, hide the loader
        setIsLoading(false);

        if (!profile.onboardingDone) {
          // Need to complete onboarding — show that flow, not the login screen.
          // Pre-fill with whatever profile data we already have.
=======
        // Persist comprehensive session so next load is instant
        writeSessionV2({
          userId: storedUserId || `email:${storedEmail.trim().toLowerCase()}`,
          email: storedEmail,
          name: profile.name || '',
          studyMode: profile.studyMode || 'pw',
          onboardingDone: !!profile.onboardingDone,
          studentClass: profile.studentClass || '',
          examDate: profile.examDate || '',
          examGoal: profile.examGoal || '',
          gender: profile.gender || '',
        });

        setIsLoading(false);

        if (!profile.onboardingDone) {
>>>>>>> 925ef42 (Initial commit)
          setPendingSignupName(profile.name || '');
          setPendingSignupGender(profile.gender || '');
          setShowOnboarding(true);
        } else {
          setAppReady(true);
          if (!profile.username) setShowUsernamePrompt(true);
        }
        return;
      }

<<<<<<< HEAD
      // Only clear session on a real auth rejection (401/403).
      // Anything else (5xx, network blip) should fall through to the cache path
      // so the user is NOT logged out just because of a temporary server hiccup.
      if (res.status === 401 || res.status === 403) {
        try {
          localStorage.removeItem('nuviora-user-id');
          localStorage.removeItem('nuviora-user-email');
          localStorage.removeItem('nuviora-user-cache');
        } catch { /* ignore */ }
        try { document.cookie = 'nuviora-session=; Max-Age=0; path=/'; } catch { /* ignore */ }
=======
      // Real auth rejection → clear everything and show login
      if (res.status === 401 || res.status === 403) {
        clearSession();
>>>>>>> 925ef42 (Initial commit)
        setIsLoading(false);
        setShowSplash(true);
        return;
      }

<<<<<<< HEAD
      // Temporary server error — recover from cache so the user stays logged in
      let cache: { name?: string; examDate?: string } | null = null;
      try {
        const raw = localStorage.getItem('nuviora-user-cache');
        if (raw) cache = JSON.parse(raw);
      } catch { /* ignore */ }

      setIsLoading(false);

      if (cache) {
        setUserName(cache.name || '');
        setExamDate(cache.examDate || '');
        setAppReady(true);
      } else {
        setShowSplash(true);
      }
    } catch {
      // Network failure — try to recover with cached profile so the user isn't
      // kicked to the login screen just because of a bad connection.
      let cache: { name?: string; examDate?: string } | null = null;
      try {
        const raw = localStorage.getItem('nuviora-user-cache');
        if (raw) cache = JSON.parse(raw);
      } catch { /* ignore */ }

      setIsLoading(false);

      if (cache) {
        // Restore from cache and let the user in — data will refresh on next
        // successful fetch
        setUserName(cache.name || '');
        setExamDate(cache.examDate || '');
        setAppReady(true);
      } else {
        // No cache available — show login so the user can re-authenticate
=======
      // Temporary server/network error → use the comprehensive cache so user stays in
      const sess = readSessionV2();
      setIsLoading(false);
      if (sess) {
        setUserName(sess.name);
        setExamDate(sess.examDate);
        setStudyMode(sess.studyMode === 'normal' ? 'normal' : 'pw');
        setStudentClass(sess.studentClass);
        setExamGoal(sess.examGoal);
        setUserGender(sess.gender);
        setAppReady(true);
      } else {
        // No cache at all — fall back to the slim legacy cache
        try {
          const raw = localStorage.getItem('nuviora-user-cache');
          if (raw) {
            const c = JSON.parse(raw);
            setUserName(c.name || '');
            setExamDate(c.examDate || '');
            setAppReady(true);
            return;
          }
        } catch { /* ignore */ }
        setShowSplash(true);
      }
    } catch {
      // Network failure — stay logged in if any cache exists
      setIsLoading(false);
      const sess = readSessionV2();
      if (sess) {
        setUserName(sess.name);
        setExamDate(sess.examDate);
        setStudyMode(sess.studyMode === 'normal' ? 'normal' : 'pw');
        setStudentClass(sess.studentClass);
        setExamGoal(sess.examGoal);
        setUserGender(sess.gender);
        setAppReady(true);
      } else {
        try {
          const raw = localStorage.getItem('nuviora-user-cache');
          if (raw) {
            const c = JSON.parse(raw);
            setUserName(c.name || '');
            setExamDate(c.examDate || '');
            setAppReady(true);
            return;
          }
        } catch { /* ignore */ }
>>>>>>> 925ef42 (Initial commit)
        setShowSplash(true);
      }
    }
  };

  const handleLoginAttempt = async (data: { email: string; password: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email: data.email, password: data.password }),
      });
      const authData = await res.json().catch(() => ({}));
      if (!res.ok) return { success: false, error: authData.error || 'Invalid email or password.' };
      const profile = authData.profile;
<<<<<<< HEAD
=======
<<<<<<< HEAD
      // Persist comprehensive session so the next app open is instant and reliable
      writeSessionV2({
        userId: authData.userId,
        email: data.email,
        name: profile.name || '',
        studyMode: profile.studyMode || 'pw',
        onboardingDone: !!profile.onboardingDone,
        studentClass: profile.studentClass || '',
        examDate: profile.examDate || '',
        examGoal: profile.examGoal || '',
        gender: profile.gender || '',
      });
=======
>>>>>>> 925ef42 (Initial commit)
      localStorage.setItem('nuviora-user-id', authData.userId);
      localStorage.setItem('nuviora-user-email', data.email);
      // Write session cookie so next app open restores the session even if localStorage is cleared
      try {
        document.cookie = `nuviora-session=${encodeURIComponent(authData.userId)}; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Lax`;
      } catch { /* ignore */ }
      // Cache profile for offline/fast-path recovery
      try {
        localStorage.setItem('nuviora-user-cache', JSON.stringify({
          name: profile.name || '',
          examDate: profile.examDate || '',
        }));
      } catch { /* ignore */ }
<<<<<<< HEAD
=======
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
      setUserName(profile.name || '');
      setStudyMode(profile.studyMode === 'normal' ? 'normal' : 'pw');
      setExamDate(profile.examDate || '');
      setStudentClass(profile.studentClass || '');
      setExamGoal(profile.examGoal || '');
      setUserGender(profile.gender || '');
      setUserUsername(profile.username || null);
      if (profile.pinEnabled && profile.pinCode) setPinLock({ enabled: true, code: profile.pinCode });
      await Promise.all([fetchHabits(), fetchStats()]);
      setShowSplash(false);
      setAppReady(true);
      if (!profile.username) setShowUsernamePrompt(true);
      return { success: true };
    } catch {
      return { success: false, error: 'Something went wrong. Please try again.' };
    }
  };

  useEffect(() => {
    return () => { if (darkScheduleRef.current) clearInterval(darkScheduleRef.current); };
  }, []);

  useEffect(() => {
    if (studyMode === 'normal' && activeTab === 'pw') {
      setActiveTab('home');
    }
  }, [activeTab, setActiveTab, studyMode]);

  const today = new Date();
  const formattedDate = format(today, 'EEEE, MMMM d');
  const currentStreak = stats?.currentStreak ?? 0;

  const widgetData = useMemo(() => {
    const todayStr = format(today, 'yyyy-MM-dd');
    const activeHabits = habits.filter(h => !h.isArchived);
    const completedToday = activeHabits.filter(h =>
      h.logs?.some(l => l.date === todayStr && l.status === 'completed')
    ).length;
    const progressPercent = activeHabits.length
      ? Math.round((completedToday / activeHabits.length) * 100) : 0;
    return { progressPercent, completedToday, totalHabits: activeHabits.length };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits]);

  const availableTabs = useMemo(
    () => studyMode === 'normal'
      ? tabs.filter(tab => tab.id !== 'pw')
      : tabs,
    [studyMode],
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      const tabIds = availableTabs.map(t => t.id);
      const currentIndex = tabIds.indexOf(activeTab);
      if (deltaX < 0 && currentIndex < tabIds.length - 1) {
        navigateTo(tabIds[currentIndex + 1]);
      } else if (deltaX > 0 && currentIndex > 0) {
        navigateTo(tabIds[currentIndex - 1]);
      }
    }
  }, [availableTabs, activeTab, navigateTo]);

  const checkPromptUsername = async (username: string) => {
    const clean = username.trim().toLowerCase();
    if (clean.length < 3) { setPromptUsernameAvailable(null); return; }
    setPromptUsernameChecking(true);
    try {
      const res = await fetch(`/api/username-check?username=${encodeURIComponent(clean)}`);
      const json = await res.json().catch(() => ({}));
      setPromptUsernameAvailable(json.available ?? null);
    } catch { setPromptUsernameAvailable(null); }
    setPromptUsernameChecking(false);
  };

  const handleSaveUsername = async () => {
    const clean = promptUsername.trim().toLowerCase();
    setPromptUsernameError('');
    if (!clean || clean.length < 3) return setPromptUsernameError('Username must be at least 3 characters.');
    if (promptUsernameAvailable === false) return setPromptUsernameError('This username is already taken.');
    setPromptUsernameLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: clean }),
      });
      if (res.ok) {
        setUserUsername(clean);
        setShowUsernamePrompt(false);
        toast.success(`Username @${clean} saved!`);
      } else {
        const json = await res.json().catch(() => ({}));
        setPromptUsernameError(json.error || 'Could not save username.');
      }
    } catch { setPromptUsernameError('Something went wrong.'); }
    setPromptUsernameLoading(false);
  };

  const handleOnboardingComplete = async (name: string, selectedStudyMode: StudyMode) => {
    setUserName(name);
    setStudyMode(selectedStudyMode);
    setShowOnboarding(false);
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const profile = await res.json();
        setStudentClass(profile.studentClass || '');
        setExamDate(profile.examDate || '');
        setExamGoal(profile.examGoal || '');
<<<<<<< HEAD
=======
        // Refresh the session cache now that onboarding is complete
        const userId = (() => { try { return localStorage.getItem('nuviora-user-id') || ''; } catch { return ''; } })();
        const email = (() => { try { return localStorage.getItem('nuviora-user-email') || ''; } catch { return ''; } })();
        writeSessionV2({
          userId,
          email,
          name: profile.name || name,
          studyMode: profile.studyMode || selectedStudyMode,
          onboardingDone: true,
          studentClass: profile.studentClass || '',
          examDate: profile.examDate || '',
          examGoal: profile.examGoal || '',
          gender: profile.gender || '',
        });
>>>>>>> 925ef42 (Initial commit)
      }
    } catch { /* ignore */ }
    setAppReady(true);
  };

  const handleProfileUpdate = (profile: Partial<ProfileSummary>) => {
    if (profile.studyMode) {
      setStudyMode(profile.studyMode);
    }
    if (profile.examDate !== undefined) {
      setExamDate(profile.examDate);
    }
    if (profile.studentClass !== undefined) {
      setStudentClass(profile.studentClass);
    }
    if (profile.studyMode === 'normal' && activeTab === 'pw') {
      setActiveTab('home');
    }
  };

  return (
    <>
      {/* Seamless background fill — sits behind the loader but prevents any
          blank flash while we're verifying the session after the animation exits */}
      {isLoading && (
        <div className="fixed inset-0 z-[9998] bg-background" />
      )}

      {/* Loading Screen */}
      {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}

      {/* PIN Lock */}
      {!isLoading && pinLock?.enabled && (
        <PinLockScreen
          correctPin={pinLock.code}
          onUnlock={() => setPinLock(null)}
        />
      )}

      {/* Splash login screen (shown first for new users) */}
      {!isLoading && !pinLock?.enabled && showSplash && !showOnboarding && (
        <SplashLoginScreen
          onStartJourney={async (data) => {
<<<<<<< HEAD
=======
<<<<<<< HEAD
            writeSessionV2({
              userId: data.userId,
              email: data.email,
              name: data.name || '',
              studyMode: 'pw',
              onboardingDone: false,
              studentClass: '',
              examDate: '',
              examGoal: '',
              gender: data.gender || '',
            });
=======
>>>>>>> 925ef42 (Initial commit)
            localStorage.setItem('nuviora-user-id', data.userId);
            localStorage.setItem('nuviora-user-email', data.email);
            // Write session cookie immediately on signup so next app open skips login
            try {
              document.cookie = `nuviora-session=${encodeURIComponent(data.userId)}; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Lax`;
            } catch { /* ignore */ }
            // Seed the user cache with their name so the loading screen can greet them
            try {
              localStorage.setItem('nuviora-user-cache', JSON.stringify({ name: data.name, examDate: '' }));
            } catch { /* ignore */ }
<<<<<<< HEAD
=======
>>>>>>> 02b3c2faa52add0d654dfc155eecd2baddc0f79f
>>>>>>> 925ef42 (Initial commit)
            setUserName(data.name);
            setUserUsername(data.username || null);
            setPendingSignupName(data.name);
            setPendingSignupGender(data.gender || '');
            setShowSplash(false);
            setShowOnboarding(true);
          }}
          onLogin={handleLoginAttempt}
        />
      )}

      {/* Onboarding */}
      {!isLoading && !pinLock?.enabled && showOnboarding && (
        <OnboardingScreen initialName={pendingSignupName} initialGender={pendingSignupGender} onComplete={handleOnboardingComplete} />
      )}

      {/* Main App */}
      <AnimatePresence>
        {appReady && !pinLock?.enabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="min-h-screen bg-background flex flex-col"
          >
            {/* Header */}
            <header className="flex-shrink-0 px-5 pt-5 pb-3 max-w-3xl mx-auto w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <motion.div
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      <h1 className="text-xl font-bold gradient-text tracking-tight">
                        {userName ? `Hey, ${userName.split(' ')[0]}!` : 'Nuviora'}
                      </h1>
                      {studentClass ? (
                        <p className="text-xs text-primary/80 font-semibold mt-0.5">
                          {studentClass}{examGoal && examGoal !== 'School' && examGoal !== 'Boards' ? ` • ${examGoal}` : ''} Plan
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-0.5" suppressHydrationWarning>
                          {formattedDate}
                        </p>
                      )}
                    </motion.div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {currentStreak > 0 && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 26, delay: 0.2 }}
                      className="flex items-center gap-1.5 bg-amber-500/12 border border-amber-500/20 text-foreground px-3 py-1.5 rounded-full text-sm font-bold badge-glow-amber"
                    >
                      <Flame className="h-4 w-4 text-amber-500" />
                      <span className="text-amber-700 dark:text-amber-300">{currentStreak}</span>
                    </motion.div>
                  )}

                  {/* Changelog bell */}
                  <ChangelogBell />

                  {/* 3-option dark mode toggle */}
                  <ThemeToggleButton theme={theme} setTheme={setTheme} />
                </div>
              </div>

              {/* Header progress widgets (home tab only) */}
              <AnimatePresence>
                {activeTab === 'home' && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                    className="grid grid-cols-3 gap-2 mt-3.5"
                  >
                    {/* Progress ring */}
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.05, type: 'spring', stiffness: 380, damping: 26 }}
                      className="relative flex flex-col items-center gap-1.5 bg-card rounded-2xl p-3 border border-border/40 shadow-card overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-primary/2 to-transparent pointer-events-none" />
                      <div className="relative w-10 h-10 flex-shrink-0">
                        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                          <circle cx="20" cy="20" r="15" fill="none" stroke="currentColor" strokeOpacity={0.1} strokeWidth="3.5" />
                          <motion.circle
                            cx="20" cy="20" r="15" fill="none" className="stroke-primary"
                            strokeWidth="3.5" strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 15}`}
                            animate={{ strokeDashoffset: `${2 * Math.PI * 15 * (1 - widgetData.progressPercent / 100)}` }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[9px] font-black text-primary leading-none">{widgetData.progressPercent}%</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-semibold leading-none tracking-wide">Progress</p>
                    </motion.div>

                    {/* Habits done */}
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.09, type: 'spring', stiffness: 380, damping: 26 }}
                      className="relative flex flex-col items-center gap-1.5 bg-card rounded-2xl p-3 border border-border/40 shadow-card overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-primary/2 to-transparent pointer-events-none" />
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 style={{ width: '1.1rem', height: '1.1rem' }} className="text-primary" />
                      </div>
                      <div className="text-center leading-none">
                        <p className="text-sm font-black text-foreground leading-none">
                          {widgetData.completedToday}<span className="text-muted-foreground font-medium text-xs">/{widgetData.totalHabits}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground font-semibold mt-0.5 tracking-wide">Habits</p>
                      </div>
                    </motion.div>

                    {/* Streak */}
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.13, type: 'spring', stiffness: 380, damping: 26 }}
                      className="relative flex flex-col items-center gap-1.5 bg-card rounded-2xl p-3 border border-border/40 shadow-card overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/6 via-amber-500/2 to-transparent pointer-events-none" />
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg leading-none">🔥</span>
                      </div>
                      <div className="text-center leading-none">
                        <p className="text-sm font-black text-foreground leading-none">{currentStreak}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold mt-0.5 tracking-wide">Streak</p>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </header>

            {/* Scrollable content */}
            <main
              className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar px-5 pb-28 max-w-3xl mx-auto w-full"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div className={activeTab === 'focus' ? 'tab-content min-h-full' : 'hidden'}>
                <PomodoroScreen studentClass={studentClass} />
              </div>
              <AnimatePresence mode="wait" custom={slideDir}>
                {activeTab !== 'focus' && (
                  <motion.div
                    key={activeTab}
                    custom={slideDir}
                    variants={{
                      initial: (dir: number) => ({ opacity: 0, x: dir * 24 }),
                      animate: { opacity: 1, x: 0 },
                      exit: (dir: number) => ({ opacity: 0, x: dir * -24 }),
                    }}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ type: 'spring', stiffness: 340, damping: 32 }}
                    className="tab-content min-h-full"
                  >
                    {renderScreen(activeTab, { examDate, studentClass, studyMode }, handleProfileUpdate)}
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            {/* Merged floating action menu — Add Habit + Add Doubt */}
            {activeTab !== 'focus' && (
              <FloatingActionMenu
                onAddHabit={() => setAddHabitOpen(true)}
                onAddDoubt={() => setDoubtOpen(true)}
                stats={stats}
              />
            )}

            {/* Quick Doubt Logger — controlled sheet, no floating button */}
            <QuickDoubtLogger isOpen={doubtOpen} onClose={() => setDoubtOpen(false)} />

            {/* Bottom navigation bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-30">
              <div className="glass-premium bg-background/85 backdrop-blur-2xl nav-float border-t border-border/30 px-2 pb-[env(safe-area-inset-bottom)]">
                <div className="flex items-center justify-around h-[64px] max-w-3xl mx-auto">
                  {availableTabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => navigateTo(tab.id)}
                        whileTap={{ scale: 0.88 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                        className={`
                          relative flex flex-col items-center justify-center gap-1 w-14 h-full
                          ${isActive ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground/80'}
                        `}
                        aria-label={tab.label}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {/* Active background pill */}
                        {isActive ? (
                          <motion.div
                            layoutId="nav-bg"
                            className="absolute inset-x-0 inset-y-1 rounded-2xl nav-active-pill"
                            transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                          />
                        ) : null}
                        <motion.div
                          animate={isActive ? { scale: 1.12, y: -1 } : { scale: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 26 }}
                          className="relative z-10"
                        >
                          <Icon
                            className={`h-[18px] w-[18px] transition-all duration-200 ${isActive ? 'text-primary-foreground drop-shadow-sm' : ''}`}
                            strokeWidth={isActive ? 2.5 : 1.8}
                          />
                        </motion.div>
                        <motion.span
                          animate={isActive ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0.5, scale: 0.95, y: 0 }}
                          transition={{ duration: 0.15 }}
                          className={`text-[9px] font-semibold leading-none tracking-wide relative z-10 ${isActive ? 'text-primary-foreground' : ''}`}
                        >
                          {tab.label}
                        </motion.span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </nav>

            <AddHabitDialog />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Username Prompt — shown for existing users without a username */}
      <AnimatePresence>
        {showUsernamePrompt && appReady && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[9990] backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="fixed inset-x-6 top-1/2 -translate-y-1/2 z-[9991] max-w-sm mx-auto"
            >
              <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                <div className="px-5 pt-6 pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <AtSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-base font-black text-foreground">Choose a Username</p>
                      <p className="text-xs text-muted-foreground">Friends will add you with this</p>
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 text-sm font-medium">@</span>
                    <input
                      type="text"
                      placeholder="yourname"
                      value={promptUsername}
                      onChange={e => {
                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9_\.]/g, '');
                        setPromptUsername(val);
                        setPromptUsernameAvailable(null);
                        setPromptUsernameError('');
                      }}
                      onBlur={() => checkPromptUsername(promptUsername)}
                      className="w-full h-12 pl-7 pr-9 rounded-xl bg-muted/60 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                      maxLength={20}
                      autoFocus
                    />
                    {promptUsernameChecking && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    )}
                    {!promptUsernameChecking && promptUsernameAvailable === true && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-xs font-bold">✓</span>
                    )}
                    {!promptUsernameChecking && promptUsernameAvailable === false && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive text-xs font-bold">✗</span>
                    )}
                  </div>
                  {promptUsernameError && (
                    <p className="text-xs text-destructive mt-2">{promptUsernameError}</p>
                  )}
                  {promptUsernameAvailable === false && !promptUsernameError && (
                    <p className="text-xs text-destructive mt-2">Username taken. Try another.</p>
                  )}
                  {promptUsernameAvailable === true && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">@{promptUsername} is available!</p>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-2">3–20 chars. Letters, numbers, _ and . only.</p>
                </div>
                <div className="px-5 pb-5 flex gap-2">
                  <button
                    onClick={() => setShowUsernamePrompt(false)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold border border-border bg-muted/40 text-foreground transition-all active:scale-95"
                  >
                    Skip for now
                  </button>
                  <button
                    onClick={handleSaveUsername}
                    disabled={promptUsernameLoading || promptUsername.trim().length < 3 || promptUsernameAvailable === false}
                    className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    style={{ background: '#C08552', color: '#fff' }}
                  >
                    {promptUsernameLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : 'Save'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Weekly Review — auto-shows on Sundays */}
      <WeeklyReviewDialog />

      {/* Keyboard Shortcuts Overlay */}
      <AnimatePresence>
        {showShortcuts && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[9998]"
              onClick={() => setShowShortcuts(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className="fixed inset-x-6 top-1/2 -translate-y-1/2 z-[9999] max-w-sm mx-auto"
            >
              <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Keyboard className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Keyboard Shortcuts</p>
                      <p className="text-[10px] text-muted-foreground">Press ? to toggle</p>
                    </div>
                  </div>
                  <button onClick={() => setShowShortcuts(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-4 space-y-2">
                  {[
                    { key: 'H', desc: 'Go to Home', tab: 'home' },
                    { key: 'F', desc: 'Go to Focus / Pomodoro', tab: 'focus' },
                    { key: 'A', desc: 'Go to Analytics', tab: 'analytics' },
                    { key: '?', desc: 'Toggle this shortcuts panel', tab: null },
                    { key: 'Esc', desc: 'Close overlays', tab: null },
                  ].map(({ key, desc, tab }) => (
                    <button
                      key={key}
                      onClick={() => {
                        if (tab) { setActiveTab(tab as TabType); setShowShortcuts(false); }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${tab ? 'hover:bg-muted/60 cursor-pointer' : 'cursor-default'}`}
                    >
                      <span className="text-sm text-foreground/80">{desc}</span>
                      <kbd className="text-[11px] font-bold bg-muted border border-border/70 px-2 py-0.5 rounded-md text-foreground">{key}</kbd>
                    </button>
                  ))}
                </div>
                <div className="px-5 pb-4 pt-1">
                  <p className="text-[10px] text-muted-foreground text-center">Shortcuts work on desktop &amp; tablet</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
