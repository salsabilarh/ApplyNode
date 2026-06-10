'use client';
import { Droppable } from '@hello-pangea/dnd';
import PlannerJobCard from './PlannerJobCard';
import { format, isToday, isTomorrow } from 'date-fns';
import { id } from 'date-fns/locale';

type Job = {
  id: string;
  position: string;
  company: string;
  platform: string;
  priority: string;
  status: string;
  plannedApplyDate: string | null;
};

export default function DayColumn({
  date,
  jobs,
}: {
  date: Date;
  jobs: Job[];
}) {
  const dayLabel = isToday(date)
    ? 'Hari ini'
    : isTomorrow(date)
    ? 'Besok'
    : format(date, 'EEEE', { locale: id });

  const dateString = format(date, 'yyyy-MM-dd');

  return (
    <div className="flex flex-col w-60 flex-shrink-0 bg-white rounded-lg p-3 border shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm capitalize">{dayLabel}</h3>
        <span className="text-xs text-gray-500">
          {format(date, 'd MMM', { locale: id })}
        </span>
      </div>
      <Droppable droppableId={dateString}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[120px] transition-colors rounded ${
              snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'
            } p-2`}
          >
            {jobs.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Kosong</p>
            ) : (
              jobs.map((job, index) => (
                <PlannerJobCard
                  key={job.id}
                  job={job}
                  index={index}
                  isScheduled={true}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}