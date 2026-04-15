'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useHabitStore } from '@/stores/habit-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Plus, Package, ChevronRight } from 'lucide-react';

interface TemplateHabit {
  name: string;
  type: 'daily' | 'weekly' | 'numeric';
  color: string;
  icon: string;
  targetValue: number | null;
  unit: string | null;
}

interface TemplatePack {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  gradient: string;
  habits: TemplateHabit[];
}

const TEMPLATE_PACKS: TemplatePack[] = [
  // ── Stream Packs ────────────────────────────────────────────────
  {
    id: 'pcm-jee',
    name: 'PCM (JEE)',
    icon: '⚙️',
    description: 'JEE-focused daily habits for Physics, Chemistry & Maths',
    color: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600',
    habits: [
      { name: 'Physics 30 Questions', type: 'numeric', color: '#3b82f6', icon: '⚛️', targetValue: 30, unit: 'questions' },
      { name: 'Chemistry Revision', type: 'daily', color: '#10b981', icon: '🧪', targetValue: null, unit: null },
      { name: 'Maths 40 Problems', type: 'numeric', color: '#8b5cf6', icon: '📐', targetValue: 40, unit: 'problems' },
      { name: 'Formula Sheet Review', type: 'daily', color: '#f59e0b', icon: '📋', targetValue: null, unit: null },
      { name: 'JEE Mock Test', type: 'weekly', color: '#ef4444', icon: '📊', targetValue: null, unit: null },
      { name: 'Mistake Notebook', type: 'daily', color: '#f97316', icon: '📕', targetValue: null, unit: null },
    ],
  },
  {
    id: 'pcb-neet',
    name: 'PCB (NEET)',
    icon: '🩺',
    description: 'NEET-focused habits for Biology, Chemistry & Physics',
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-600',
    habits: [
      { name: 'Biology NCERT Chapter', type: 'daily', color: '#10b981', icon: '🧬', targetValue: null, unit: null },
      { name: 'Chemistry Revision', type: 'daily', color: '#8b5cf6', icon: '🧪', targetValue: null, unit: null },
      { name: 'Physics Numericals', type: 'numeric', color: '#3b82f6', icon: '⚛️', targetValue: 20, unit: 'questions' },
      { name: 'NEET Mock Test', type: 'weekly', color: '#ef4444', icon: '📊', targetValue: null, unit: null },
      { name: 'Diagram Practice', type: 'daily', color: '#f59e0b', icon: '🔬', targetValue: null, unit: null },
      { name: 'NCERT Highlight Review', type: 'daily', color: '#ec4899', icon: '📖', targetValue: null, unit: null },
    ],
  },
  {
    id: 'pcmb',
    name: 'PCMB',
    icon: '🔬',
    description: 'Balanced habits for students taking all four subjects',
    color: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600',
    habits: [
      { name: 'Physics Problems', type: 'numeric', color: '#3b82f6', icon: '⚛️', targetValue: 20, unit: 'questions' },
      { name: 'Chemistry Revision', type: 'daily', color: '#10b981', icon: '🧪', targetValue: null, unit: null },
      { name: 'Maths Practice', type: 'numeric', color: '#8b5cf6', icon: '📐', targetValue: 25, unit: 'problems' },
      { name: 'Biology NCERT', type: 'daily', color: '#34d399', icon: '🧬', targetValue: null, unit: null },
      { name: 'Weekly Mock Test', type: 'weekly', color: '#ef4444', icon: '📊', targetValue: null, unit: null },
    ],
  },
  {
    id: 'commerce',
    name: 'Commerce',
    icon: '📊',
    description: 'Daily habits for Accounts, BST, Economics & Maths',
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600',
    habits: [
      { name: 'Accountancy Practice', type: 'daily', color: '#f59e0b', icon: '📊', targetValue: null, unit: null },
      { name: 'Business Studies Notes', type: 'daily', color: '#3b82f6', icon: '📈', targetValue: null, unit: null },
      { name: 'Economics Concepts', type: 'daily', color: '#10b981', icon: '🏦', targetValue: null, unit: null },
      { name: 'Maths/Stats Problems', type: 'numeric', color: '#8b5cf6', icon: '🧮', targetValue: 20, unit: 'questions' },
      { name: 'Sample Paper Practice', type: 'weekly', color: '#ef4444', icon: '📋', targetValue: null, unit: null },
    ],
  },
  {
    id: 'humanities',
    name: 'Humanities',
    icon: '📜',
    description: 'Daily revision habits for History, Geography, Polity & more',
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-600',
    habits: [
      { name: 'History Revision', type: 'daily', color: '#f59e0b', icon: '📜', targetValue: null, unit: null },
      { name: 'Geography Map Practice', type: 'daily', color: '#10b981', icon: '🌍', targetValue: null, unit: null },
      { name: 'Political Science Notes', type: 'daily', color: '#3b82f6', icon: '⚖️', targetValue: null, unit: null },
      { name: 'English Literature', type: 'daily', color: '#ec4899', icon: '📖', targetValue: null, unit: null },
      { name: 'Current Affairs', type: 'daily', color: '#8b5cf6', icon: '🗞️', targetValue: null, unit: null },
    ],
  },
  // ── Lifestyle Packs ──────────────────────────────────────────────
  {
    id: 'fitness',
    name: 'Fitness',
    icon: '🏋️',
    description: 'Build strength and stay active every day',
    color: '#34d399',
    gradient: 'from-emerald-400 to-green-500',
    habits: [
      { name: 'Morning Run', type: 'daily', color: '#34d399', icon: '🏃', targetValue: null, unit: null },
      { name: 'Push-ups', type: 'numeric', color: '#f97316', icon: '💪', targetValue: 50, unit: 'reps' },
      { name: 'Stretching', type: 'daily', color: '#a78bfa', icon: '🧘', targetValue: null, unit: null },
      { name: 'Water Intake', type: 'numeric', color: '#38bdf8', icon: '💧', targetValue: 8, unit: 'glasses' },
      { name: 'Protein Shake', type: 'daily', color: '#fb923c', icon: '🥤', targetValue: null, unit: null },
    ],
  },
  {
    id: 'study',
    name: 'Study',
    icon: '📚',
    description: 'Ace your exams with consistent study habits',
    color: '#60a5fa',
    gradient: 'from-blue-400 to-sky-500',
    habits: [
      { name: 'Study Session', type: 'daily', color: '#60a5fa', icon: '📚', targetValue: null, unit: null },
      { name: 'Revision', type: 'weekly', color: '#fbbf24', icon: '🔄', targetValue: null, unit: null },
      { name: 'Reading', type: 'daily', color: '#f472b6', icon: '📖', targetValue: null, unit: null },
      { name: 'Flashcards', type: 'daily', color: '#fb923c', icon: '🎯', targetValue: null, unit: null },
      { name: 'Note Taking', type: 'daily', color: '#a78bfa', icon: '📝', targetValue: null, unit: null },
    ],
  },
  {
    id: 'wellness',
    name: 'Wellness',
    icon: '🌿',
    description: 'Nurture your mind and body daily',
    color: '#10b981',
    gradient: 'from-teal-400 to-emerald-500',
    habits: [
      { name: 'Meditate', type: 'daily', color: '#c084fc', icon: '🧘', targetValue: null, unit: null },
      { name: 'Sleep 8 Hours', type: 'daily', color: '#818cf8', icon: '😴', targetValue: null, unit: null },
      { name: 'Eat Healthy', type: 'daily', color: '#34d399', icon: '🥗', targetValue: null, unit: null },
      { name: 'No Junk Food', type: 'daily', color: '#f87171', icon: '🚫', targetValue: null, unit: null },
      { name: 'Vitamins', type: 'daily', color: '#fbbf24', icon: '💊', targetValue: null, unit: null },
    ],
  },
  {
    id: 'productivity',
    name: 'Productivity',
    icon: '⚡',
    description: 'Supercharge your daily output and focus',
    color: '#f59e0b',
    gradient: 'from-amber-400 to-orange-500',
    habits: [
      { name: 'Plan Today', type: 'daily', color: '#fbbf24', icon: '📝', targetValue: null, unit: null },
      { name: 'Deep Work', type: 'numeric', color: '#8b5cf6', icon: '🎯', targetValue: 120, unit: 'mins' },
      { name: 'Journal', type: 'daily', color: '#fb923c', icon: '✍️', targetValue: null, unit: null },
      { name: 'No Social Media', type: 'daily', color: '#f87171', icon: '📵', targetValue: null, unit: null },
      { name: 'Inbox Zero', type: 'daily', color: '#60a5fa', icon: '📧', targetValue: null, unit: null },
    ],
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    icon: '🙏',
    description: 'Find peace and gratitude in each day',
    color: '#a78bfa',
    gradient: 'from-violet-400 to-purple-500',
    habits: [
      { name: 'Morning Meditation', type: 'daily', color: '#c084fc', icon: '🧘', targetValue: null, unit: null },
      { name: 'Gratitude Journal', type: 'daily', color: '#fbbf24', icon: '🙏', targetValue: null, unit: null },
      { name: 'Digital Detox', type: 'daily', color: '#34d399', icon: '📵', targetValue: null, unit: null },
      { name: 'Nature Walk', type: 'daily', color: '#10b981', icon: '🌿', targetValue: null, unit: null },
      { name: 'Breathing Exercise', type: 'daily', color: '#60a5fa', icon: '🌬️', targetValue: null, unit: null },
    ],
  },
  {
    id: 'creative',
    name: 'Creative',
    icon: '🎨',
    description: 'Unlock your creative potential',
    color: '#ec4899',
    gradient: 'from-pink-400 to-rose-500',
    habits: [
      { name: 'Sketch', type: 'daily', color: '#f472b6', icon: '🎨', targetValue: null, unit: null },
      { name: 'Write', type: 'daily', color: '#60a5fa', icon: '✍️', targetValue: null, unit: null },
      { name: 'Practice Music', type: 'daily', color: '#a78bfa', icon: '🎵', targetValue: null, unit: null },
      { name: 'Learn New Skill', type: 'weekly', color: '#34d399', icon: '🌱', targetValue: null, unit: null },
      { name: 'Photography', type: 'daily', color: '#fb923c', icon: '📷', targetValue: null, unit: null },
    ],
  },
];

