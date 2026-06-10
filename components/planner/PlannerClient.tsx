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
  subMonths,
  parseISO
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

    // Optimistic UI Update
    setJobs((prev) =>
      prev.map((job) =>
        job.id === draggableId
          ? { ...job, plannedApplyDate: newPlannedDate }
          : job
      )
    );
    setSyncing(true);

    try {
      const response = await fetch(`/api/jobs/${draggableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plannedApplyDate: newPlannedDate
            ? new Date(newPlannedDate).toISOString()
            : null,
        }),
      });
      if (!response.ok) throw new Error('Gagal memperbarui di server');
    } catch (error) {
      setJobs(previousJobs);
      alert('Gagal menyinkronkan jadwal ke database. Sesi dipulihkan.');
    } finally {
      setSyncing(false);
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-1">
        <div className="h-14 bg-slate-200 rounded-2xl w-full"></div>
        <div className="h-[500px] bg-slate-100/80 rounded-2xl border border-slate-200/40 w-full" />
      </div>
    );
  }

  // Logika pembentukan Grid Kalender Bulanan
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Dimulai hari Senin
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const unscheduledJobs = jobs.filter(
    (job) => !job.plannedApplyDate && (job.status === 'BACKLOG' || job.status === 'APPLYING')
  );

  const getJobsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return jobs.filter((job) => job.plannedApplyDate?.startsWith(dateStr));
  };

  const scheduledCount = jobs.filter((j) => j.plannedApplyDate).length;
  const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      {/* Header Widget */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.01)] gap-4">
        <div className="flex items-center gap-3">
          <CalendarDays size={22} className="text-violet-600" strokeWidth={2.2} />
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Kalender Rencana Apply
              {syncing && <RefreshCw size={13} className="text-violet-500 animate-spin" />}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Kelola eksekusi berkas lamaran Anda dengan layout kalender bulanan interaktif.
            </p>
          </div>
        </div>

        {/* Controls & Metrics */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-xl border border-violet-100/60">
            <CalendarCheck size={13} />
            {scheduledCount} Terjadwal
          </span>

          <button
            onClick={() => setShowBacklog(!showBacklog)}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
              showBacklog 
                ? 'bg-slate-800 text-white border-transparent' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Inbox size={13} />
            <span>{showBacklog ? 'Sembunyikan Backlog' : 'Tampilkan Backlog'}</span>
          </button>

          {/* Navigator Bulan */}
          <div className="flex items-center border border-slate-200 bg-slate-50/50 p-1 rounded-xl">
            <button onClick={prevMonth} className="p-1.5 hover:bg-white rounded-lg text-slate-600 active:scale-95 transition-all">
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-slate-800 px-3 min-w-[110px] text-center capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: id })}
            </span>
            <button onClick={nextMonth} className="p-1.5 hover:bg-white rounded-lg text-slate-600 active:scale-95 transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Drag & Drop Workspace */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          
          {/* Backlog Side Pool */}
          {showBacklog && (
            <div className="w-full lg:w-64 flex-shrink-0">
              <UnscheduledPool jobs={unscheduledJobs} />
            </div>
          )}

          {/* Grid Kalender Sebenarnya */}
          <div className="flex-1 w-full bg-white border border-slate-200/60 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] overflow-hidden">
            {/* Header Nama Hari */}
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/60 text-center py-2.5">
              {dayNames.map((day, idx) => (
                <span 
                  key={day} 
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    idx >= 5 ? 'text-rose-500' : 'text-slate-400'
                  }`}
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Grid Box Tanggal */}
            <div className="grid grid-cols-7 bg-slate-100 gap-[1px]">
              {calendarDays.map((date) => (
                <DayColumn
                  key={date.toISOString()}
                  date={date}
                  currentMonth={currentMonth}
                  jobs={getJobsForDate(date)}
                />
              ))}
            </div>
          </div>

        </div>
      </DragDropContext>
    </div>
  );
}