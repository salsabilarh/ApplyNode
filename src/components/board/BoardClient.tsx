'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import Column from './Column';
import DeadlineModal from './DeadlineModal';
import { 
  Loader2, Briefcase, CheckCircle2, BarChart3, Plus,
  Compass, FileSearch, Users2, Award
} from 'lucide-react';

interface Job {
  id: string;
  position: string;
  company: string;
  platform: string;
  deadline: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'BACKLOG' | 'APPLYING' | 'APPLIED' | 'ADMIN_SCREENING' | 'ASSESSMENT' | 'FGD_LGD' | 'INTERVIEW_HR' | 'INTERVIEW_USER' | 'INTERVIEW_EXECUTIVE' | 'MEDICAL_CHECK_UP' | 'OFFERING' | 'CLOSED';
}

// Recruitment phase architecture (unchanged)
const RECRUITMENT_PHASES = [
  {
    id: 'preparation',
    name: '1. Persiapan & Berkas',
    description: 'Proses riset & submit berkas lamaran',
    icon: Compass,
    headerColor: 'bg-slate-900 text-white',
    bodyColor: 'bg-slate-50/50 border-slate-200/80',
    subColumns: [
      { id: 'BACKLOG', label: 'To Be Apply', color: 'bg-slate-100 text-slate-700' },
      { id: 'APPLYING', label: 'Applying', color: 'bg-amber-50 text-amber-800' },
      { id: 'APPLIED', label: 'Applied', color: 'bg-sky-50 text-sky-800' },
    ]
  },
  {
    id: 'screening',
    name: '2. Penyaringan Awal',
    description: 'Seleksi berkas administrasi & tes dasar',
    icon: FileSearch,
    headerColor: 'bg-indigo-950 text-white',
    bodyColor: 'bg-indigo-50/20 border-indigo-100/80',
    subColumns: [
      { id: 'ADMIN_SCREENING', label: 'CV Screening', color: 'bg-indigo-50 text-indigo-800' },
      { id: 'ASSESSMENT', label: 'Assessment / Test', color: 'bg-purple-50 text-purple-800' },
      { id: 'FGD_LGD', label: 'FGD / LGD', color: 'bg-fuchsia-50 text-fuchsia-800' },
    ]
  },
  {
    id: 'interview',
    name: '3. Wawancara Kerja',
    description: 'Uji kompetensi, kecocokan tim, & direksi',
    icon: Users2,
    headerColor: 'bg-violet-950 text-white',
    bodyColor: 'bg-pink-50/10 border-pink-100/60',
    subColumns: [
      { id: 'INTERVIEW_HR', label: 'Interview HR', color: 'bg-pink-50 text-pink-800' },
      { id: 'INTERVIEW_USER', label: 'Interview User', color: 'bg-orange-50 text-orange-800' },
      { id: 'INTERVIEW_EXECUTIVE', label: 'Interview Exec', color: 'bg-cyan-50 text-cyan-800' },
    ]
  },
  {
    id: 'final',
    name: '4. Negosiasi & Hasil',
    description: 'Tahap penawaran kontrak & keputusan',
    icon: Award,
    headerColor: 'bg-emerald-950 text-white',
    bodyColor: 'bg-emerald-50/20 border-emerald-100/80',
    subColumns: [
      { id: 'MEDICAL_CHECK_UP', label: 'Medical Check Up', color: 'bg-teal-50 text-teal-800' },
      { id: 'OFFERING', label: 'Offering Letter', color: 'bg-emerald-50 text-emerald-800' },
      { id: 'CLOSED', label: 'Closed / Ended', color: 'bg-rose-50 text-rose-800' },
    ]
  }
];

const ACTIVE_APPLY_STATUSES = [
  'APPLIED', 'ADMIN_SCREENING', 'ASSESSMENT', 'FGD_LGD',
  'INTERVIEW_HR', 'INTERVIEW_USER', 'INTERVIEW_EXECUTIVE',
  'MEDICAL_CHECK_UP', 'OFFERING'
];

