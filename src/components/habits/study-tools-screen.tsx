'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, BookMarked, ClipboardList, BookLock,
  HelpCircle, BarChart3, ChevronLeft,
  FlaskConical, NotebookPen, Trophy,
  Brain, Timer, Moon, Heart, Zap, CalendarRange,
  HeartPulse,
} from 'lucide-react';
import { useHabitStore } from '@/stores/habit-store';
import type { TabType } from '@/stores/habit-store';

const ToolLoading = () => (
  <div className="space-y-3">
    {[1, 2, 3].map(i => (
      <div key={i} className="h-20 rounded-2xl bg-muted/50 animate-pulse" />
    ))}
  </div>
);

const SubjectTracker = dynamic(() => import('./subject-tracker').then(m => ({ default: m.SubjectTracker })), { ssr: false, loading: ToolLoading });
const MockTestScreen = dynamic(() => import('./mock-test-screen').then(m => ({ default: m.MockTestScreen })), { ssr: false, loading: ToolLoading });
const FormulaVault = dynamic(() => import('./formula-vault').then(m => ({ default: m.FormulaVault })), { ssr: false, loading: ToolLoading });
const DoubtBank = dynamic(() => import('./doubt-bank').then(m => ({ default: m.DoubtBank })), { ssr: false, loading: ToolLoading });
const MistakeNotebook = dynamic(() => import('./mistake-notebook').then(m => ({ default: m.MistakeNotebook })), { ssr: false, loading: ToolLoading });
const RevisionReminder = dynamic(() => import('./revision-reminder').then(m => ({ default: m.RevisionReminder })), { ssr: false, loading: ToolLoading });
const RewardShop = dynamic(() => import('./reward-shop').then(m => ({ default: m.RewardShop })), { ssr: false, loading: ToolLoading });
const ParentReport = dynamic(() => import('./parent-report').then(m => ({ default: m.ParentReport })), { ssr: false, loading: ToolLoading });
const WeeklyTimetableBuilder = dynamic(() => import('./weekly-timetable-builder').then(m => ({ default: m.WeeklyTimetableBuilder })), { ssr: false, loading: ToolLoading });

const STUDY_TOOLS = [
  {
    id: 'subjects',
    label: 'Syllabus',
    icon: BookOpen,
    desc: 'Track subject & chapter progress',
    color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    accent: 'border-sky-200/60 dark:border-sky-800/40',
  },
  {
    id: 'mocks',
    label: 'Mock Tests',
    icon: BarChart3,
    desc: 'Log scores & analyse performance',
    color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    accent: 'border-violet-200/60 dark:border-violet-800/40',
  },
  {
    id: 'formulas',
    label: 'Formula Vault',
    icon: FlaskConical,
    desc: 'Store & revise key formulas',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    accent: 'border-emerald-200/60 dark:border-emerald-800/40',
  },
  {
    id: 'doubts',
    label: 'Doubt Bank',
    icon: HelpCircle,
    desc: 'Capture and resolve doubts',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    accent: 'border-amber-200/60 dark:border-amber-800/40',
  },
  {
    id: 'mistakes',
    label: 'Mistake Book',
    icon: NotebookPen,
    desc: 'Learn from past mistakes',
    color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    accent: 'border-rose-200/60 dark:border-rose-800/40',
  },
  {
    id: 'revisions',
    label: 'Revisions',
    icon: BookMarked,
    desc: 'Spaced repetition reminders',
    color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    accent: 'border-teal-200/60 dark:border-teal-800/40',
  },
  {
    id: 'rewards',
    label: 'Reward Shop',
    icon: Trophy,
    desc: 'Spend coins on study breaks',
    color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    accent: 'border-yellow-200/60 dark:border-yellow-800/40',
  },
  {
    id: 'report',
    label: 'Report',
    icon: ClipboardList,
    desc: 'Progress report & insights',
    color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    accent: 'border-indigo-200/60 dark:border-indigo-800/40',
  },
  {
    id: 'timetable',
    label: 'Timetable',
    icon: CalendarRange,
    desc: 'Build your weekly study schedule',
    color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    accent: 'border-cyan-200/60 dark:border-cyan-800/40',
  },
  {
    id: 'wellbeing',
    label: 'Wellbeing',
    icon: HeartPulse,
    desc: 'Reflect, check stress & exam milestones',
    color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
    accent: 'border-pink-200/60 dark:border-pink-800/40',
  },
] as const;

type StudyTab = typeof STUDY_TOOLS[number]['id'];

function StudyToolContent({ id, studentClass }: { id: StudyTab; studentClass?: string }) {
  switch (id) {
    case 'subjects': return <SubjectTracker studentClass={studentClass ?? ''} />;
    case 'mocks': return <MockTestScreen />;
    case 'formulas': return <FormulaVault />;
    case 'doubts': return <DoubtBank />;
    case 'mistakes': return <MistakeNotebook />;
    case 'revisions': return <RevisionReminder />;
    case 'rewards': return <RewardShop />;
    case 'report': return <ParentReport />;
    case 'timetable': return <WeeklyTimetableBuilder studentClass={studentClass ?? ''} />;
  }
}

