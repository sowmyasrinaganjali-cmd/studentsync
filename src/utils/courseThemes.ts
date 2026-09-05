import { Course } from '../types';

export interface ColorOption {
  id: string;
  name: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  dotBg: string;
  ringColor: string;
}

export const COURSE_COLOR_PALETTES: Record<string, ColorOption> = {
  indigo: {
    id: 'indigo',
    name: 'Indigo',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    textColor: 'text-indigo-700 dark:text-indigo-300',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    dotBg: 'bg-indigo-500',
    ringColor: 'ring-indigo-500',
  },
  violet: {
    id: 'violet',
    name: 'Violet',
    badgeBg: 'bg-violet-50 dark:bg-violet-950/40',
    textColor: 'text-violet-700 dark:text-violet-300',
    borderColor: 'border-violet-200 dark:border-violet-800',
    dotBg: 'bg-violet-500',
    ringColor: 'ring-violet-500',
  },
  blue: {
    id: 'blue',
    name: 'Blue',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/40',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-800',
    dotBg: 'bg-blue-500',
    ringColor: 'ring-blue-500',
  },
  cyan: {
    id: 'cyan',
    name: 'Cyan',
    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/40',
    textColor: 'text-cyan-700 dark:text-cyan-300',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
    dotBg: 'bg-cyan-500',
    ringColor: 'ring-cyan-500',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    dotBg: 'bg-emerald-500',
    ringColor: 'ring-emerald-500',
  },
  teal: {
    id: 'teal',
    name: 'Teal',
    badgeBg: 'bg-teal-50 dark:bg-teal-950/40',
    textColor: 'text-teal-700 dark:text-teal-300',
    borderColor: 'border-teal-200 dark:border-teal-800',
    dotBg: 'bg-teal-500',
    ringColor: 'ring-teal-500',
  },
  amber: {
    id: 'amber',
    name: 'Amber',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    textColor: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-200 dark:border-amber-800',
    dotBg: 'bg-amber-500',
    ringColor: 'ring-amber-500',
  },
  orange: {
    id: 'orange',
    name: 'Orange',
    badgeBg: 'bg-orange-50 dark:bg-orange-950/40',
    textColor: 'text-orange-700 dark:text-orange-300',
    borderColor: 'border-orange-200 dark:border-orange-800',
    dotBg: 'bg-orange-500',
    ringColor: 'ring-orange-500',
  },
  rose: {
    id: 'rose',
    name: 'Rose',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
    textColor: 'text-rose-700 dark:text-rose-300',
    borderColor: 'border-rose-200 dark:border-rose-800',
    dotBg: 'bg-rose-500',
    ringColor: 'ring-rose-500',
  },
  fuchsia: {
    id: 'fuchsia',
    name: 'Fuchsia',
    badgeBg: 'bg-fuchsia-50 dark:bg-fuchsia-950/40',
    textColor: 'text-fuchsia-700 dark:text-fuchsia-300',
    borderColor: 'border-fuchsia-200 dark:border-fuchsia-800',
    dotBg: 'bg-fuchsia-500',
    ringColor: 'ring-fuchsia-500',
  },
  slate: {
    id: 'slate',
    name: 'Slate',
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    textColor: 'text-slate-700 dark:text-slate-300',
    borderColor: 'border-slate-200 dark:border-slate-700',
    dotBg: 'bg-slate-500',
    ringColor: 'ring-slate-500',
  },
};

export const createCourseWithTheme = (data: {
  code: string;
  name: string;
  color?: string;
  instructor?: string;
  location?: string;
  id?: string;
}): Course => {
  const chosenColor = data.color && COURSE_COLOR_PALETTES[data.color] ? data.color : 'indigo';
  const palette = COURSE_COLOR_PALETTES[chosenColor];

  const generatedId = data.id || ('course-' + data.code.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Date.now().toString(36).slice(-4));

  return {
    id: generatedId,
    code: data.code.trim().toUpperCase(),
    name: data.name.trim(),
    color: chosenColor,
    accentBg: palette.badgeBg,
    textColor: palette.textColor,
    borderColor: palette.borderColor,
    instructor: data.instructor?.trim() || undefined,
    location: data.location?.trim() || undefined,
  };
};
