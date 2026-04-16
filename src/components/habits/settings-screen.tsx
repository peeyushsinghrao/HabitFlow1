'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useHabitStore } from '@/stores/habit-store';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Sprout, Download, Moon, Sun, Monitor, GraduationCap,
  Flame, Trophy, Star, Target, Zap, Sparkles, RotateCcw,
  Clock, Shield, Palette, Bell, Tag, Plus, Trash2,
  CheckCircle2, Heart, Lock,
  ChevronRight, RefreshCw, LogOut, User, Settings2,
  BookOpen, BarChart2, Umbrella, CalendarDays,
} from 'lucide-react';
import type { TabType } from '@/stores/habit-store';
import { differenceInDays } from 'date-fns';
import { AchievementWall } from './achievement-wall';

const THEMES = [
  { id: 'warm-brown', name: 'Warm Brown', emoji: '🍂', class: '', primary: '#C08552', bg: '#FFF8F0' },
  { id: 'forest-green', name: 'Forest Green', emoji: '🌿', class: 'theme-forest-green', primary: '#2D7A3E', bg: '#F0FBF4' },
  { id: 'sunset-orange', name: 'Sunset Orange', emoji: '🌅', class: 'theme-sunset-orange', primary: '#E86F2D', bg: '#FFF7F0' },
  { id: 'midnight-purple', name: 'Midnight Purple', emoji: '🌙', class: 'theme-midnight-purple', primary: '#7C3AED', bg: '#F8F5FF' },
  { id: 'rose-gold', name: 'Rose Gold', emoji: '🌸', class: 'theme-rose-gold', primary: '#C87B8C', bg: '#FFF5F7' },
  { id: 'cyber-dark', name: 'Cyber Dark', emoji: '🤖', class: 'theme-cyber-dark', primary: '#00ADB5', bg: '#222831' },
  { id: 'mint-breeze', name: 'Mint Breeze', emoji: '🍃', class: 'theme-mint-breeze', primary: '#71C9CE', bg: '#E3FDFD' },
  { id: 'classic-navy', name: 'Classic Navy', emoji: '⚓', class: 'theme-classic-navy', primary: '#3F72AF', bg: '#F9F7F7' },
  { id: 'blush-pink', name: 'Blush Pink', emoji: '🌷', class: 'theme-blush-pink', primary: '#FF9494', bg: '#FFF5E4' },
  { id: 'deep-ocean', name: 'Deep Ocean', emoji: '🌊', class: 'theme-deep-ocean', primary: '#3282B8', bg: '#1B262C' },
];

type StudyMode = 'pw' | 'normal';
type StreamOption = 'Science' | 'Commerce' | 'Humanities';
type ScienceOption = 'PCM' | 'PCB' | 'PCMB';
type SectionId = 'account' | 'appearance' | 'study' | 'preferences' | 'achievements' | 'statistics' | 'data' | 'wellbeing';

const SENIOR_CLASSES = ['11', '12'];
const STREAM_OPTIONS: StreamOption[] = ['Science', 'Commerce', 'Humanities'];
const SCIENCE_OPTIONS: ScienceOption[] = ['PCM', 'PCB', 'PCMB'];

const parseProfileClass = (value: string) => {
  const classNumber = value.match(/\d+/)?.[0] || '';
  let stream: StreamOption | '' = '';
  let scienceOption: ScienceOption | '' = '';
  if (value.includes('Commerce')) stream = 'Commerce';
  if (value.includes('Humanities')) stream = 'Humanities';
  if (value.includes('Science') || value.includes('PCM') || value.includes('PCB') || value.includes('PCMB')) {
    stream = 'Science';
    if (value.includes('PCMB')) scienceOption = 'PCMB';
    else if (value.includes('PCM')) scienceOption = 'PCM';
    else if (value.includes('PCB')) scienceOption = 'PCB';
  }
  return { classNumber, stream, scienceOption };
};

const buildProfileClass = (classNumber: string, stream: StreamOption | '', scienceOption: ScienceOption | '') => {
  if (!classNumber) return '';
  if (!SENIOR_CLASSES.includes(classNumber)) return classNumber;
  if (!stream) return classNumber;
  if (stream === 'Science' && scienceOption) return `${classNumber} - Science (${scienceOption})`;
  return `${classNumber} - ${stream}`;
};

