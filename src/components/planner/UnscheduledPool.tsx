'use client';

import { Droppable } from '@hello-pangea/dnd';
import PlannerJobCard from './PlannerJobCard';
import { Inbox } from 'lucide-react';
import { Job } from '@/types/job';

interface UnscheduledPoolProps {
  jobs: Job[];
}

/**
 * Sidebar pool for jobs without a planned apply date.
 * Acts as a drag source for the calendar.
 */
export default function UnscheduledPool({ jobs }: UnscheduledPoolProps) {
  return (
    <div className="w-full lg:w-72 flex-shrink-0 bg-white rounded-2xl border border-neutral-200 shadow-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-neutral-50/80 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Inbox size={16} className="text-neutral-500" />
          <h2 className="text-xs font-bold uppercase tracking-wide text-neutral-600">
            Job Backlog
          </h2>
        </div>
        <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 text-[10px] font-bold bg-white border border-neutral-200 rounded-full text-neutral-600 shadow-sm">
          {jobs.length}
        </span>
      </div>

      {/* Droppable area */}
      <Droppable droppableId="unscheduled">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 flex flex-col gap-2 transition-colors overflow-y-auto max-h-[500px] ${
              snapshot.isDraggingOver ? 'bg-primary-50/30' : 'bg-white'
            }`}
          >
            {jobs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10 text-neutral-400">
                <Inbox size={28} className="text-neutral-300 mb-2" />
                <p className="text-xs font-medium">All jobs scheduled</p>
                <p className="text-[10px] mt-1">Drag jobs from calendar to reschedule</p>
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