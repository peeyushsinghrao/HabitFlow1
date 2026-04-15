export const DEFAULT_SUBJECT_COLORS: Record<string, string> = {
  Physics:     '#3B82F6',
  Chemistry:   '#10B981',
  Mathematics: '#F59E0B',
  Biology:     '#8B5CF6',
  Accounts:    '#EF4444',
  Economics:   '#06B6D4',
  History:     '#D97706',
  Geography:   '#059669',
  English:     '#EC4899',
  Hindi:       '#F97316',
  Science:     '#6366F1',
  Maths:       '#F59E0B',
  Math:        '#F59E0B',
  SST:         '#14B8A6',
  Computer:    '#64748B',
};

const STORAGE_KEY = 'nuviora-subject-colors';

export function getSubjectColors(): Record<string, string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SUBJECT_COLORS, ...parsed };
    }
  } catch {}
  return { ...DEFAULT_SUBJECT_COLORS };
}

export function setSubjectColor(subject: string, color: string) {
  try {
    const current = getSubjectColors();
    current[subject] = color;
    const toStore: Record<string, string> = {};
    for (const [k, v] of Object.entries(current)) {
      if (DEFAULT_SUBJECT_COLORS[k] !== v || !DEFAULT_SUBJECT_COLORS[k]) {
        toStore[k] = v;
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {}
}

export function getSubjectColor(subject: string, colors?: Record<string, string>): string {
  const map = colors || DEFAULT_SUBJECT_COLORS;
  return map[subject] || map[subject?.trim()] || '#6B7280';
}

export function subjectColorStyle(subject: string, colors?: Record<string, string>) {
  const color = getSubjectColor(subject, colors);
  return {
    backgroundColor: color + '20',
    color,
    borderColor: color + '40',
  };
}
