import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function JobsListPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { deadline: 'asc' },
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl rounded-3xl bg-white p-6 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Project Tracking Apply Job</h1>
            <p className="mt-1 text-sm text-slate-500">Kelola lowongan dan status aplikasi secara mudah.</p>
          </div>
          <Link href="/jobs/new" className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
            + Tambah Lowongan
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-lg font-medium text-slate-700">Belum ada lowongan yang dicatat.</p>
            <p className="mt-2 text-sm text-slate-500">Tambahkan lowongan baru untuk mulai melacak aplikasi pekerjaanmu.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {jobs.map(job => (
              <div key={job.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{job.platform}</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">{job.position}</h2>
                    <p className="mt-1 text-sm text-slate-600">{job.company}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-slate-500">
                  <p>Deadline: {new Date(job.deadline).toLocaleDateString('id-ID')}</p>
                  <p className="mt-1">Tipe: {job.jobType.replace(/_/g, ' ')}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${job.priority === 'HIGH' ? 'bg-red-100 text-red-700' : job.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {job.priority}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${job.status === 'TO_BE_APPLY' ? 'bg-blue-100 text-blue-700' : job.status === 'APPLIED' ? 'bg-emerald-100 text-emerald-700' : job.status === 'ON_PROGRESS' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                    {job.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="mt-5">
                  <Link href={`/jobs/${job.id}/edit`} className="text-sm font-semibold text-slate-900 underline transition hover:text-blue-600">
                    Edit data
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
