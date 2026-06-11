import JobForm from '@/components/JobForm';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Menunggu resolusi data params dari arsitektur dinamis Next.js App Router
  const { id } = await params;

  const job = await prisma.job.findUnique({ 
    where: { id } 
  });
  
  if (!job) notFound();

  // Memastikan transformasi data tanggal ter-normalisasi dengan aman untuk HTML5 Date Element (Pencegahan Bug Rendering)
  const initialData = {
    ...job,
    deadline: job.deadline ? job.deadline.toISOString().split('T')[0] : '',
    openingDate: job.openingDate ? job.openingDate.toISOString().split('T')[0] : '',
    plannedApplyDate: job.plannedApplyDate ? job.plannedApplyDate.toISOString().split('T')[0] : '',
    description: job.description || '',
    applyNotes: job.applyNotes || '',
    notes: job.notes || '',
    duration: job.duration || '',
    sourceLink: job.sourceLink || '',
    plannedApplyTime: job.plannedApplyTime || '',
  };

  return <JobForm initialData={initialData} />;
}