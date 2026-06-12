'use client';

import { Droppable } from '@hello-pangea/dnd';
import PlannerJobCard from './PlannerJobCard';
import { Inbox } from 'lucide-react';
import { Job } from '@/types/job';

interface UnscheduledPoolProps {
  jobs: Job[];
}

/**
 * Sidebar pool for jobs that haven't been scheduled yet.
 * Acts as a source for drag & drop into the calendar.
 */
export default function UnscheduledPool({ jobs }: UnscheduledPoolProps) {
  return (
    <div className="w-full md:w-64 flex-shrink-0 bg-slate-50/60 rounded-2xl border border-slate-200/50 flex flex-col min-h-[460px]">
      <div className="px-4 py-3 bg-white border-b border-slate-100 rounded-t-2xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 text-slate-700">
          <Inbox size={15} className="text-slate-400" />
          <h2 className="font-bold text-xs uppercase tracking-wider text-slate-500">Job Backlog</h2>
        </div>
        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md">
          {jobs.length}
        </span>
      </div>

      <Droppable droppableId="unscheduled">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 flex flex-col gap-2 transition-colors overflow-y-auto max-h-[500px] custom-scrollbar ${
              snapshot.isDraggingOver ? 'bg-purple-50/30' : 'bg-transparent'
            }`}
          >
            {jobs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Inbox size={24} className="text-slate-200 mb-1" />
                <p className="text-[11px] font-medium">All items are scheduled</p>
              </div>
            ) : (
              jobs.map((job, index) => (
                <PlannerJobCard key={job.id} job={job} index={index} isScheduled={false} />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}