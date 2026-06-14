import { prisma } from '@/lib/prisma';
import { JobStatus } from '@prisma/client';

// Urutan status sesuai tahapan rekrutmen (dari awal ke akhir)
const STATUS_ORDER = [
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

const STAGE_DATE_FIELDS = [
  { status: 'CLOSED', field: 'closedDate' },
  { status: 'OFFERING', field: 'offeringDate' },
  { status: 'MEDICAL_CHECK_UP', field: 'medicalCheckUpDate' },
  { status: 'INTERVIEW_EXECUTIVE', field: 'interviewExecutiveDate' },
  { status: 'INTERVIEW_USER', field: 'interviewUserDate' },
  { status: 'INTERVIEW_HR', field: 'interviewHrDate' },
  { status: 'FGD_LGD', field: 'fgdLgdDate' },
  { status: 'ASSESSMENT', field: 'assessmentDate' },
  { status: 'ADMIN_SCREENING', field: 'adminScreeningDate' },
];

function computeStatusFromDates(data: any): JobStatus | null {
  for (const item of STAGE_DATE_FIELDS) {
    if (data[item.field] && data[item.field] instanceof Date && !isNaN(data[item.field].getTime())) {
      return item.status as JobStatus;
    }
  }
  return null;
}

// Mapping status ke nama field tanggal di database
const getDateFieldName = (status: string): string | null => {
  const map: Record<string, string> = {
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
  return map[status] || null;
};

export async function getJobsByUser(userId: string) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  await prisma.job.updateMany({
    where: {
      userId,
      status: { not: 'CLOSED' },
      deadline: { lt: startOfToday },
    },
    data: { status: 'CLOSED' },
  });

  return prisma.job.findMany({
    where: { userId },
    orderBy: { deadline: 'asc' },
  });
}

export async function createJob(userId: string, data: any) {
  const deadlineDate = data.deadline ? new Date(data.deadline) : new Date();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const initialStatus = deadlineDate < startOfToday ? 'CLOSED' : (data.status || 'BACKLOG');
  
  return prisma.job.create({
    data: {
      userId,
      position: data.position,
      jobType: data.jobType,
      company: data.company,
      platform: data.platform,
      sourceLink: data.sourceLink || null,
      description: data.description || null,
      requirement: data.requirement || null,
      applyLink: data.applyLink || null,
      duration: data.duration || null,
      deadline: deadlineDate,
      openingDate: data.openingDate ? new Date(data.openingDate) : null,
      priority: data.priority,
      status: initialStatus,
      plannedApplyDate: data.plannedApplyDate ? new Date(data.plannedApplyDate) : null,
      plannedApplyTime: data.plannedApplyTime || null,
      applyNotes: data.applyNotes || null,
      notes: data.notes || null,
    },
  });
}

export async function updateJob(jobId: string, userId: string, data: any) {
  const existing = await prisma.job.findFirst({ where: { id: jobId, userId } });
  if (!existing) throw new Error('Job not found');

  const updatePayload: any = {};

  // Update field biasa
  if (data.position !== undefined) updatePayload.position = data.position;
  if (data.jobType !== undefined) updatePayload.jobType = data.jobType;
  if (data.company !== undefined) updatePayload.company = data.company;
  if (data.platform !== undefined) updatePayload.platform = data.platform;
  if (data.sourceLink !== undefined) updatePayload.sourceLink = data.sourceLink || null;
  if (data.description !== undefined) updatePayload.description = data.description || null;
  if (data.requirement !== undefined) updatePayload.requirement = data.requirement || null;
  if (data.applyLink !== undefined) updatePayload.applyLink = data.applyLink || null;
  if (data.duration !== undefined) updatePayload.duration = data.duration || null;
  if (data.priority !== undefined) updatePayload.priority = data.priority;
  if (data.applyNotes !== undefined) updatePayload.applyNotes = data.applyNotes || null;
  if (data.notes !== undefined) updatePayload.notes = data.notes || null;
  if (data.plannedApplyTime !== undefined) updatePayload.plannedApplyTime = data.plannedApplyTime || null;

  // Deadline handling
  if (data.deadline !== undefined) {
    const newDeadline = new Date(data.deadline);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    updatePayload.deadline = newDeadline;

    if (
      (existing.status === 'BACKLOG' || existing.status === 'APPLYING') &&
      newDeadline < startOfToday
    ) {
      updatePayload.status = JobStatus.CLOSED;
    } else if (existing.status === 'CLOSED' && newDeadline >= startOfToday) {
      updatePayload.status = JobStatus.BACKLOG;
    }
  }

  if (data.openingDate !== undefined) {
    updatePayload.openingDate = data.openingDate ? new Date(data.openingDate) : null;
  }
  if (data.plannedApplyDate !== undefined) {
    updatePayload.plannedApplyDate = data.plannedApplyDate ? new Date(data.plannedApplyDate) : null;
  }

  const stageDateFields = [
    'appliedDate', 'adminScreeningDate', 'assessmentDate', 'fgdLgdDate',
    'interviewHrDate', 'interviewUserDate', 'interviewExecutiveDate',
    'medicalCheckUpDate', 'offeringDate', 'closedDate'
  ];
  for (const field of stageDateFields) {
    if (data[field] !== undefined) {
      updatePayload[field] = data[field] ? new Date(data[field]) : null;
    }
  }

  // Status change handling with stage dates
  if (data.status !== undefined) {
    const oldStatus = existing.status;
    const newStatus = data.status;
    updatePayload.status = data.status;

    const oldIdx = STATUS_ORDER.indexOf(oldStatus);
    const newIdx = STATUS_ORDER.indexOf(newStatus);

    if (newIdx > oldIdx) {
      // Moving forward: set date for the new status ONLY if user didn't provide one
      const field = getDateFieldName(newStatus);
      if (field && !(existing as any)[field] && updatePayload[field] === undefined) {
        updatePayload[field] = new Date();
      }
    } else if (newIdx < oldIdx) {
      // Moving backward: reset dates for all stages after the target status
      for (let i = newIdx + 1; i <= oldIdx; i++) {
        const statusToReset = STATUS_ORDER[i];
        const field = getDateFieldName(statusToReset);
        if (field) {
          updatePayload[field] = null;
        }
      }
      // Keep the target stage date (do nothing)
    }
  }

  // Rekomputasi status berdasarkan tanggal stage (jika ada)
const computedStatus = computeStatusFromDates(updatePayload);
if (computedStatus) {
  updatePayload.status = computedStatus;
} else if (!updatePayload.status && existing.status) {
  // Jika tidak ada tanggal stage, pertahankan status lama (tapi jangan override jika sudah ada)
  updatePayload.status = existing.status;
}

  return prisma.job.update({
    where: { id: jobId },
    data: updatePayload,
  });
}

export async function deleteJob(jobId: string, userId: string) {
  const result = await prisma.job.deleteMany({
    where: { id: jobId, userId },
  });
  if (result.count === 0) throw new Error('Job not found');
  return true;
}