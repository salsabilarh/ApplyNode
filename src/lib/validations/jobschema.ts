import { z } from 'zod';

export const jobBaseSchema = z.object({
  position: z.string().min(1, 'Posisi wajib diisi'),
  company: z.string().min(1, 'Perusahaan wajib diisi'),
  platform: z.string().min(1, 'Platform wajib diisi'),
  sourceLink: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  duration: z.string().optional(),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format deadline harus YYYY-MM-DD'),
  openingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal buka harus YYYY-MM-DD').optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  status: z.enum([
    'BACKLOG', 'APPLYING', 'APPLIED', 'ADMIN_SCREENING', 'ASSESSMENT', 'FGD_LGD',
    'INTERVIEW_HR', 'INTERVIEW_USER', 'INTERVIEW_EXECUTIVE', 'MEDICAL_CHECK_UP',
    'OFFERING', 'CLOSED'
  ]),
  plannedApplyDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  plannedApplyTime: z.string().optional(),
  applyNotes: z.string().optional(),
  notes: z.string().optional(),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']).optional(),
});

export const createJobSchema = jobBaseSchema;
export const updateJobSchema = jobBaseSchema.partial();