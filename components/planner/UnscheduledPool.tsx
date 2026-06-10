'use client';
import { Droppable } from '@hello-pangea/dnd';
import PlannerJobCard from './PlannerJobCard';

type Job = {
  id: string;
  position: string;
  company: string;
  platform: string;
  priority: string;
  status: string;
  plannedApplyDate: string | null;
};

export default function UnscheduledPool({ jobs }: { jobs: Job[] }) {
  return (
    <div className="w-full md:w-60 flex-shrink-0 bg-white rounded-lg p-3 border shadow-sm">
      <h2 className="font-bold text-sm mb-2 flex items-center justify-between">
        Belum Dijadwalkan
        <span className="text-xs bg-gray-100 rounded-full px-2 py-0.5">
          {jobs.length}
        </span>
      </h2>
      <Droppable droppableId="unscheduled">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[150px] transition-colors rounded ${
              snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'
            } p-2`}
          >
            {jobs.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Semua sudah terjadwal</p>
            ) : (
              jobs.map((job, index) => (
                <PlannerJobCard
                  key={job.id}
                  job={job}
                  index={index}
                  isScheduled={false}
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