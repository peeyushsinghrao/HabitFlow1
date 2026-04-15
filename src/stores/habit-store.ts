import { create } from 'zustand';

export type TabType = 'home' | 'pw' | 'focus' | 'monthly' | 'yearly' | 'analytics' | 'settings' | 'study' | 'flashcards' | 'formulas' | 'challenges' | 'mock-tests' | 'sleep' | 'gratitude' | 'energy' | 'wellbeing' | 'topic-timer' | 'ai-summary' | 'pin-lock' | 'period-tracker' | 'friends';

export interface Habit {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'numeric';
  color: string;
  icon: string;
  targetValue: number | null;
  unit: string | null;
  reminderTime: string | null;
  isArchived: boolean;
  isPaused: boolean;
  frequency: string;
  sortOrder: number;
  categoryId?: string | null;
  deadline?: string | null;
  logs: HabitLog[];
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  status: string;
  value: number | null;
}

interface HabitStore {
  habits: Habit[];
  isLoading: boolean;
  activeTab: TabType;
  isAddHabitOpen: boolean;
  editingHabit: Habit | null;
  analytics: AnalyticsData | null;
  stats: StatsData | null;
  error: string | null;

  setActiveTab: (tab: TabType) => void;
  setAddHabitOpen: (open: boolean) => void;
  setEditingHabit: (habit: Habit | null) => void;
  fetchHabits: () => Promise<void>;
  createHabit: (data: CreateHabitData) => Promise<boolean>;
  updateHabit: (id: string, data: Partial<CreateHabitData>) => Promise<boolean>;
  deleteHabit: (id: string) => Promise<boolean>;
  toggleHabit: (habitId: string, date: string, value?: number | null, status?: string, note?: string) => Promise<void> | void;
  pauseHabit: (id: string, isPaused: boolean) => Promise<boolean>;
  fetchAnalytics: (range?: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  seedData: () => Promise<boolean>;
  resetData: () => Promise<boolean>;
  clearError: () => void;
}

export interface CreateHabitData {
  name: string;
  type: 'daily' | 'weekly' | 'numeric';
  color: string;
  icon: string;
  targetValue: number | null;
  unit: string | null;
  reminderTime: string | null;
  deadline?: string | null;
  frequency?: string;
  categoryId?: string | null;
}

export interface AnalyticsData {
  chartData: { date: string; completed: number; total: number; rate: number }[];
  labels: string[];
  todayCompleted: number;
  todayTotal: number;
  todayRate: number;
  habitPerformance: {
    id: string;
    name: string;
    color: string;
    icon: string;
    rate: number;
    completedDays: number;
  }[];
  insights: string[];
  monthlyGrid: {
    habitId: string;
    habitName: string;
    habitColor: string;
    habitIcon: string;
    habitType: string;
    logs: Record<string, { status: string; value: number | null }>;
  }[];
  habitsCount: number;
}

export interface StatsData {
  id: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  xpForNextLevel: number;
  xpInCurrentLevel: number;
  xpProgress: number;
  totalHabits: number;
  thisWeekCompleted: number;
  badges: {
    id: string;
    badgeType: string;
    earnedAt: string;
    name: string;
    description: string;
    icon: string;
  }[];
  allBadgeTypes: {
    type: string;
    name: string;
    description: string;
    icon: string;
    earned: boolean;
  }[];
}

// Safe empty analytics fallback so UI never gets stuck
const EMPTY_ANALYTICS: AnalyticsData = {
  chartData: [],
  labels: [],
  todayCompleted: 0,
  todayTotal: 0,
  todayRate: 0,
  habitPerformance: [],
  insights: [],
  monthlyGrid: [],
  habitsCount: 0,
};

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  isLoading: false,
  activeTab: 'home',
  isAddHabitOpen: false,
  editingHabit: null,
  analytics: null,
  stats: null,
  error: null,

  setActiveTab: (tab) => {
    try { localStorage.setItem('habitflow-active-tab', tab); } catch { /* ignore */ }
    set({ activeTab: tab, error: null });
  },
  setAddHabitOpen: (open) => set({ isAddHabitOpen: open }),
  setEditingHabit: (habit) => set({ editingHabit: habit }),
  clearError: () => set({ error: null }),

