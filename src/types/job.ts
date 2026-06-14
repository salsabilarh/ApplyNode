import { JobStatus, Priority, JobType } from '@prisma/client';

export interface Job {
  id: string;
  userId: string;
  position: string;
  jobType: JobType;
  company: string;
  platform: string;
  sourceLink: string | null;
  applyLink: string | null;
  description: string | null;
  requirement: string | null;
  duration: string | null;
  deadline: string;
  openingDate: string | null;
  priority: Priority;
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