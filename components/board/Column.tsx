'use client';

import { Droppable, Draggable } from '@hello-pangea/dnd';
import JobCard from './JobCard'; // Sesuaikan dengan nama komponen kartu Anda

interface ColumnProps {
  id: string;
  label: string;
  colorClass: string;
  jobs: any[];
  quantity: number;
  percentage: number;
  onStatusChange: (id: string, nextStatus: any) => void;
}

export default function Column({ id, label, colorClass, jobs, quantity, percentage }: ColumnProps) {
  return (
    <div className="flex flex-col w-full h-full">
      {/* Header Sub-Kolom */}
      <div className={`px-3 py-2 flex items-center justify-between border-b border-slate-100 ${colorClass}`}>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[11px] tracking-tight">{label}</span>
          <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-white/60 rounded-md">
            {quantity}
          </span>
        </div>
        {quantity > 0 && (
          <span className="text-[9px] font-medium opacity-60">{percentage}%</span>
        )}
      </div>

      {/* Area Droppable Kontainer Adaptif */}
      {/* Area Droppable Kontainer Adaptif */}
<Droppable droppableId={id}>
  {(provided, snapshot) => (
    <div
      ref={provided.innerRef}
      {...provided.droppableProps}
      className={`p-2 flex flex-col gap-2 transition-all duration-300 rounded-b-xl ${
        snapshot.isDraggingOver ? 'bg-slate-100/70' : 'bg-transparent'
      } ${
        jobs.length === 0 
          ? 'min-h-[48px] justify-center items-center' 
          : 'h-auto min-h-[120px]' 
      }`}
    >
      {jobs.length === 0 ? (
        <p className="text-[10px] text-slate-300 font-medium tracking-wide pointer-events-none select-none animate-pulse">
          Drop di sini
        </p>
      ) : (
        jobs.map((job, index) => (
          // Cukup panggil JobCard dan oper property index ke dalamnya
          <JobCard key={job.id} job={job} index={index} />
        ))
      )}
      {provided.placeholder}
    </div>
  )}
</Droppable>
    </div>
  );
}