// types/job.ts
import { JobStatus, Priority, JobType } from '@prisma/client';

export interface Job {
  id: string;
  position: string;
  company: string;
  platform: string;
  deadline: string;
  priority: Priority;
  status: JobStatus;
  jobType: JobType;
  // Gunakan string | null agar kompatibel dengan JSON.stringify(date)
  plannedApplyDate: string | null; 
  openingDate?: string | null;
  createdAt?: string;
  sourceLink?: string | null;
  description?: string | null;
  duration?: string | null;
  plannedApplyTime?: string | null;
  applyNotes?: string | null;
  notes?: string | null;
}