'use client';
import { useEffect, useState } from 'react';
import {
  DragDropContext,
  DropResult,
  Droppable,
} from '@hello-pangea/dnd';
import UnscheduledPool from './UnscheduledPool';
import DayColumn from './DayColumn';
import { addDays, format, startOfToday } from 'date-fns';

type Job = {
  id: string;
  position: string;
  company: string;
  platform: string;
  priority: string;
  status: string;
  deadline: string;
  plannedApplyDate: string | null;
};

export default function PlannerClient() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/jobs')
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .finally(() => setLoading(false));
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    let newPlannedDate: string | null = null;
    if (destination.droppableId !== 'unscheduled') {
      newPlannedDate = destination.droppableId; // yyyy-MM-dd
    }

    // Optimistic update
    setJobs((prev) =>
      prev.map((job) =>
        job.id === draggableId
          ? { ...job, plannedApplyDate: newPlannedDate }
          : job
      )
    );

    // Update API
    await fetch(`/api/jobs/${draggableId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plannedApplyDate: newPlannedDate
          ? new Date(newPlannedDate).toISOString()
          : null,
      }),
    });
  };

  if (loading) return <p className="p-4">Loading...</p>;

  // Generate 7 hari ke depan
  const today = startOfToday();
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  // Kelompokkan job
  const unscheduledJobs = jobs.filter(
    (job) =>
      !job.plannedApplyDate &&
      (job.status === 'TO_BE_APPLY' || job.status === 'ON_PROGRESS')
  );

  const getJobsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return jobs.filter((job) => {
      if (!job.plannedApplyDate) return false;
      return job.plannedApplyDate.startsWith(dateStr);
    });
  };

  return (
    <div className="p-4 max-w-full mx-auto">
      <h1 className="text-xl font-bold mb-4">Planner Apply</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          <UnscheduledPool jobs={unscheduledJobs} />
          {days.map((date) => (
            <DayColumn
              key={date.toISOString()}
              date={date}
              jobs={getJobsForDate(date)}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}