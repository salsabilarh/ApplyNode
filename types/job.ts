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
  // Ubah dari ? (undefined) menjadi | null (tanpa tanda tanya)
  plannedApplyDate: string | null; 
  openingDate: string | null;
  sourceLink: string | null;
  description: string | null;
  duration: string | null;
  plannedApplyTime: string | null;
  applyNotes: string | null;
  notes: string | null;
  // createdAt bisa tetap opsional karena biasanya di-generate oleh DB
  createdAt?: string;
}