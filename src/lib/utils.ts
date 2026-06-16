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
    BACKLOG: 'To Apply',
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

export function formatWorkMethodLabel(workMethod: string | null | undefined): string {
  if (!workMethod) return '-';
  const map: Record<string, string> = {
    WFH: 'WFH',
    WFO: 'WFO',
    HYBRID: 'Hybrid'
  };
  return map[workMethod] || workMethod.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

export function formatDurationUnitLabel(durationUnit: string | null | undefined): string {
  if (!durationUnit) return '-';
  const map: Record<string, string> = {
    DAYS: 'Days',
    WEEKS: 'Weeks',
    MONTHS: 'Months',
    YEARS: 'Years',
  };
  return map[durationUnit] || durationUnit.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

export function formatJobType(jobType: string | null | undefined): string {
  if (!jobType) return '-';
  const map: Record<string, string> = {
    FULL_TIME: 'Full Time',
    FREELANCE: 'Freelance',
    PROJECT_BASED: 'Project Based',
    INTERNSHIP: 'Internship',
    BOOTCAMP: 'Bootcamp',
    CONTRACT: 'Contract',
    PART_TIME: 'Part Time',
  };
  return map[jobType] || jobType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

export function getDaysLeft(date: Date | string | null): number {
  if (!date) return Infinity;
  const target = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatDateShort(date: Date | string | null): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const getStagesAffected = (current: string, target: string) => {
  const currentIdx = STATUS_ORDER.indexOf(current);
  const targetIdx = STATUS_ORDER.indexOf(target);
  const appliedIdx = STATUS_ORDER.indexOf('APPLIED');
  const stagesToUpdate: string[] = [];
  const stagesToReset: string[] = [];

  if (targetIdx > currentIdx) {
    // Maju
    if (targetIdx >= appliedIdx) {
      for (let i = appliedIdx; i <= targetIdx; i++) {
        const stage = STATUS_ORDER[i];
        if (getDateFieldName(stage)) stagesToUpdate.push(stage);
      }
    } else {
      for (let i = currentIdx + 1; i <= targetIdx; i++) {
        const stage = STATUS_ORDER[i];
        if (getDateFieldName(stage)) stagesToUpdate.push(stage);
      }
    }
  } else {
    // Mundur
    for (let i = targetIdx + 1; i <= currentIdx; i++) {
      const stage = STATUS_ORDER[i];
      if (getDateFieldName(stage)) stagesToReset.push(stage);
    }
    if (targetIdx >= appliedIdx) {
      for (let i = appliedIdx; i <= targetIdx; i++) {
        const stage = STATUS_ORDER[i];
        if (getDateFieldName(stage)) stagesToUpdate.push(stage);
      }
    } else {
      if (getDateFieldName(target)) stagesToUpdate.push(target);
    }
  }
  return { stagesToUpdate, stagesToReset };
};