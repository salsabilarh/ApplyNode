'use client';

import { useEffect, useState, useCallback } from 'react';
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

/**
 * Client component for the monthly planner view.
 * Allows drag & drop scheduling of job applications.
 */
export default function PlannerClient() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [showBacklog, setShowBacklog] = useState(true);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/jobs');
      if (!res.ok) throw new Error('Gagal memuat data');
      const data = await res.json();
      // Handle both direct array and { success: true, data: [] } format
      const jobsData = Array.isArray(data) ? data : (data.data || []);
      
      // Ensure date strings are valid (API returns ISO strings)
      const normalizedJobs = jobsData.map((job: any) => ({
        ...job,
        deadline: job.deadline,
        openingDate: job.openingDate || null,
        plannedApplyDate: job.plannedApplyDate || null,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      }));
      setJobs(normalizedJobs);
    } catch (err) {
      console.error('Gagal memuat data planner:', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const onDragEnd = useCallback(async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    const previousJobs = [...jobs];
    let newPlannedDate: string | null = null;
    if (destination.droppableId !== 'unscheduled') {
      newPlannedDate = destination.droppableId; // YYYY-MM-DD
    }

    // Optimistic UI update - update plannedApplyDate as string
    setJobs(prev =>
      prev.map(job =>
        job.id === draggableId ? { ...job, plannedApplyDate: newPlannedDate } : job
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
      if (!response.ok) throw new Error('Gagal menyimpan jadwal');
      await fetchJobs(); // Refresh to ensure consistency
    } catch (error) {
      setJobs(previousJobs);
      alert('Gagal menyinkronkan jadwal. Perubahan dibatalkan.');
    } finally {
      setSyncing(false);
    }
  }, [jobs, fetchJobs]);

  const nextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const prevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-1">
        <div className="h-14 bg-slate-200 rounded-2xl w-full" />
        <div className="h-[500px] bg-slate-100/80 rounded-2xl border border-slate-200/40 w-full" />
      </div>
    );
  }

  const safeJobs = Array.isArray(jobs) ? jobs : [];
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const unscheduledJobs = safeJobs.filter(
    job => !job.plannedApplyDate && (job.status === 'BACKLOG' || job.status === 'APPLYING')
  );

  const getJobsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return safeJobs.filter(job => job.plannedApplyDate === dateStr);
  };

  const scheduledCount = safeJobs.filter(j => j.plannedApplyDate).length;
  const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      {/* Header Widget */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <CalendarDays size={22} className="text-violet-600" strokeWidth={2.2} />
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Kalender Rencana Apply
              {syncing && <RefreshCw size={13} className="text-violet-500 animate-spin" />}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Drag & drop lowongan ke tanggal yang direncanakan.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-xl border border-violet-100/60">
            <CalendarCheck size={13} /> {scheduledCount} Terjadwal
          </span>
          <button
            onClick={() => setShowBacklog(prev => !prev)}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
              showBacklog ? 'bg-slate-800 text-white border-transparent' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Inbox size={13} /> {showBacklog ? 'Sembunyikan Backlog' : 'Tampilkan Backlog'}
          </button>

          {/* Month Navigator */}
          <div className="flex items-center border border-slate-200 bg-slate-50/50 p-1 rounded-xl">
            <button onClick={prevMonth} className="p-1.5 hover:bg-white rounded-lg text-slate-600 active:scale-95 transition-all" aria-label="Bulan sebelumnya">
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-slate-800 px-3 min-w-[110px] text-center capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: id })}
            </span>
            <button onClick={nextMonth} className="p-1.5 hover:bg-white rounded-lg text-slate-600 active:scale-95 transition-all" aria-label="Bulan berikutnya">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Drag & Drop Workspace */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Backlog Side Pool */}
          {showBacklog && (
            <div className="w-full lg:w-72 flex-shrink-0">
              <UnscheduledPool jobs={unscheduledJobs} />
            </div>
          )}

          {/* Calendar Grid */}
          <div className="flex-1 w-full bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
              {dayNames.map(day => (
                <div key={day} className="py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 bg-slate-100 gap-[1px]">
              {calendarDays.map(date => (
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