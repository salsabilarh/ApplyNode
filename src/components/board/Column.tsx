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
  percentage?: number;
}

/**
 * A single droppable column that displays a list of job cards.
 * Used within the Kanban board to represent a specific application status.
 */
export default function Column({ id, label, colorClass, jobs, quantity }: ColumnProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
      <div className={`px-3 py-2 flex items-center justify-between border-b border-slate-100 ${colorClass}`}>
        <span className="font-bold text-[10px] uppercase tracking-wider">{label}</span>
        <span className="px-2 py-0.5 text-[9px] bg-white/50 rounded-full font-bold">{quantity}</span>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-2 min-h-[120px] transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50/30' : ''}`}
          >
            {jobs.map((job, index) => (
              <JobCard key={job.id} job={job} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}