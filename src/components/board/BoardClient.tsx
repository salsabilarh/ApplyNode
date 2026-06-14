'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import Column from './Column';
import DeadlineModal from './DeadlineModal';
import { 
  Loader2, Briefcase, CheckCircle2, BarChart3, Plus,
  Compass, FileSearch, Users2, Award, Clock
} from 'lucide-react';
import { Job } from '@/types/job';
import AlertModal from '@/components/ui/AlertModal';
import StageDatesInputModal from '@/components/board/StageDatesInputModal';
import StageTransitionConfirmModal from '@/components/board/StageTransitionConfirmModal';
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

const STATUS_ORDER = [
  'BACKLOG', 'APPLYING', 'APPLIED', 'ADMIN_SCREENING', 'ASSESSMENT', 'FGD_LGD',
  'INTERVIEW_HR', 'INTERVIEW_USER', 'INTERVIEW_EXECUTIVE', 'MEDICAL_CHECK_UP', 'OFFERING', 'CLOSED'
];

const getDateFieldName = (status: string): string | null => {
  const map: Record<string, string> = {
    APPLIED: 'appliedDate',
    ADMIN_SCREENING: 'adminScreeningDate',
    ASSESSMENT: 'assessmentDate',
    FGD_LGD: 'fgdLgdDate',
    INTERVIEW_HR: 'interviewHrDate',
    INTERVIEW_USER: 'interviewUserDate',
    INTERVIEW_EXECUTIVE: 'interviewExecutiveDate',
    MEDICAL_CHECK_UP: 'medicalCheckUpDate',
    OFFERING: 'offeringDate',
    CLOSED: 'closedDate',
  };
  return map[status] || null;
};

const getStagesAffected = (current: string, target: string) => {
  const currentIdx = STATUS_ORDER.indexOf(current);
  const targetIdx = STATUS_ORDER.indexOf(target);
  const appliedIdx = STATUS_ORDER.indexOf('APPLIED');
  const stagesToUpdate: string[] = [];
  const stagesToReset: string[] = [];

  // ================= MAJU =================
  if (targetIdx > currentIdx) {
    if (targetIdx >= appliedIdx) {
      // Target di atas atau sama dengan APPLIED -> tampilkan semua stage dari APPLIED hingga target
      for (let i = appliedIdx; i <= targetIdx; i++) {
        const stage = STATUS_ORDER[i];
        if (stage !== 'BACKLOG' && stage !== 'CLOSED' && getDateFieldName(stage)) {
          stagesToUpdate.push(stage);
        }
      }
    } else {
      // Target di bawah APPLIED (BACKLOG/APPLYING) -> tidak ada date field
      for (let i = currentIdx + 1; i <= targetIdx; i++) {
        const stage = STATUS_ORDER[i];
        if (stage !== 'BACKLOG' && stage !== 'CLOSED' && getDateFieldName(stage)) {
          stagesToUpdate.push(stage);
        }
      }
    }
  } 
  // ================= MUNDUR =================
  else {
    // Reset semua stage setelah target hingga current (yang memiliki date field)
    for (let i = targetIdx + 1; i <= currentIdx; i++) {
      const stage = STATUS_ORDER[i];
      if (stage !== 'BACKLOG' && stage !== 'CLOSED' && getDateFieldName(stage)) {
        stagesToReset.push(stage);
      }
    }

    // Tampilkan stage dari APPLIED hingga target (jika target >= APPLIED)
    if (targetIdx >= appliedIdx) {
      for (let i = appliedIdx; i <= targetIdx; i++) {
        const stage = STATUS_ORDER[i];
        if (stage !== 'BACKLOG' && stage !== 'CLOSED' && getDateFieldName(stage)) {
          stagesToUpdate.push(stage);
        }
      }
    } else {
      // Target di bawah APPLIED (BACKLOG/APPLYING) -> hanya target stage jika punya date field
      if (target !== 'BACKLOG' && target !== 'APPLYING' && getDateFieldName(target)) {
        stagesToUpdate.push(target);
      }
    }
  }

  return { stagesToUpdate, stagesToReset };
};

