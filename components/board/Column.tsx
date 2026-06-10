'use client';
import { Droppable } from '@hello-pangea/dnd';
import JobCard from './JobCard';
import { Status } from '@prisma/client';

type Job = {
  id: string;
  position: string;
  company: string;
  platform: string;
  deadline: string;
  priority: string;
  status: Status;
};

export default function Column({
  title,
  status,
  jobs,
}: {
  title: string;
  status: Status;
  jobs: Job[];
}) {
  const bgColor =
    status === 'TO_BE_APPLY'
      ? 'bg-blue-50'
      : status === 'ON_PROGRESS'
      ? 'bg-yellow-50'
      : status === 'APPLIED'
      ? 'bg-green-50'
      : 'bg-gray-50';

  return (
    <div className={`flex flex-col w-72 flex-shrink-0 rounded-lg p-3 ${bgColor}`}>
      <h2 className="font-bold text-sm mb-2 flex items-center justify-between">
        {title}
        <span className="text-xs bg-white rounded-full px-2 py-0.5">
          {jobs.length}
        </span>
      </h2>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[200px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-100/50' : ''
            }`}
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