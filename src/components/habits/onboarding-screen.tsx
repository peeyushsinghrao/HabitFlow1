'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, ArrowRight, Target, Flame, Trophy, BarChart3, ChevronDown } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: (name: string, studyMode: 'pw' | 'normal') => void;
  initialName?: string;
  initialGender?: string;
}

const STEPS = [
  {
    icon: '👋',
    title: 'Welcome to Nuviora!',
    subtitle: 'Your personal habit tracking companion that helps you build a better life, one day at a time.',
    action: 'Get Started',
  },
  {
    icon: '🎯',
    title: 'Track Any Habit',
    subtitle: 'Daily workouts, meditation, reading — create habits for anything and watch your consistency grow.',
    action: 'Next',
  },
  {
    icon: '🔥',
    title: 'Build Streaks & Level Up',
    subtitle: 'Earn XP, unlock badges, and maintain streaks that motivate you to keep going every single day.',
    action: 'Next',
  },
  {
    icon: '✨',
    title: 'Tell us about you',
    subtitle: 'Personalize your experience with your name, class, stream and exam goal.',
    action: 'Next',
    hasNameInput: true,
  },
  {
    icon: '📚',
    title: 'Your Subjects',
    subtitle: 'Select which subjects you study and tell us where you need the most help.',
    action: 'Start Journey',
    hasSubjectInput: true,
  },
];

const CLASS_OPTIONS = ['7', '8', '9', '10', '11', '12'];
const SENIOR_CLASSES = ['11', '12'];
const STREAM_OPTIONS = ['Science', 'Commerce', 'Humanities'] as const;
const SCIENCE_OPTIONS = ['PCM', 'PCB', 'PCMB'] as const;
type StreamOption = typeof STREAM_OPTIONS[number];
type ScienceOption = typeof SCIENCE_OPTIONS[number];

const EXAM_GOALS_BY_STREAM: Record<string, { id: string; label: string; emoji: string; desc: string }[]> = {
  PCM: [
    { id: 'JEE', label: 'JEE', emoji: '⚙️', desc: 'Joint Entrance Exam' },
    { id: 'Boards', label: 'Boards', emoji: '📋', desc: 'Class 11/12 Boards' },
    { id: 'CUET', label: 'CUET', emoji: '🏫', desc: 'Central University Entrance' },
    { id: 'School', label: 'School Only', emoji: '🏫', desc: 'School exams only' },
  ],
  PCB: [
    { id: 'NEET', label: 'NEET', emoji: '🩺', desc: 'National Eligibility cum Entrance Test' },
    { id: 'Boards', label: 'Boards', emoji: '📋', desc: 'Class 11/12 Boards' },
    { id: 'CUET', label: 'CUET', emoji: '🏫', desc: 'Central University Entrance' },
    { id: 'School', label: 'School Only', emoji: '🏫', desc: 'School exams only' },
  ],
  PCMB: [
    { id: 'JEE', label: 'JEE', emoji: '⚙️', desc: 'Joint Entrance Exam' },
    { id: 'NEET', label: 'NEET', emoji: '🩺', desc: 'National Eligibility cum Entrance Test' },
    { id: 'Boards', label: 'Boards', emoji: '📋', desc: 'Class 11/12 Boards' },
    { id: 'CUET', label: 'CUET', emoji: '🏫', desc: 'Central University Entrance' },
  ],
  Commerce: [
    { id: 'CUET', label: 'CUET', emoji: '🏫', desc: 'Central University Entrance' },
    { id: 'CA Foundation', label: 'CA Foundation', emoji: '💼', desc: 'Chartered Accountancy' },
    { id: 'Boards', label: 'Boards', emoji: '📋', desc: 'Class 11/12 Boards' },
    { id: 'School', label: 'School Only', emoji: '🏫', desc: 'School exams only' },
  ],
  Humanities: [
    { id: 'CUET', label: 'CUET', emoji: '🏫', desc: 'Central University Entrance' },
    { id: 'CLAT', label: 'CLAT', emoji: '⚖️', desc: 'Common Law Admission Test' },
    { id: 'NDA', label: 'NDA', emoji: '🪖', desc: 'National Defence Academy' },
    { id: 'Boards', label: 'Boards', emoji: '📋', desc: 'Class 11/12 Boards' },
    { id: 'School', label: 'School Only', emoji: '🏫', desc: 'School exams only' },
  ],
  default: [
    { id: 'Boards', label: 'Boards', emoji: '📋', desc: 'School board exams' },
    { id: 'School', label: 'School Only', emoji: '🏫', desc: 'School exams only' },
  ],
};

