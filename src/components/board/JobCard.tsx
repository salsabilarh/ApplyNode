'use client';
import { Draggable } from '@hello-pangea/dnd';
import { Priority } from '@prisma/client';
import Link from 'next/link';
import { Building2, CalendarDays, ArrowUpRight, Lock, Trash2 } from 'lucide-react';
import { useModal } from '@/context/ModalContext';

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
  // ================= GARANSI KONSISTENSI DEADLINE =================
  const deadlineDate = job.deadline ? new Date(job.deadline) : new Date();
  const utcYear = deadlineDate.getUTCFullYear();
  const utcMonth = deadlineDate.getUTCMonth();
  const utcDay = deadlineDate.getUTCDate();
  const deadlineNormalized = new Date(Date.UTC(utcYear, utcMonth, utcDay));
  const sekarang = new Date();
  const nowNormalized = new Date(Date.UTC(sekarang.getUTCFullYear(), sekarang.getUTCMonth(), sekarang.getUTCDate()));
  const selisihMilidetik = deadlineNormalized.getTime() - nowNormalized.getTime();
  const daysLeft = Math.ceil(selisihMilidetik / (1000 * 60 * 60 * 24));
  const namaBulanIndo = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const formattedDeadlineCard = `${utcDay} ${namaBulanIndo[utcMonth]}`;

  const safeStatuses = ['APPLIED', 'ADMIN_SCREENING', 'ASSESSMENT', 'FGD_LGD', 'INTERVIEW_HR', 'INTERVIEW_USER', 'INTERVIEW_EXECUTIVE', 'MEDICAL_CHECK_UP', 'OFFERING'];
  const isAutoExpired = !safeStatuses.includes(job.status) && daysLeft < 0;
  const isClosed = job.status === 'CLOSED' || isAutoExpired;
  const isUrgent = daysLeft <= 2 && daysLeft >= 0 && !isClosed && job.status !== 'APPLIED';

  const priorityMeta = {
    HIGH: { label: 'Tinggi', wrapper: 'text-red-700 bg-red-50/60 border-red-100', dot: 'bg-red-500' },
    MEDIUM: { label: 'Sedang', wrapper: 'text-amber-700 bg-amber-50/60 border-amber-100', dot: 'bg-amber-500' },
    LOW: { label: 'Rendah', wrapper: 'text-emerald-700 bg-emerald-50/60 border-emerald-100', dot: 'bg-emerald-500' }
  }[job.priority as Priority] || { label: job.priority, wrapper: 'text-slate-600 bg-slate-50 border-slate-100', dot: 'bg-slate-400' };

  const { openModal } = useModal();

  const handleDelete = async () => {
    // Logika hapus asli Anda
    await fetch(`/api/jobs/${job.id}`, { method: 'DELETE' });
    window.location.reload();
  };

  return (
    <Draggable draggableId={job.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group p-3 bg-white border border-slate-100 rounded-lg hover:shadow-md transition-all ${snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-500' : ''}`}
        >
          <h3 className="font-bold text-xs text-slate-800 line-clamp-2 mb-1">{job.position}</h3>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-3">
            <Building2 size={11} /> {job.company}
          </div>
          
          <div className="flex justify-between items-center border-t border-slate-50 pt-2">
            <span className="text-[9px] font-bold uppercase text-slate-400">{job.priority}</span>
            <div className="flex gap-1">
              <button onClick={handleDelete} className="p-1.5 text-slate-300 hover:text-red-500 rounded hover:bg-red-50"><Trash2 size={13}/></button>
              <Link href={`/jobs/${job.id}/edit`} className="p-1.5 text-slate-300 hover:text-blue-600 rounded hover:bg-blue-50"><ArrowUpRight size={13}/></Link>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}