export default function BoardClient() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    jobId: string;
    position: string;
    company: string;
  } | null>(null);
  const router = useRouter();

  const autoCloseExpiredJobs = useCallback(async (fetchedJobs: Job[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const preAppliedStatus = ['BACKLOG', 'APPLYING'];

    const expiredJobs = fetchedJobs.filter(job => {
      const deadline = new Date(job.deadline);
      deadline.setHours(0, 0, 0, 0);
      return preAppliedStatus.includes(job.status) && deadline < today;
    });

    if (expiredJobs.length === 0) return;

    // Batch close - background operation, don't block UI
    try {
      await fetch('/api/jobs/batch-close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: expiredJobs.map(j => j.id) }),
      });
      
      const updatePromises = expiredJobs.map(job =>
        fetch(`/api/jobs/${job.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'CLOSED' }),
        })
      );
      await Promise.all(updatePromises);
      
      setJobs(prev =>
        prev.map(job => {
          const deadline = new Date(job.deadline);
          deadline.setHours(0, 0, 0, 0);
          return preAppliedStatus.includes(job.status) && deadline < today
            ? { ...job, status: 'CLOSED' }
            : job;
        })
      );
      router.refresh();
    } catch (error) {
      console.error('Auto-close expired jobs failed:', error);
    }
  }, [router]);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/jobs');
      if (!res.ok) throw new Error('Gagal mengambil data lowongan');
      const data = await res.json();
      // Handle both direct array and { success: true, data: [] } format
      const jobsData = Array.isArray(data) ? data : (data.data || []);
      setJobs(jobsData);
      await autoCloseExpiredJobs(jobsData);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  }, [autoCloseExpiredJobs]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const executeUpdateStatus = useCallback(async (id: string, payload: { status: string; deadline?: string }) => {
    // Optimistic update
    setJobs(prev =>
      prev.map(job =>
        job.id === id
          ? { ...job, status: payload.status as Job['status'], deadline: payload.deadline || job.deadline }
          : job
      )
    );

    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal memperbarui status');
      }
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui data');
      await fetchJobs(); // revert optimistic update
    }
  }, [fetchJobs, router]);

  const handleStatusChange = useCallback(async (jobId: string, nextStatus: Job['status']) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    if (nextStatus === 'CLOSED') {
      setModalConfig({ isOpen: true, jobId, position: job.position, company: job.company });
      return;
    }
    await executeUpdateStatus(jobId, { status: nextStatus });
  }, [jobs, executeUpdateStatus]);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    await handleStatusChange(draggableId, destination.droppableId as Job['status']);
  }, [handleStatusChange]);

  const handleConfirmClosed = useCallback(async (finalDeadlineDate: string) => {
    if (!modalConfig) return;
    const { jobId } = modalConfig;
    setModalConfig(null);
    await executeUpdateStatus(jobId, { status: 'CLOSED', deadline: finalDeadlineDate });
  }, [modalConfig, executeUpdateStatus]);

  const totalJobs = jobs.length;
  const appliedCount = jobs.filter(j => ACTIVE_APPLY_STATUSES.includes(j.status)).length;
  const successRate = totalJobs > 0 ? Math.round((appliedCount / totalJobs) * 100) : 0;

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-2 select-none">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-xs font-semibold text-slate-400">Memuat papan rekrutmen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 text-center text-red-600 bg-red-50 rounded-2xl">
        <p>⚠️ {error}</p>
        <button onClick={fetchJobs} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl">Coba Lagi</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none w-full max-w-[1600px] mx-auto px-2">
      {/* Header stats panel */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-base font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <Briefcase className="text-blue-600" size={18} strokeWidth={2.5} />
            Alur Pelacakan Karier Vertikal
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 mt-0.5 font-medium">
            <span>Total: <strong className="text-slate-700 font-bold">{totalJobs}</strong></span>
            <span className="flex items-center gap-1 text-sky-600">
              <CheckCircle2 size={12} /> Applied: <strong className="font-bold">{appliedCount}</strong>
            </span>
            <span className="flex items-center gap-1 text-blue-600">
              <BarChart3 size={12} /> Conversion Rate: <strong className="font-bold">{successRate}%</strong>
            </span>
          </div>
        </div>
        <Link
          href="/jobs/new"
          className="inline-flex items-center justify-center gap-1.5 bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-blue-700 shadow-sm transition-all w-full sm:w-auto active:scale-95"
        >
          <Plus size={15} strokeWidth={2.5} /> Tambah Lowongan
        </Link>
      </div>

      {/* Drag & Drop Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
          {RECRUITMENT_PHASES.map(phase => {
            const Icon = phase.icon;
            return (
              <div
                key={phase.id}
                className={`rounded-2xl border ${phase.bodyColor} overflow-hidden shadow-sm flex flex-col`}
              >
                <div className={`p-4 ${phase.headerColor} flex flex-col gap-1`}>
                  <div className="flex items-center gap-2">
                    <Icon size={16} strokeWidth={2.5} className="opacity-90" />
                    <h2 className="font-black text-xs uppercase tracking-wider">{phase.name}</h2>
                  </div>
                  <p className="text-[10px] opacity-75 font-medium leading-tight">{phase.description}</p>
                </div>
                <div className="p-3.5 space-y-4 bg-slate-50/40">
                  {phase.subColumns.map(col => {
                    const columnJobs = jobs.filter(job => job.status === col.id);
                    const percentage = totalJobs > 0 ? Math.round((columnJobs.length / totalJobs) * 100) : 0;
                    return (
                      <div key={col.id} className="bg-white rounded-xl border border-slate-200/50 shadow-inner overflow-hidden">
                        <Column
                          id={col.id as Job['status']}
                          label={col.label}
                          colorClass={col.color}
                          jobs={columnJobs}
                          quantity={columnJobs.length}
                          percentage={percentage}
                          onStatusChange={handleStatusChange}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {modalConfig && (
        <DeadlineModal
          isOpen={modalConfig.isOpen}
          positionName={modalConfig.position}
          companyName={modalConfig.company}
          onClose={() => setModalConfig(null)}
          onConfirm={handleConfirmClosed}
        />
      )}
    </div>
  );
}