const STREAM_SUGGESTIONS: Record<string, { emoji: string; text: string }[]> = {
  PCM: [
    { emoji: '⚛️', text: 'Physics 30 questions/day' },
    { emoji: '🧪', text: 'Chemistry revision daily' },
    { emoji: '📐', text: 'Math 40 problems/day' },
    { emoji: '📝', text: 'Formula sheet review' },
  ],
  PCB: [
    { emoji: '🧬', text: 'Biology NCERT daily' },
    { emoji: '🧪', text: 'Chemistry revision daily' },
    { emoji: '⚛️', text: 'Physics numericals' },
    { emoji: '📋', text: 'NEET mock test weekly' },
  ],
  PCMB: [
    { emoji: '⚛️', text: 'Physics problems daily' },
    { emoji: '🧬', text: 'Biology NCERT daily' },
    { emoji: '📐', text: 'Math practice daily' },
    { emoji: '🧪', text: 'Chemistry revision' },
  ],
  Commerce: [
    { emoji: '📊', text: 'Accountancy practice daily' },
    { emoji: '📈', text: 'Business Studies revision' },
    { emoji: '🏦', text: 'Economics concepts daily' },
    { emoji: '🧮', text: 'Math/Stats problems' },
  ],
  Humanities: [
    { emoji: '📜', text: 'History revision daily' },
    { emoji: '🌍', text: 'Geography map practice' },
    { emoji: '⚖️', text: 'Political Science notes' },
    { emoji: '📖', text: 'English literature' },
  ],
};

const STUDY_MODES = [
  {
    id: 'pw',
    title: 'Online Student',
    description: 'Track classes, tests, and study sessions with a dedicated Classes tracker.',
  },
  {
    id: 'normal',
    title: 'Standard Mode',
    description: 'Focus on habits, focus sessions, and study tools. No class tracker.',
  },
] as const;

const ALL_SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'English', 'Hindi',
  'History', 'Geography', 'Political Science', 'Economics',
  'Sanskrit', 'Computer Science', 'AI', 'Accountancy',
  'Business Studies', 'Physical Education',
];

const FEATURES = [
  { icon: Target, label: 'Habit Tracking' },
  { icon: Flame, label: 'Streak System' },
  { icon: Trophy, label: 'Achievements' },
  { icon: BarChart3, label: 'Analytics' },
];

const getDisplayClass = (
  studentClass: string,
  stream: StreamOption | '',
  scienceOption: ScienceOption | '',
) => {
  if (!studentClass) return '';
  if (!SENIOR_CLASSES.includes(studentClass)) return `Class ${studentClass}`;
  if (!stream) return `Class ${studentClass}`;
  if (stream === 'Science' && scienceOption) return `Class ${studentClass} - Science (${scienceOption})`;
  return `Class ${studentClass} - ${stream}`;
};

const getProfileClass = (
  studentClass: string,
  stream: StreamOption | '',
  scienceOption: ScienceOption | '',
) => getDisplayClass(studentClass, stream, scienceOption).replace(/^Class /, '');

const getDashboardTitle = (
  studentClass: string,
  stream: StreamOption | '',
  scienceOption: ScienceOption | '',
  examGoal: string,
) => {
  if (!studentClass) return '';
  const classNum = `Class ${studentClass}`;
  const streamLabel = stream === 'Science' && scienceOption ? scienceOption : stream;
  const goalLabel = examGoal && examGoal !== 'School' && examGoal !== 'Boards' ? ` • ${examGoal}` : '';
  if (streamLabel) return `${classNum} ${streamLabel} Plan${goalLabel}`;
  return `${classNum} Plan`;
};

