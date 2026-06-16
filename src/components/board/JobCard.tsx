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

  const deadlineDate = job.deadline ? new Date(job.deadline) : null;
  const hasDeadline = deadlineDate !== null;
  const daysLeft = hasDeadline ? getDaysLeft(deadlineDate!) : null;
  const isExpired = hasDeadline ? daysLeft! < 0 : false;

  const isClosed = job.status === 'CLOSED';
  const isOpenStatus = job.status === 'BACKLOG' || job.status === 'APPLYING';
  const isInProgress = [
    'APPLIED', 'ADMIN_SCREENING', 'ASSESSMENT', 'FGD_LGD',
    'INTERVIEW_HR', 'INTERVIEW_USER', 'INTERVIEW_EXECUTIVE',
    'MEDICAL_CHECK_UP', 'OFFERING'
  ].includes(job.status);
  
  const isUrgent = hasDeadline && daysLeft !== null && daysLeft >= 0 && isOpenStatus && !isExpired;
  
  // ✅ Hanya dapatkan priorityMeta jika priority ada
  const priorityMeta = job.priority ? getPriorityClass(job.priority) : null;
  
  const getStatusBadge = () => {
    if (isClosed) return 'neutral';
    if (isInProgress) return 'success';
    return 'warning';
  };

  const statusBadgeType = getStatusBadge();
  const statusLabel = isClosed ? 'Closed' : (isInProgress ? 'In Progress' : 'Open');

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

  return (
    <Draggable draggableId={job.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group relative bg-white border rounded-xl p-3 transition-all duration-200 ${
            isClosed
              ? 'border-neutral-200 bg-neutral-50/60 opacity-70 cursor-grab'
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
            {isUrgent && daysLeft !== null && (
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

          {/* Deadline - Always show if exists */}
          {hasDeadline && deadlineDate && (
            <div className="mb-2.5 flex items-center gap-1.5 text-[11px] text-neutral-500 bg-neutral-50 rounded-lg px-2 py-1 w-fit">
              <CalendarDays size={11} />
              <span>Deadline: {formatDateShort(deadlineDate)}</span>
            </div>
          )}

          {/* Footer */}
          <div className="pt-2.5 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* ✅ Hanya tampilkan priority jika ada */}
              {priorityMeta && (
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${priorityMeta.wrapper}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${priorityMeta.dot}`} />
                  {priorityMeta.label}
                </span>
              )}
              <span className={`badge badge-${statusBadgeType} text-[11px]`}>
                {statusLabel}
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

          {/* Application active indicator (only for in progress) */}
          {!isClosed && isInProgress && (
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