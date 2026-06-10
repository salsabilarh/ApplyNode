// types/job.ts
import { JobStatus, Priority, JobType } from '@prisma/client';

export interface Job {
  id: string;
  position: string;
  company: string;
  platform: string;
  deadline: string;
  openingDate?: string | null;
  createdAt?: string;
  priority: Priority;
  status: JobStatus;
  jobType: JobType;
  sourceLink?: string;
  description?: string;
  duration?: string;
  plannedApplyDate?: string;
  plannedApplyTime?: string;
  applyNotes?: string;
  notes?: string;
}