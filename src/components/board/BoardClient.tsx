'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import Column from './Column';
import DeadlineModal from './DeadlineModal';
import ReopenJobModal from '@/components/board/ReopenJobModal';
import { 
  Loader2, Briefcase, CheckCircle2, BarChart3, Plus,
  Compass, FileSearch, Users2, Award, Clock
} from 'lucide-react';
import { Job } from '@/types/job';
import ApplyDateModal from '@/components/ui/ApplyDateModal';
import AlertModal from '@/components/ui/AlertModal';
import BackwardConfirmModal from '@/components/board/BackwardConfirmModal';
import PlannedDateModal from '@/components/board/PlannedDateModal';

const RECRUITMENT_PHASES = [
  {
    id: 'preparation',
    name: 'Preparation & Documents',
    description: 'Research & submit applications',
    icon: Compass,
    headerBg: 'from-neutral-700 to-neutral-800',
    bodyBg: 'bg-neutral-50/40',
    borderColor: 'border-neutral-200',
    subColumns: [
      { id: 'BACKLOG', label: 'To Apply', color: 'badge-neutral' },
      { id: 'APPLYING', label: 'Applying', color: 'badge-warning' },
      { id: 'APPLIED', label: 'Applied', color: 'badge-primary' },
    ]
  },
  {
    id: 'screening',
    name: 'Initial Screening',
    description: 'CV & assessment tests',
    icon: FileSearch,
    headerBg: 'from-indigo-700 to-indigo-800',
    bodyBg: 'bg-indigo-50/20',
    borderColor: 'border-indigo-100',
    subColumns: [
      { id: 'ADMIN_SCREENING', label: 'CV Screening', color: 'badge-primary' },
      { id: 'ASSESSMENT', label: 'Assessment', color: 'badge-primary' },
      { id: 'FGD_LGD', label: 'FGD / LGD', color: 'badge-primary' },
    ]
  },
  {
    id: 'interview',
    name: 'Job Interview',
    description: 'HR, user & executive rounds',
    icon: Users2,
    headerBg: 'from-violet-700 to-violet-800',
    bodyBg: 'bg-pink-50/10',
    borderColor: 'border-pink-100',
    subColumns: [
      { id: 'INTERVIEW_HR', label: 'HR Interview', color: 'badge-primary' },
      { id: 'INTERVIEW_USER', label: 'User Interview', color: 'badge-primary' },
      { id: 'INTERVIEW_EXECUTIVE', label: 'Executive Interview', color: 'badge-primary' },
    ]
  },
  {
    id: 'final',
    name: 'Offer & Result',
    description: 'Medical check, offering, closure',
    icon: Award,
    headerBg: 'from-emerald-700 to-emerald-800',
    bodyBg: 'bg-emerald-50/20',
    borderColor: 'border-emerald-100',
    subColumns: [
      { id: 'MEDICAL_CHECK_UP', label: 'Medical Check', color: 'badge-primary' },
      { id: 'OFFERING', label: 'Offering', color: 'badge-success' },
      { id: 'CLOSED', label: 'Closed', color: 'badge-neutral' },
    ]
  }
];

const ACTIVE_APPLY_STATUSES = [
  'APPLIED', 'ADMIN_SCREENING', 'ASSESSMENT', 'FGD_LGD',
  'INTERVIEW_HR', 'INTERVIEW_USER', 'INTERVIEW_EXECUTIVE',
  'MEDICAL_CHECK_UP', 'OFFERING'
];

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

const STATUS_ORDER = [
  'BACKLOG',
  'APPLYING',
  'APPLIED',
  'ADMIN_SCREENING',
  'ASSESSMENT',
  'FGD_LGD',
  'INTERVIEW_HR',
  'INTERVIEW_USER',
  'INTERVIEW_EXECUTIVE',
  'MEDICAL_CHECK_UP',
  'OFFERING',
  'CLOSED'
];

const isStatusEarlier = (statusA: string, statusB: string): boolean => {
  const indexA = STATUS_ORDER.indexOf(statusA);
  const indexB = STATUS_ORDER.indexOf(statusB);
  return indexA < indexB;
};

