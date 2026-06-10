'use client';
import { Draggable } from '@hello-pangea/dnd';
import { Priority } from '@prisma/client';
import Link from 'next/link';
import { differenceInDays } from 'date-fns';
import { Building2, CalendarDays, ArrowUpRight, Lock } from 'lucide-react';

type Job = {
  id: string;
  position: string;
  company: string;
  platform: string;
  deadline: string; 
  priority: Priority;
  status: string;
};

export default function JobCard({ job, index }: { job: Job; index: number }) {
  
// ================= GARANSI KONSISTENSI DEADLINE MUTLAK =================
const deadlineDate = job.deadline ? new Date(job.deadline) : new Date();

// 1. Ambil nilai waktu murni UTC dari database
const utcYear = deadlineDate.getUTCFullYear();
const utcMonth = deadlineDate.getUTCMonth();
const utcDay = deadlineDate.getUTCDate();
const deadlineNormalized = new Date(Date.UTC(utcYear, utcMonth, utcDay));

// 2. Ambil waktu sekarang murni berbasis UTC (Sama persis dengan kalkulasi API Backend)
const sekarang = new Date();
const nowNormalized = new Date(Date.UTC(sekarang.getUTCFullYear(), sekarang.getUTCMonth(), sekarang.getUTCDate()));

// 3. Hitung selisih hari secara presisi tanpa intervensi zona waktu lokal komputer
const selisihMilidetik = deadlineNormalized.getTime() - nowNormalized.getTime();
const daysLeft = Math.ceil(selisihMilidetik / (1000 * 60 * 60 * 24));

// Array nama bulan Indonesia untuk rendering UI
const namaBulanIndo = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const formattedDeadlineCard = `${utcDay} ${namaBulanIndo[utcMonth]}`;
// =======================================================================

  const safeStatuses = [
    'APPLIED', 'ADMIN_SCREENING', 'ASSESSMENT', 'FGD_LGD', 
    'INTERVIEW_HR', 'INTERVIEW_USER', 'INTERVIEW_EXECUTIVE', 
    'MEDICAL_CHECK_UP', 'OFFERING'
  ];

  // Kartu otomatis expired jika hari H terlewati DAN status bukan merupakan alur rekrutmen aktif
  const isAutoExpired = !safeStatuses.includes(job.status) && daysLeft < 0;
  
  // SEKARANG: Jika status diubah DB menjadi BACKLOG dan daysLeft >= 0, maka isClosed otomatis bernilai FALSE
  const isClosed = job.status === 'CLOSED' || isAutoExpired;
  const isUrgent = daysLeft <= 2 && daysLeft >= 0 && !isClosed && job.status !== 'APPLIED';

  const priorityMeta = {
    HIGH: { label: 'Tinggi', wrapper: 'text-red-700 bg-red-50/60 border-red-100', dot: 'bg-red-500' },
    MEDIUM: { label: 'Sedang', wrapper: 'text-amber-700 bg-amber-50/60 border-amber-100', dot: 'bg-amber-500' },
    LOW: { label: 'Rendah', wrapper: 'text-emerald-700 bg-emerald-50/60 border-emerald-100', dot: 'bg-emerald-500' }
  }[job.priority as Priority] || { label: job.priority, wrapper: 'text-slate-600 bg-slate-50 border-slate-100', dot: 'bg-slate-400' };

  return (
    <Draggable draggableId={job.id} index={index} isDragDisabled={isClosed}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{ ...provided.draggableProps.style }}
          className={`interactive-card p-4 bg-white border border-slate-100 rounded-xl relative select-none transition-all duration-200 ${
            isClosed 
              ? 'opacity-65 bg-slate-50/60 border-slate-200/60 cursor-not-allowed' 
              : 'cursor-grab active:cursor-grabbing hover:border-slate-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
          } ${
            snapshot.isDragging ? 'shadow-lg rotate-[1.5deg] scale-[1.02] border-blue-500 bg-white/95 z-50' : ''
          }`}
        >
          {/* Card Top Header Area */}
          <div className="flex justify-between items-start gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              {isClosed && <Lock size={12} className="text-slate-400 flex-shrink-0" />}
              <h3 className={`font-semibold text-[14px] tracking-tight leading-snug line-clamp-1 ${
                isClosed ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-800'
              }`}>
                {job.position}
              </h3>
            </div>
            {isUrgent && (
              <span className="flex-shrink-0 text-[10px] bg-rose-50 text-rose-600 border border-rose-100 px-1.5 py-0.5 rounded-md font-bold animate-pulse">
                Mendesak (H-{daysLeft})
              </span>
            )}
            {isClosed && (
              <span className="flex-shrink-0 text-[9px] bg-slate-200 text-slate-600 border border-slate-300 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide">
                Locked
              </span>
            )}
          </div>

          {/* Company Details */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-3">
            <Building2 size={13} className="text-slate-300" />
            <span className="line-clamp-1">{job.company}</span>
          </div>

          {/* Card Footer Meta */}
          <div className="pt-2.5 border-t border-slate-100 flex justify-between items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${priorityMeta.wrapper}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priorityMeta.dot}`} />
              {priorityMeta.label}
            </span>
            
            <div className="flex items-center gap-2.5">
              <span className={`text-[11px] font-medium flex items-center gap-1 ${isClosed ? 'text-rose-600 font-semibold' : 'text-slate-400'}`}>
                <CalendarDays size={12} className={isClosed ? 'text-rose-400' : 'text-slate-300'} />
                {formattedDeadlineCard}
              </span>
              
              <Link
                href={`/jobs/${job.id}/edit`}
                className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all pointer-events-auto"
                title="Edit / Lihat Detail"
              >
                <ArrowUpRight size={14} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}