const STREAM_PACK_IDS: Record<string, string[]> = {
  PCM: ['pcm-jee'],
  PCB: ['pcb-neet'],
  PCMB: ['pcmb'],
  Commerce: ['commerce'],
  Humanities: ['humanities'],
};

const getClassPack = (studentClass?: string): TemplatePack | null => {
  if (!studentClass) return null;
  const classNumber = Number(studentClass.match(/\d+/)?.[0]);
  if (!Number.isFinite(classNumber)) return null;
  const classLabel = studentClass.startsWith('Class ') ? studentClass : `Class ${studentClass}`;
  if (classNumber <= 8) {
    return {
      id: `class-${studentClass}-foundation`,
      name: `${classLabel} Foundation`,
      icon: '🎒',
      description: 'Daily basics for school, homework, reading, and revision',
      color: '#60a5fa',
      gradient: 'from-sky-400 to-blue-500',
      habits: [
        { name: 'Complete School Homework', type: 'daily', color: '#60a5fa', icon: '📘', targetValue: null, unit: null },
        { name: 'Read NCERT Chapter', type: 'daily', color: '#34d399', icon: '📖', targetValue: null, unit: null },
        { name: 'Revise Class Notes', type: 'daily', color: '#fbbf24', icon: '📝', targetValue: null, unit: null },
        { name: 'Math Practice', type: 'numeric', color: '#f97316', icon: '➗', targetValue: 20, unit: 'questions' },
        { name: 'Pack Bag for Tomorrow', type: 'daily', color: '#a78bfa', icon: '🎒', targetValue: null, unit: null },
      ],
    };
  }
  if (classNumber <= 10) {
    return {
      id: `class-${studentClass}-boards`,
      name: `${classLabel} Boards`,
      icon: '📋',
      description: 'Board-exam ready habits for practice, revision, and tests',
      color: '#f59e0b',
      gradient: 'from-amber-400 to-orange-500',
      habits: [
        { name: 'NCERT Revision', type: 'daily', color: '#60a5fa', icon: '📚', targetValue: null, unit: null },
        { name: 'Sample Paper Practice', type: 'weekly', color: '#f97316', icon: '📋', targetValue: null, unit: null },
        { name: 'Science Numericals', type: 'numeric', color: '#34d399', icon: '🧪', targetValue: 15, unit: 'questions' },
        { name: 'Math Problem Set', type: 'numeric', color: '#8b5cf6', icon: '📐', targetValue: 25, unit: 'questions' },
        { name: 'Mistake Notebook', type: 'daily', color: '#ef4444', icon: '📕', targetValue: null, unit: null },
      ],
    };
  }
  return null;
};

