import { JobStatus, Priority, JobType } from '@prisma/client';

export interface Job {
  id: string;
  userId: string;
  position: string;
  jobType: JobType;
  company: string;
  platform: string;
  sourceLink: string | null;
  description: string | null;
  duration: string | null;
  deadline: string;
  openingDate: string | null;
  priority: Priority;
  status: JobStatus;
  plannedApplyDate: string | null;
  plannedApplyTime: string | null;
  applyNotes: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}