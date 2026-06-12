'use client';

import { Draggable } from '@hello-pangea/dnd';
import Link from 'next/link';
import { Building2, ArrowUpRight, Trash2, CalendarDays } from 'lucide-react';
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
  const isUrgent = daysLeft <= 2 && daysLeft >= 0 && !isClosed && job.status !== 'APPLIED';

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

  return (
    <Draggable draggableId={job.id} index={index} isDragDisabled={isClosed}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-3 bg-white border border-slate-100 rounded-xl relative select-none transition-all duration-200 ${
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
                onClick={handleDelete}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                aria-label="Delete job"
              >
                <Trash2 size={14} />
              </button>
              <Link
                href={`/jobs/${job.id}/edit`}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                aria-label="Edit job"
              >
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          {!isClosed && !isUrgent && (
            <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
              <CalendarDays size={10} />
              <span>Deadline: {formatDateShort(new Date(job.deadline))}</span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}