const getStreamPacks = (studentClass?: string): TemplatePack[] => {
  if (!studentClass) return [];
  const packs: TemplatePack[] = [];
  for (const [streamKey, packIds] of Object.entries(STREAM_PACK_IDS)) {
    if (studentClass.includes(streamKey)) {
      for (const packId of packIds) {
        const pack = TEMPLATE_PACKS.find(p => p.id === packId);
        if (pack) packs.push(pack);
      }
    }
  }
  return packs;
};

const getClassNumber = (studentClass?: string) => {
  if (!studentClass) return null;
  const classNumber = Number(studentClass.match(/\d+/)?.[0]);
  return Number.isFinite(classNumber) ? classNumber : null;
};

export function HabitTemplatesDialog({
  open,
  onOpenChange,
  studentClass,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentClass?: string;
}) {
  const { createHabit, habits } = useHabitStore();
  const [selectedPack, setSelectedPack] = useState<TemplatePack | null>(null);
  const [selectedHabits, setSelectedHabits] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [addedCount, setAddedCount] = useState<number | null>(null);
  const [addedPackName, setAddedPackName] = useState('');

  const templatePacks = useMemo(() => {
    const classPack = getClassPack(studentClass);
    const streamPacks = getStreamPacks(studentClass);
    const hasStream = streamPacks.length > 0;
    const classNum = getClassNumber(studentClass);
    const isClass1112 = classNum === 11 || classNum === 12;
    const allStreamPackIds = new Set(Object.values(STREAM_PACK_IDS).flat());
    const lifestylePacks = TEMPLATE_PACKS.filter(p => !allStreamPackIds.has(p.id));

    if (hasStream) {
      return [...streamPacks, ...lifestylePacks];
    }

    if (isClass1112) {
      return lifestylePacks;
    }

    const result: TemplatePack[] = [];
    if (classPack) result.push(classPack);
    result.push(...lifestylePacks);
    return result;
  }, [studentClass]);

  const existingHabitNames = new Set(habits.map((h) => h.name.toLowerCase()));

  const handlePackSelect = (pack: TemplatePack) => {
    setSelectedPack(pack);
    setSelectedHabits(new Set());
    setAddedCount(null);
  };

  const toggleHabit = (habitName: string) => {
    setSelectedHabits((prev) => {
      const next = new Set(prev);
      if (next.has(habitName)) {
        next.delete(habitName);
      } else {
        next.add(habitName);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (!selectedPack) return;
    const newHabits = getNewHabits(selectedPack);
    const newNames = new Set(newHabits.map(h => h.name));
    const allNewSelected = newHabits.every(h => selectedHabits.has(h.name));
    if (allNewSelected) {
      setSelectedHabits(new Set());
    } else {
      setSelectedHabits(newNames);
    }
  };

  const getNewHabits = (pack: TemplatePack) => {
    return pack.habits.filter((h) => !existingHabitNames.has(h.name.toLowerCase()));
  };

  const handleAddPack = async () => {
    if (!selectedPack) return;
    setIsAdding(true);
    const packName = selectedPack.name;
    const habitsToAdd = selectedHabits.size > 0
      ? selectedPack.habits.filter((h) => selectedHabits.has(h.name) && !existingHabitNames.has(h.name.toLowerCase()))
      : getNewHabits(selectedPack);

    let count = 0;
    for (const habit of habitsToAdd) {
      const success = await createHabit({ ...habit, reminderTime: null });
      if (success) count++;
    }
    setIsAdding(false);
    handleClose(false);
    if (count > 0) {
      toast.success(`Added ${count} habit${count > 1 ? 's' : ''} from ${packName}`);
    } else {
      toast.info('All habits from this pack already exist.');
    }
  };

  const handleQuickAdd = async (pack: TemplatePack) => {
    setIsAdding(true);
    const newHabits = getNewHabits(pack);
    let count = 0;
    for (const habit of newHabits) {
      const success = await createHabit({ ...habit, reminderTime: null });
      if (success) count++;
    }
    setIsAdding(false);
    handleClose(false);
    if (count > 0) {
      toast.success(`Added ${count} habit${count > 1 ? 's' : ''} from ${pack.name}`);
    } else {
      toast.info('All habits from this pack already exist.');
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setSelectedPack(null);
      setSelectedHabits(new Set());
      setAddedCount(null);
    }
    onOpenChange(open);
  };

  const streamPacks = getStreamPacks(studentClass);
  const hasStreamPacks = streamPacks.length > 0;
  const classNumber = getClassNumber(studentClass);
  const needsStream = classNumber === 11 || classNumber === 12;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg rounded-xl p-0 gap-0 overflow-hidden max-h-[85vh]">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Habit Templates
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {hasStreamPacks
              ? 'Stream templates + general packs'
              : needsStream
                ? 'General packs available — set your stream in Settings for more'
                : 'Quick-start with pre-built habit packs'}
          </p>
        </DialogHeader>

        <div className="px-5 pb-5 overflow-y-auto custom-scrollbar max-h-[calc(85vh-6rem)]">
          <AnimatePresence mode="wait">
            {selectedPack ? (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <button
                  onClick={() => { setSelectedPack(null); setAddedCount(null); }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                  Back to templates
                </button>

                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedPack.gradient} flex items-center justify-center text-xl shadow-lg`}>
                    {selectedPack.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{selectedPack.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedPack.description}</p>
                  </div>
                </div>

                {addedCount !== null && addedCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/30 dark:border-emerald-500/20 rounded-lg p-3 flex items-center gap-2"
                  >
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                      Added {addedCount} habit{addedCount > 1 ? 's' : ''} from {addedPackName}
                    </span>
                  </motion.div>
                )}

                {addedCount === 0 && (
                  <div className="bg-muted/40 rounded-lg p-3">
                    <span className="text-xs text-muted-foreground">
                      All habits from this pack already exist.
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button onClick={selectAll} className="text-xs font-medium text-primary hover:underline">
                    {selectedHabits.size === selectedPack.habits.length ? 'Deselect All' : 'Select All'}
                  </button>
<<<<<<< HEAD
                  <span className="text-[10px] text-muted-foreground">
=======
                  <span className="text-xs text-muted-foreground">
>>>>>>> 925ef42 (Initial commit)
                    {getNewHabits(selectedPack).length} new of {selectedPack.habits.length} total
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedPack.habits.map((habit) => {
                    const isSelected = selectedHabits.has(habit.name);
                    const alreadyExists = existingHabitNames.has(habit.name.toLowerCase());
                    return (
                      <motion.button
                        key={habit.name}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => !alreadyExists && toggleHabit(habit.name)}
                        disabled={alreadyExists}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                          alreadyExists
                            ? 'opacity-50 bg-muted/30 border-border/30 cursor-not-allowed'
                            : isSelected
                              ? 'border-primary/50 bg-primary/5 shadow-sm'
                              : 'border-border/40 bg-background hover:border-border/60 hover:bg-muted/30'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ backgroundColor: `${habit.color}15` }}>
                          {habit.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{habit.name}</p>
<<<<<<< HEAD
                          <p className="text-[10px] text-muted-foreground">
=======
                          <p className="text-xs text-muted-foreground">
>>>>>>> 925ef42 (Initial commit)
                            {habit.type === 'daily' ? 'Daily' : habit.type === 'weekly' ? 'Weekly' : `${habit.targetValue} ${habit.unit}`}
                          </p>
                        </div>
                        {alreadyExists ? (
<<<<<<< HEAD
                          <span className="text-[9px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">Exists</span>
=======
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">Exists</span>
>>>>>>> 925ef42 (Initial commit)
                        ) : (
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${isSelected ? 'border-primary bg-primary' : 'border-border/60'}`}>
                            {isSelected && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex gap-2 pt-1">
                  <Button variant="outline" className="flex-1 rounded-lg h-10 text-xs" onClick={() => handleQuickAdd(selectedPack)} disabled={isAdding || getNewHabits(selectedPack).length === 0}>
                    {isAdding ? 'Adding...' : `Add All New (${getNewHabits(selectedPack).length})`}
                  </Button>
                  <Button className="flex-1 rounded-lg h-10 text-xs shadow-sm" onClick={handleAddPack} disabled={isAdding || selectedHabits.size === 0}>
                    {isAdding ? 'Adding...' : `Add Selected (${selectedHabits.size})`}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                {/* Stream packs section — shown when stream is selected */}
                {hasStreamPacks && (
                  <div className="mb-4">
<<<<<<< HEAD
                    <p className="text-[10px] font-semibold text-primary uppercase tracking-wide mb-2">
=======
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
>>>>>>> 925ef42 (Initial commit)
                      🎯 Your Stream Templates
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {templatePacks.filter(p => streamPacks.some(sp => sp.id === p.id)).map((pack, index) => {
                        const newCount = getNewHabits(pack).length;
                        return (
                          <motion.button
                            key={pack.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handlePackSelect(pack)}
                            className="group rounded-xl border-2 border-primary/30 bg-primary/5 hover:border-primary/50 hover:shadow-md transition-all p-3.5 text-left"
                          >
                            <div className="flex items-start justify-between mb-2.5">
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pack.gradient} flex items-center justify-center text-lg shadow-sm`}>
                                {pack.icon}
                              </div>
                              {newCount === 0 && (
<<<<<<< HEAD
                                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-full font-medium">Added</span>
                              )}
                            </div>
                            <p className="text-xs font-semibold mb-0.5">{pack.name}</p>
                            <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{pack.description}</p>
                            <div className="mt-2.5 flex items-center justify-between">
                              <span className="text-[10px] text-muted-foreground">{pack.habits.length} habits</span>
=======
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-full font-medium">Added</span>
                              )}
                            </div>
                            <p className="text-xs font-semibold mb-0.5">{pack.name}</p>
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{pack.description}</p>
                            <div className="mt-2.5 flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">{pack.habits.length} habits</span>
>>>>>>> 925ef42 (Initial commit)
                              <Plus className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Compact stream prompt for class 11/12 without a stream set */}
                {!hasStreamPacks && needsStream && (
                  <div className="mb-4 bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center gap-3">
                    <span className="text-2xl flex-shrink-0">🎓</span>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Unlock Stream Templates</p>
<<<<<<< HEAD
                      <p className="text-[10px] text-muted-foreground mt-0.5">
=======
                      <p className="text-xs text-muted-foreground mt-0.5">
>>>>>>> 925ef42 (Initial commit)
                        Go to Settings → choose your stream (PCM, PCB, Commerce…) for personalised packs.
                      </p>
                    </div>
                  </div>
                )}

                {/* General / lifestyle packs — always shown */}
                {templatePacks.filter(p => !streamPacks.some(sp => sp.id === p.id)).length > 0 && (
                  <>
<<<<<<< HEAD
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
=======
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
>>>>>>> 925ef42 (Initial commit)
                      {hasStreamPacks ? '✨ General Packs' : 'All Packs'}
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {templatePacks.filter(p => !streamPacks.some(sp => sp.id === p.id)).map((pack, index) => {
                        const newCount = getNewHabits(pack).length;
                        return (
                          <motion.button
                            key={pack.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handlePackSelect(pack)}
                            className="group rounded-xl border border-border/40 bg-background hover:border-border/60 hover:shadow-md transition-all p-3.5 text-left"
                          >
                            <div className="flex items-start justify-between mb-2.5">
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pack.gradient} flex items-center justify-center text-lg shadow-sm`}>
                                {pack.icon}
                              </div>
                              {newCount === 0 && (
<<<<<<< HEAD
                                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-full font-medium">Added</span>
                              )}
                            </div>
                            <p className="text-xs font-semibold mb-0.5">{pack.name}</p>
                            <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{pack.description}</p>
                            <div className="mt-2.5 flex items-center justify-between">
                              <span className="text-[10px] text-muted-foreground">{pack.habits.length} habits</span>
=======
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-full font-medium">Added</span>
                              )}
                            </div>
                            <p className="text-xs font-semibold mb-0.5">{pack.name}</p>
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{pack.description}</p>
                            <div className="mt-2.5 flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">{pack.habits.length} habits</span>
>>>>>>> 925ef42 (Initial commit)
                              <Plus className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </>
                )}

                <div className="mt-4 bg-muted/30 rounded-lg p-3">
<<<<<<< HEAD
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
=======
                  <p className="text-xs text-muted-foreground leading-relaxed">
>>>>>>> 925ef42 (Initial commit)
                    <span className="font-semibold text-foreground">Pro tip:</span> Duplicate habits are automatically skipped. All general packs are always available.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
