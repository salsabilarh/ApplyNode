'use client';
import { Draggable } from '@hello-pangea/dnd';
import { Priority } from '@prisma/client';
import { Edit2 } from 'lucide-react';
import Link from 'next/link';

type Job = {
  id: string;
  position: string;
  company: string;
  platform: string;
  priority: Priority;
  status: string;
  plannedApplyDate: string | null;
};

export default function PlannerJobCard({
  job,
  index,
  isScheduled,
}: {
  job: Job;
  index: number;
  isScheduled: boolean;
}) {
  const priorityColors = {
    HIGH: 'bg-red-500',
    MEDIUM: 'bg-amber-500',
    LOW: 'bg-emerald-500'
  }[job.priority];

  return (
    <Draggable draggableId={job.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-slate-50 rounded-md p-1.5 border border-slate-200/60 flex items-start gap-1.5 select-none cursor-grab active:cursor-grabbing hover:bg-white hover:shadow-sm transition-all text-left group relative ${
            snapshot.isDragging 
              ? 'shadow-xl scale-105 border-violet-500 bg-white z-50 ring-2 ring-violet-500/10' 
              : ''
          }`}
        >
          {/* Dot Indicator Prioritas */}
          <span className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${priorityColors}`} />
          
          <div className="min-w-0 flex-1 leading-tight pr-4">
            <h4 className="font-bold text-[10px] text-slate-800 tracking-tight line-clamp-1">
              {job.position}
            </h4>
            <p className="text-[9px] text-slate-400 font-medium truncate">
              {job.company}
            </p>
          </div>

          {/* Tombol Aksi Edit Instan (Muncul Pop-up halus saat di-hover) */}
          <Link
            href={`/jobs/${job.id}/edit`}
            className="absolute right-1 top-1.5 p-1 rounded bg-slate-100 hover:bg-blue-50 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-150"
            title="Edit Detail Lowongan"
          >
            <Edit2 size={8} strokeWidth={2.5} />
          </Link>
        </div>
      )}
    </Draggable>
  );
}