  fetchHabits: async () => {
    set({ error: null });
    try {
      const res = await fetch('/api/habits');
      if (res.ok) {
        const data = await res.json();
        set({ habits: data, error: null });
      } else {
        set({ error: 'Failed to load habits' });
      }
    } catch (error) {
      console.error('Failed to fetch habits:', error);
      set({ error: 'Network error loading habits' });
    } finally {
      set({ isLoading: false });
    }
  },

  createHabit: async (data) => {
    set({ error: null });
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const createdHabit = await res.json();
        set({
          habits: [
            ...get().habits,
            {
              ...createdHabit,
              logs: createdHabit.logs || [],
              createdAt: createdHabit.createdAt || new Date().toISOString(),
            },
          ],
          isAddHabitOpen: false,
          editingHabit: null,
          error: null,
        });
        void get().fetchHabits();
        void get().fetchStats();
        return true;
      } else {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        set({ error: err.error || 'Failed to create habit' });
        return false;
      }
    } catch (error) {
      console.error('Failed to create habit:', error);
      set({ error: 'Network error. Please try again.' });
      return false;
    }
  },

  updateHabit: async (id, data) => {
    set({ error: null });
    try {
      const res = await fetch(`/api/habits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updatedHabit = await res.json();
        set({
          habits: get().habits.map(h => h.id === id ? { ...h, ...updatedHabit, logs: updatedHabit.logs || h.logs } : h),
          editingHabit: null,
          isAddHabitOpen: false,
          error: null,
        });
        void get().fetchHabits();
        return true;
      } else {
        set({ error: 'Failed to update habit' });
        return false;
      }
    } catch (error) {
      console.error('Failed to update habit:', error);
      set({ error: 'Network error' });
      return false;
    }
  },

  deleteHabit: async (id) => {
    const previousHabits = get().habits;
    set({
      habits: previousHabits.filter(h => h.id !== id),
      editingHabit: null,
      isAddHabitOpen: false,
      error: null,
    });
    try {
      const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' });
      if (res.ok) {
        void get().fetchHabits();
        void get().fetchStats();
        return true;
      }
      set({ habits: previousHabits, error: 'Failed to delete habit' });
      return false;
    } catch (error) {
      console.error('Failed to delete habit:', error);
      set({ habits: previousHabits, error: 'Network error' });
      return false;
    }
  },

  toggleHabit: (habitId, date, value, status, note) => {
    const { habits } = get();
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      const existingLog = habit.logs?.find(
        l => l.date === date && (habit.type === 'numeric' || l.status === 'completed')
      );
      let newLogs: HabitLog[];
      if (existingLog && habit.type !== 'numeric') {
        newLogs = habit.logs.filter(l => l !== existingLog);
      } else if (existingLog && habit.type === 'numeric') {
        newLogs = habit.logs.map(l =>
          l === existingLog
            ? { ...l, value: value ?? l.value, status: status ?? l.status }
            : l
        );
      } else {
        newLogs = [
          ...(habit.logs || []),
          { id: `opt-${Date.now()}`, habitId, date, status: status || 'completed', value: value ?? null },
        ];
      }
      set({ habits: habits.map(h => h.id === habitId ? { ...h, logs: newLogs } : h) });
    }

    fetch(`/api/habits/${habitId}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, value, status, note }),
    })
      .then(res => {
        if (res.ok) {
          void get().fetchHabits();
          void get().fetchStats();
        } else {
          void get().fetchHabits();
        }
      })
      .catch(() => {
        void get().fetchHabits();
      });

    return Promise.resolve();
  },

  pauseHabit: async (id, isPaused) => {
    try {
      const res = await fetch(`/api/habits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaused }),
      });
      if (res.ok) {
        await get().fetchHabits();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to pause habit:', error);
      return false;
    }
  },

  fetchAnalytics: async (range = 'weekly') => {
    try {
      const res = await fetch(`/api/analytics?range=${range}`);
      if (res.ok) {
        const data = await res.json();
        set({ analytics: data });
      } else {
        // Use empty fallback instead of staying null (which causes infinite loading)
        set({ analytics: EMPTY_ANALYTICS });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      set({ analytics: EMPTY_ANALYTICS });
    }
  },

  fetchStats: async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        set({ stats: data });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  },

  seedData: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        await get().fetchHabits();
        await get().fetchStats();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to seed data:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  resetData: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        await get().fetchHabits();
        await get().fetchStats();
        set({ analytics: EMPTY_ANALYTICS });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to reset data:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));
