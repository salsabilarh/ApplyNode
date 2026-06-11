'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import Column from './Column';
import DeadlineModal from './DeadlineModal';
import { 
  Loader2, 
  AlertCircle, 
  Briefcase, 
  CheckCircle2, 
  BarChart3, 
  Plus,
  Compass,
  FileSearch,
  Users2,
  Award
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

// STRUKTUR VERTIKAL: Pembagian Kolom Utama berdasarkan Fase Kerja Rekrutmen
const ARSITEKTUR_FASE = [
  {
    idFase: 'fase-persiapan',
    nama: '1. Persiapan & Berkas',
    deskripsi: 'Proses riset & submit berkas lamaran',
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
    idFase: 'fase-penyaringan',
    nama: '2. Penyaringan Awal',
    deskripsi: 'Seleksi berkas administrasi & tes dasar',
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
    idFase: 'fase-interview',
    nama: '3. Wawancara Kerja',
    deskripsi: 'Uji kompetensi, kecocokan tim, & direksi',
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
    idFase: 'fase-final',
    nama: '4. Negosiasi & Hasil',
    deskripsi: 'Tahap penawaran kontrak & keputusan',
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

export default function BoardClient() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    jobId: string;
    position: string;
    company: string;
  } | null>(null);

  // Jalankan pengecekan otomatis untuk lowongan yang melewati deadline
  const autoCheckExpiredJobs = async (fetchedJobs: Job[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Daftar status yang dianggap "Belum Terkumpul/Belum Aman" (Sebelum APPLIED)
    const sebelumAppliedStatus = ['BACKLOG', 'APPLYING'];

    // Cari apakah ada lowongan yang harus otomatis ditutup
    const expiredJobs = fetchedJobs.filter((job) => {
      const jobDeadline = new Date(job.deadline);
      jobDeadline.setHours(0, 0, 0, 0);

      return sebelumAppliedStatus.includes(job.status) && jobDeadline < today;
    });

    if (expiredJobs.length === 0) return;

    await fetch('/api/jobs/batch-close', {
      method: 'POST',
      body: JSON.stringify({ ids: expiredJobs.map(j => j.id) })
    });
    
    // Eksekusi pembaruan status ke CLOSED secara paralel di background
    const updatePromises = expiredJobs.map((job) =>
      fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'CLOSED',
          // Opsional: kirim flag atau biarkan backend tahu ini auto-closed
        }),
      })
    );

    try {
      await Promise.all(updatePromises);
      
      // Perbarui state lokal secara instan agar user tidak melihat keanehan data
      setJobs((prevJobs) =>
        prevJobs.map((job) => {
          const jobDeadline = new Date(job.deadline);
          jobDeadline.setHours(0, 0, 0, 0);
          
          if (sebelumAppliedStatus.includes(job.status) && jobDeadline < today) {
            return { ...job, status: 'CLOSED' };
          }
          return job;
        })
      );
      
      router.refresh();
    } catch (error) {
      console.error('Gagal menjalankan otomatisasi penutupan lowongan:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/jobs');
      if (!res.ok) throw new Error('Gagal mengambil data lowongan');
      const data = await res.json();
      setJobs(data);
      
      // Pemicu pengecekan otomatis setelah data masuk ke state
      await autoCheckExpiredJobs(data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const executeUpdateStatus = async (id: string, payload: { status: string; deadline?: string }) => {
    try {
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === id 
            ? { ...job, status: payload.status as Job['status'], deadline: payload.deadline || job.deadline } 
            : job
        )
      );

      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal memperbarui status lowongan');
      }
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui data');
      fetchJobs();
    }
  };

  const handleStatusChange = async (jobId: string, nextStatus: Job['status']) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob) return;

    if (nextStatus === 'CLOSED') {
      setModalConfig({ isOpen: true, jobId, position: targetJob.position, company: targetJob.company });
      return;
    }
    await executeUpdateStatus(jobId, { status: nextStatus });
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const nextStatus = destination.droppableId as Job['status'];
    await handleStatusChange(draggableId, nextStatus);
  };

  const handleConfirmClosed = async (finalDeadlineDate: string) => {
    if (!modalConfig) return;
    const { jobId } = modalConfig;
    setModalConfig(null);
    await executeUpdateStatus(jobId, { status: 'CLOSED', deadline: finalDeadlineDate });
  };

  const totalJobsCount = jobs.length;
  const offeringCount = jobs.filter(j => j.status === 'OFFERING').length;
  
  // 1. Tentukan status apa saja yang dianggap sudah "Apply" atau dalam proses
  const activeApplyStatuses = [
    'APPLIED', 'ADMIN_SCREENING', 'ASSESSMENT', 'FGD_LGD', 
    'INTERVIEW_HR', 'INTERVIEW_USER', 'INTERVIEW_EXECUTIVE', 
    'MEDICAL_CHECK_UP', 'OFFERING'
  ];

  // 2. Hitung jumlah lamaran yang sudah masuk tahap "Applied"
  const appliedCount = jobs.filter(j => activeApplyStatuses.includes(j.status)).length;

