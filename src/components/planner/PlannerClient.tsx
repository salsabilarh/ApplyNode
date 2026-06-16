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
  subMonths,
  startOfDay,
} from 'date-fns';
import { enUS } from 'date-fns/locale'; // Gunakan locale Inggris
import {
  CalendarDays,
  CalendarCheck,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Briefcase,
} from 'lucide-react';
import { Job } from '@/types/job';
import AlertModal from '@/components/ui/AlertModal';

const ADVANCED_STATUSES = [
  'APPLIED',
  'ADMIN_SCREENING',
  'ASSESSMENT',
  'FGD_LGD',
  'INTERVIEW_HR',
  'INTERVIEW_USER',
  'INTERVIEW_EXECUTIVE',
  'MEDICAL_CHECK_UP',
  'OFFERING',
];

export default function PlannerClient() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [showBacklog, setShowBacklog] = useState(true);
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
  });
  const [confirmReschedule, setConfirmReschedule] = useState<{
    isOpen: boolean;
    jobId: string;
    jobPosition: string;
    jobCompany: string;
    newDate: string | null;
  }>({ isOpen: false, jobId: '', jobPosition: '', jobCompany: '', newDate: null });
  const [confirmUnschedule, setConfirmUnschedule] = useState<{
    isOpen: boolean;
    jobId: string;
    jobPosition: string;
    jobCompany: string;
  }>({ isOpen: false, jobId: '', jobPosition: '', jobCompany: '' });

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/jobs');
      if (!res.ok) throw new Error('Failed to load data');
      const result = await res.json();
      const jobsData = result.success ? result.data : result;
      const normalizedJobs = (Array.isArray(jobsData) ? jobsData : []).map((job: any) => ({
        ...job,
        plannedApplyDate: job.plannedApplyDate ? job.plannedApplyDate.split('T')[0] : null,
        appliedDate: job.appliedDate ? job.appliedDate.split('T')[0] : null,
        openingDate: job.openingDate ? job.openingDate.split('T')[0] : null,
        deadline: job.deadline ? job.deadline.split('T')[0] : null,
      }));
      setJobs(normalizedJobs);
    } catch (err) {
      console.error('Failed to load planner data:', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const moveToBacklogAndClearDate = useCallback(async (jobId: string) => {
    setSyncing(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'BACKLOG', plannedApplyDate: null }),
      });
      if (!response.ok) throw new Error('Failed to move to backlog');
      await fetchJobs();
    } catch (error) {
      setAlertModal({
        isOpen: true,
        title: 'Failed',
        message: 'Could not move job to backlog. Please try again.',
      });
    } finally {
      setSyncing(false);
    }
  }, [fetchJobs]);

