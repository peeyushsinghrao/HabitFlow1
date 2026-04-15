'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabitStore } from '@/stores/habit-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Tag } from 'lucide-react';

const COLORS = [
  { value: '#f43f5e', label: 'Rose' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#a78bfa', label: 'Purple' },
  { value: '#60a5fa', label: 'Blue' },
  { value: '#34d399', label: 'Green' },
  { value: '#fbbf24', label: 'Yellow' },
  { value: '#fb923c', label: 'Orange' },
  { value: '#f87171', label: 'Red' },
  { value: '#2dd4bf', label: 'Teal' },
  { value: '#818cf8', label: 'Indigo' },
];

const ICONS = [
  { emoji: '📚', label: 'Study' },
  { emoji: '🏃', label: 'Run' },
  { emoji: '💧', label: 'Water' },
  { emoji: '🧘', label: 'Meditate' },
  { emoji: '💪', label: 'Gym' },
  { emoji: '🎯', label: 'Target' },
  { emoji: '✍️', label: 'Write' },
  { emoji: '🎵', label: 'Music' },
  { emoji: '😴', label: 'Sleep' },
  { emoji: '🥗', label: 'Eat' },
  { emoji: '💊', label: 'Pills' },
  { emoji: '🧹', label: 'Clean' },
  { emoji: '📖', label: 'Read' },
  { emoji: '🔄', label: 'Review' },
  { emoji: '📝', label: 'Notes' },
  { emoji: '🎨', label: 'Art' },
];

const HABIT_TYPES = [
  { value: 'daily' as const, label: 'Daily', description: 'Every day' },
  { value: 'weekly' as const, label: 'Weekly', description: 'Weekly goal' },
  { value: 'numeric' as const, label: 'Counter', description: 'Track numbers' },
];

const DAYS = [
  { key: '1', label: 'Mon' },
  { key: '2', label: 'Tue' },
  { key: '3', label: 'Wed' },
  { key: '4', label: 'Thu' },
  { key: '5', label: 'Fri' },
  { key: '6', label: 'Sat' },
  { key: '0', label: 'Sun' },
];

interface Category {
  id: string;
  name: string;
  color: string;
  emoji: string;
}

export function AddHabitDialog() {
  const {
    isAddHabitOpen,
    setAddHabitOpen,
    editingHabit,
    setEditingHabit,
    createHabit,
    updateHabit,
    deleteHabit,
    error,
  } = useHabitStore();

  const [name, setName] = useState('');
  const [type, setType] = useState<'daily' | 'weekly' | 'numeric'>('daily');
  const [color, setColor] = useState('#f43f5e');
  const [icon, setIcon] = useState('🎯');
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [deadline, setDeadline] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'custom'>('daily');
  const [customDays, setCustomDays] = useState<string[]>(['1','2','3','4','5']);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Advanced fields
  const [stackedAfter, setStackedAfter] = useState('');
  const [minViableVersion, setMinViableVersion] = useState('');
  const [conditionType, setConditionType] = useState('');
  const [conditionValue, setConditionValue] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isEditing = !!editingHabit;

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setType(editingHabit.type as 'daily' | 'weekly' | 'numeric');
      setColor(editingHabit.color);
      setIcon(editingHabit.icon);
      setTargetValue(editingHabit.targetValue?.toString() || '');
      setUnit(editingHabit.unit || '');
      setReminderTime(editingHabit.reminderTime || '');
      setDeadline((editingHabit as { deadline?: string }).deadline || '');
      setCategoryId((editingHabit as { categoryId?: string }).categoryId || '');
      const freq = editingHabit.frequency || 'daily';
      if (freq === 'daily' || freq === 'weekly') {
        setFrequency('daily');
        setCustomDays(['1','2','3','4','5']);
      } else {
        setFrequency('custom');
        setCustomDays(freq.split(','));
      }
      setDeleteConfirm(false);
      const h = editingHabit as { stackedAfter?: string; minViableVersion?: string; conditionType?: string; conditionValue?: string };
      setStackedAfter(h.stackedAfter || '');
      setMinViableVersion(h.minViableVersion || '');
      setConditionType(h.conditionType || '');
      setConditionValue(h.conditionValue || '');
      if (h.stackedAfter || h.minViableVersion || h.conditionType) setShowAdvanced(true);
    } else {
      resetForm();
    }
  }, [editingHabit]);

  const resetForm = () => {
    setName('');
    setType('daily');
    setColor('#f43f5e');
    setIcon('🎯');
    setTargetValue('');
    setUnit('');
    setReminderTime('');
    setDeadline('');
    setCategoryId('');
    setFrequency('daily');
    setCustomDays(['1','2','3','4','5']);
    setDeleteConfirm(false);
    setStackedAfter('');
    setMinViableVersion('');
    setConditionType('');
    setConditionValue('');
    setShowAdvanced(false);
  };

  const toggleDay = (day: string) => {
    setCustomDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setAddHabitOpen(false);
      setEditingHabit(null);
      resetForm();
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      const freqValue = frequency === 'custom' ? customDays.sort().join(',') : 'daily';
      const data = {
        name: name.trim(),
        type,
        color,
        icon,
        targetValue: type === 'numeric' ? (Number(targetValue) || null) : null,
        unit: type === 'numeric' ? (unit.trim() || null) : null,
        reminderTime: reminderTime || null,
        deadline: deadline || null,
        categoryId: categoryId || null,
        frequency: freqValue,
        stackedAfter: stackedAfter || null,
        minViableVersion: minViableVersion.trim() || null,
        conditionType: conditionType || null,
        conditionValue: conditionValue.trim() || null,
      };

      if (isEditing && editingHabit) {
        await updateHabit(editingHabit.id, data);
      } else {
        await createHabit(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingHabit) return;
    await deleteHabit(editingHabit.id);
  };

  return (
    <Dialog open={isAddHabitOpen || isEditing} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 gap-0 overflow-hidden max-h-[90vh]">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="text-lg font-bold">
            {isEditing ? 'Edit Habit' : 'New Habit'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="mx-5 mt-2 px-3 py-2 bg-destructive/10 text-destructive text-xs rounded-lg">
            {error}
          </div>
        )}

        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar max-h-[calc(90vh-8rem)]">
          {/* Preview */}
          <div className="flex items-center justify-center">
            <motion.div
              key={`${icon}-${color}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
              style={{
                backgroundColor: `${color}20`,
                boxShadow: `0 8px 24px ${color}30`,
              }}
            >
              {icon}
            </motion.div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="habit-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Habit Name
            </Label>
            <Input
              id="habit-name"
              placeholder="e.g., Morning Run"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl h-11 text-sm"
              autoFocus
            />
          </div>

          {/* Icon selection */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Icon
            </Label>
            <div className="grid grid-cols-8 gap-1.5">
              {ICONS.map((item) => (
                <motion.button
                  key={item.emoji}
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIcon(item.emoji)}
                  className={`aspect-square rounded-xl text-lg flex items-center justify-center transition-all ${
                    icon === item.emoji
                      ? 'bg-primary/15 ring-2 ring-primary scale-105'
                      : 'bg-muted/60 hover:bg-muted'
                  }`}
                  title={item.label}
                >
                  {item.emoji}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Color selection */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Color
            </Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <motion.button
                  key={c.value}
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setColor(c.value)}
                  className={`h-8 w-8 rounded-full transition-all ${
                    color === c.value
                      ? 'ring-2 ring-offset-2 ring-primary scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Type selection */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Type
            </Label>
            <div className="flex gap-2">
              {HABIT_TYPES.map((t) => (
                <motion.button
                  key={t.value}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setType(t.value)}
                  className={`flex-1 py-3 px-3 rounded-xl text-center transition-all ${
                    type === t.value
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <p className="text-xs font-semibold">{t.label}</p>
<<<<<<< HEAD
                  <p className={`text-[9px] mt-0.5 ${type === t.value ? 'text-primary-foreground/70' : ''}`}>
=======
                  <p className={`text-xs mt-0.5 ${type === t.value ? 'text-primary-foreground/70' : ''}`}>
>>>>>>> 925ef42 (Initial commit)
                    {t.description}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Numeric fields */}
          <AnimatePresence mode="wait">
            {type === 'numeric' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="target-value" className="text-xs font-medium">
                      Daily Target
                    </Label>
                    <Input
                      id="target-value"
                      type="number"
                      placeholder="8"
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="unit" className="text-xs font-medium">
                      Unit
                    </Label>
                    <Input
                      id="unit"
                      placeholder="glasses, mins..."
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category (optional) */}
          {categories.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Tag className="h-3 w-3" /> Category (optional)
              </Label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setCategoryId('')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    categoryId === ''
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  None
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                      categoryId === cat.id
                        ? 'ring-2 ring-offset-1 ring-primary'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                    style={categoryId === cat.id ? { backgroundColor: cat.color + '20', color: cat.color } : {}}
                  >
                    {cat.emoji} {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Frequency */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Frequency
            </Label>
            <div className="flex gap-2">
              {(['daily', 'custom'] as const).map((f) => (
                <motion.button
                  key={f}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFrequency(f)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                    frequency === f
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {f === 'daily' ? 'Every Day' : 'Specific Days'}
                </motion.button>
              ))}
            </div>
            <AnimatePresence>
              {frequency === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-1.5 mt-1.5">
                    {DAYS.map((d) => (
                      <motion.button
                        key={d.key}
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleDay(d.key)}
<<<<<<< HEAD
                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${
=======
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
>>>>>>> 925ef42 (Initial commit)
                          customDays.includes(d.key)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {d.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Deadline (optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="deadline" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Goal Deadline (optional)
            </Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="rounded-xl h-11"
              min={new Date().toISOString().split('T')[0]}
            />
            {deadline && (
<<<<<<< HEAD
              <p className="text-[10px] text-muted-foreground">
=======
              <p className="text-xs text-muted-foreground">
>>>>>>> 925ef42 (Initial commit)
                Habit auto-archives after this date
              </p>
            )}
          </div>

          {/* Reminder time */}
          <div className="space-y-1.5">
            <Label htmlFor="reminder-time" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Reminder Time (optional)
            </Label>
            <Input
              id="reminder-time"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>

          {/* Advanced Options */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(v => !v)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className={`transition-transform ${showAdvanced ? 'rotate-90' : ''}`}>›</span>
              Advanced Options
            </button>
            {showAdvanced && (
              <div className="mt-3 space-y-4 pl-4 border-l-2 border-border/50">
                {/* Habit Stacking */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Habit Stacking</Label>
<<<<<<< HEAD
                  <p className="text-[10px] text-muted-foreground">Name the habit you do this after</p>
=======
                  <p className="text-xs text-muted-foreground">Name the habit you do this after</p>
>>>>>>> 925ef42 (Initial commit)
                  <Input
                    value={stackedAfter}
                    onChange={e => setStackedAfter(e.target.value)}
                    placeholder='e.g., "After morning tea"'
                    className="rounded-xl h-10 text-sm"
                  />
                </div>
                {/* Min Viable Version */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Minimum Viable Version</Label>
<<<<<<< HEAD
                  <p className="text-[10px] text-muted-foreground">Smallest version that still counts</p>
=======
                  <p className="text-xs text-muted-foreground">Smallest version that still counts</p>
>>>>>>> 925ef42 (Initial commit)
                  <Input
                    value={minViableVersion}
                    onChange={e => setMinViableVersion(e.target.value)}
                    placeholder='e.g., "Just 1 page"'
                    className="rounded-xl h-10 text-sm"
                  />
                </div>
                {/* Conditional Habit */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Only do when...</Label>
<<<<<<< HEAD
                  <p className="text-[10px] text-muted-foreground">Skip on certain conditions</p>
=======
                  <p className="text-xs text-muted-foreground">Skip on certain conditions</p>
>>>>>>> 925ef42 (Initial commit)
                  <div className="flex gap-2">
                    <select
                      value={conditionType}
                      onChange={e => setConditionType(e.target.value)}
                      className="h-10 rounded-xl border border-border bg-background px-3 text-sm flex-1"
                    >
                      <option value="">No condition</option>
                      <option value="mood">Mood ≥</option>
                      <option value="energy">Energy ≥</option>
                      <option value="weather">Weather is</option>
                    </select>
                    {conditionType && (
                      <Input
                        value={conditionValue}
                        onChange={e => setConditionValue(e.target.value)}
                        placeholder={conditionType === 'weather' ? 'sunny' : '3'}
                        className="rounded-xl h-10 text-sm w-24"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Delete section (edit only) */}
          {isEditing && (
            <div className="pt-2 border-t border-border/50">
              {!deleteConfirm ? (
                <Button
                  variant="ghost"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl h-10"
                  onClick={() => setDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Habit
                </Button>
              ) : (
                <div className="bg-destructive/10 rounded-xl p-3 space-y-2">
                  <p className="text-xs text-destructive font-medium">
                    Are you sure? This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-lg h-9"
                      onClick={() => setDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1 rounded-lg h-9"
                      onClick={handleDelete}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-5 pt-2 flex gap-2 border-t border-border/30">
          <Button
            variant="outline"
            className="flex-1 rounded-xl h-11"
            onClick={() => handleClose(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-xl h-11 shadow-lg shadow-primary/20"
            onClick={handleSubmit}
            disabled={!name.trim() || isSubmitting}
          >
            {isSubmitting
              ? 'Saving...'
              : isEditing
                ? 'Save Changes'
                : 'Create Habit'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
