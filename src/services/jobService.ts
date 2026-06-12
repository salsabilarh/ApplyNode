import { prisma } from '@/lib/prisma';
import { JobStatus } from '@prisma/client';

export async function getJobsByUser(userId: string) {
  const now = new Date();
  await prisma.job.updateMany({
    where: {
      userId,
      status: { not: 'CLOSED' },
      deadline: { lt: now },
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
  const initialStatus = deadlineDate < new Date() ? 'CLOSED' : (data.status || 'BACKLOG');

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
  if (!existing) throw new Error('Job tidak ditemukan');

  const updatePayload: any = {};
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Hanya update field yang dikirim
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

  // Konversi tanggal
  if (data.deadline !== undefined) {
    const newDeadline = new Date(data.deadline);
    updatePayload.deadline = newDeadline;
    if (existing.status === 'CLOSED' && newDeadline >= now) {
      updatePayload.status = JobStatus.BACKLOG;
    }
  }
  if (data.openingDate !== undefined) {
    updatePayload.openingDate = data.openingDate ? new Date(data.openingDate) : null;
  }
  if (data.plannedApplyDate !== undefined) {
    updatePayload.plannedApplyDate = data.plannedApplyDate ? new Date(data.plannedApplyDate) : null;
  }
  if (data.status !== undefined) {
    updatePayload.status = data.status;
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
  if (result.count === 0) throw new Error('Job tidak ditemukan');
  return true;
}