export default function BoardClient() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    jobId: string;
    position: string;
    company: string;
  } | null>(null);
  
  const [reopenModalConfig, setReopenModalConfig] = useState<{
    isOpen: boolean;
    jobId: string;
    position: string;
    company: string;
    currentDeadline: string;
    targetStatus: string;
  } | null>(null);

  const [pendingDrag, setPendingDrag] = useState<{
    jobId: string;
    targetStatus: string;
  } | null>(null);

  const [applyDateModalConfig, setApplyDateModalConfig] = useState<{
    isOpen: boolean;
    jobId: string;
    position: string;
    company: string;
    targetStatus: string;
  } | null>(null);

  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({ isOpen: false, title: '', message: '' });

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/jobs');
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const result = await res.json();
      const jobsData = result.success ? result.data : result;
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setError('');
    } catch (err: any) {
      setError(err.message || 'System error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const executeUpdateStatus = useCallback(async (
    id: string, 
    payload: { status?: string; deadline?: string; plannedApplyDate?: string | null }
  ) => {
    const currentJob = jobs.find(j => j.id === id);
    let finalPayload: { status?: string; deadline?: string; plannedApplyDate?: string | null } = { ...payload };

    if (currentJob && currentJob.status === 'CLOSED' && payload.deadline && !payload.status) {
      const newDeadlineDate = new Date(payload.deadline);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      newDeadlineDate.setHours(23, 59, 59, 999);
      if (newDeadlineDate >= today) {
        finalPayload.status = 'BACKLOG';
      }
    }

    setJobs(prev =>
      prev.map(job =>
        job.id === id
          ? {
              ...job,
              status: (finalPayload.status as Job['status']) || job.status,
              deadline: finalPayload.deadline || job.deadline,
              plannedApplyDate: finalPayload.plannedApplyDate !== undefined ? finalPayload.plannedApplyDate : job.plannedApplyDate
            }
          : job
      )
    );

    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update status');
      }
      router.refresh();
    } catch (err: any) {
      setErrorModal({
        isOpen: true,
        title: 'Update Failed',
        message: err.message || 'Failed to update data. Changes have been reverted.',
      });
      await fetchJobs();
    }
  }, [fetchJobs, router, jobs]);

  const handleStatusChange = useCallback(async (jobId: string, nextStatus: Job['status']) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    if (nextStatus === 'CLOSED') {
      setModalConfig({ isOpen: true, jobId, position: job.position, company: job.company });
      return;
    }
    await executeUpdateStatus(jobId, { status: nextStatus });
  }, [jobs, executeUpdateStatus]);

  const [backwardConfirm, setBackwardConfirm] = useState<{
    isOpen: boolean;
    jobId: string;
    jobPosition: string;
    jobCompany: string;
    currentStatus: string;
    appliedDate: string | null;
    targetStatus: 'BACKLOG' | 'APPLYING';
  }>({
    isOpen: false,
    jobId: '',
    jobPosition: '',
    jobCompany: '',
    currentStatus: '',
    appliedDate: null,
    targetStatus: 'BACKLOG',
  });

  const [plannedDateModal, setPlannedDateModal] = useState<{
    isOpen: boolean;
    jobId: string;
    targetStatus: string;
    position: string;
    company: string;
  }>({
    isOpen: false,
    jobId: '',
    targetStatus: '',
    position: '',
    company: '',
  });

  const handleBackwardWithPlannedDate = useCallback(async (plannedDate: string | null) => {
    if (!plannedDateModal.jobId) return;
    await executeUpdateStatus(plannedDateModal.jobId, {
      status: plannedDateModal.targetStatus,
      plannedApplyDate: plannedDate || undefined,
    });
    setPlannedDateModal({ isOpen: false, jobId: '', targetStatus: '', position: '', company: '' });
  }, [plannedDateModal, executeUpdateStatus]);

  const [advancedBackwardConfirm, setAdvancedBackwardConfirm] = useState<{
    isOpen: boolean;
    jobId: string;
    sourceStatus: string;
    targetStatus: string;
    position: string;
    company: string;
  }>({
    isOpen: false,
    jobId: '',
    sourceStatus: '',
    targetStatus: '',
    position: '',
    company: '',
  });

  const handleAdvancedBackwardConfirm = useCallback(async () => {
    const { jobId, targetStatus } = advancedBackwardConfirm;
    if (jobId && targetStatus) {
      await handleStatusChange(jobId, targetStatus as Job['status']);
    }
    setAdvancedBackwardConfirm({
      isOpen: false,
      jobId: '',
      sourceStatus: '',
      targetStatus: '',
      position: '',
      company: '',
    });
  }, [advancedBackwardConfirm, handleStatusChange]);

  const handleBackwardConfirm = useCallback(() => {
    setBackwardConfirm(prev => ({ ...prev, isOpen: false }));
    setPlannedDateModal({
      isOpen: true,
      jobId: backwardConfirm.jobId,
      targetStatus: backwardConfirm.targetStatus,
      position: backwardConfirm.jobPosition,
      company: backwardConfirm.jobCompany,
    });
  }, [backwardConfirm]);

  const handleApplyDateConfirm = useCallback(async (appliedDate: string) => {
    if (!applyDateModalConfig) return;
    const { jobId, targetStatus } = applyDateModalConfig;
    await executeUpdateStatus(jobId, { status: targetStatus, plannedApplyDate: appliedDate });
    setApplyDateModalConfig(null);
  }, [applyDateModalConfig, executeUpdateStatus]);

  const handleReopenConfirm = useCallback(async (newDeadline: string, appliedDate?: string | null) => {
    if (!reopenModalConfig || !pendingDrag) return;
    const { jobId, targetStatus } = pendingDrag;
    const payload: { status: string; deadline: string; plannedApplyDate?: string | null } = {
      status: targetStatus,
      deadline: newDeadline,
    };
    if (appliedDate !== undefined) {
      payload.plannedApplyDate = appliedDate;
    }
    await executeUpdateStatus(jobId, payload);
    setReopenModalConfig(null);
    setPendingDrag(null);
  }, [reopenModalConfig, pendingDrag, executeUpdateStatus]);

  const handleConfirmClosed = useCallback(async (finalDeadlineDate: string) => {
    if (!modalConfig) return;
    const { jobId } = modalConfig;
    setModalConfig(null);
    await executeUpdateStatus(jobId, { status: 'CLOSED', deadline: finalDeadlineDate });
  }, [modalConfig, executeUpdateStatus]);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const job = jobs.find(j => j.id === draggableId);
    if (!job) return;

    const targetStatus = destination.droppableId as Job['status'];
    const sourceStatus = job.status;
    
    if (sourceStatus !== 'CLOSED' && targetStatus !== 'CLOSED' && isStatusEarlier(targetStatus, sourceStatus)) {
      setAdvancedBackwardConfirm({
        isOpen: true,
        jobId: job.id,
        sourceStatus: sourceStatus,
        targetStatus: targetStatus,
        position: job.position,
        company: job.company,
      });
      return;
    }

    if (ADVANCED_STATUSES.includes(job.status) && (targetStatus === 'BACKLOG' || targetStatus === 'APPLYING')) {
      setBackwardConfirm({
        isOpen: true,
        jobId: job.id,
        jobPosition: job.position,
        jobCompany: job.company,
        currentStatus: job.status,
        appliedDate: job.plannedApplyDate,
        targetStatus: targetStatus as 'BACKLOG' | 'APPLYING',
      });
      return;
    }

    if (sourceStatus !== 'CLOSED' && targetStatus !== 'CLOSED' && isStatusEarlier(targetStatus, sourceStatus) && !['BACKLOG', 'APPLYING'].includes(targetStatus)) {
      setAdvancedBackwardConfirm({
        isOpen: true,
        jobId: job.id,
        sourceStatus,
        targetStatus,
        position: job.position,
        company: job.company,
      });
      return;
    }

    const isAdvancedStatus = ['APPLIED', 'ADMIN_SCREENING', 'ASSESSMENT', 'FGD_LGD', 
      'INTERVIEW_HR', 'INTERVIEW_USER', 'INTERVIEW_EXECUTIVE', 'MEDICAL_CHECK_UP', 'OFFERING']
      .includes(targetStatus);
    const isSourceBacklogOrApplying = ['BACKLOG', 'APPLYING'].includes(job.status);

    if (isSourceBacklogOrApplying && isAdvancedStatus) {
      setApplyDateModalConfig({
        isOpen: true,
        jobId: draggableId,
        position: job.position,
        company: job.company,
        targetStatus,
      });
      return;
    }

    if (job.status === 'CLOSED' && targetStatus !== 'CLOSED') {
      setPendingDrag({ jobId: draggableId, targetStatus });
      setReopenModalConfig({
        isOpen: true,
        jobId: draggableId,
        position: job.position,
        company: job.company,
        currentDeadline: job.deadline,
        targetStatus,
      });
      return;
    }

    if (targetStatus === 'CLOSED') {
      setModalConfig({ isOpen: true, jobId: draggableId, position: job.position, company: job.company });
      return;
    }

    await handleStatusChange(draggableId, targetStatus);
  }, [jobs, handleStatusChange]);

  const totalJobs = jobs.length;
  const appliedCount = jobs.filter(j => ACTIVE_APPLY_STATUSES.includes(j.status)).length;
  const successRate = totalJobs > 0 ? Math.round((appliedCount / totalJobs) * 100) : 0;
  const expiredCount = jobs.filter(j => {
    if (!j.deadline) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return j.deadline < todayStr && ['BACKLOG', 'APPLYING'].includes(j.status);
  }).length;

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-primary-600" size={36} strokeWidth={2} />
        <p className="text-sm font-medium text-neutral-500">Loading recruitment board...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto p-6 text-center bg-danger-50 rounded-2xl border border-danger-200">
        <p className="text-danger-600 font-medium">⚠️ {error}</p>
        <button onClick={fetchJobs} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition">Try Again</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto px-4 sm:px-6 pb-12">
      {/* Header Stats */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2 tracking-tight">
            <Briefcase className="text-primary-600" size={22} strokeWidth={2} />
            Career Tracking Board
          </h1>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-neutral-500 mt-1.5 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-neutral-400"></span>
              Total: <strong className="text-neutral-800">{totalJobs}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-sky-500" />
              Applied: <strong className="text-neutral-800">{appliedCount}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <BarChart3 size={14} className="text-primary-500" />
              Conversion: <strong className="text-neutral-800">{successRate}%</strong>
            </span>
            {expiredCount > 0 && (
              <span className="flex items-center gap-1.5 text-amber-600">
                <Clock size={14} />
                Expired: <strong>{expiredCount}</strong>
              </span>
            )}
          </div>
        </div>
        <Link
          href="/jobs/new"
          className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-primary-700 shadow-sm transition-all active:scale-95"
        >
          <Plus size={16} strokeWidth={2} /> Add New Job
        </Link>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
          {RECRUITMENT_PHASES.map(phase => {
            const Icon = phase.icon;
            return (
              <div
                key={phase.id}
                className={`rounded-2xl border ${phase.borderColor} ${phase.bodyBg} overflow-hidden shadow-sm flex flex-col transition-all hover:shadow-md`}
              >
                <div className={`bg-gradient-to-r ${phase.headerBg} p-4 text-white`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={18} strokeWidth={2} className="opacity-90" />
                    <h2 className="font-bold text-sm tracking-wide">{phase.name}</h2>
                  </div>
                  <p className="text-[11px] opacity-80 leading-relaxed">{phase.description}</p>
                </div>
                
                <div className="p-4 space-y-5">
                  {phase.subColumns.map(col => {
                    const columnJobs = jobs.filter(job => job.status === col.id);
                    return (
                      <div key={col.id} className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                        <Column
                          id={col.id as Job['status']}
                          label={col.label}
                          colorClass={col.color}
                          jobs={columnJobs}
                          quantity={columnJobs.length}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Modal untuk menutup job */}
      {modalConfig && (
        <DeadlineModal
          isOpen={modalConfig.isOpen}
          positionName={modalConfig.position}
          companyName={modalConfig.company}
          onClose={() => setModalConfig(null)}
          onConfirm={handleConfirmClosed}
        />
      )}

      {/* Modal untuk membuka kembali job */}
      {reopenModalConfig && (
        <ReopenJobModal
          isOpen={reopenModalConfig.isOpen}
          positionName={reopenModalConfig.position}
          companyName={reopenModalConfig.company}
          currentDeadline={reopenModalConfig.currentDeadline}
          targetStatus={reopenModalConfig.targetStatus}
          onClose={() => {
            setReopenModalConfig(null);
            setPendingDrag(null);
          }}
          onConfirm={handleReopenConfirm}
        />
      )}

      {/* Modal untuk apply date */}
      {applyDateModalConfig && (
        <ApplyDateModal
          isOpen={applyDateModalConfig.isOpen}
          positionName={applyDateModalConfig.position}
          companyName={applyDateModalConfig.company}
          targetStatus={applyDateModalConfig.targetStatus}
          onClose={() => setApplyDateModalConfig(null)}
          onConfirm={handleApplyDateConfirm}
        />
      )}

      {/* Error alert modal */}
      <AlertModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })}
        title={errorModal.title}
        message={errorModal.message}
      />

      {/* Confirmation for backward move to BACKLOG/APPLYING */}
      <BackwardConfirmModal
        isOpen={backwardConfirm.isOpen}
        onClose={() => setBackwardConfirm(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleBackwardConfirm}
        jobPosition={backwardConfirm.jobPosition}
        jobCompany={backwardConfirm.jobCompany}
        currentStatus={backwardConfirm.currentStatus}
        appliedDate={backwardConfirm.appliedDate}
        targetStatus={backwardConfirm.targetStatus}
      />

      {/* Modal input planned date after backward confirm */}
      <PlannedDateModal
        isOpen={plannedDateModal.isOpen}
        onClose={() => setPlannedDateModal({ isOpen: false, jobId: '', targetStatus: '', position: '', company: '' })}
        onConfirm={handleBackwardWithPlannedDate}
        positionName={plannedDateModal.position}
        companyName={plannedDateModal.company}
        targetStatus={plannedDateModal.targetStatus}
      />

      {/* Confirmation for backward move between advanced statuses */}
      <AlertModal
        isOpen={advancedBackwardConfirm.isOpen}
        onClose={() => setAdvancedBackwardConfirm(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleAdvancedBackwardConfirm}
        title="Confirm Backward Move"
        message={`You are about to move "${advancedBackwardConfirm.position}" from ${advancedBackwardConfirm.sourceStatus.replace(/_/g, ' ')} to ${advancedBackwardConfirm.targetStatus.replace(/_/g, ' ')}.\n\nThis is a backward step in the recruitment process. Are you sure?`}
        confirmText="Yes, Move"
        cancelText="Cancel"
      />
    </div>
  );
}