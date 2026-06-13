'use client';

import { Droppable } from '@hello-pangea/dnd';
import PlannerJobCard from './PlannerJobCard';
import { format, isToday, isSameMonth } from 'date-fns';
import { Job } from '@/types/job';

interface DayColumnProps {
  date: Date;
  jobs: Job[];
  currentMonth: Date;
}

/**
 * A single day cell in the calendar grid.
 * Shows day number and draggable job cards.
 */
export default function DayColumn({ date, jobs, currentMonth }: DayColumnProps) {
  const isCurrentMonth = isSameMonth(date, currentMonth);
  const isDateToday = isToday(date);
  const dateString = format(date, 'yyyy-MM-dd');

  return (
    <div
      className={`min-h-[140px] bg-white p-2 flex flex-col transition-all ${
        !isCurrentMonth ? 'bg-neutral-50/50' : ''
      }`}
    >
      {/* Day number */}
      <div className="flex justify-between items-center mb-2">
        <span
          className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
            isDateToday
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-neutral-600'
          }`}
        >
          {format(date, 'd')}
        </span>
      </div>

      {/* Droppable area for jobs */}
      <Droppable droppableId={dateString}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar-thin min-h-[80px] rounded-md transition-colors ${
              snapshot.isDraggingOver ? 'bg-primary-50/40 ring-1 ring-primary-200' : ''
            }`}
          >
            {jobs.map((job, index) => (
              <PlannerJobCard key={job.id} job={job} index={index} isScheduled={true} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}