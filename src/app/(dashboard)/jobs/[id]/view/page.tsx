import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import JobView from '@/components/jobs/JobView';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) notFound();
  const payload = await verifyJWT(token);
  if (!payload?.id) notFound();

  const job = await prisma.job.findFirst({
    where: { id, userId: payload.id },
  });
  if (!job) notFound();

  // Serialize all date fields to ISO strings for client component
const serializedJob = {
  ...job,
  deadline: job.deadline.toISOString(),
  openingDate: job.openingDate?.toISOString() ?? null,
  plannedApplyDate: job.plannedApplyDate?.toISOString() ?? null,
  appliedDate: job.appliedDate?.toISOString() ?? null,
  adminScreeningDate: job.adminScreeningDate?.toISOString() ?? null,
  assessmentDate: job.assessmentDate?.toISOString() ?? null,
  fgdLgdDate: job.fgdLgdDate?.toISOString() ?? null,
  interviewHrDate: job.interviewHrDate?.toISOString() ?? null,
  interviewUserDate: job.interviewUserDate?.toISOString() ?? null,
  interviewExecutiveDate: job.interviewExecutiveDate?.toISOString() ?? null,
  medicalCheckUpDate: job.medicalCheckUpDate?.toISOString() ?? null,
  offeringDate: job.offeringDate?.toISOString() ?? null,
  closedDate: job.closedDate?.toISOString() ?? null,
  createdAt: job.createdAt.toISOString(),
  updatedAt: job.updatedAt.toISOString(),
};

  return <JobView job={serializedJob} />;
}