export function OnboardingScreen({ onComplete, initialName = '', initialGender = '' }: OnboardingScreenProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(initialName || '');
  const [examDate, setExamDate] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [isClassPickerOpen, setIsClassPickerOpen] = useState(false);
  const [stream, setStream] = useState<StreamOption | ''>('');
  const [scienceOption, setScienceOption] = useState<ScienceOption | ''>('');
  const [examGoal, setExamGoal] = useState('');
  const [studyMode, setStudyMode] = useState<'pw' | 'normal'>('pw');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [weakSubjects, setWeakSubjects] = useState<string[]>([]);
  const [gender, setGender] = useState(initialGender || '');

  const currentStep = STEPS[step];
  const isLastStep = step === STEPS.length - 1;
  const needsStream = SENIOR_CLASSES.includes(studentClass);
  const finalStudentClass = getProfileClass(studentClass, stream, scienceOption);
  const isClassSelectionComplete = Boolean(
    studentClass &&
      (!needsStream || (stream && (stream !== 'Science' || scienceOption)))
  );

  const streamKey = stream === 'Science' ? (scienceOption || '') : stream;
  const examGoals = EXAM_GOALS_BY_STREAM[streamKey] || EXAM_GOALS_BY_STREAM.default;
  const streamSuggestions = STREAM_SUGGESTIONS[streamKey] || [];
  const dashTitle = getDashboardTitle(studentClass, stream, scienceOption, examGoal);

  const handleNext = async () => {
    if (isLastStep) {
      setIsSubmitting(true);
      try {
        await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim() || 'Nuviora User',
            examDate,
            studentClass: finalStudentClass,
            studyMode,
            examGoal,
            subjects: JSON.stringify(selectedSubjects),
            weakSubjects: JSON.stringify(weakSubjects),
            gender,
            onboardingDone: true,
          }),
        });
        onComplete(name.trim() || 'Nuviora User', studyMode);
      } catch {
        onComplete(name.trim() || 'Nuviora User', studyMode);
      }
      setIsSubmitting(false);
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9998] bg-background flex flex-col items-center justify-between py-6 px-6 overflow-y-auto"
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-primary/10"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-chart-2/10"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
        />
        <motion.div
          className="absolute top-1/2 right-0 w-32 h-32 rounded-full bg-primary/5"
          animate={{ y: [-20, 20, -20] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Step indicator */}
      <div className="flex gap-2 z-10">
        {STEPS.map((_, i) => (
          <motion.div
            key={i}
            className="h-1.5 rounded-full bg-primary"
            animate={{ width: i === step ? 24 : 8, opacity: i === step ? 1 : 0.3 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 w-full max-w-sm gap-8">
        {/* Logo on first step */}
        {step === 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Nuviora" className="w-28 h-28 object-contain drop-shadow-2xl rounded-2xl" />
            </motion.div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="text-center space-y-4 w-full"
          >
            {step > 0 && (
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="text-6xl text-center"
              >
                {currentStep.icon}
              </motion.div>
            )}

            <div className="space-y-2">
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-bold text-foreground"
              >
                {currentStep.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-muted-foreground text-sm leading-relaxed"
              >
                {currentStep.subtitle}
              </motion.p>
            </div>

            {/* Feature grid on first step */}
            {step === 0 && (
              <div className="grid grid-cols-2 gap-3 mt-6">
                {FEATURES.map(({ icon: Icon, label }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 15, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.08, type: 'spring', stiffness: 200 }}
                    className="bg-muted/50 border border-border/30 rounded-xl p-3 flex items-center gap-2"
                  >
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-xs font-medium">{label}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {currentStep.hasNameInput && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mt-4 space-y-3"
              >
                <Input
                  placeholder="Enter your name..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="rounded-2xl h-12 text-center text-base border-2 border-primary/20 focus:border-primary"
                  onKeyDown={e => e.key === 'Enter' && name.trim() && handleNext()}
                  autoFocus
                />
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Gender <span className="text-rose-500">*</span>
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'female', label: 'Female' },
                      { id: 'male', label: 'Male' },
                      { id: 'other', label: 'Other' },
                    ].map(option => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setGender(option.id)}
                        className={`rounded-2xl border-2 px-2 py-3 text-center text-xs font-semibold transition-all ${
                          gender === option.id
                            ? 'border-primary bg-primary/10 text-primary shadow-sm shadow-primary/20'
                            : 'border-primary/20 bg-background/80 text-muted-foreground hover:border-primary/50 hover:bg-primary/5'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Required · Used to personalize wellbeing tools.</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Select your class</p>
                  <button
                    type="button"
                    onClick={() => setIsClassPickerOpen(open => !open)}
                    className="w-full rounded-2xl border-2 border-primary/20 bg-background/80 px-4 py-3 text-left transition-all hover:border-primary/50 hover:bg-primary/5"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span>
                        <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Class
                        </span>
                        <span className={`block text-sm font-semibold ${studentClass ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {getDisplayClass(studentClass, stream, scienceOption) || 'Tap to choose your class'}
                        </span>
                      </span>
                      <ChevronDown className={`h-4 w-4 text-primary transition-transform ${isClassPickerOpen ? 'rotate-180' : ''}`} />
                    </span>
                  </button>

                  <AnimatePresence>
                    {isClassPickerOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -8, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          {CLASS_OPTIONS.map(className => {
                            const selected = studentClass === className;
                            return (
                              <button
                                key={className}
                                type="button"
                                onClick={() => {
                                  setStudentClass(className);
                                  setStream('');
                                  setScienceOption('');
                                  setExamGoal('');
                                  setIsClassPickerOpen(false);
                                }}
                                className={`rounded-2xl border-2 px-3 py-3 text-center transition-all ${
                                  selected
                                    ? 'border-primary bg-primary/10 text-primary shadow-sm shadow-primary/20'
                                    : 'border-primary/20 bg-background/80 text-muted-foreground hover:border-primary/50 hover:bg-primary/5'
                                }`}
                              >
                                <span className="block text-xs font-medium uppercase tracking-wide">Class</span>
                                <span className="block text-lg font-bold leading-tight">{className}</span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {needsStream && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <p className="text-xs font-semibold text-muted-foreground">Choose your stream</p>
                      <div className="grid grid-cols-3 gap-2">
                        {STREAM_OPTIONS.map(option => {
                          const selected = stream === option;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setStream(option);
                                if (option !== 'Science') setScienceOption('');
                                setExamGoal('');
                              }}
                              className={`rounded-2xl border-2 px-2 py-3 text-center text-xs font-semibold transition-all ${
                                selected
                                  ? 'border-primary bg-primary/10 text-primary shadow-sm shadow-primary/20'
                                  : 'border-primary/20 bg-background/80 text-muted-foreground hover:border-primary/50 hover:bg-primary/5'
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>

                      <AnimatePresence>
                        {stream === 'Science' && (
                          <motion.div
                            initial={{ opacity: 0, y: -6, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -6, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-3 gap-2 pt-1">
                              {SCIENCE_OPTIONS.map(option => {
                                const selected = scienceOption === option;
                                return (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => { setScienceOption(option); setExamGoal(''); }}
                                    className={`rounded-2xl border-2 px-2 py-3 text-center text-xs font-bold transition-all ${
                                      selected
                                        ? 'border-primary bg-primary/10 text-primary shadow-sm shadow-primary/20'
                                        : 'border-primary/20 bg-background/80 text-muted-foreground hover:border-primary/50 hover:bg-primary/5'
                                    }`}
                                  >
                                    {option}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {/* Exam Goal Selection (for Class 11/12 with stream selected) */}
                  <AnimatePresence>
                    {isClassSelectionComplete && needsStream && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: 8, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden space-y-2"
                      >
                        <p className="text-xs font-semibold text-muted-foreground">Your exam goal</p>
                        <div className="grid grid-cols-2 gap-2">
                          {examGoals.map(goal => {
                            const selected = examGoal === goal.id;
                            return (
                              <button
                                key={goal.id}
                                type="button"
                                onClick={() => setExamGoal(goal.id)}
                                className={`rounded-2xl border-2 p-2.5 text-left transition-all ${
                                  selected
                                    ? 'border-primary bg-primary/10 text-primary shadow-sm shadow-primary/20'
                                    : 'border-primary/20 bg-background/80 text-muted-foreground hover:border-primary/50 hover:bg-primary/5'
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="text-base">{goal.emoji}</span>
                                  <span className="text-xs font-bold">{goal.label}</span>
                                </span>
                                <span className="block text-xs text-muted-foreground mt-0.5 leading-tight">{goal.desc}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Stream-based habit suggestions */}
                        {streamSuggestions.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-primary/5 border border-primary/15 rounded-2xl p-3 space-y-1.5"
                          >
                            <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                              Suggested habits for {streamKey}
                            </p>
                            <div className="grid grid-cols-2 gap-1">
                              {streamSuggestions.map((s, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <span>{s.emoji}</span>
                                  <span className="truncate">{s.text}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

                <div className="grid grid-cols-2 gap-2">
                  {STUDY_MODES.map(mode => {
                    const selected = studyMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setStudyMode(mode.id)}
                        className={`rounded-2xl border-2 p-3 text-left transition-all ${
                          selected
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-primary/20 bg-background text-muted-foreground'
                        }`}
                      >
                        <span className="block text-sm font-semibold">{mode.title}</span>
                        <span className="mt-1 block text-xs leading-snug">{mode.description}</span>
                      </button>
                    );
                  })}
                </div>
                <Input
                  type="date"
                  value={examDate}
                  onChange={e => setExamDate(e.target.value)}
                  className="rounded-2xl h-12 text-center text-base border-2 border-primary/20 focus:border-primary"
                  aria-label="Exam date optional"
                />
                <p className="text-xs text-muted-foreground">Exam date is optional</p>

                {/* Personalized dashboard preview */}
                {name.trim() && dashTitle && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/8 border border-primary/20 rounded-2xl p-3 text-center"
                  >
                    <p className="text-xs text-muted-foreground">Your dashboard will be titled</p>
                    <p className="text-sm font-bold text-primary mt-0.5">{dashTitle}</p>
                  </motion.div>
                )}
                {name.trim() && !dashTitle && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-primary font-medium mt-2"
                  >
                    Hi {name.trim()}! Ready to build great habits? 🚀
                  </motion.p>
                )}
              </motion.div>
            )}

            {/* ── Step 4: Subjects ── */}
            {currentStep.hasSubjectInput && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mt-4 space-y-4"
              >
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Select your subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {ALL_SUBJECTS.map(subject => {
                      const selected = selectedSubjects.includes(subject);
                      return (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => {
                            setSelectedSubjects(prev =>
                              selected ? prev.filter(s => s !== subject) : [...prev, subject]
                            );
                            if (selected) setWeakSubjects(prev => prev.filter(s => s !== subject));
                          }}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold border-2 transition-all ${
                            selected
                              ? 'border-primary bg-primary/10 text-primary shadow-sm shadow-primary/20'
                              : 'border-primary/20 bg-background text-muted-foreground hover:border-primary/50 hover:bg-primary/5'
                          }`}
                        >
                          {subject}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedSubjects.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <p className="text-xs font-semibold text-muted-foreground">Which are your weaker subjects? (select all that apply)</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubjects.map(subject => {
                        const selected = weakSubjects.includes(subject);
                        return (
                          <button
                            key={subject}
                            type="button"
                            onClick={() =>
                              setWeakSubjects(prev =>
                                selected ? prev.filter(s => s !== subject) : [...prev, subject]
                              )
                            }
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold border-2 transition-all ${
                              selected
                                ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-sm shadow-rose-500/20'
                                : 'border-primary/20 bg-background text-muted-foreground hover:border-rose-400/50 hover:bg-rose-50 dark:hover:bg-rose-900/10'
                            }`}
                          >
                            {selected ? '⚠️ ' : ''}{subject}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA button */}
      <motion.div
        className="w-full max-w-sm z-10 space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          className="w-full h-14 rounded-2xl text-base font-semibold shadow-lg shadow-primary/25"
          onClick={handleNext}
          disabled={isSubmitting || (step === 3 && (!name.trim() || !gender || !isClassSelectionComplete)) || (isLastStep && selectedSubjects.length === 0)}
        >
          {isSubmitting ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
            />
          ) : (
            <>
              {currentStep.action}
              {!isLastStep && <ArrowRight className="h-5 w-5 ml-2" />}
              {isLastStep && <Sparkles className="h-5 w-5 ml-2" />}
            </>
          )}
        </Button>

        {step > 0 && (
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            ← Back
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
