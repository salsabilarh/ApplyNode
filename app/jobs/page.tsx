import { prisma } from '@/lib/prisma';
import MasterListClient from '@/components/master/MasterListClient';

export const dynamic = 'force-dynamic';

export default async function MasterJobsPage() {
  // Mengambil repositori data menyeluruh dari database prisma
  const rawJobs = await prisma.job.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Normalisasi data tanggal agar aman dikirimkan ke Client Component
  const jobs = rawJobs.map(job => ({
    id: job.id,
    position: job.position,
    company: job.company,
    platform: job.platform,
    priority: job.priority,
    status: job.status,
    createdAt: job.createdAt.toISOString(), // Ditambahkan sebagai basis hari setelah dibuka
    deadline: job.deadline.toISOString(),
    openingDate: job.openingDate ? job.openingDate.toISOString() : null,
    plannedApplyDate: job.plannedApplyDate ? job.plannedApplyDate.toISOString() : null,
  }));

  return (
    <div className="space-y-5">
      <MasterListClient initialJobs={jobs} />
    </div>
  );
}