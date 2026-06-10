import JobForm from '@/components/JobForm';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // 🔥 ambil id setelah await

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) notFound();

  // Konversi Date ke string yyyy-mm-dd untuk input date
  const initialData = {
    ...job,
    deadline: job.deadline.toISOString().split('T')[0],
    openingDate: job.openingDate?.toISOString().split('T')[0] || '',
    plannedApplyDate: job.plannedApplyDate?.toISOString().split('T')[0] || '',
    description: job.description || '',
    applyNotes: job.applyNotes || '',
    notes: job.notes || '',
    duration: job.duration || '',
    sourceLink: job.sourceLink || '',
    plannedApplyTime: job.plannedApplyTime || '',
  };

  return <JobForm initialData={initialData} />;
}