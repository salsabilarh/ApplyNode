'use client';
import { useEffect, useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import Column from './Column';
import { Status } from '@prisma/client';
import Link from 'next/link';

type Job = {
  id: string;
  position: string;
  company: string;
  platform: string;
  deadline: string;
  priority: string;
  status: Status;
};

const columnsData = [
  { title: 'To Be Apply', status: 'TO_BE_APPLY' as Status },
  { title: 'On Progress', status: 'ON_PROGRESS' as Status },
  { title: 'Applied', status: 'APPLIED' as Status },
  { title: 'Closed', status: 'CLOSED' as Status },
];

export default function BoardClient() {
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

    // Optimistic update
    setJobs((prev) =>
      prev.map((job) =>
        job.id === draggableId
          ? { ...job, status: destination.droppableId as Status }
          : job
      )
    );

    // Update API
    await fetch(`/api/jobs/${draggableId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: destination.droppableId }),
    });
  };

  if (loading) return <p className="p-4">Loading...</p>;

  // Kelompokkan jobs berdasarkan status
  const grouped = columnsData.map((col) => ({
    ...col,
    jobs: jobs.filter((job) => job.status === col.status),
  }));

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Board Lamaran</h1>
        <Link href="/jobs/new" className="bg-blue-600 text-white px-4 py-2 rounded">
          + Tambah
        </Link>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {grouped.map((col) => (
            <Column key={col.status} title={col.title} status={col.status} jobs={col.jobs} />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}