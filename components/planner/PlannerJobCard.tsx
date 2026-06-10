'use client';
import { Draggable } from '@hello-pangea/dnd';
import { JobType, Priority, Status } from '@prisma/client';

type Job = {
  id: string;
  position: string;
  company: string;
  platform: string;
  priority: Priority;
  status: Status;
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
  return (
    <Draggable draggableId={job.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg p-2 border shadow-sm mb-2 ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-300' : ''
          }`}
        >
          <p className="font-semibold text-sm">{job.position}</p>
          <p className="text-xs text-gray-600">{job.company}</p>
          <div className="flex justify-between items-center mt-1">
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                job.priority === 'HIGH'
                  ? 'bg-red-100 text-red-700'
                  : job.priority === 'MEDIUM'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {job.priority}
            </span>
            {isScheduled && (
              <span className="text-xs text-gray-500">
                {job.plannedApplyDate
                  ? new Date(job.plannedApplyDate).toLocaleDateString('id-ID', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })
                  : ''}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}