import { create } from 'zustand';

// ─── Exported Types ────────────────────────────────────────────────

export interface ClassEntry {
  id?: string;
  subject: string;
  time: string;
  topic: string;
  teacher: string;
  attendedLive: boolean;
  attendedRecorded: boolean;
}

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface StudyWork {
  theoryRevised: boolean;
  dppSolved: boolean;
  practiceSheet: boolean;
  pyqPracticed: boolean;
  formulaRevised: boolean;
  isRestDay: boolean;
}

export interface Task {
  hasTask: boolean;
  testName: string;
  score: string;
  accuracy: string;
  mistakes: string;
  improvedAt: string;
}

export interface PWAnalytics {
  studyCompletionRate: number;
  studyData: { date: string; rate: number }[];
  classStats: {
    attendedLive: number;
    attendedRecorded: number;
    totalClasses: number;
  };
  taskStats: { daysWithTask: number; totalTasks: number };
  restDays: number;
}

// ─── Empty Defaults ────────────────────────────────────────────────

const EMPTY_STUDY_WORK: StudyWork = {
  theoryRevised: false,
  dppSolved: false,
  practiceSheet: false,
  pyqPracticed: false,
  formulaRevised: false,
  isRestDay: false,
};

const EMPTY_TASK: Task = {
  hasTask: false,
  testName: '',
  score: '',
  accuracy: '',
  mistakes: '',
  improvedAt: '',
};

const EMPTY_ANALYTICS: PWAnalytics = {
  studyCompletionRate: 0,
  studyData: [],
  classStats: { attendedLive: 0, attendedRecorded: 0, totalClasses: 0 },
  taskStats: { daysWithTask: 0, totalTasks: 0 },
  restDays: 0,
};

// ─── Store Interface ───────────────────────────────────────────────

interface PWStore {
  // State
  studyWork: StudyWork;
  task: Task;
  classes: ClassEntry[];
  todos: TodoItem[];
  analytics: PWAnalytics;
  isLoading: boolean;

  // Local setters
  setStudyWork: (work: Partial<StudyWork>) => void;
  setTask: (task: Partial<Task>) => void;
  setClasses: (classes: ClassEntry[]) => void;
  setTodos: (todos: TodoItem[]) => void;

  // API actions
  fetchDailyData: (date: string) => Promise<void>;
  saveDailyData: (date: string, studyWork: StudyWork, task: Task) => Promise<boolean>;
  fetchClasses: (date: string) => Promise<void>;
  saveClasses: (date: string, classes: ClassEntry[]) => Promise<boolean>;
  fetchTodos: () => Promise<void>;
  createTodo: (title: string) => Promise<boolean>;
  deleteTodo: (id: string) => Promise<boolean>;
  fetchAnalytics: (range?: string) => Promise<void>;
  toggleTodoComplete: (id: string) => void;
}

// ─── Store ─────────────────────────────────────────────────────────

export const usePWStore = create<PWStore>((set, get) => ({
  studyWork: { ...EMPTY_STUDY_WORK },
  task: { ...EMPTY_TASK },
  classes: [],
  todos: [],
  analytics: { ...EMPTY_ANALYTICS },
  isLoading: false,

  // ── Local setters ────────────────────────────────────────────

  setStudyWork: (work) =>
    set((state) => ({ studyWork: { ...state.studyWork, ...work } })),

  setTask: (task) =>
    set((state) => ({ task: { ...state.task, ...task } })),

  setClasses: (classes) => set({ classes }),

  setTodos: (todos) => set({ todos }),

  // ── Daily data ───────────────────────────────────────────────

  fetchDailyData: async (date) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/pw/daily?date=${encodeURIComponent(date)}`);
      if (res.ok) {
        const data = await res.json();
        set({
          studyWork: { ...EMPTY_STUDY_WORK, ...(data.studyWork ?? {}) },
          task: { ...EMPTY_TASK, ...(data.task ?? {}) },
        });
      } else {
        // On 404 or error, keep defaults — don't leave state stale
        set({
          studyWork: { ...EMPTY_STUDY_WORK },
          task: { ...EMPTY_TASK },
        });
      }
    } catch (error) {
      console.error('Failed to fetch daily data:', error);
      set({
        studyWork: { ...EMPTY_STUDY_WORK },
        task: { ...EMPTY_TASK },
      });
    } finally {
      set({ isLoading: false });
    }
  },

  saveDailyData: async (date, studyWork, task) => {
    try {
      const res = await fetch('/api/pw/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, studyWork, task }),
      });
      if (res.ok) {
        set({ studyWork, task });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save daily data:', error);
      return false;
    }
  },

  // ── Classes ──────────────────────────────────────────────────

  fetchClasses: async (date) => {
    try {
      const res = await fetch(`/api/pw/classes?date=${encodeURIComponent(date)}`);
      if (res.ok) {
        const data = await res.json();
        set({ classes: Array.isArray(data) ? data : [] });
      } else {
        set({ classes: [] });
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      set({ classes: [] });
    }
  },

  saveClasses: async (date, classes) => {
    try {
      const res = await fetch('/api/pw/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, classes, _action: 'save-batch' }),
      });
      if (res.ok) {
        set({ classes });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save classes:', error);
      return false;
    }
  },

  // ── Todos ────────────────────────────────────────────────────

  fetchTodos: async () => {
    try {
      const res = await fetch('/api/pw/todos');
      if (res.ok) {
        const data = await res.json();
        set({ todos: Array.isArray(data) ? data : [] });
      } else {
        set({ todos: [] });
      }
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      set({ todos: [] });
    }
  },

  createTodo: async (title) => {
    try {
      const res = await fetch('/api/pw/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        await get().fetchTodos();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to create todo:', error);
      return false;
    }
  },

  deleteTodo: async (id) => {
    try {
      const res = await fetch(`/api/pw/todos?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        set((state) => ({ todos: state.todos.filter((t) => t.id !== id) }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete todo:', error);
      return false;
    }
  },

  // ── Analytics ────────────────────────────────────────────────

  fetchAnalytics: async (range = 'weekly') => {
    try {
      const res = await fetch(`/api/pw/analytics?range=${encodeURIComponent(range)}`);
      if (res.ok) {
        const data = await res.json();
        set({ analytics: data });
      } else {
        set({ analytics: { ...EMPTY_ANALYTICS } });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      set({ analytics: { ...EMPTY_ANALYTICS } });
    }
  },

  // ── Toggle todo (optimistic, local-only for now) ─────────────

  toggleTodoComplete: (id) =>
    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t,
      ),
    })),
}));
