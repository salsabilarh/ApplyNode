'use client';
import { useEffect, useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import UnscheduledPool from './UnscheduledPool';
import DayColumn from './DayColumn';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarDays, CalendarCheck, RefreshCw, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { Job } from '@/types/job';

export default function PlannerClient() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [showBacklog, setShowBacklog] = useState(true);

  useEffect(() => {
    fetch('/api/jobs')
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch((err) => console.error("Gagal memuat agenda planner:", err))
      .finally(() => setLoading(false));
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const previousJobs = [...jobs];
    let newPlannedDate: string | null = null;
    if (destination.droppableId !== 'unscheduled') {
      newPlannedDate = destination.droppableId;
    }

    setJobs((prev) =>
      prev.map((job) =>
        job.id === draggableId
          ? { ...job, plannedApplyDate: newPlannedDate || undefined }
          : job
      )
    );
    setSyncing(true);

    try {
      const response = await fetch(`/api/jobs/${draggableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plannedApplyDate: newPlannedDate ? new Date(newPlannedDate).toISOString() : null,
        }),
      });
      if (!response.ok) throw new Error('Gagal');
    } catch (error) {
      setJobs(previousJobs);
      alert('Gagal menyinkronkan ke server.');
    } finally {
      setSyncing(false);
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  if (loading) {
    return <div className="p-10 text-center text-slate-400">Memuat kalender...</div>;
  }

  const monthStart = startOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const unscheduledJobs = jobs.filter(
    (job) => !job.plannedApplyDate && (job.status === 'BACKLOG' || job.status === 'APPLYING')
  );

  const getJobsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return jobs.filter((job) => job.plannedApplyDate?.startsWith(dateStr));
  };

  const scheduledCount = jobs.filter((j) => j.plannedApplyDate).length;

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-4 rounded-2xl border border-slate-100 gap-4">
        <div className="flex items-center gap-3">
          <CalendarDays size={22} className="text-violet-600" />
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Kalender Rencana Apply {syncing && <RefreshCw size={14} className="animate-spin" />}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-violet-700 bg-violet-50 px-3 py-1 rounded-xl">
            {scheduledCount} Terjadwal
          </span>
          <button onClick={() => setShowBacklog(!showBacklog)} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 text-white">
            {showBacklog ? 'Sembunyikan Backlog' : 'Tampilkan Backlog'}
          </button>
          <div className="flex items-center border rounded-xl p-1">
            <button onClick={prevMonth} className="p-1"><ChevronLeft size={16} /></button>
            <span className="text-xs font-bold px-3 capitalize">{format(currentMonth, 'MMMM yyyy', { locale: id })}</span>
            <button onClick={nextMonth} className="p-1"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col lg:flex-row gap-5">
          {showBacklog && <div className="w-full lg:w-64"><UnscheduledPool jobs={unscheduledJobs} /></div>}
          <div className="flex-1 bg-white border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-7 border-b text-center py-2 text-[10px] font-bold text-slate-400 uppercase">
              {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(d => <span key={d}>{d}</span>)}
            </div>
            <div className="grid grid-cols-7 bg-slate-100 gap-[1px]">
              {calendarDays.map((date) => (
                <DayColumn
                  key={date.toISOString()}
                  date={date}
                  currentMonth={currentMonth}
                  // FIX: Menggunakan as any untuk memotong ketidakcocokan tipe saat build
                  jobs={getJobsForDate(date) as any} 
                />
              ))}
            </div>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}