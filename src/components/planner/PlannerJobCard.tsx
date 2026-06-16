'use client';

import { Draggable } from '@hello-pangea/dnd';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { Job } from '@/types/job';

interface PlannerJobCardProps {
  job: Job;
  index: number;
  isScheduled: boolean;
}

export default function PlannerJobCard({ job, index, isScheduled }: PlannerJobCardProps) {
  // Priority bisa null, gunakan fallback 'bg-neutral-400'
  const priorityColors = { HIGH: 'bg-danger-500', MEDIUM: 'bg-warning-500', LOW: 'bg-success-500' };
  const priorityColor = job.priority ? priorityColors[job.priority] : 'bg-neutral-400';
  const hasAppliedDate = !!job.appliedDate;

  return (
    <Draggable draggableId={job.id} index={index} isDragDisabled={hasAppliedDate}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group relative bg-white rounded-lg p-2 border border-neutral-200 flex items-start gap-2 select-none transition-all ${
            hasAppliedDate 
              ? 'opacity-75 cursor-default border-neutral-100' 
              : 'cursor-grab active:cursor-grabbing hover:shadow-sm hover:border-primary-300'
          } ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary-500/20 scale-105 z-50 border-primary-400' : ''}`}
        >
          <span className={`w-2 h-2 rounded-full mt-0.5 flex-shrink-0 ${priorityColor}`} />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-[11px] text-neutral-800 leading-tight truncate">
              {job.position}
            </h4>
            <p className="text-[10px] text-neutral-500 truncate mt-0.5">{job.company}</p>
          </div>
          <Link
            href={`/jobs/${job.id}/view`}
            className="absolute right-1.5 top-1.5 p-1 rounded-md bg-neutral-100 text-neutral-400 opacity-0 group-hover:opacity-100 hover:bg-primary-50 hover:text-primary-600 transition-all"
            aria-label="View job details"
          >
            <Eye size={10} strokeWidth={2.5} />
          </Link>
          {hasAppliedDate && (
            <span className="absolute bottom-1 right-1 bg-green-100 text-green-700 text-[8px] px-1 py-0.5 rounded-full">
              Applied
            </span>
          )}
        </div>
      )}
    </Draggable>
  );
}