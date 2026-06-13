'use client';

import { Droppable } from '@hello-pangea/dnd';
import JobCard from './JobCard';
import { Job } from '@/types/job';

interface ColumnProps {
  id: string;
  label: string;
  colorClass: string;
  jobs: Job[];
  quantity: number;
}

export default function Column({ id, label, colorClass, jobs, quantity }: ColumnProps) {
  return (
    <div className="flex flex-col">
      {/* Column Header */}
      <div className={`px-3 py-2.5 flex items-center justify-between border-b border-neutral-100 ${colorClass}`}>
        <span className="font-bold text-[11px] uppercase tracking-wider">{label}</span>
        <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 text-[10px] font-bold bg-white/70 rounded-full text-neutral-700 shadow-sm">
          {quantity}
        </span>
      </div>

      {/* Droppable Area - consistent gap between cards */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-2 transition-all duration-200 ${
              snapshot.isDraggingOver 
                ? 'bg-primary-50/40 ring-1 ring-primary-200' 
                : 'bg-white'
            }`}
          >
            <div className="flex flex-col gap-2">
              {jobs.length === 0 && !snapshot.isDraggingOver && (
                <div className="flex flex-col items-center justify-center py-6 text-neutral-400 text-xs select-none">
                  <span className="text-neutral-300">∅</span>
                  <span className="mt-1">No jobs</span>
                </div>
              )}
              {jobs.map((job, index) => (
                <JobCard key={job.id} job={job} index={index} />
              ))}
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>
    </div>
  );
}