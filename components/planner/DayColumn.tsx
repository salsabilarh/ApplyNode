'use client';
import { Droppable } from '@hello-pangea/dnd';
import PlannerJobCard from './PlannerJobCard';
import { format, isToday, isSameMonth } from 'date-fns';
import { Priority } from '@prisma/client';

type Job = {
  id: string;
  position: string;
  company: string;
  platform: string;
  priority: Priority;
  status: string;
  plannedApplyDate: string | null;
};

export default function DayColumn({ 
  date, 
  currentMonth, 
  jobs 
}: { 
  date: Date; 
  currentMonth: Date; 
  jobs: Job[] 
}) {
  const isCurrentMonth = isSameMonth(date, currentMonth);
  const isDateToday = isToday(date);
  const dateString = format(date, 'yyyy-MM-dd');

  return (
    <div
      className={`min-h-[110px] md:min-h-[130px] bg-white p-1.5 flex flex-col transition-all duration-200 ${
        !isCurrentMonth ? 'bg-slate-50/60 opacity-40 select-none pointer-events-none md:pointer-events-auto' : ''
      } ${isDateToday ? 'bg-blue-50/20' : ''}`}
    >
      {/* Label Angka Tanggal */}
      <div className="flex justify-between items-center mb-1 px-1">
        <span
          className={`text-xs font-bold rounded-md w-5 h-5 flex items-center justify-center ${
            isDateToday
              ? 'bg-blue-600 text-white shadow-sm'
              : isCurrentMonth
              ? 'text-slate-700'
              : 'text-slate-300'
          }`}
        >
          {format(date, 'd')}
        </span>
        {jobs.length > 0 && (
          <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-full">
            {jobs.length}
          </span>
        )}
      </div>

      {/* Dropzone Area di Dalam Kotak Tanggal */}
      <Droppable droppableId={dateString}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 flex flex-col gap-1 rounded-lg p-1 transition-colors overflow-y-auto max-h-[85px] md:max-h-[105px] custom-scrollbar-thin ${
              snapshot.isDraggingOver ? 'bg-violet-50' : 'bg-transparent'
            }`}
          >
            {jobs.map((job, index) => (
              <PlannerJobCard
                key={job.id}
                job={job}
                index={index}
                isScheduled={true}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}