// 3. Kalkulasi Success Rate (Target Finis)
// Sekarang rasio dihitung dari berapa banyak yang sudah berhasil 'Applied' dari total lowongan
const successRate = totalJobsCount > 0 ? Math.round((appliedCount / totalJobsCount) * 100) : 0;
  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-2 select-none">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-xs font-semibold text-slate-400">Mengkalkulasi Matriks Kolom Rekrutmen...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none w-full max-w-[1600px] mx-auto px-2">
      
      {/* Header Panel Statis */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
        <div>
          <h1 className="text-base font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <Briefcase className="text-blue-600" size={18} strokeWidth={2.5} /> Alur Pelacakan Karier Vertikal
          </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 mt-0.5 font-medium">
              <span>Total: <strong className="text-slate-700 font-bold">{totalJobsCount}</strong></span>
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

      {/* Grid Arsitektur Utama (Fase Ditampilkan Per Kolom Ke Samping, Sub-tahap Berurutan Ke Bawah) */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
          
          {ARSITEKTUR_FASE.map((fase) => {
            const IconFase = fase.icon;
            
            return (
              <div 
                key={fase.idFase} 
                className={`rounded-2xl border ${fase.bodyColor} overflow-hidden shadow-sm flex flex-col`}
              >
                {/* Header Kolom Kategori Fase */}
                <div className={`p-4 ${fase.headerColor} flex flex-col gap-1`}>
                  <div className="flex items-center gap-2">
                    <IconFase size={16} strokeWidth={2.5} className="opacity-90" />
                    <h2 className="font-black text-xs uppercase tracking-wider">{fase.nama}</h2>
                  </div>
                  <p className="text-[10px] opacity-75 font-medium leading-tight">
                    {fase.deskripsi}
                  </p>
                </div>

                {/* Wadah Tumpukan Sub-Tahapan Berurutan Ke Bawah */}
                <div className="p-3.5 space-y-4 bg-slate-50/40">
                  {fase.subColumns.map((col) => {
                    const filteredJobs = jobs.filter((job) => job.status === col.id);
                    const percentage = totalJobsCount > 0 
                      ? Math.round((filteredJobs.length / totalJobsCount) * 100) 
                      : 0;

                    return (
                      <div 
                        key={col.id} 
                        className="bg-white rounded-xl border border-slate-200/50 shadow-inner overflow-hidden flex flex-col min-h-[160px]"
                      >
                        {/* Memanggil Komponen Column Bawaan Anda */}
                        <Column
                          id={col.id as Job['status']}
                          label={col.label}
                          colorClass={col.color}
                          jobs={filteredJobs}
                          quantity={filteredJobs.length}
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