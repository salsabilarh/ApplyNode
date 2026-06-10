'use client';
import { Draggable } from '@hello-pangea/dnd';
import { JobType, Priority, Status } from '@prisma/client';
import Link from 'next/link';
import { differenceInDays } from 'date-fns';
import { Badge } from 'lucide-react'; // opsional, nanti kita ganti dengan teks

type Job = {
  id: string;
  position: string;
  company: string;
  platform: string;
  deadline: string; // ISO string
  priority: Priority;
  status: Status;
};

export default function JobCard({ job, index }: { job: Job; index: number }) {
  const deadlineDate = new Date(job.deadline);
  const now = new Date();
  const daysLeft = differenceInDays(deadlineDate, now);
  const isUrgent = daysLeft <= 2 && job.status !== 'CLOSED' && job.status !== 'APPLIED';

  return (
    <Draggable draggableId={job.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg p-3 border shadow-sm mb-2 ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-300' : ''
          }`}
        >
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-sm">{job.position}</h3>
            {isUrgent && (
              <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                H-{daysLeft >= 0 ? daysLeft : '0'}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-1">{job.company}</p>
          <p className="text-xs text-gray-500">{job.platform}</p>
          <div className="flex justify-between items-center mt-2">
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
            <Link
              href={`/jobs/${job.id}/edit`}
              className="text-xs text-blue-600 hover:underline"
            >
              Edit
            </Link>
          </div>
        </div>
      )}
    </Draggable>
  );
}