const getReopenStages = (targetStatus: string) => {
  const targetIdx = STATUS_ORDER.indexOf(targetStatus);
  const appliedIdx = STATUS_ORDER.indexOf('APPLIED');
  const stagesToUpdate: string[] = [];

  // APPLIED wajib diisi jika target >= APPLIED
  if (targetIdx >= appliedIdx && getDateFieldName('APPLIED')) {
    stagesToUpdate.push('APPLIED');
  }
  // Target stage wajib diisi jika memiliki date field
  if (getDateFieldName(targetStatus)) {
    stagesToUpdate.push(targetStatus);
  }

  // Reset semua stage setelah target hingga CLOSED yang memiliki date field
  const stagesToReset: string[] = [];
  for (let i = targetIdx + 1; i < STATUS_ORDER.length; i++) {
    const stage = STATUS_ORDER[i];
    if (stage !== 'BACKLOG' && stage !== 'APPLYING' && getDateFieldName(stage)) {
      stagesToReset.push(stage);
    }
  }
  return { stagesToUpdate, stagesToReset };
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
  
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({ isOpen: false, title: '', message: '' });

  const [stageConfirm, setStageConfirm] = useState<{
    isOpen: boolean;
    jobId: string;
    currentStatus: string;
    targetStatus: string;
    stagesToUpdate: string[];
    stagesToReset: string[];
    isForward: boolean;
    isReopen: boolean;       // baru
    currentDeadline?: string; // baru
  }>({
    isOpen: false,
    jobId: '',
    currentStatus: '',
    targetStatus: '',
    stagesToUpdate: [],
    stagesToReset: [],
    isForward: false,
    isReopen: false,
  });

  const [stageDatesModal, setStageDatesModal] = useState<{
    isOpen: boolean;
    jobId: string;
    targetStatus: string;
    stagesToUpdate: string[];        // yang dipilih user
    allStagesToUpdate: string[];     // semua stage asli (untuk reset)
    existingDates: Record<string, string | null>;
    isReopen: boolean;
    currentDeadline?: string;
  }>({
    isOpen: false,
    jobId: '',
    targetStatus: '',
    stagesToUpdate: [],
    allStagesToUpdate: [],
    existingDates: {},
    isReopen: false,
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

  const [tempResetList, setTempResetList] = useState<string[]>([]);

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

  const handlePlannedDateConfirm = useCallback(async (plannedDate: string | null) => {
  if (!plannedDateModal.jobId) return;
  await executeUpdateStatus(plannedDateModal.jobId, {
    status: plannedDateModal.targetStatus as Job['status'],
    plannedApplyDate: plannedDate || undefined,
  });
  setPlannedDateModal({ isOpen: false, jobId: '', targetStatus: '', position: '', company: '' });
}, [plannedDateModal, executeUpdateStatus]);

// Handler konfirmasi stage
const handleStageConfirm = useCallback((selectedStages: string[]) => {
  const { jobId, targetStatus, stagesToUpdate, stagesToReset, isReopen, currentDeadline } = stageConfirm;
  const job = jobs.find(j => j.id === jobId);
  if (!job) return;

  const existingDates: Record<string, string | null> = {};
  selectedStages.forEach(stage => {
    const field = getDateFieldName(stage);
    if (field) existingDates[stage] = (job as any)[field] || null;
  });

  setStageConfirm(prev => ({ ...prev, isOpen: false }));
  setTempResetList(stagesToReset);
  setStageDatesModal({
    isOpen: true,
    jobId,
    targetStatus,
    stagesToUpdate: selectedStages,
    allStagesToUpdate: stagesToUpdate, // simpan original
    existingDates,
    isReopen: isReopen || false,
    currentDeadline,
  });
}, [stageConfirm, jobs]);
const getReopenStages = (targetStatus: string) => {
  const targetIdx = STATUS_ORDER.indexOf(targetStatus);
  const stagesToUpdate: string[] = [];
  
  // APPLIED wajib diisi jika target bukan APPLIED
  if (targetStatus !== 'APPLIED' && getDateFieldName('APPLIED')) {
    stagesToUpdate.push('APPLIED');
  }
  // Target stage wajib diisi jika memiliki date field
  if (getDateFieldName(targetStatus)) {
    stagesToUpdate.push(targetStatus);
  }

  // Reset semua stage setelah target hingga CLOSED yang memiliki date field
  const stagesToReset: string[] = [];
  for (let i = targetIdx + 1; i < STATUS_ORDER.length; i++) {
    const stage = STATUS_ORDER[i];
    if (stage !== 'BACKLOG' && stage !== 'APPLYING' && getDateFieldName(stage)) {
      stagesToReset.push(stage);
    }
  }
  return { stagesToUpdate, stagesToReset };
};

const handleStageDatesConfirm = useCallback(async (dates: Record<string, string>, deadline?: string) => {
  const { jobId, targetStatus, stagesToUpdate, allStagesToUpdate, isReopen } = stageDatesModal;
  const stagesToResetOriginal = tempResetList;
  
  // Stage yang ada di allStagesToUpdate tapi tidak dipilih -> harus direset
  const unselectedStages = allStagesToUpdate.filter(s => !stagesToUpdate.includes(s));
  const allResetStages = [...stagesToResetOriginal, ...unselectedStages];

  const payload: any = { status: targetStatus };
  // Set tanggal untuk yang dipilih
  for (const [stage, date] of Object.entries(dates)) {
    const field = getDateFieldName(stage);
    if (field && date) payload[field] = new Date(date);
  }
  // Reset untuk semua resetStages
  for (const stage of allResetStages) {
    const field = getDateFieldName(stage);
    if (field) payload[field] = null;
  }
  if (isReopen && deadline) payload.deadline = deadline;

  await executeUpdateStatus(jobId, payload);
  setStageDatesModal({ isOpen: false, jobId: '', targetStatus: '', stagesToUpdate: [], allStagesToUpdate: [], existingDates: {}, isReopen: false });
  setTempResetList([]);
}, [stageDatesModal, tempResetList, executeUpdateStatus]);
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

if (targetStatus === sourceStatus) return;

  // Kasus pindah ke CLOSED
  if (targetStatus === 'CLOSED') {
    setModalConfig({ isOpen: true, jobId: draggableId, position: job.position, company: job.company });
    return;
  }

  // Kasus dari CLOSED
  if (sourceStatus === 'CLOSED') {
    const targetIdx = STATUS_ORDER.indexOf(targetStatus);
    const appliedIdx = STATUS_ORDER.indexOf('APPLIED');
    if (targetIdx >= appliedIdx) {
      const { stagesToUpdate, stagesToReset } = getReopenStages(targetStatus);
      setStageConfirm({
        isOpen: true,
        jobId: job.id,
        currentStatus: sourceStatus,
        targetStatus,
        stagesToUpdate,
        stagesToReset,
        isForward: false,
        isReopen: true,
        currentDeadline: job.deadline,
      });
    } else {
      setPlannedDateModal({
        isOpen: true,
        jobId: job.id,
        targetStatus,
        position: job.position,
        company: job.company,
      });
    }
    return;
  }

  // WAJIB planned date untuk BACKLOG/APPLYING
  if (targetStatus === 'BACKLOG' || targetStatus === 'APPLYING') {
    setPlannedDateModal({
      isOpen: true,
      jobId: job.id,
      targetStatus,
      position: job.position,
      company: job.company,
    });
    return;
  }

  // Transisi biasa
  const { stagesToUpdate, stagesToReset } = getStagesAffected(sourceStatus, targetStatus);
  const isForward = STATUS_ORDER.indexOf(targetStatus) > STATUS_ORDER.indexOf(sourceStatus);
  setStageConfirm({
    isOpen: true,
    jobId: job.id,
    currentStatus: sourceStatus,
    targetStatus,
    stagesToUpdate,
    stagesToReset,
    isForward,
    isReopen: false,
  });
}, [jobs, executeUpdateStatus]);

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

      {/* Error alert modal */}
      <AlertModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })}
        title={errorModal.title}
        message={errorModal.message}
      />
      {/* Modal PlannedDateModal */}
      <PlannedDateModal
        isOpen={plannedDateModal.isOpen}
        onClose={() => setPlannedDateModal({ isOpen: false, jobId: '', targetStatus: '', position: '', company: '' })}
        onConfirm={handlePlannedDateConfirm}
        positionName={plannedDateModal.position}
        companyName={plannedDateModal.company}
        targetStatus={plannedDateModal.targetStatus}
      />

    {/* MODAL STAGE TRANSITION CONFIRM (termasuk reopen) */}
    <StageTransitionConfirmModal
      isOpen={stageConfirm.isOpen}
      onClose={() => setStageConfirm(prev => ({ ...prev, isOpen: false }))}
      onConfirm={handleStageConfirm}   // hanya satu
      jobPosition={stageConfirm.jobId ? jobs.find(j => j.id === stageConfirm.jobId)?.position || '' : ''}
      jobCompany={stageConfirm.jobId ? jobs.find(j => j.id === stageConfirm.jobId)?.company || '' : ''}
      currentStatus={stageConfirm.currentStatus}
      targetStatus={stageConfirm.targetStatus}
      stagesToUpdate={stageConfirm.stagesToUpdate}
      stagesToReset={stageConfirm.stagesToReset}
      isForward={stageConfirm.isForward}
  customTitle={stageConfirm.isReopen ? "Reopen Job Application" : undefined}
    />
    
