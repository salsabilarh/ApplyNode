import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function JobsListPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { deadline: 'asc' },
  });

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Daftar Lowongan</h1>
        <Link href="/jobs/new" className="bg-blue-600 text-white px-4 py-2 rounded">
          + Tambah
        </Link>
      </div>

      {jobs.length === 0 ? (
        <p>Belum ada lowongan.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <div key={job.id} className="border rounded-lg p-4 shadow-sm">
              <h2 className="font-semibold text-lg">{job.position}</h2>
              <p className="text-gray-600">{job.company} - {job.platform}</p>
              <p className="text-sm">
                Deadline: {new Date(job.deadline).toLocaleDateString('id-ID')}
              </p>
              <span
                className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium
                ${
                  job.priority === 'HIGH'
                    ? 'bg-red-100 text-red-700'
                    : job.priority === 'MEDIUM'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {job.priority}
              </span>
              <span
                className={`ml-2 inline-block px-2 py-1 rounded text-xs font-medium
                ${
                  job.status === 'TO_BE_APPLY'
                    ? 'bg-blue-100 text-blue-700'
                    : job.status === 'APPLIED'
                    ? 'bg-green-100 text-green-700'
                    : job.status === 'ON_PROGRESS'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {job.status.replace(/_/g, ' ')}
              </span>
              <div className="mt-3">
                <Link
                  href={`/jobs/${job.id}/edit`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}