'use client';
import { Droppable } from '@hello-pangea/dnd';
import PlannerJobCard from './PlannerJobCard';
import { Inbox } from 'lucide-react';
import { Job } from '@/types/job';

interface UnscheduledPoolProps {
  jobs: Job[];
}

export default function UnscheduledPool({ jobs }: UnscheduledPoolProps) {
  return (
    <div className="w-full md:w-64 flex-shrink-0 bg-slate-50/60 rounded-2xl border border-slate-200/50 flex flex-col min-h-[460px]">
      {/* Pool Header */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 rounded-t-2xl flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
        <div className="flex items-center gap-2 text-slate-700">
          <Inbox size={15} className="text-slate-400" />
          <h2 className="font-bold text-xs uppercase tracking-wider text-slate-500">Backlog Lowongan</h2>
        </div>
        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md">
          {jobs.length}
        </span>
      </div>

      {/* Pool Droppable Area */}
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
                <p className="text-[11px] font-medium">Semua item sudah memiliki jadwal eksekusi</p>
              </div>
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