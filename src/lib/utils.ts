// lib/utils.ts
import { PRIORITY_META, MONTH_NAMES_ID } from '@/constants';

// Urutan status sesuai tahapan rekrutmen (dari awal ke akhir)
export const STATUS_ORDER = [
  'BACKLOG',
  'APPLYING',
  'APPLIED',
  'ADMIN_SCREENING',
  'ASSESSMENT',
  'FGD_LGD',
  'INTERVIEW_HR',
  'INTERVIEW_USER',
  'INTERVIEW_EXECUTIVE',
  'MEDICAL_CHECK_UP',
  'OFFERING',
  'CLOSED'
];

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

export const statusToDateField: Record<string, string> = {
  APPLIED: 'appliedDate',
  ADMIN_SCREENING: 'adminScreeningDate',
  ASSESSMENT: 'assessmentDate',
  FGD_LGD: 'fgdLgdDate',
  INTERVIEW_HR: 'interviewHrDate',
  INTERVIEW_USER: 'interviewUserDate',
  INTERVIEW_EXECUTIVE: 'interviewExecutiveDate',
  MEDICAL_CHECK_UP: 'medicalCheckUpDate',
  OFFERING: 'offeringDate',
  CLOSED: 'closedDate',
};

export const getDateFieldName = (status: string): string | null => {
  return statusToDateField[status] || null;
};

export function formatStageLabel(status: string): string {
  const map: Record<string, string> = {
    BACKLOG: 'Backlog',
    APPLYING: 'Applying',
    APPLIED: 'Applied',
    ADMIN_SCREENING: 'Admin Screening',
    ASSESSMENT: 'Assessment',
    FGD_LGD: 'FGD / LGD',
    INTERVIEW_HR: 'HR Interview',
    INTERVIEW_USER: 'User Interview',
    INTERVIEW_EXECUTIVE: 'Executive Interview',
    MEDICAL_CHECK_UP: 'Medical Check Up',
    OFFERING: 'Offering',
    CLOSED: 'Closed',
  };
  return map[status] || status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}