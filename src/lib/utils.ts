import { PRIORITY_META, MONTH_NAMES_ID } from '@/constants';

/**
 * Normalize a date to UTC midnight for consistent day comparison.
 */
export function normalizeToUTCMidnight(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/**
 * Calculate days left until deadline (negative if expired).
 */
export function getDaysLeft(deadline: Date, referenceDate: Date = new Date()): number {
  const deadlineUTC = normalizeToUTCMidnight(deadline);
  const referenceUTC = normalizeToUTCMidnight(referenceDate);
  return Math.ceil((deadlineUTC.getTime() - referenceUTC.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Format date as "DD MMM" in Indonesian.
 */
export function formatDateShort(date: Date): string {
  return `${date.getUTCDate()} ${MONTH_NAMES_ID[date.getUTCMonth()]}`;
}

/**
 * Format date as YYYY-MM-DD for input[type="date"].
 */
export function formatDateForInput(date: Date | string | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Get CSS class for priority badge.
 */
export function getPriorityClass(priority: 'HIGH' | 'MEDIUM' | 'LOW') {
  return PRIORITY_META[priority];
}