'use client';

import { Draggable } from '@hello-pangea/dnd';
import Link from 'next/link';
import { Building2, ArrowUpRight, Trash2, CalendarDays, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useModal } from '@/context/ModalContext';
import { getDaysLeft, formatDateShort, getPriorityClass } from '@/lib/utils';
import { Job } from '@/types/job';

interface JobCardProps {
  job: Job;
  index: number;
}

export default function JobCard({ job, index }: JobCardProps) {
  const { openModal } = useModal();
  const daysLeft = getDaysLeft(new Date(job.deadline));
  const isExpired = daysLeft < 0;
  const isClosed = job.status === 'CLOSED' || (job.status !== 'APPLIED' && isExpired);
  const isAppliedStatus = ['APPLIED', 'ADMIN_SCREENING', 'ASSESSMENT', 'FGD_LGD', 'INTERVIEW_HR', 'INTERVIEW_USER', 'INTERVIEW_EXECUTIVE', 'MEDICAL_CHECK_UP', 'OFFERING'].includes(job.status);
  
  const isUrgent = daysLeft >= 0 && !isClosed && !isAppliedStatus;
  const priorityMeta = getPriorityClass(job.priority);

  const handleDelete = async () => {
    openModal({
      onConfirm: async () => {
        const res = await fetch(`/api/jobs/${job.id}`, { method: 'DELETE' });
        if (res.ok) window.location.reload();
      },
      title: 'Delete Job?',
      message: 'This job application will be permanently deleted. This action cannot be undone.'
    });
  };

  const getStatusBadge = () => {
    if (isClosed) return 'neutral';
    if (isAppliedStatus) return 'success';
    if (isUrgent && daysLeft <= 3) return 'danger';
    if (isUrgent) return 'warning';
    return 'neutral';
  };

  const statusBadgeType = getStatusBadge();

  return (
    // Drag diaktifkan untuk semua kartu (termasuk CLOSED)
    <Draggable draggableId={job.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group relative bg-white border rounded-xl p-3 transition-all duration-200 ${
            isClosed
              ? 'border-neutral-200 bg-neutral-50/60 opacity-70 cursor-grab' // tetap grab
              : 'border-neutral-200 hover:border-primary-300 hover:shadow-md hover:-translate-y-0.5 cursor-grab active:cursor-grabbing'
          } ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary-500/20 rotate-1' : ''}`}
        >
          {/* Header */}
          <div className="flex justify-between items-start gap-2 mb-1.5">
            <h3 className={`font-semibold text-sm leading-tight ${
              isClosed ? 'text-neutral-500' : 'text-neutral-800'
            }`}>
              {job.position}
            </h3>
            {isUrgent && (
              <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                daysLeft <= 3
                  ? 'bg-danger-50 text-danger-600 animate-pulse'
                  : 'bg-warning-50 text-warning-600'
              }`}>
                <AlertCircle size={12} />
                {daysLeft === 0 ? 'Due Today' : `H-${daysLeft}`}
              </span>
            )}
          </div>

          {/* Company */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-2.5">
            <Building2 size={14} />
            <span className="line-clamp-1 font-medium">{job.company}</span>
          </div>

          {/* Footer */}
          <div className="pt-2.5 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${priorityMeta.wrapper}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${priorityMeta.dot}`} />
                {priorityMeta.label}
              </span>
              <span className={`badge badge-${statusBadgeType} text-[11px]`}>
                {isClosed ? 'Closed' : isAppliedStatus ? 'In Progress' : 'Open'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                className="p-1.5 text-neutral-400 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                aria-label="Delete job"
              >
                <Trash2 size={14} />
              </button>
              <Link
                href={`/jobs/${job.id}/view`}
                className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                aria-label="View job details"
              >
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          {/* Extra info */}
          {!isClosed && isUrgent && (
            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-neutral-500 bg-neutral-50 rounded-lg px-2 py-1 w-fit">
              <CalendarDays size={11} />
              <span>Deadline: {formatDateShort(new Date(job.deadline))}</span>
            </div>
          )}
          {!isClosed && isAppliedStatus && (
            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-success-600 bg-success-50 rounded-lg px-2 py-1 w-fit">
              <CheckCircle2 size={11} />
              <span>Application active</span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}