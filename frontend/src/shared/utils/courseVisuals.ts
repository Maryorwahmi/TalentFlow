/**
 * Course Visual System - Maps categories to colors, gradients, and icons
 * Provides consistent visual representations across course cards
 */

export interface CourseVisualConfig {
  icon: string;
  gradient: string;
  bgColor: string;
  iconBg: string;
  accentColor: string;
  textColor: string;
}

const COURSE_VISUALS: Record<string, CourseVisualConfig> = {
  'ui/ux': {
    icon: '🎨',
    gradient: 'from-purple-100 via-pink-50 to-purple-50',
    bgColor: 'bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50',
    iconBg: 'bg-gradient-to-br from-purple-400 to-pink-400',
    accentColor: '#a855f7',
    textColor: 'text-purple-900',
  },
  'frontend': {
    icon: '💻',
    gradient: 'from-blue-100 via-cyan-50 to-blue-50',
    bgColor: 'bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50',
    iconBg: 'bg-gradient-to-br from-blue-400 to-cyan-400',
    accentColor: '#3b82f6',
    textColor: 'text-blue-900',
  },
  'backend': {
    icon: '⚙️',
    gradient: 'from-slate-100 via-gray-50 to-slate-50',
    bgColor: 'bg-gradient-to-br from-slate-100 via-gray-50 to-slate-50',
    iconBg: 'bg-gradient-to-br from-slate-400 to-gray-500',
    accentColor: '#475569',
    textColor: 'text-slate-900',
  },
  'design': {
    icon: '🎭',
    gradient: 'from-orange-100 via-rose-50 to-orange-50',
    bgColor: 'bg-gradient-to-br from-orange-100 via-rose-50 to-orange-50',
    iconBg: 'bg-gradient-to-br from-orange-400 to-rose-400',
    accentColor: '#f97316',
    textColor: 'text-orange-900',
  },
  'product': {
    icon: '📦',
    gradient: 'from-emerald-100 via-teal-50 to-emerald-50',
    bgColor: 'bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-50',
    iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-400',
    accentColor: '#059669',
    textColor: 'text-emerald-900',
  },
  'marketing': {
    icon: '📊',
    gradient: 'from-red-100 via-pink-50 to-red-50',
    bgColor: 'bg-gradient-to-br from-red-100 via-pink-50 to-red-50',
    iconBg: 'bg-gradient-to-br from-red-400 to-pink-400',
    accentColor: '#dc2626',
    textColor: 'text-red-900',
  },
  'architecture': {
    icon: '🏗️',
    gradient: 'from-indigo-100 via-purple-50 to-indigo-50',
    bgColor: 'bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-50',
    iconBg: 'bg-gradient-to-br from-indigo-400 to-purple-400',
    accentColor: '#4f46e5',
    textColor: 'text-indigo-900',
  },
  'social media': {
    icon: '📱',
    gradient: 'from-amber-100 via-yellow-50 to-amber-50',
    bgColor: 'bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-50',
    iconBg: 'bg-gradient-to-br from-amber-400 to-yellow-400',
    accentColor: '#d97706',
    textColor: 'text-amber-900',
  },
  'data-science': {
    icon: '📊',
    gradient: 'from-violet-100 via-fuchsia-50 to-violet-50',
    bgColor: 'bg-gradient-to-br from-violet-100 via-fuchsia-50 to-violet-50',
    iconBg: 'bg-gradient-to-br from-violet-400 to-fuchsia-400',
    accentColor: '#7c3aed',
    textColor: 'text-violet-900',
  },
};

const DEFAULT_VISUAL: CourseVisualConfig = {
  icon: '📚',
  gradient: 'from-cyan-100 via-blue-50 to-cyan-50',
  bgColor: 'bg-gradient-to-br from-cyan-100 via-blue-50 to-cyan-50',
  iconBg: 'bg-gradient-to-br from-cyan-400 to-blue-400',
  accentColor: '#0891b2',
  textColor: 'text-cyan-900',
};

/**
 * Get visual configuration for a course category
 */
export function getCourseVisual(category?: string): CourseVisualConfig {
  if (!category) return DEFAULT_VISUAL;

  const normalizedCategory = category.toLowerCase().trim();
  return COURSE_VISUALS[normalizedCategory] || DEFAULT_VISUAL;
}

/**
 * Get just the emoji icon for a category
 */
export function getCourseIcon(category?: string): string {
  return getCourseVisual(category).icon;
}

/**
 * Get gradient class for a category
 */
export function getCourseGradient(category?: string): string {
  return getCourseVisual(category).gradient;
}

/**
 * Get all available categories with their visuals
 */
export function getAllCourseCategories(): Array<{
  id: string;
  label: string;
  visual: CourseVisualConfig;
}> {
  return Object.entries(COURSE_VISUALS).map(([id, visual]) => ({
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1),
    visual,
  }));
}

/**
 * Generate a color-based avatar for a course (fallback if needed)
 */
export function generateCourseInitials(title: string): string {
  if (!title) return '?';
  const words = title.split(' ');
  if (words.length > 1) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return title.substring(0, 2).toUpperCase();
}
