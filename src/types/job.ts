import { JobStatus, Priority, JobType, DurationUnit, WorkMethod } from '@prisma/client';

export interface Job {
  id: string;
  userId: string;
  position: string;
  jobType: JobType | null;
  company: string;
  platform: string;
  sourceLink: string | null;
  applyLink: string | null;
  description: string | null;
  requirement: string | null;
  duration: string | null;
  location: string | null;
  workMethod: WorkMethod | null;
  durationUnit: DurationUnit | null;
  deadline: string | null; // ← nullable
  openingDate: string | null;
  priority: Priority | null;
  status: JobStatus;
  plannedApplyDate: string | null;
  plannedApplyTime: string | null;
  appliedDate: string | null;
  adminScreeningDate: string | null;
  assessmentDate: string | null;
  fgdLgdDate: string | null;
  interviewHrDate: string | null;
  interviewUserDate: string | null;
  interviewExecutiveDate: string | null;
  medicalCheckUpDate: string | null;
  offeringDate: string | null;
  closedDate: string | null;
  applyNotes: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}