'use client';

import { Draggable } from '@hello-pangea/dnd';
import { Priority } from '@prisma/client';
import Link from 'next/link';
import { Building2, ArrowUpRight, Lock, Trash2, CalendarDays } from 'lucide-react';
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

interface JobCardProps {
  job: Job;
  index: number;
  onStatusChange?: (id: string, nextStatus: string) => void;
}

/**
 * Draggable card representing a single job application.
 * Shows priority, deadline urgency, and provides edit/delete actions.
 */
export default function JobCard({ job, index, onStatusChange }: JobCardProps) {
  const { openModal } = useModal();

  // Normalize deadline to UTC date for consistent day calculation
  const deadlineDate = new Date(job.deadline);
  const utcDeadline = new Date(Date.UTC(deadlineDate.getUTCFullYear(), deadlineDate.getUTCMonth(), deadlineDate.getUTCDate()));
  const today = new Date();
  const utcToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const daysLeft = Math.ceil((utcDeadline.getTime() - utcToday.getTime()) / (1000 * 60 * 60 * 24));

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const formattedDeadline = `${deadlineDate.getUTCDate()} ${monthNames[deadlineDate.getUTCMonth()]}`;

  const safeStatuses = [
    'APPLIED', 'ADMIN_SCREENING', 'ASSESSMENT', 'FGD_LGD',
    'INTERVIEW_HR', 'INTERVIEW_USER', 'INTERVIEW_EXECUTIVE',
    'MEDICAL_CHECK_UP', 'OFFERING'
  ];
  const isAutoExpired = !safeStatuses.includes(job.status) && daysLeft < 0;
  const isClosed = job.status === 'CLOSED' || isAutoExpired;
  const isUrgent = daysLeft <= 2 && daysLeft >= 0 && !isClosed && job.status !== 'APPLIED';

  const priorityMeta = {
    HIGH: { label: 'Tinggi', wrapper: 'text-red-700 bg-red-50/60 border-red-100', dot: 'bg-red-500' },
    MEDIUM: { label: 'Sedang', wrapper: 'text-amber-700 bg-amber-50/60 border-amber-100', dot: 'bg-amber-500' },
    LOW: { label: 'Rendah', wrapper: 'text-emerald-700 bg-emerald-50/60 border-emerald-100', dot: 'bg-emerald-500' }
  }[job.priority] || { label: job.priority, wrapper: 'text-slate-600 bg-slate-50 border-slate-100', dot: 'bg-slate-400' };

  const handleDelete = async () => {
    await fetch(`/api/jobs/${job.id}`, { method: 'DELETE' });
    window.location.reload();
  };

  return (
    <Draggable draggableId={job.id} index={index} isDragDisabled={isClosed}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`interactive-card p-3 bg-white border border-slate-100 rounded-xl relative select-none transition-all duration-200 ${
            isClosed ? 'opacity-65 bg-slate-50/60 border-slate-200/60 cursor-not-allowed' : 'cursor-grab hover:border-slate-300 hover:shadow-sm'
          }`}
        >
          <div className="flex justify-between items-start gap-2 mb-1.5">
            <h3 className={`font-semibold text-sm ${isClosed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
              {job.position}
            </h3>
            {isUrgent && (
              <span className="text-[10px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-md font-bold animate-pulse">
                H-{daysLeft}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-3">
            <Building2 size={13} />
            <span className="line-clamp-1">{job.company}</span>
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex justify-between items-center">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${priorityMeta.wrapper}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priorityMeta.dot}`} />
              {priorityMeta.label}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => openModal({
                  onConfirm: handleDelete,
                  title: 'Hapus Lowongan?',
                  message: 'Data lamaran ini akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.'
                })}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                aria-label="Hapus Lowongan"
              >
                <Trash2 size={14} />
              </button>
              <Link
                href={`/jobs/${job.id}/edit`}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                aria-label="Edit Lowongan"
              >
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          {/* Show deadline if not closed and not urgent */}
          {!isClosed && !isUrgent && (
            <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
              <CalendarDays size={10} />
              <span>Deadline: {formattedDeadline}</span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}