import { prisma } from '@/lib/prisma';
import MasterListClient from '@/components/master/MasterListClient';
import { cookies } from 'next/headers'; // Gunakan cookies dari next/headers
import { verifyJWT } from '@/lib/auth'; // Gunakan fungsi verifikasi yang sudah Anda buat
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function MasterJobsPage() {
  // 1. Ambil token dari cookie
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  // 2. Verifikasi token
  if (!token) {
    redirect('/login'); // Arahkan ke login jika tidak ada token
  }

  const payload = await verifyJWT(token);

  if (!payload || !payload.id) {
    redirect('/login'); // Arahkan ke login jika token tidak valid
  }

  // 3. Gunakan userId dari payload untuk memfilter data
  const rawJobs = await prisma.job.findMany({
    where: {
      userId: payload.id, // Menggunakan ID dari token yang diverifikasi
    },
    orderBy: { createdAt: 'desc' },
  });

  // Normalisasi data
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
    openingDate: job.openingDate ? job.openingDate.toISOString() : null,
  }));

  return (
    <div className="space-y-5">
      <MasterListClient initialJobs={jobs} />
    </div>
  );
}