const QUICK_SHORTCUTS: { label: string; icon: React.ElementType; tab: TabType; bg: string; text: string }[] = [
  { label: 'AI Plan',    icon: Brain,       tab: 'ai-summary',  bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-300' },
  { label: 'Flashcards', icon: BookOpen,    tab: 'flashcards',  bg: 'bg-sky-100 dark:bg-sky-900/30',      text: 'text-sky-600 dark:text-sky-300' },
  { label: 'Focus',      icon: Timer,       tab: 'focus',       bg: 'bg-teal-100 dark:bg-teal-900/30',    text: 'text-teal-600 dark:text-teal-300' },
  { label: 'Challenges', icon: Trophy,      tab: 'challenges',  bg: 'bg-amber-100 dark:bg-amber-900/30',  text: 'text-amber-600 dark:text-amber-300' },
  { label: 'Sleep',      icon: Moon,        tab: 'sleep',       bg: 'bg-blue-100 dark:bg-blue-900/30',    text: 'text-blue-600 dark:text-blue-300' },
  { label: 'Gratitude',  icon: Heart,       tab: 'gratitude',   bg: 'bg-pink-100 dark:bg-pink-900/30',    text: 'text-pink-600 dark:text-pink-300' },
  { label: 'Energy',     icon: Zap,         tab: 'energy',      bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-300' },
  { label: 'Wellbeing',  icon: HeartPulse,  tab: 'wellbeing',   bg: 'bg-rose-100 dark:bg-rose-900/30',    text: 'text-rose-600 dark:text-rose-300' },
];

export function StudyToolsScreen({ studentClass = '' }: { studentClass?: string }) {
  const [activeTool, setActiveTool] = useState<StudyTab | null>(null);
  const { setActiveTab } = useHabitStore();

  const activeMeta = activeTool ? STUDY_TOOLS.find(t => t.id === activeTool) : null;

  return (
    <div className="pt-2 pb-2">
      <AnimatePresence mode="wait">
        {/* ── Tool Detail View ── */}
        {activeTool && activeMeta ? (
          <motion.div
            key="tool-detail"
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 32 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            {/* Detail header */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setActiveTool(null)}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-muted/70 hover:bg-muted transition-colors text-foreground"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeMeta.color}`}>
                {(() => { const Icon = activeMeta.icon; return <Icon className="h-5 w-5" />; })()}
              </div>
              <div>
                <h3 className="text-base font-bold leading-tight">{activeMeta.label}</h3>
                <p className="text-xs text-muted-foreground">{activeMeta.desc}</p>
              </div>
            </div>

            <StudyToolContent id={activeTool} studentClass={studentClass} />
          </motion.div>

        ) : (

          /* ── Dashboard Grid ── */
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="space-y-4"
          >
            {/* Page title */}
            <div className="flex items-center gap-2 pb-1">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookLock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold leading-tight">Study Tools</h2>
                <p className="text-xs text-muted-foreground">Everything you need to ace your exams</p>
              </div>
            </div>

            {/* Quick Access shortcuts */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Quick Jump</p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-0.5 px-0.5">
                {QUICK_SHORTCUTS.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.tab}
                      onClick={() => setActiveTab(item.tab)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-2xl ${item.bg} active:scale-95 transition-transform`}
                    >
                      <Icon className={`h-4 w-4 ${item.text}`} />
                      <span className={`text-xs font-semibold ${item.text} whitespace-nowrap`}>{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Tools grid */}
            <div className="grid grid-cols-2 gap-3">
              {STUDY_TOOLS.map((tool, i) => {
                const Icon = tool.icon;
                return (
                  <motion.button
                    key={tool.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 28 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => tool.id === 'wellbeing' ? setActiveTab('wellbeing') : setActiveTool(tool.id)}
                    className={`relative text-left p-4 rounded-2xl bg-card border ${tool.accent} shadow-sm hover:shadow-md transition-all duration-200 active:scale-95`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tool.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-sm font-semibold text-foreground leading-tight">{tool.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{tool.desc}</p>
                      </div>
                    </div>
                    <div className={`absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full ${tool.color.split(' ')[0]}`} />
                  </motion.button>
                );
              })}
            </div>

            {/* Study tip card */}
            <div className="rounded-2xl bg-gradient-to-br from-primary/8 to-primary/4 border border-primary/15 p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="text-sm font-semibold text-primary/90">Study Tip</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Start each session by reviewing your Doubt Bank. Clearing doubts before a new topic helps your brain build stronger connections.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
