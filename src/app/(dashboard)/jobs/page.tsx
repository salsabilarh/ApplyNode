// app/(dashboard)/jobs/page.tsx
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MasterListClient from '@/components/master/MasterListClient';

export const dynamic = 'force-dynamic';

export default async function MasterJobsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/login');
  const payload = await verifyJWT(token);
  if (!payload?.id) redirect('/login');

  const rawJobs = await prisma.job.findMany({
    where: { userId: payload.id },
    orderBy: { createdAt: 'desc' },
  });

  const jobs = rawJobs.map(job => ({
    id: job.id,
    user_id: job.userId,
    position: job.position,
    company: job.company,
    platform: job.platform,
    priority: job.priority,
    status: job.status,
    createdAt: job.createdAt.toISOString(),
    deadline: job.deadline.toISOString(),
    openingDate: job.openingDate?.toISOString() ?? null,
  }));

  return (
    <div className="space-y-5">
      <MasterListClient initialJobs={jobs} />
    </div>
  );
}