{/* MODAL STAGE DATES INPUT (dengan deadline untuk reopen) */}
<StageDatesInputModal
  isOpen={stageDatesModal.isOpen}
  onClose={() => setStageDatesModal({
    isOpen: false,
    jobId: '',
    targetStatus: '',
    stagesToUpdate: [],
    allStagesToUpdate: [],
    existingDates: {},
    isReopen: false
  })}
  onBack={() => {
    // Tutup stageDatesModal dan buka stageConfirm lagi
    setStageDatesModal(prev => ({ ...prev, isOpen: false }));
    setStageConfirm(prev => ({ ...prev, isOpen: true }));
  }}
  onConfirm={handleStageDatesConfirm}
  jobPosition={stageDatesModal.jobId ? jobs.find(j => j.id === stageDatesModal.jobId)?.position || '' : ''}
  jobCompany={stageDatesModal.jobId ? jobs.find(j => j.id === stageDatesModal.jobId)?.company || '' : ''}
  targetStatus={stageDatesModal.targetStatus}
  stagesToUpdate={stageDatesModal.stagesToUpdate}
  existingDates={stageDatesModal.existingDates}
  isReopen={stageDatesModal.isReopen}
  currentDeadline={stageDatesModal.currentDeadline}
/>
  </div>
);
}