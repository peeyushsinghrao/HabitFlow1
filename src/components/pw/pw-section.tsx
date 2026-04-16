'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  ClipboardList,
  Plus,
  Save,
  Flame,
  Target,
  Coffee,
  Trash2,
  BarChart3,
  X,
  CheckCircle2,
  History as HistoryIcon,
  Map,
  MessageSquare,
  Clock,
  User,
  FileText,
  Radio,
  PlayCircle,
} from 'lucide-react';
import { PWHistorySheet } from '@/components/pw/pw-history';
import { ChapterCompletionMap } from '@/components/pw/chapter-completion-map';
import { DoubtLog } from '@/components/pw/doubt-log';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { usePWStore } from '@/stores/pw-store';
import type { ClassEntry } from '@/stores/pw-store';

// ─── Helper Functions ─────────────────────────────────────────────

function getTodayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDisplayDate(): string {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ─── Animation Variants ──────────────────────────────────────────

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  }),
};

const emptyClassRow: ClassEntry = {
  subject: '',
  time: '',
  topic: '',
  teacher: '',
  attendedLive: false,
  attendedRecorded: false,
};

// ─── Labelled Input Helper ────────────────────────────────────────

function LabelledInput({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon && <span className="opacity-70">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Class Card ───────────────────────────────────────────────────

function ClassCard({
  cls,
  idx,
  onFieldChange,
  onAttendanceChange,
  onRemove,
}: {
  cls: ClassEntry;
  idx: number;
  onFieldChange: (index: number, field: keyof ClassEntry, value: string | boolean) => void;
  onAttendanceChange: (index: number, field: 'attendedLive' | 'attendedRecorded', checked: boolean) => void;
  onRemove: (index: number) => void;
}) {
  const attended = cls.attendedLive ? 'live' : cls.attendedRecorded ? 'recorded' : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: -8 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="relative rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden"
    >
      {/* Card header with class number + remove */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">{idx + 1}</span>
          </div>
          <span className="text-xs font-semibold text-foreground/70">
            {cls.subject || `Class ${idx + 1}`}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
          onClick={() => onRemove(idx)}
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Card body */}
      <div className="p-4 space-y-3">
        {/* Row 1: Subject + Time */}
        <div className="grid grid-cols-2 gap-3">
          <LabelledInput label="Subject" icon={<BookOpen className="w-3 h-3" />}>
            <Input
              className="h-9 text-sm"
              placeholder="e.g. Physics"
              value={cls.subject}
              onChange={(e) => onFieldChange(idx, 'subject', e.target.value)}
            />
          </LabelledInput>
          <LabelledInput label="Time" icon={<Clock className="w-3 h-3" />}>
            <Input
              type="time"
              className="h-9 text-sm"
              value={cls.time}
              onChange={(e) => onFieldChange(idx, 'time', e.target.value)}
            />
          </LabelledInput>
        </div>

        {/* Row 2: Topic + Teacher */}
        <div className="grid grid-cols-2 gap-3">
          <LabelledInput label="Topic" icon={<FileText className="w-3 h-3" />}>
            <Input
              className="h-9 text-sm"
              placeholder="e.g. Newton's Laws"
              value={cls.topic}
              onChange={(e) => onFieldChange(idx, 'topic', e.target.value)}
            />
          </LabelledInput>
          <LabelledInput label="Teacher" icon={<User className="w-3 h-3" />}>
            <Input
              className="h-9 text-sm"
              placeholder="e.g. Prateek Sir"
              value={cls.teacher}
              onChange={(e) => onFieldChange(idx, 'teacher', e.target.value)}
            />
          </LabelledInput>
        </div>

        {/* Attendance row */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Attendance
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onAttendanceChange(idx, 'attendedLive', !cls.attendedLive)}
              className={`flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold border transition-all active:scale-[0.97] ${
                attended === 'live'
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-primary/40 hover:text-foreground'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              Live
            </button>
            <button
              type="button"
              onClick={() => onAttendanceChange(idx, 'attendedRecorded', !cls.attendedRecorded)}
              className={`flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold border transition-all active:scale-[0.97] ${
                attended === 'recorded'
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-primary/40 hover:text-foreground'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              Recorded
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Section Divider ──────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 px-1">
      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
        <span className="text-primary">{icon}</span>
      </div>
      <span className="text-sm font-bold text-foreground">{title}</span>
      {badge && <div className="ml-auto">{badge}</div>}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────

export function PWSection() {
  const today = getTodayLocal();
  const displayDate = formatDisplayDate();
  const [historyOpen, setHistoryOpen] = useState(false);

  const {
    studyWork,
    task,
    classes,
    todos,
    analytics,
    setStudyWork,
    setTask,
    setClasses,
    fetchDailyData,
    saveDailyData,
    fetchClasses,
    saveClasses,
    fetchTodos,
    createTodo,
    deleteTodo,
    fetchAnalytics,
    toggleTodoComplete,
  } = usePWStore();

  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [classesSaving, setClassesSaving] = useState(false);
  const todoInputRef = useRef<HTMLInputElement>(null);
  const notifiedClassesRef = useRef<Set<string>>(new Set());

  // ── Fetch data on mount ────────────────────────────────────────

  useEffect(() => {
    fetchDailyData(today);
    fetchClasses(today);
    fetchTodos();
    fetchAnalytics('weekly');
  }, []);

  // ── Notification reminder system ───────────────────────────────

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    const checkClassReminders = () => {
      if (typeof window === 'undefined') return;
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      classes.forEach((cls, idx) => {
        if (!cls.time || !cls.subject) return;
        const notifKey = `${today}-${idx}-${cls.time}`;
        if (notifiedClassesRef.current.has(notifKey)) return;
        const [hours, minutes] = cls.time.split(':').map(Number);
        const classMinutes = hours * 60 + minutes;
        const diffMinutes = classMinutes - currentMinutes;
        if (diffMinutes >= 0 && diffMinutes <= 10) {
          if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(
              `🔔 ${cls.subject} at ${cls.time}`,
              { body: cls.topic || 'No topic specified', icon: '/icon-192.png' },
            );
            setTimeout(() => notification.close(), 10000);
          }
          notifiedClassesRef.current.add(notifKey);
        }
      });
    };

    checkClassReminders();
    const interval = setInterval(checkClassReminders, 60_000);
    return () => clearInterval(interval);
  }, [classes, today]);

  // ── Handlers ───────────────────────────────────────────────────

  const handleRestDayToggle = useCallback(
    (checked: boolean) => {
      setStudyWork({ isRestDay: checked });
      saveDailyData(today, { ...studyWork, isRestDay: checked }, task);
    },
    [studyWork, task, today, setStudyWork, saveDailyData],
  );

  const handleClassChange = useCallback(
    (index: number, field: keyof ClassEntry, value: string | boolean) => {
      const updated = classes.map((c, i) =>
        i === index ? { ...c, [field]: value } : c,
      );
      setClasses(updated);
    },
    [classes, setClasses],
  );

  const handleAttendanceChange = useCallback(
    (index: number, field: 'attendedLive' | 'attendedRecorded', checked: boolean) => {
      const otherField = field === 'attendedLive' ? 'attendedRecorded' : 'attendedLive';
      const updated = classes.map((c, i) =>
        i === index ? { ...c, [field]: checked, [otherField]: false } : c,
      );
      setClasses(updated);
    },
    [classes, setClasses],
  );

  const handleAddClassRow = useCallback(() => {
    setClasses([...classes, { ...emptyClassRow }]);
  }, [classes, setClasses]);

  const handleRemoveClassRow = useCallback(
    (index: number) => {
      setClasses(classes.filter((_, i) => i !== index));
    },
    [classes, setClasses],
  );

  const handleSaveClasses = useCallback(async () => {
    setClassesSaving(true);
    await saveClasses(today, classes.filter((c) => c.subject.trim()));
    setClassesSaving(false);
  }, [today, classes, saveClasses]);

  const handleTaskToggle = useCallback(
    (hasTask: boolean) => {
      const updated = { ...task, hasTask };
      setTask({ hasTask });
      saveDailyData(today, studyWork, updated);
    },
    [task, studyWork, today, setTask, saveDailyData],
  );

  const handleTaskFieldChange = useCallback(
    (field: string, value: string) => {
      const updated = { ...task, [field]: value };
      setTask({ [field]: value });
      saveDailyData(today, studyWork, updated);
    },
    [task, studyWork, today, setTask, saveDailyData],
  );

  const handleAddTodo = useCallback(async () => {
    const trimmed = newTodoTitle.trim();
    if (!trimmed) return;
    const ok = await createTodo(trimmed);
    if (ok) {
      setNewTodoTitle('');
      todoInputRef.current?.focus();
    }
  }, [newTodoTitle, createTodo]);

  const handleTodoKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddTodo();
      }
    },
    [handleAddTodo],
  );

  const handleDeleteTodo = useCallback(
    (id: string) => deleteTodo(id),
    [deleteTodo],
  );

  const handleToggleTodo = useCallback(
    (id: string) => toggleTodoComplete(id),
    [toggleTodoComplete],
  );

  // ── Computed values ────────────────────────────────────────────

  const todoCompleted = todos.filter((t) => t.completed).length;
  const todoTotal = todos.length;
  const todoPct = todoTotal > 0 ? Math.round((todoCompleted / todoTotal) * 100) : 0;
  const classesAttended =
    (analytics.classStats?.attendedLive ?? 0) +
    (analytics.classStats?.attendedRecorded ?? 0);
  const tasksDone = analytics.taskStats?.totalTasks ?? 0;
  const isRestDay = studyWork.isRestDay;

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="space-y-5 pb-10">

      {/* ═══ 1. Header ═════════════════════════════════════════════ */}
      <motion.div
        className="flex items-center gap-3 pt-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' as const }}
      >
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary">
          <GraduationCap className="w-6 h-6 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Classes Daily Tracker
          </h2>
          <p className="text-xs text-muted-foreground truncate" suppressHydrationWarning>
            {displayDate}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-muted/60 hover:bg-muted transition-colors"
        >
          <HistoryIcon className="w-4 h-4 text-muted-foreground" />
        </button>
      </motion.div>

      <PWHistorySheet open={historyOpen} onOpenChange={setHistoryOpen} />

      {/* ═══ 2. Rest Day Toggle ══════════════════════════════════ */}
      <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible">
        <div className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-muted/50 border border-border/40">
          <div className="flex items-center gap-3">
            <Coffee className="w-4.5 h-4.5 text-muted-foreground" style={{ width: '1.1rem', height: '1.1rem' }} />
            <span className="text-sm font-semibold text-foreground">Rest Day</span>
            {isRestDay && (
              <Badge className="text-xs px-2 py-0 border-none bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                No classes today
              </Badge>
            )}
          </div>
          <Switch checked={isRestDay} onCheckedChange={handleRestDayToggle} />
        </div>
      </motion.div>

      {/* ═══ 3. Class Log ════════════════════════════════════════ */}
      {!isRestDay && (
        <motion.div
          custom={2}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {/* Section header */}
          <SectionHeader
            icon={<BookOpen className="w-4 h-4" />}
            title="Class Log"
            badge={
              <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {classes.length} {classes.length === 1 ? 'class' : 'classes'}
              </span>
            }
          />

          {/* Empty state */}
          {classes.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 rounded-2xl border border-dashed border-border/60 bg-muted/20">
              <BookOpen className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No classes added yet</p>
              <p className="text-xs text-muted-foreground/60">Tap + Add Class below to get started</p>
            </div>
          )}

          {/* Class cards */}
          <AnimatePresence mode="popLayout">
            {classes.map((cls, idx) => (
              <ClassCard
                key={idx}
                cls={cls}
                idx={idx}
                onFieldChange={handleClassChange}
                onAttendanceChange={handleAttendanceChange}
                onRemove={handleRemoveClassRow}
              />
            ))}
          </AnimatePresence>

          {/* Add + Save row */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 h-10 text-sm border-dashed border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40"
              onClick={handleAddClassRow}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Class
            </Button>
            <Button
              className="h-10 px-4 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 shadow-sm"
              onClick={handleSaveClasses}
              disabled={classesSaving}
            >
              <Save className="w-4 h-4 mr-1.5" />
              {classesSaving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </motion.div>
      )}

      {/* ═══ 4. Test Tracker ════════════════════════════════════ */}
      <motion.div
        custom={isRestDay ? 2 : 3}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        <SectionHeader icon={<Target className="w-4 h-4" />} title="Test Tracker" />

        <Card className="border border-border/40 shadow-none rounded-2xl">
          <CardContent className="p-4 space-y-3">
            {/* Yes / No toggle */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Did you have a test today?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleTaskToggle(true)}
                  className={`h-11 rounded-xl text-sm font-semibold border transition-all active:scale-[0.97] ${
                    task.hasTask
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => handleTaskToggle(false)}
                  className={`h-11 rounded-xl text-sm font-semibold border transition-all active:scale-[0.97] ${
                    !task.hasTask
                      ? 'bg-muted text-foreground border-border shadow-sm'
                      : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-border hover:text-foreground'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Test form */}
            <AnimatePresence mode="wait">
              {task.hasTask && (
                <motion.div
                  key="test-form"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: 'easeInOut' as const }}
                  className="overflow-hidden"
                >
                  <Separator className="my-3" />
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <LabelledInput label="Test Name">
                        <Input
                          className="h-9 text-sm"
                          placeholder="e.g. DPP-12"
                          value={task.testName}
                          onChange={(e) => handleTaskFieldChange('testName', e.target.value)}
                        />
                      </LabelledInput>
                      <LabelledInput label="Date">
                        <Input
                          className="h-9 text-sm bg-muted/40 text-muted-foreground"
                          value={today}
                          readOnly
                        />
                      </LabelledInput>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <LabelledInput label="Score">
                        <Input
                          className="h-9 text-sm"
                          placeholder="e.g. 45/50"
                          value={task.score}
                          onChange={(e) => handleTaskFieldChange('score', e.target.value)}
                        />
                      </LabelledInput>
                      <LabelledInput label="Accuracy">
                        <Input
                          className="h-9 text-sm"
                          placeholder="e.g. 90%"
                          value={task.accuracy}
                          onChange={(e) => handleTaskFieldChange('accuracy', e.target.value)}
                        />
                      </LabelledInput>
                    </div>
                    <LabelledInput label="Mistakes / Areas to Improve">
                      <Textarea
                        className="text-sm min-h-[80px] resize-none"
                        placeholder="What mistakes did you make?"
                        value={task.mistakes}
                        onChange={(e) => handleTaskFieldChange('mistakes', e.target.value)}
                      />
                    </LabelledInput>
                    <LabelledInput label="What You Improved On">
                      <Textarea
                        className="text-sm min-h-[80px] resize-none"
                        placeholder="What did you improve on?"
                        value={task.improvedAt}
                        onChange={(e) => handleTaskFieldChange('improvedAt', e.target.value)}
                      />
                    </LabelledInput>
                    <Button
                      className="w-full h-10 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => saveDailyData(today, studyWork, task)}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Test
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══ 5. To-Do List ═════════════════════════════════════ */}
      <motion.div
        custom={isRestDay ? 3 : 4}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        <SectionHeader
          icon={<ClipboardList className="w-4 h-4" />}
          title="To-Do List"
          badge={
            todoTotal > 0 ? (
              <Badge className="text-xs px-2 py-0 border-none bg-primary/15 text-primary">
                {todoCompleted}/{todoTotal}
              </Badge>
            ) : undefined
          }
        />

        <Card className="border border-border/40 shadow-none rounded-2xl">
          <CardContent className="p-4 space-y-3">
            {/* Add input */}
            <div className="flex gap-2">
              <Input
                ref={todoInputRef}
                className="h-10 text-sm flex-1"
                placeholder="Add a new task…"
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                onKeyDown={handleTodoKeyDown}
              />
              <Button
                size="icon"
                className="h-10 w-10 flex-shrink-0 text-primary-foreground bg-primary hover:bg-primary/90"
                onClick={handleAddTodo}
                disabled={!newTodoTitle.trim()}
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>

            {/* Progress bar */}
            {todoTotal > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground font-medium">Progress</span>
                  <span className="text-xs font-semibold text-primary">{todoPct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted/60 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${todoPct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' as const }}
                  />
                </div>
              </div>
            )}

            {/* Todo items */}
            <div className="space-y-1">
              {todos.length === 0 && (
                <p className="text-center py-5 text-sm text-muted-foreground">
                  No tasks yet — add one above!
                </p>
              )}
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/40 transition-colors min-h-[48px]"
                >
                  {/* Custom round checkbox */}
                  <button
                    type="button"
                    onClick={() => handleToggleTodo(todo.id)}
                    className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      todo.completed
                        ? 'bg-primary border-primary'
                        : 'border-border/60 hover:border-primary/50'
                    }`}
                  >
                    {todo.completed && (
                      <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                    )}
                  </button>
                  <span
                    className={`flex-1 text-sm transition-all duration-200 ${
                      todo.completed
                        ? 'line-through text-muted-foreground'
                        : 'text-foreground'
                    }`}
                  >
                    {todo.title}
                  </span>
                  <button
                    type="button"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex-shrink-0"
                    onClick={() => handleDeleteTodo(todo.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══ 6. Quick Stats ════════════════════════════════════ */}
      <motion.div
        custom={isRestDay ? 4 : 5}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        <SectionHeader
          icon={<BarChart3 className="w-4 h-4" />}
          title="Quick Stats"
          badge={
            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Weekly
            </span>
          }
        />

        <div className="grid grid-cols-2 gap-3">
          {[
            {
              icon: <CheckCircle2 className="w-5 h-5 text-primary" />,
              value: `${todoPct}%`,
              label: 'To-Do Done',
              bg: 'bg-primary/8',
            },
            {
              icon: <Target className="w-5 h-5 text-primary" />,
              value: tasksDone,
              label: 'Tests Logged',
              bg: 'bg-primary/8',
            },
            {
              icon: <BookOpen className="w-5 h-5 text-primary" />,
              value: classesAttended,
              label: 'Classes Attended',
              bg: 'bg-primary/8',
            },
            {
              icon: <ClipboardList className="w-5 h-5 text-primary" />,
              value: (
                <span>
                  {todoCompleted}
                  <span className="text-sm text-muted-foreground font-normal">/{todoTotal}</span>
                </span>
              ),
              label: 'To-Dos Today',
              bg: 'bg-primary/8',
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border/40 bg-card p-4 shadow-sm text-center"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-foreground leading-none">{stat.value}</p>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide leading-none">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ═══ 7. Chapter Progress Map ════════════════════════════ */}
      <motion.div custom={6} variants={sectionVariants} initial="hidden" animate="visible" className="space-y-3">
        <SectionHeader icon={<Map className="w-4 h-4" />} title="Chapter Progress Map" />
        <Card className="border border-border/40 shadow-none rounded-2xl">
          <CardContent className="p-4">
            <ChapterCompletionMap />
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══ 8. Doubt Log ══════════════════════════════════════ */}
      <motion.div custom={7} variants={sectionVariants} initial="hidden" animate="visible" className="space-y-3">
        <SectionHeader icon={<MessageSquare className="w-4 h-4" />} title="Doubt Log" />
        <Card className="border border-border/40 shadow-none rounded-2xl">
          <CardContent className="p-4">
            <DoubtLog />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