const handleConfirmReschedule = useCallback(async () => {
  const { jobId, newDate } = confirmReschedule;
  if (!jobId) return;

  if (newDate) {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    if (newDate < todayStr) {
      setAlertModal({
        isOpen: true,
        title: 'Invalid Date',
        message: 'You cannot schedule a job on a past date. Please choose today or a future date.',
      });
      setConfirmReschedule({ isOpen: false, jobId: '', jobPosition: '', jobCompany: '', newDate: null });
      return;
    }
    const job = jobs.find(j => j.id === jobId);
    if (job && job.deadline && newDate > job.deadline) {
      setAlertModal({
        isOpen: true,
        title: 'Date Exceeds Deadline',
        message: `The selected date (${newDate}) is after the deadline (${job.deadline}).\nPlease choose a date on or before the deadline.`,
      });
      setConfirmReschedule({ isOpen: false, jobId: '', jobPosition: '', jobCompany: '', newDate: null });
      return;
    }
  }

  try {
    const response = await fetch(`/api/jobs/${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plannedApplyDate: newDate }),
    });
    if (!response.ok) throw new Error();
    await fetchJobs();
  } catch (error) {
    setAlertModal({ isOpen: true, title: 'Failed', message: 'Could not reschedule.' });
  } finally {
    setConfirmReschedule({ isOpen: false, jobId: '', jobPosition: '', jobCompany: '', newDate: null });
  }
}, [confirmReschedule, jobs, fetchJobs]);
  const onDragEnd = useCallback(
    async (result: DropResult) => {
      const { source, destination, draggableId } = result;
      if (!destination || source.droppableId === destination.droppableId) return;
      const job = jobs.find((j) => j.id === draggableId);
      if (!job) return;

      if (job.appliedDate) {
        setAlertModal({
          isOpen: true,
          title: 'Cannot Move',
          message: `"${job.position}" at ${job.company} already has an applied date (${job.appliedDate}).\nYou cannot reschedule this job.`,
        });
        return;
      }

      if (job.plannedApplyDate) {
        setConfirmReschedule({
          isOpen: true,
          jobId: job.id,
          jobPosition: job.position,
          jobCompany: job.company,
          newDate: destination.droppableId === 'unscheduled' ? null : destination.droppableId,
        });
        return;
      }

      if (ADVANCED_STATUSES.includes(job.status)) {
        if (destination.droppableId === 'unscheduled') {
          setConfirmUnschedule({
            isOpen: true,
            jobId: job.id,
            jobPosition: job.position,
            jobCompany: job.company,
          });
          return;
        } else {
          setAlertModal({
            isOpen: true,
            title: 'Cannot Reschedule',
            message: `"${job.position}" at ${job.company} has already been applied or is in advanced stage.\nYou cannot change its scheduled date.`,
          });
          return;
        }
      }

      let newPlannedDate: string | null = null;
      if (destination.droppableId !== 'unscheduled') {
        newPlannedDate = destination.droppableId;
        const today = startOfDay(new Date());
        const selectedDate = startOfDay(new Date(newPlannedDate));
        const deadlineDate = job.deadline ? startOfDay(new Date(job.deadline)) : null;
        if (selectedDate < today) {
          setAlertModal({ isOpen: true, title: 'Invalid Date', message: 'You cannot schedule a job on a past date. Please choose today or a future date.' });
          return;
        }
        if (deadlineDate && selectedDate > deadlineDate) {
          setAlertModal({ isOpen: true, title: 'Date Exceeds Deadline', message: `The selected date (${newPlannedDate}) is after the deadline (${job.deadline}).\nPlease choose a date on or before the deadline.` });
          return;
        }
      }

      const previousJobs = [...jobs];
      setJobs((prev) =>
        prev.map((j) => (j.id === draggableId ? { ...j, plannedApplyDate: newPlannedDate } : j))
      );
      setSyncing(true);
      try {
        const response = await fetch(`/api/jobs/${draggableId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plannedApplyDate: newPlannedDate }),
        });
        if (!response.ok) throw new Error('Failed to save schedule');
        await fetchJobs();
      } catch (error) {
        setJobs(previousJobs);
        setAlertModal({
          isOpen: true,
          title: 'Sync Failed',
          message: 'Failed to sync schedule. Changes reverted. Please try again.',
        });
      } finally {
        setSyncing(false);
      }
    },
    [jobs, fetchJobs]
  );

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const nextMonth = useCallback(() => setCurrentMonth((prev) => addMonths(prev, 1)), []);
  const prevMonth = useCallback(() => setCurrentMonth((prev) => subMonths(prev, 1)), []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-1">
        <div className="h-14 bg-neutral-200 rounded-2xl w-full" />
        <div className="h-[500px] bg-neutral-100 rounded-2xl border border-neutral-200 w-full" />
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
    (job) => !job.plannedApplyDate && (job.status === 'BACKLOG' || job.status === 'APPLYING')
  );

  const getJobsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return safeJobs.filter((job) => {
      const targetDate = job.appliedDate || job.plannedApplyDate;
      return targetDate === dateStr;
    });
  };

  const scheduledCount = safeJobs.filter((j) => j.plannedApplyDate).length;
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="w-full space-y-5 pb-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl shadow-md shadow-primary-500/20">
            <CalendarDays className="text-white" size={22} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              Application Planner
              {syncing && <RefreshCw size={14} className="text-primary-500 animate-spin" />}
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Drag & drop jobs to schedule your application dates
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 bg-primary-50 px-3 py-1.5 rounded-full border border-primary-100">
            <CalendarCheck size={14} /> {scheduledCount} Scheduled
          </span>
          <button
            onClick={() => setShowBacklog((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
              showBacklog
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            <Inbox size={14} />
            {showBacklog ? 'Hide Backlog' : 'Show Backlog'}
          </button>
          <div className="flex items-center border border-neutral-200 rounded-xl bg-white p-0.5 shadow-sm">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-semibold text-neutral-800 px-3 min-w-[120px] text-center capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: enUS })}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {showBacklog && (
            <div className="w-full lg:w-72 flex-shrink-0">
              <UnscheduledPool jobs={unscheduledJobs} />
            </div>
          )}
          <div className="flex-1 w-full bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50/80">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="py-3 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 bg-neutral-100 gap-[1px]">
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

      {/* Modal for unscheduling advanced job */}
      <AlertModal
        isOpen={confirmUnschedule.isOpen}
        onClose={() => setConfirmUnschedule({ isOpen: false, jobId: '', jobPosition: '', jobCompany: '' })}
        title="Move to Backlog?"
        message={`"${confirmUnschedule.jobPosition}" at ${confirmUnschedule.jobCompany} has already progressed.\n\nRemoving its scheduled date will move it back to "To Apply" (BACKLOG).\n\nDo you want to proceed?`}
        onConfirm={() => {
          moveToBacklogAndClearDate(confirmUnschedule.jobId);
          setConfirmUnschedule({ isOpen: false, jobId: '', jobPosition: '', jobCompany: '' });
        }}
      />

      {/* General alert modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false, title: '', message: '' })}
        title={alertModal.title}
        message={alertModal.message}
      />

      {/* Confirmation modal for rescheduling */}
      <AlertModal
        isOpen={confirmReschedule.isOpen}
        onClose={() => setConfirmReschedule({ isOpen: false, jobId: '', jobPosition: '', jobCompany: '', newDate: null })}
        onConfirm={handleConfirmReschedule}
        title="Confirm Schedule Change"
        message={`You are about to change the planned apply date for "${confirmReschedule.jobPosition}" at ${confirmReschedule.jobCompany}.\n\nAre you sure?`}
        confirmText="Yes, Change"
        cancelText="Cancel"
      />
    </div>
  );
}