interface Category {
  id: string;
  name: string;
  color: string;
  emoji: string;
  habits?: { id: string }[];
}

function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('📁');
  const [newColor, setNewColor] = useState('#C08552');
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) setCategories(await res.json());
    } catch {}
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const addCategory = async () => {
    if (!newName.trim()) return;
    setIsAdding(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), color: newColor, emoji: newEmoji }),
      });
      if (res.ok) {
        setNewName('');
        setNewEmoji('📁');
        setNewColor('#C08552');
        fetchCategories();
        toast({ title: 'Category added!' });
      }
    } catch {}
    setIsAdding(false);
  };

  const deleteCategory = async (id: string) => {
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      fetchCategories();
    } catch {}
  };

  const CATEGORY_COLORS = ['#C08552', '#2D7A3E', '#E86F2D', '#7C3AED', '#C87B8C', '#00ADB5', '#3F72AF', '#FF9494'];

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Category name..."
          value={newName}
          onChange={e => setNewName(e.target.value)}
          className="rounded-lg h-9 text-sm flex-1"
          onKeyDown={e => e.key === 'Enter' && addCategory()}
        />
        <input
          type="text"
          value={newEmoji}
          onChange={e => setNewEmoji(e.target.value)}
          className="w-10 h-9 rounded-lg border border-input text-center text-sm"
          maxLength={2}
        />
        <Button size="sm" className="h-9 px-3 rounded-lg" onClick={addCategory} disabled={isAdding || !newName.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {CATEGORY_COLORS.map(c => (
          <button
            key={c}
            onClick={() => setNewColor(c)}
            className={`w-5 h-5 rounded-full transition-all ${newColor === c ? 'ring-2 ring-offset-1 ring-foreground scale-110' : ''}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <div className="space-y-1.5">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
            <span className="text-base">{cat.emoji}</span>
            <span className="text-sm font-medium flex-1">{cat.name}</span>
            <span className="text-xs text-muted-foreground">{cat.habits?.length || 0} habits</span>
            <button
              onClick={() => deleteCategory(cat.id)}
              className="text-muted-foreground/50 hover:text-destructive transition-colors ml-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">No categories yet</p>
        )}
      </div>
    </div>
  );
}

function AccordionRow({
  id,
  icon,
  label,
  subtitle,
  isOpen,
  onToggle,
  accentColor = 'bg-primary/10',
  iconColor = 'text-primary',
  children,
}: {
  id: SectionId;
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: () => void;
  accentColor?: string;
  iconColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border/40 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/30 active:bg-muted/50 transition-colors"
      >
        <div className={`w-8 h-8 rounded-xl ${accentColor} flex items-center justify-center flex-shrink-0`}>
          <span className={iconColor}>{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{label}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key={`section-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SettingsScreen({ onProfileUpdate }: { onProfileUpdate?: (profile: { examDate?: string; studentClass?: string; studyMode?: StudyMode }) => void }) {
  const { stats, seedData, resetData, isLoading, setActiveTab } = useHabitStore();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [openSection, setOpenSection] = useState<SectionId | null>(null);
  const [showExamDialog, setShowExamDialog] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  // Profile state
  const [profileName, setProfileName] = useState('');
  const [gender, setGender] = useState('');
  const [examDate, setExamDate] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('warm-brown');
  const [darkModeSchedule, setDarkModeSchedule] = useState(false);
  const [darkStart, setDarkStart] = useState('20:00');
  const [darkEnd, setDarkEnd] = useState('07:00');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [studyMode, setStudyMode] = useState<StudyMode>('pw');
  const [studentClass, setStudentClass] = useState('');
  const [stream, setStream] = useState<StreamOption | ''>('');
  const [scienceOption, setScienceOption] = useState<ScienceOption | ''>('');
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [holidayMode, setHolidayMode] = useState(false);
  const [holidayStart, setHolidayStart] = useState('');
  const [holidayEnd, setHolidayEnd] = useState('');
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [screenTimeGoal, setScreenTimeGoal] = useState(0);
  const [weeklyStudyGoal, setWeeklyStudyGoal] = useState(0);
  const [isNewYearResetting, setIsNewYearResetting] = useState(false);
  const [mantra, setMantra] = useState('');
  const [vacationMode, setVacationMode] = useState(false);
  const [vacationStart, setVacationStart] = useState('');
  const [vacationEnd, setVacationEnd] = useState('');

  const toggleSection = (id: SectionId) => {
    setOpenSection(prev => prev === id ? null : id);
  };

  const applyTheme = (themeObj: typeof THEMES[0], save = true) => {
    const html = document.documentElement;
    THEMES.forEach(t => { if (t.class) html.classList.remove(t.class); });
    if (themeObj.class) html.classList.add(themeObj.class);
    setSelectedTheme(themeObj.id);
    try { localStorage.setItem('nuviora-color-theme', themeObj.id); } catch { }
    if (save) {
      fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: themeObj.id }),
      }).catch(() => {});
    }
  };

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(p => {
        setProfileName(p.name || '');
        setGender(p.gender || '');
        setSelectedTheme(p.theme || 'warm-brown');
        setDarkModeSchedule(p.darkModeSchedule || false);
        setDarkStart(p.darkModeStart || '20:00');
        setDarkEnd(p.darkModeEnd || '07:00');
        setNotificationsEnabled(p.notificationsEnabled || false);
        setStudyMode(p.studyMode === 'normal' ? 'normal' : 'pw');
        const parsedClass = parseProfileClass(p.studentClass || '');
        setStudentClass(parsedClass.classNumber);
        setStream(parsedClass.stream);
        setScienceOption(parsedClass.scienceOption);
        setExamDate(p.examDate || '');
        setPinEnabled(p.pinEnabled || false);
        setPinCode(p.pinCode || '');
        setScreenTimeGoal(p.screenTimeGoal || 0);
        setWeeklyStudyGoal(p.weeklyStudyGoal || 0);
        setMantra(p.mantra || '');
        const mergedVacationMode = (p.vacationMode || p.holidayMode) || false;
        const mergedVacationStart = p.vacationStart || p.holidayStart || '';
        const mergedVacationEnd = p.vacationEnd || p.holidayEnd || '';
        setVacationMode(mergedVacationMode);
        setVacationStart(mergedVacationStart);
        setVacationEnd(mergedVacationEnd);
        setHolidayMode(mergedVacationMode);
        setHolidayStart(mergedVacationStart);
        setHolidayEnd(mergedVacationEnd);
        const themeObj = THEMES.find(t => t.id === (p.theme || 'warm-brown'));
        if (themeObj) applyTheme(themeObj, false);
      })
      .catch(() => {})
      .finally(() => setIsProfileLoading(false));
  }, []);

  const saveProfile = async () => {
    setIsSavingProfile(true);
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName,
          gender,
          darkModeSchedule,
          darkModeStart: darkStart,
          darkModeEnd: darkEnd,
          notificationsEnabled,
          studyMode,
          studentClass: buildProfileClass(studentClass, stream, scienceOption),
          examDate,
          holidayMode: vacationMode,
          holidayStart: vacationStart,
          holidayEnd: vacationEnd,
          pinEnabled,
          pinCode,
          screenTimeGoal,
          weeklyStudyGoal,
          mantra,
          vacationMode,
          vacationStart,
          vacationEnd,
        }),
      });
      onProfileUpdate?.({ studyMode, studentClass: buildProfileClass(studentClass, stream, scienceOption), examDate });
      toast({ title: 'Settings saved!' });
    } catch {
      toast({ title: 'Failed to save', variant: 'destructive' });
    }
    setIsSavingProfile(false);
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({ title: 'Notifications not supported in this browser' });
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      toast({ title: 'Notifications enabled! ✅' });
      new Notification('Nuviora', { body: 'Notifications are now enabled!', icon: '/manifest.json' });
    } else {
      toast({ title: 'Notification permission denied', variant: 'destructive' });
    }
  };

  const handleLogout = () => {
    ['nuviora-user-id','nuviora-user-email','nuviora-user-cache','nuviora-session-v2','habitflow-active-tab'].forEach(k => {
      try { localStorage.removeItem(k); } catch { /* ignore */ }
    });
    try { sessionStorage.removeItem('nuviora-loading-shown'); } catch { /* ignore */ }
    try { document.cookie = 'nuviora-session=; Max-Age=0; path=/; SameSite=None; Secure'; } catch { /* ignore */ }
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch('/api/account', { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast({ title: data.error || 'Failed to delete account', variant: 'destructive' });
        return;
      }
      localStorage.clear();
      window.location.reload();
    } catch {
      toast({ title: 'Failed to delete account', variant: 'destructive' });
    }
  };

  const handleExport = () => {
    window.open('/api/export?format=json', '_blank');
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    await seedData();
    setIsSeeding(false);
  };

  const handleReset = async () => {
    setIsResetting(true);
    const success = await resetData();
    setIsResetting(false);
    toast({
      title: success ? 'All tracking data reset' : 'Reset failed',
      variant: success ? 'default' : 'destructive',
    });
  };

  const handleNewYearReset = async () => {
    setIsNewYearResetting(true);
    try {
      const res = await fetch('/api/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ keepSettings: true }) });
      if (res.ok) {
        toast({ title: '🎉 New Year Reset done! Fresh start with your habits.' });
      } else {
        toast({ title: 'Reset failed', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Reset failed', variant: 'destructive' });
    }
    setIsNewYearResetting(false);
  };

  return (
    <div className="space-y-4 pb-6">
      <h2 className="text-lg font-bold px-1">Settings</h2>

      {/* ── Profile Card — always visible ──────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-secondary via-muted to-accent shadow-sm border border-border/30">
          <div className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-primary to-chart-2 flex items-center justify-center text-primary-foreground text-lg font-bold shadow-md flex-shrink-0">
                {isLoading ? <Skeleton className="w-14 h-14 rounded-2xl" /> : `Lv${stats?.level ?? 1}`}
              </div>
              <div className="flex-1 min-w-0">
                {isProfileLoading ? (
                  <Skeleton className="h-5 w-32 mb-1" />
                ) : (
                  <p className="font-bold text-foreground text-base truncate">{profileName || 'Nuviora User'}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stats ? `${stats.totalCompleted} completions • ${stats.xp} XP` : 'Loading...'}
                </p>
                {stats && stats.currentStreak > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Flame className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      {stats.currentStreak} day streak
                    </span>
                  </div>
                )}
              </div>
            </div>
            {/* XP bar */}
            {stats && (
              <div className="mt-3 bg-background/40 rounded-xl p-2.5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-foreground/80">Level {stats.level}</span>
                  <span className="text-muted-foreground">{stats.xpInCurrentLevel}/{stats.xpForNextLevel} XP</span>
                </div>
                <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-chart-2"
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.xpProgress}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Accordion Menu ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl overflow-hidden bg-card shadow-sm border border-border/30"
      >
        {/* Account */}
        <AccordionRow
          id="account"
          icon={<User className="h-4 w-4" />}
          label="Account"
          subtitle="Name, gender & study mode"
          isOpen={openSection === 'account'}
          onToggle={() => toggleSection('account')}
          accentColor="bg-sky-500/10"
          iconColor="text-sky-500"
        >
          {/* Name */}
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Display Name</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                placeholder="Your name..."
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                className="rounded-xl h-9 text-sm flex-1"
              />
              <Button size="sm" className="h-9 px-3 rounded-xl" onClick={saveProfile} disabled={isSavingProfile}>
                {isSavingProfile ? '...' : <CheckCircle2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          {/* Gender */}
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Gender</Label>
            <div className="grid grid-cols-3 gap-2 mt-1.5">
              {[{ id: 'female', label: 'Female' }, { id: 'male', label: 'Male' }, { id: 'other', label: 'Other' }].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setGender(opt.id)}
                  className={`rounded-xl border px-2 py-2 text-xs font-semibold transition-all ${
                    gender === opt.id ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 bg-muted/30 text-muted-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {/* Study mode */}
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Mode</Label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {(['pw', 'normal'] as StudyMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setStudyMode(mode)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    studyMode === mode ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border/50 bg-muted/20 hover:bg-muted/40'
                  }`}
                >
                  <p className="text-xs font-semibold">{mode === 'pw' ? 'Online Student' : 'Standard Mode'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {mode === 'pw' ? 'Show Classes tab' : 'Hide Classes tab'}
                  </p>
                </button>
              ))}
            </div>
          </div>
          <Button className="w-full rounded-xl h-10 text-sm" onClick={saveProfile} disabled={isSavingProfile}>
            {isSavingProfile ? 'Saving...' : 'Save Account Settings'}
          </Button>
        </AccordionRow>

        {/* Appearance */}
        <AccordionRow
          id="appearance"
          icon={<Palette className="h-4 w-4" />}
          label="Appearance"
          subtitle={`${THEMES.find(t => t.id === selectedTheme)?.name ?? 'Theme'} • ${theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'}`}
          isOpen={openSection === 'appearance'}
          onToggle={() => toggleSection('appearance')}
          accentColor="bg-violet-500/10"
          iconColor="text-violet-500"
        >
          {/* Color theme — horizontal scroll */}
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Color Theme</Label>
            <div className="flex gap-2.5 mt-2 overflow-x-auto pb-1 no-scrollbar">
              {THEMES.map(themeOption => (
                <button
                  key={themeOption.id}
                  onClick={() => applyTheme(themeOption)}
                  className={`flex flex-col items-center gap-1.5 flex-shrink-0 p-2 rounded-xl transition-all ${
                    selectedTheme === themeOption.id
                      ? 'ring-2 ring-primary bg-primary/5 scale-105'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl shadow-sm border border-border/50 overflow-hidden" style={{ backgroundColor: themeOption.bg }}>
                    <div className="w-5 h-5 rounded-tr-xl" style={{ backgroundColor: themeOption.primary }} />
                  </div>
                  <span className="text-[9px] text-muted-foreground font-medium w-12 text-center leading-tight">
                    {themeOption.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
          {/* Light / Dark / System */}
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Display Mode</Label>
            <div className="flex rounded-xl overflow-hidden border border-border/60 bg-muted/30 p-0.5 gap-0.5 mt-1.5">
              {(['system', 'light', 'dark'] as const).map(val => {
                const icons = { system: <Monitor className="h-3.5 w-3.5" />, light: <Sun className="h-3.5 w-3.5" />, dark: <Moon className="h-3.5 w-3.5" /> };
                const labels = { system: 'System', light: 'Light', dark: 'Dark' };
                return (
                  <button
                    key={val}
                    onClick={() => setTheme(val)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                      theme === val ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    }`}
                  >
                    {icons[val]}{labels[val]}
                  </button>
                );
              })}
            </div>
          </div>
        </AccordionRow>

        {/* Study Settings */}
        <AccordionRow
          id="study"
          icon={<BookOpen className="h-4 w-4" />}
          label="Study Settings"
          subtitle={`${studentClass ? `Class ${studentClass}` : 'No class set'}${examDate ? ` • ${Math.max(0, differenceInDays(new Date(examDate), new Date()))}d to exam` : ''}`}
          isOpen={openSection === 'study'}
          onToggle={() => toggleSection('study')}
          accentColor="bg-emerald-500/10"
          iconColor="text-emerald-500"
        >
          {/* Class */}
          <div>
            <Label htmlFor="student-class" className="text-xs uppercase tracking-wider text-muted-foreground">Class</Label>
            <select
              id="student-class"
              value={studentClass}
              onChange={e => { setStudentClass(e.target.value); setStream(''); setScienceOption(''); }}
              className="mt-1.5 w-full rounded-xl h-9 text-sm bg-muted/30 border border-input px-3"
            >
              <option value="">Select class</option>
              {[7, 8, 9, 10, 11, 12].map(n => <option key={n} value={String(n)}>Class {n}</option>)}
            </select>
          </div>
          <AnimatePresence>
            {SENIOR_CLASSES.includes(studentClass) && (
              <motion.div
                key="stream-selector"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="overflow-hidden space-y-2"
              >
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Stream</Label>
                <div className="grid grid-cols-3 gap-2">
                  {STREAM_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { setStream(opt); if (opt !== 'Science') setScienceOption(''); }}
                      className={`rounded-xl border p-2 text-xs font-semibold transition-all ${stream === opt ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 bg-muted/30 text-muted-foreground'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <AnimatePresence>
                  {stream === 'Science' && (
                    <motion.div
                      key="science-opts"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        {SCIENCE_OPTIONS.map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setScienceOption(opt)}
                            className={`rounded-xl border p-2 text-xs font-bold transition-all ${scienceOption === opt ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 bg-muted/30 text-muted-foreground'}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <p className="text-xs text-muted-foreground">Stream-specific templates appear for class 11/12 students.</p>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Exam Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Exam Date</p>
                <p className="text-xs text-muted-foreground">
                  {examDate ? `${Math.max(0, differenceInDays(new Date(examDate), new Date()))} days remaining` : 'Not set'}
                </p>
              </div>
            </div>
            <Dialog open={showExamDialog} onOpenChange={setShowExamDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg text-xs">Set Date</Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader><DialogTitle className="text-base">Exam Date</DialogTitle></DialogHeader>
                <div className="space-y-3 pt-2">
                  <Label htmlFor="exam-date" className="text-sm">Select your exam date</Label>
                  <Input id="exam-date" type="date" value={examDate} onChange={e => setExamDate(e.target.value)} className="rounded-lg" />
                  {examDate && (
                    <div className="bg-amber-50 dark:bg-amber-500/10 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Days until exam</p>
                      <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {Math.max(0, differenceInDays(new Date(examDate), new Date()))}
                      </p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {/* Goals */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Target className="h-3.5 w-3.5 text-primary" />
                <Label className="text-xs font-medium">Weekly Study Goal</Label>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" min={0} max={168} value={weeklyStudyGoal || ''} onChange={e => setWeeklyStudyGoal(Number(e.target.value))} className="h-9 rounded-lg text-sm w-20" placeholder="0" />
                <span className="text-xs text-muted-foreground">hrs/wk</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <Label className="text-xs font-medium">Screen Time Limit</Label>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" min={0} max={24} value={screenTimeGoal || ''} onChange={e => setScreenTimeGoal(Number(e.target.value))} className="h-9 rounded-lg text-sm w-20" placeholder="0" />
                <span className="text-xs text-muted-foreground">hrs/day</span>
              </div>
            </div>
          </div>
          <Button className="w-full rounded-xl h-10 text-sm" onClick={saveProfile} disabled={isSavingProfile}>
            {isSavingProfile ? 'Saving...' : 'Save Study Settings'}
          </Button>
        </AccordionRow>

        {/* Preferences */}
        <AccordionRow
          id="preferences"
          icon={<Settings2 className="h-4 w-4" />}
          label="Preferences"
          subtitle="Notifications, reminders & more"
          isOpen={openSection === 'preferences'}
          onToggle={() => toggleSection('preferences')}
          accentColor="bg-amber-500/10"
          iconColor="text-amber-500"
        >
          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Notifications</p>
                <p className="text-xs text-muted-foreground">Browser reminders</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg text-xs" onClick={requestNotificationPermission}>
              {notificationsEnabled ? '✅ On' : 'Enable'}
            </Button>
          </div>
          {/* Dark mode schedule */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center">
                  <Moon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Auto Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Switch by time of day</p>
                </div>
              </div>
              <Switch checked={darkModeSchedule} onCheckedChange={setDarkModeSchedule} />
            </div>
            <AnimatePresence>
              {darkModeSchedule && (
                <motion.div
                  key="dark-sched"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-3 pl-11">
                    <div>
                      <Label className="text-xs text-muted-foreground">Dark from</Label>
                      <Input type="time" value={darkStart} onChange={e => setDarkStart(e.target.value)} className="h-9 rounded-lg mt-1 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Light from</Label>
                      <Input type="time" value={darkEnd} onChange={e => setDarkEnd(e.target.value)} className="h-9 rounded-lg mt-1 text-sm" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Vacation / Holiday Mode */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center">
                  <Umbrella className="h-4 w-4 text-sky-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Break Mode</p>
                  <p className="text-[11px] text-muted-foreground">Freeze all streaks for a date range</p>
                </div>
              </div>
              <Switch checked={vacationMode} onCheckedChange={setVacationMode} />
            </div>
            <AnimatePresence>
              {vacationMode && (
                <motion.div
                  key="vacation-dates"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="overflow-hidden space-y-2 pl-11"
                >
                  <div className="px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-200/50 dark:border-sky-700/20">
                    <p className="text-[10px] text-sky-700 dark:text-sky-300 leading-snug flex items-start gap-1.5">
                      <Shield className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      All habit streaks are protected during this period. Set your travel, holiday, or exam break dates here — no breaks, no guilt.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Start Date</Label>
                      <Input type="date" value={vacationStart} onChange={e => setVacationStart(e.target.value)} className="h-9 rounded-lg mt-1 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">End Date</Label>
                      <Input type="date" value={vacationEnd} onChange={e => setVacationEnd(e.target.value)} className="h-9 rounded-lg mt-1 text-sm" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Mantra */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Word of the Month</p>
                <p className="text-xs text-muted-foreground">Shown as banner on home screen</p>
              </div>
            </div>
            <Input
              value={mantra}
              onChange={e => setMantra(e.target.value)}
              placeholder='"JEE 2026 — AIR under 1000" or "Stay consistent"'
              className="h-10 rounded-xl text-sm"
              maxLength={80}
            />
          </div>
          {/* PIN lock */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center">
                  <Lock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">App PIN Lock</p>
                  <p className="text-xs text-muted-foreground">Require PIN to open app</p>
                </div>
              </div>
              <Switch checked={pinEnabled} onCheckedChange={setPinEnabled} />
            </div>
            <AnimatePresence>
              {pinEnabled && (
                <motion.div
                  key="pin-input"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden pl-11"
                >
                  <Label className="text-xs text-muted-foreground">PIN Code (4 digits)</Label>
                  <Input
                    type="password"
                    maxLength={4}
                    value={pinCode}
                    onChange={e => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="h-9 rounded-lg mt-1 text-sm w-32"
                    placeholder="••••"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Button className="w-full rounded-xl h-10 text-sm" onClick={saveProfile} disabled={isSavingProfile}>
            {isSavingProfile ? 'Saving...' : 'Save Preferences'}
          </Button>
        </AccordionRow>

        {/* Achievements */}
        <AccordionRow
          id="achievements"
          icon={<Trophy className="h-4 w-4" />}
          label="Achievements"
          subtitle={stats ? `${stats.badges.length} badges earned` : 'Loading...'}
          isOpen={openSection === 'achievements'}
          onToggle={() => toggleSection('achievements')}
          accentColor="bg-amber-400/15"
          iconColor="text-amber-500"
        >
          {isLoading || !stats ? (
            <div className="flex gap-2">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="w-14 h-16 rounded-xl" />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-2">
                {stats.allBadgeTypes.map((badge: { type: string; earned: boolean; icon: string; name: string; description: string }) => (
                  <div
                    key={badge.type}
                    className={`rounded-xl flex flex-col items-center justify-center text-center p-2 transition-all ${
                      badge.earned
                        ? 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-500/10 dark:to-yellow-500/10 shadow-sm border border-amber-200/30 dark:border-amber-500/20'
                        : 'bg-muted/50 opacity-40 grayscale'
                    }`}
                    title={`${badge.name}: ${badge.description}`}
                  >
                    <span className="text-lg leading-none">{badge.icon}</span>
                    <span className="text-[7px] text-muted-foreground mt-1 leading-tight font-medium truncate w-full">{badge.name}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full rounded-xl h-9 text-xs" onClick={() => setShowAchievements(true)}>
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                View Full Achievement Wall
              </Button>
            </>
          )}
        </AccordionRow>

        {/* Statistics */}
        <AccordionRow
          id="statistics"
          icon={<BarChart2 className="h-4 w-4" />}
          label="Statistics"
          subtitle={stats ? `${stats.currentStreak}d streak • ${stats.xp} XP` : 'Loading...'}
          isOpen={openSection === 'statistics'}
          onToggle={() => toggleSection('statistics')}
          accentColor="bg-sky-500/10"
          iconColor="text-sky-500"
        >
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { icon: Flame, label: 'Current Streak', value: `${stats?.currentStreak ?? 0} days`, color: 'text-amber-500' },
              { icon: Trophy, label: 'Longest Streak', value: `${stats?.longestStreak ?? 0} days`, color: 'text-amber-500' },
              { icon: Zap, label: 'This Week', value: `${stats?.thisWeekCompleted ?? 0} done`, color: 'text-emerald-500' },
              { icon: Star, label: 'Total Habits', value: `${stats?.totalHabits ?? 0} active`, color: 'text-sky-500' },
            ].map(item => (
              <div key={item.label} className="bg-muted/40 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
                <p className="text-sm font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </AccordionRow>

        {/* Data */}
        <AccordionRow
          id="data"
          icon={<Shield className="h-4 w-4" />}
          label="Data"
          subtitle="Export, backup & categories"
          isOpen={openSection === 'data'}
          onToggle={() => toggleSection('data')}
          accentColor="bg-muted"
          iconColor="text-muted-foreground"
        >
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-3 rounded-xl h-11" onClick={handleExport}>
              <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center flex-shrink-0">
                <Download className="h-4 w-4 text-sky-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Export Backup</p>
                <p className="text-xs text-muted-foreground">Download complete JSON backup</p>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 rounded-xl h-11" onClick={handleSeed} disabled={isSeeding}>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Sprout className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">{isSeeding ? 'Loading...' : 'Load Sample Data'}</p>
                <p className="text-xs text-muted-foreground">Populate with demo habits</p>
              </div>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-3 rounded-xl h-11" disabled={isResetting}>
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <RotateCcw className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{isResetting ? 'Resetting...' : 'Reset All Data'}</p>
                    <p className="text-xs text-muted-foreground">Wipe tracking data, keep settings</p>
                  </div>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset all tracking data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently removes habits, habit logs, stats, badges, mood, water, focus sessions, categories, and Classes tracker data. Your profile, class, exam date, theme, and student mode stay saved.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset} className="rounded-lg bg-destructive text-white hover:bg-destructive/90">Reset Everything</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" className="w-full justify-start gap-3 rounded-xl h-11" onClick={handleNewYearReset} disabled={isNewYearResetting}>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <RefreshCw className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">{isNewYearResetting ? 'Resetting...' : '🎉 New Year Reset'}</p>
                <p className="text-xs text-muted-foreground">Fresh start — keep habits, wipe logs</p>
              </div>
            </Button>
          </div>
          {/* Habit Categories */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-3.5 w-3.5 text-primary" />
              <p className="text-sm font-semibold">Habit Categories</p>
            </div>
            <CategoryManager />
          </div>
        </AccordionRow>

        {/* Wellbeing — girls only */}
        {gender === 'female' && (
          <AccordionRow
            id="wellbeing"
            icon={<Heart className="h-4 w-4" />}
            label="Wellbeing"
            subtitle="Period tracker & health tools"
            isOpen={openSection === 'wellbeing'}
            onToggle={() => toggleSection('wellbeing')}
            accentColor="bg-rose-500/10"
            iconColor="text-rose-400"
          >
            <Button
              variant="outline"
              className="w-full justify-start gap-3 rounded-xl h-11 border-rose-200/60 dark:border-rose-500/20"
              onClick={() => setActiveTab('period-tracker')}
            >
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                <Heart className="h-4 w-4 text-rose-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Period Tracker</p>
                <p className="text-xs text-muted-foreground">Track your cycle, symptoms & insights</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
            </Button>
          </AccordionRow>
        )}
      </motion.div>

      {/* ── Danger Zone ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl overflow-hidden border border-destructive/20 bg-destructive/[0.03] shadow-sm"
      >
        <div className="px-4 py-2.5 border-b border-destructive/15">
          <p className="text-xs font-semibold uppercase tracking-wider text-destructive/70">Danger Zone</p>
        </div>
        <div className="p-3 space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 rounded-xl h-11 border-border/50"
            onClick={handleLogout}
          >
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center flex-shrink-0">
              <LogOut className="h-4 w-4 text-sky-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Log Out</p>
              <p className="text-xs text-muted-foreground">Return to the sign-in screen</p>
            </div>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start gap-3 rounded-xl h-11 border-destructive/30 text-destructive hover:text-destructive">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Delete Account</p>
                  <p className="text-xs text-muted-foreground">Permanently remove this account's data</p>
                </div>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes your profile, habits, logs, stats, badges, wellbeing data, and settings for this signed-in account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="rounded-lg bg-destructive text-white hover:bg-destructive/90">Delete Account</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </motion.div>

      {/* ── About ──────────────────────────────────────────────────────────── */}
      <div className="text-center py-2 space-y-0.5">
        <p className="gradient-text text-sm font-bold">Nuviora</p>
        <p className="text-xs text-muted-foreground">Version 2.0.0 • Track habits. Build streaks. Level up.</p>
        <p className="text-xs text-muted-foreground">Made by Kunal</p>
      </div>

      {/* Achievement wall dialog */}
      {stats && (
        <AchievementWall
          open={showAchievements}
          onOpenChange={setShowAchievements}
          earnedBadgeTypes={stats.badges.map((b: { badgeType: string }) => b.badgeType)}
          totalXP={stats.xp}
          level={stats.level}
        />
      )}
    </div>
  );
}
