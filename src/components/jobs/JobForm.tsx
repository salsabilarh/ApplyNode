'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { JobType, Priority, JobStatus, DurationUnit, WorkMethod } from '@prisma/client';
import { 
  ArrowLeft, Loader2, Briefcase, Calendar, 
  FileText, AlertCircle, Trash2, Plus, CheckCircle2, ExternalLink,
  Upload, X, Sparkles, FileJson
} from 'lucide-react';
import { useModal } from '@/context/ModalContext';
import AlertModal from '@/components/ui/AlertModal';
import StageDatesInputModal from '@/components/board/StageDatesInputModal';
import StageTransitionConfirmModal from '@/components/board/StageTransitionConfirmModal';
import DeadlineModal from '../board/DeadlineModal';
import { STATUS_ORDER, formatJobType, formatWorkMethodLabel, formatDurationUnitLabel, getStagesAffected } from '@/lib/utils';

// ---------- Types ----------
interface NoteItem {
  id: string;
  text: string;
  completed: boolean;
}

interface JobFormData {
  id?: string;
  position: string;
  jobType: JobType | null;
  company: string;
  platform: string | null;
  sourceLink: string;
  applyLink: string;
  description: string;
  requirement: string;
  duration: string | null;
  deadline: string | null;
  openingDate: string | null;
  priority: Priority | null;
  status: JobStatus;
  location: string | null;
  workMethod: WorkMethod | null;
  durationUnit: DurationUnit | null;
  plannedApplyDate: string | null;
  applyNotes: string;
  notes: string;
  appliedDate: string | null;
  adminScreeningDate: string | null;
  assessmentDate: string | null;
  fgdLgdDate: string | null;
  interviewHrDate: string | null;
  interviewUserDate: string | null;
  interviewExecutiveDate: string | null;
  medicalCheckUpDate: string | null;
  offeringDate: string | null;
  closedDate: string | null;
}

const emptyJob: JobFormData = {
  position: '',
  jobType: null,
  company: '',
  platform: '',
  sourceLink: '',
  applyLink: '',
  description: '',
  requirement: '',
  duration: '',
  priority: null,
  status: 'BACKLOG',
  location: null,
  workMethod: null,
  durationUnit: 'MONTHS',
  applyNotes: '[]',
  notes: '',
  deadline: null,
  openingDate: null,
  plannedApplyDate: null,
  appliedDate: null,
  adminScreeningDate: null,
  assessmentDate: null,
  fgdLgdDate: null,
  interviewHrDate: null,
  interviewUserDate: null,
  interviewExecutiveDate: null,
  medicalCheckUpDate: null,
  offeringDate: null,
  closedDate: null,
};

const formatDateField = (value: any): string | null => {
  if (!value) return null;
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    if (value.includes('T')) return value.split('T')[0];
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }
  try {
    return new Date(value).toISOString().split('T')[0];
  } catch {
    return null;
  }
};

const formatInitialData = (data: any): JobFormData => {
  if (!data) return emptyJob;
  return {
    id: data.id,
    position: data.position || '',
    jobType: data.jobType || null,
    company: data.company || '',
    platform: data.platform || '',
    sourceLink: data.sourceLink || '',
    applyLink: data.applyLink || '',
    description: data.description || '',
    requirement: data.requirement || '',
    duration: data.duration || '',
    deadline: formatDateField(data.deadline),
    openingDate: formatDateField(data.openingDate),
    priority: data.priority || null,
    status: data.status || 'BACKLOG',
    location: data.location || null,
    workMethod: data.workMethod || null,
    durationUnit: data.durationUnit ?? null,
    plannedApplyDate: formatDateField(data.plannedApplyDate),
    applyNotes: data.applyNotes || '[]',
    notes: data.notes || '',
    appliedDate: formatDateField(data.appliedDate),
    adminScreeningDate: formatDateField(data.adminScreeningDate),
    assessmentDate: formatDateField(data.assessmentDate),
    fgdLgdDate: formatDateField(data.fgdLgdDate),
    interviewHrDate: formatDateField(data.interviewHrDate),
    interviewUserDate: formatDateField(data.interviewUserDate),
    interviewExecutiveDate: formatDateField(data.interviewExecutiveDate),
    medicalCheckUpDate: formatDateField(data.medicalCheckUpDate),
    offeringDate: formatDateField(data.offeringDate),
    closedDate: formatDateField(data.closedDate),
  };
};

// ========== PARSING FUNCTION ==========
function parseJobPosting(text: string): Partial<JobFormData> {
  const result: Partial<JobFormData> = {};
  const positionMatch = text.match(/(?:Position|Job Title|Role):\s*(.+)/i) || text.match(/^([^\n]{10,80})/m);
  if (positionMatch) result.position = positionMatch[1].trim();
  const companyMatch = text.match(/(?:Company|At|Organization):\s*(.+)/i) || text.match(/(?:for|at)\s+([A-Z][a-zA-Z0-9\s&.]+)(?:\n|\.)/);
  if (companyMatch) result.company = companyMatch[1].trim();
  const descSection = text.match(/Description:?([\s\S]*?)(?=\n\s*(?:Requirements|Qualifications|Responsibilities|Benefits|$))/i);
  if (descSection) result.description = descSection[1].trim();
  const reqSection = text.match(/(?:Requirements|Qualifications):?([\s\S]*?)(?=\n\s*(?:Benefits|About|Apply|$))/i);
  if (reqSection) result.requirement = reqSection[1].trim();
  const urlMatch = text.match(/https?:\/\/[^\s]+/);
  if (urlMatch) result.applyLink = urlMatch[0];
  if (text.match(/linkedin/i)) result.platform = 'LinkedIn';
  else if (text.match(/jobstreet/i)) result.platform = 'Jobstreet';
  else if (text.match(/indeed/i)) result.platform = 'Indeed';
  else if (text.match(/glassdoor/i)) result.platform = 'Glassdoor';
  else if (text.match(/karir|glints/i)) result.platform = 'Glints';
  return result;
}

function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// ========== REUSABLE FORM COMPONENTS ==========
const FormRow = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`grid grid-cols-1 md:grid-cols-3 gap-5 items-start ${className}`}>{children}</div>
);

const Label = ({ label, required }: { label: string; required?: boolean }) => (
  <div className="md:col-span-1">
    <label className="block text-sm font-medium text-neutral-700 mt-1">
      {label} {required && <span className="text-danger-500 ml-0.5">*</span>}
    </label>
  </div>
);

const InputWrapper = ({ children, error }: { children: React.ReactNode; error?: string }) => (
  <div className="md:col-span-2 space-y-1.5">
    {children}
    {error && <p className="text-xs text-danger-500 flex items-center gap-1"><AlertCircle size={12} /> {error}</p>}
  </div>
);

const TextInput = ({ name, value, onChange, required, placeholder, type = 'text' }: any) => (
  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    required={required}
    placeholder={placeholder}
    className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm bg-white transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
  />
);

const TextArea = ({ name, value, onChange, rows, placeholder }: any) => (
  <textarea
    name={name}
    value={value}
    onChange={onChange}
    rows={rows}
    placeholder={placeholder}
    className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm bg-white transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 resize-none"
  />
);

const DateInput = ({ name, value, onChange, required, error, disabled }: any) => (
  <div className="relative">
    <input
      type="date"
      name={name}
      value={value || ''}
      onChange={onChange}
      required={required}
      disabled={disabled}
      max="2100-12-31"
      className={`w-full border rounded-xl px-4 py-2.5 text-sm bg-white transition-all ${
        disabled ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed' : ''
      } ${
        error
          ? 'border-danger-300 focus:border-danger-500 focus:ring-2 focus:ring-danger-500/20'
          : 'border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
      }`}
    />
  </div>
);

// Helper untuk mendapatkan nama field tanggal
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

const getReopenStages = (targetStatus: string) => {
  const targetIdx = STATUS_ORDER.indexOf(targetStatus);
  const stagesToUpdate: string[] = [];
  if (targetStatus !== 'APPLIED' && getDateFieldName('APPLIED')) {
    stagesToUpdate.push('APPLIED');
  }
  if (getDateFieldName(targetStatus)) {
    stagesToUpdate.push(targetStatus);
  }
  const stagesToReset: string[] = [];
  for (let i = targetIdx + 1; i < STATUS_ORDER.length; i++) {
    const stage = STATUS_ORDER[i];
    if (stage !== 'BACKLOG' && stage !== 'APPLYING' && getDateFieldName(stage)) {
      stagesToReset.push(stage);
    }
  }
  return { stagesToUpdate, stagesToReset };
};

// ========== MAIN COMPONENT ==========
export default function JobForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const { openModal } = useModal();
  const [form, setForm] = useState<JobFormData>(() => formatInitialData(initialData));
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['Basic Info', 'Time & Priority', 'Execution Plan'];
  const originalStatus = initialData?.status as JobStatus | undefined;
  const [expiredConfirmOpen, setExpiredConfirmOpen] = useState(false);
  const [errors, setErrors] = useState<{
    position?: string;
    company?: string;
    platform?: string;
    deadline?: string;
    plannedApplyDate?: string;
    openingDate?: string;
    appliedDate?: string;
  }>({});

  // State untuk melacak apakah priority diubah manual
  const [isPriorityManuallySet, setIsPriorityManuallySet] = useState(false);

  // State untuk stage transition
  const [stageConfirm, setStageConfirm] = useState<{
    isOpen: boolean;
    currentStatus: string;
    targetStatus: string;
    stagesToUpdate: string[];
    stagesToReset: string[];
    isForward: boolean;
    isReopen: boolean;
    currentDeadline?: string;
  }>({
    isOpen: false,
    currentStatus: '',
    targetStatus: '',
    stagesToUpdate: [],
    stagesToReset: [],
    isForward: false,
    isReopen: false,
  });

  const [stageDatesModal, setStageDatesModal] = useState<{
    isOpen: boolean;
    targetStatus: string;
    stagesToUpdate: string[];
    allStagesToUpdate: string[];
    existingDates: Record<string, string | null>;
    isReopen: boolean;
    currentDeadline?: string;
  }>({
    isOpen: false,
    targetStatus: '',
    stagesToUpdate: [],
    allStagesToUpdate: [],
    existingDates: {},
    isReopen: false,
  });

  const [tempResetList, setTempResetList] = useState<string[]>([]);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);

  // Checklist
  const [checklist, setChecklist] = useState<NoteItem[]>(() => {
    try { return JSON.parse(form.applyNotes); } catch { return []; }
  });
  const [newChecklistItem, setNewChecklistItem] = useState('');

  // Auto update priority saat deadline berubah (hanya jika mode AUTO aktif)
  useEffect(() => {
    if (!isPriorityManuallySet) {
      const newPriority = calculatePriorityFromDeadline(form.deadline);
      if (newPriority !== form.priority) {
        setForm(prev => ({ ...prev, priority: newPriority }));
      }
    }
  }, [form.deadline, isPriorityManuallySet, form.priority]);

  // Fungsi menghitung priority berdasarkan deadline
  const calculatePriorityFromDeadline = (deadlineStr: string | null): Priority | null => {
    if (!deadlineStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadlineStr);
    deadlineDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays <= 4) return 'HIGH';
    if (diffDays >= 5 && diffDays <= 10) return 'MEDIUM';
    return 'LOW';
  };

  const updateChecklist = useCallback((newList: NoteItem[]) => {
    setChecklist(newList);
    setForm(prev => ({ ...prev, applyNotes: JSON.stringify(newList) }));
  }, []);

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    updateChecklist([...checklist, { id: Date.now().toString(), text: newChecklistItem.trim(), completed: false }]);
    setNewChecklistItem('');
  };

  const toggleChecklistItem = (id: string) => {
    updateChecklist(checklist.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const deleteChecklistItem = (id: string) => {
    updateChecklist(checklist.filter(item => item.id !== id));
  };
  
  const validateDates = (
    deadline: string | null,
    plannedApply: string | null,
    opening: string | null,
    appliedDate: string | null
  ) => {
    const newErrors: typeof errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dDate = deadline ? new Date(deadline) : null;
    const pDate = plannedApply ? new Date(plannedApply) : null;
    const oDate = opening ? new Date(opening) : null;
    const aDate = appliedDate ? new Date(appliedDate) : null;

    [dDate, pDate, oDate, aDate].forEach(d => d?.setHours(0, 0, 0, 0));

    if (pDate && pDate < today) {
      newErrors.plannedApplyDate = 'Planned apply date cannot be in the past.';
    }
    if (oDate && pDate && oDate > pDate) {
      newErrors.openingDate = 'Opening date cannot be after planned apply date.';
      newErrors.plannedApplyDate = 'Planned apply date cannot be before opening date.';
    }
    if (oDate && dDate && oDate > dDate) {
      newErrors.openingDate = 'Opening date cannot be after deadline.';
    }
    if (pDate && dDate && pDate > dDate) {
      newErrors.plannedApplyDate = 'Planned apply date cannot exceed deadline.';
      newErrors.deadline = 'Deadline cannot be before planned apply date.';
    }
    if (aDate && dDate && aDate > dDate) {
      newErrors.appliedDate = 'Applied date cannot be after the deadline.';
    }
    if (aDate && oDate && aDate < oDate) {
      newErrors.appliedDate = 'Applied date cannot be before opening date.';
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Clear errors
    if (name === 'position') setErrors(prev => ({ ...prev, position: undefined }));
    if (name === 'company') setErrors(prev => ({ ...prev, company: undefined }));
    if (name === 'platform') setErrors(prev => ({ ...prev, platform: undefined }));
    if (name === 'plannedApplyDate') setErrors(prev => ({ ...prev, plannedApplyDate: undefined }));
    if (name === 'openingDate') setErrors(prev => ({ ...prev, openingDate: undefined }));
    if (name === 'deadline') setErrors(prev => ({ ...prev, deadline: undefined }));
    if (name === 'appliedDate') setErrors(prev => ({ ...prev, appliedDate: undefined }));

    if (name === 'priority') {
      setIsPriorityManuallySet(true);
    }

    if (name === 'jobType') {
      setForm(prev => ({ ...prev, jobType: value === '' ? null : value as JobType }));
      return;
    }

    if (name === 'workMethod' || name === 'durationUnit' || name === 'location') {
      setForm(prev => ({ ...prev, [name]: value === '' ? null : value }));
      return;
    }

    if (['deadline', 'openingDate', 'plannedApplyDate', 'appliedDate'].includes(name)) {
      setForm(prev => ({ ...prev, [name]: value === '' ? null : value }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    setImporting(true);
    setTimeout(() => {
      const parsed = parseJobPosting(importText);
      setForm(prev => ({ ...prev, ...parsed }));
      setImportText('');
      setIsImportModalOpen(false);
      setImporting(false);
    }, 300);
  };

  const finalSubmit = useCallback(async (finalForm: JobFormData) => {
    setLoading(true);
    try {
      const submitData: any = { ...finalForm };
      const res = await fetch(submitData.id ? `/api/jobs/${submitData.id}` : '/api/jobs', {
        method: submitData.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });
      if (res.ok) {
        if (submitData.id) {
          router.push(`/jobs/${submitData.id}/view`);
        } else {
          router.push('/');
        }
        router.refresh();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleStageConfirm = useCallback((selectedStages: string[]) => {
    const { currentStatus, targetStatus, stagesToUpdate, stagesToReset, isReopen, currentDeadline } = stageConfirm;
    
    const existingDates: Record<string, string | null> = {};
    selectedStages.forEach(stage => {
      const field = getDateFieldName(stage);
      if (field) {
        existingDates[stage] = (form as any)[field] || null;
      }
    });

    setStageConfirm(prev => ({ ...prev, isOpen: false }));
    setTempResetList(stagesToReset);
    setStageDatesModal({
      isOpen: true,
      targetStatus,
      stagesToUpdate: selectedStages,
      allStagesToUpdate: stagesToUpdate,
      existingDates,
      isReopen: isReopen || false,
      currentDeadline,
    });
  }, [stageConfirm, form]);

  const handleStageDatesConfirm = useCallback(async (dates: Record<string, string>, deadline?: string) => {
    const { targetStatus, stagesToUpdate, allStagesToUpdate, isReopen } = stageDatesModal;
    const stagesToResetOriginal = tempResetList;
    
    const unselectedStages = allStagesToUpdate.filter(s => !stagesToUpdate.includes(s));
    const allResetStages = [...stagesToResetOriginal, ...unselectedStages];

    const updatedForm = { ...form, status: targetStatus as JobStatus };
    if (targetStatus === 'CLOSED') {
      updatedForm.plannedApplyDate = null;
    }
    for (const [stage, date] of Object.entries(dates)) {
      const field = getDateFieldName(stage);
      if (field && date) (updatedForm as any)[field] = date;
    }
    for (const stage of allResetStages) {
      const field = getDateFieldName(stage);
      if (field) (updatedForm as any)[field] = null;
    }
    if (isReopen && deadline) {
      updatedForm.deadline = deadline.split('T')[0];
    }

    setStageDatesModal({ isOpen: false, targetStatus: '', stagesToUpdate: [], allStagesToUpdate: [], existingDates: {}, isReopen: false });
    setTempResetList([]);
    await finalSubmit(updatedForm);
  }, [stageDatesModal, tempResetList, form, finalSubmit]);

  const handleDeadlineConfirm = useCallback(async (deadlineDate: string) => {
    const updatedForm = { 
      ...form, 
      status: JobStatus.CLOSED, 
      deadline: deadlineDate.split('T')[0],
      plannedApplyDate: null
    };
    await finalSubmit(updatedForm);
  }, [form, finalSubmit]);

  const validateAppliedDateRequired = () => {
    if (form.status === 'BACKLOG' || form.status === 'APPLYING' || form.status === 'CLOSED') {
      setErrors(prev => ({ ...prev, appliedDate: undefined }));
      return true;
    }
    if (!form.appliedDate) {
      setErrors(prev => ({ ...prev, appliedDate: 'Applied date is required for this status.' }));
      return false;
    }
    setErrors(prev => ({ ...prev, appliedDate: undefined }));
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.position.trim()) {
      setErrors(prev => ({ ...prev, position: 'Position is required.' }));
      setActiveTab(0);
      return;
    }
    if (!form.company.trim()) {
      setErrors(prev => ({ ...prev, company: 'Company is required.' }));
      setActiveTab(0);
      return;
    }
    if (!form.platform?.trim()) {
      setErrors(prev => ({ ...prev, platform: 'Platform is required.' }));
      setActiveTab(0);
      return;
    }
    if (!validateDates(form.deadline, form.plannedApplyDate, form.openingDate, form.appliedDate)) return;
    if (!validateAppliedDateRequired()) {
      setActiveTab(1);
      return;
    }
    if (form.deadline && form.status !== 'CLOSED') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deadlineDate = new Date(form.deadline);
      if (deadlineDate < today) {
        setExpiredConfirmOpen(true);
        return;
      }
    }
    const original = originalStatus;
    const newStatus = form.status;

    if (!original || original === newStatus) {
      await finalSubmit(form);
      return;
    }

    if (String(newStatus) === 'CLOSED') {
      setShowDeadlineModal(true);
      return;
    }

    if (String(original) === 'CLOSED' && String(newStatus) !== 'CLOSED') {
      const targetIdx = STATUS_ORDER.indexOf(newStatus);
      const appliedIdx = STATUS_ORDER.indexOf('APPLIED');
      if (targetIdx >= appliedIdx) {
        const { stagesToUpdate, stagesToReset } = getReopenStages(newStatus);
        setStageConfirm({
          isOpen: true,
          currentStatus: original,
          targetStatus: newStatus,
          stagesToUpdate,
          stagesToReset,
          isForward: false,
          isReopen: true,
          currentDeadline: form.deadline || undefined,
        });
      } else {
        const updatedForm = { ...form, status: newStatus };
        await finalSubmit(updatedForm);
      }
      return;
    }

    const { stagesToUpdate, stagesToReset } = getStagesAffected(original, newStatus);
    const isForward = STATUS_ORDER.indexOf(newStatus) > STATUS_ORDER.indexOf(original);
    setStageConfirm({
      isOpen: true,
      currentStatus: original,
      targetStatus: newStatus,
      stagesToUpdate,
      stagesToReset,
      isForward,
      isReopen: false,
    });
  };

  const handleExpiredConfirm = useCallback(() => {
    setExpiredConfirmOpen(false);
    const { stagesToUpdate, stagesToReset } = getStagesAffected(form.status, 'CLOSED');
    setStageConfirm({
      isOpen: true,
      currentStatus: form.status,
      targetStatus: 'CLOSED',
      stagesToUpdate,
      stagesToReset,
      isForward: true,
      isReopen: false,
    });
  }, [form.status]);

  const handleDelete = () => {
    if (!form.id) return;
    openModal({
      title: 'Delete Job?',
      message: 'This job application will be permanently deleted.',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/jobs/${form.id}`, { method: 'DELETE' });
          if (res.ok) { router.push('/'); router.refresh(); }
          else throw new Error('Delete failed');
        } catch { alert('Delete failed'); }
      },
    });
  };

  const getTemplateText = () => `Position: [Job Title]
Company: [Company Name]
Job Type: [FULL_TIME|PART_TIME|CONTRACT|INTERNSHIP|FREELANCE|PROJECT_BASED|BOOTCAMP]
Work Method: [REMOTE|HYBRID|ONSITE|OFFICE|FLEXIBLE]
Location: [City/Country]
Duration: [number]
Duration Unit: [MONTHS|YEARS|WEEKS|DAYS]
Platform: [LinkedIn/Jobstreet/Indeed/etc.]
Apply Link: [URL/email/phone]
Source Link: [URL]
Description: [Paste job description here]
Requirement: [List qualifications]
Deadline: [YYYY-MM-DD]
Opening Date: [YYYY-MM-DD]`;

  const TabHeader = () => (
    <div className="flex border-b border-neutral-200 bg-neutral-50/40 rounded-t-2xl overflow-x-auto">
      {tabs.map((tab, idx) => (
        <button
          key={tab}
          type="button"
          onClick={() => setActiveTab(idx)}
          className={`flex-1 px-5 py-3 text-sm font-semibold transition-all relative whitespace-nowrap ${
            activeTab === idx
              ? 'text-primary-700 bg-white border-b-2 border-primary-500'
              : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100/50'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );

  // Opsi untuk job type dengan "Please select"
  const jobTypeOptions = [
    { value: '', label: 'Please select' },
    ...Object.values(JobType).map(jt => ({ value: jt, label: formatJobType(jt) }))
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 px-4 py-2 rounded-xl transition-all shadow-sm"
        >
          <ArrowLeft size={16} className="text-neutral-500" />
          <span>Back</span>
        </button>
        {!form.id && (
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 bg-green-100 border border-neutral-200 hover:bg-neutral-50 hover:border-green-300 px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            <Sparkles size={16} />
            <span>Quick Import</span>
          </button>
        )}
      </div>

      {/* Hero Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl shadow-md shadow-primary-500/20">
            <Briefcase className="text-white" size={24} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              {form.id ? 'Edit Job Application' : 'Create New Job Application'}
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              {form.id ? 'Update details to keep your tracking accurate.' : 'Fill in the details to start tracking your application journey.'}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabHeader />

      {/* Tab Content */}
      <div className="bg-white rounded-b-2xl border border-t-0 border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-6">
          {activeTab === 0 && (
            <div className="space-y-6">
              <FormRow>
                <Label label="Position" required />
                <InputWrapper error={errors.position}>
                  <TextInput name="position" value={form.position} onChange={handleInputChange} required placeholder="e.g., Frontend Developer" />
                </InputWrapper>
              </FormRow>
              <FormRow>
                <Label label="Company" required />
                <InputWrapper error={errors.company}>
                  <TextInput name="company" value={form.company} onChange={handleInputChange} required placeholder="e.g., PT Tech Solutions" />
                </InputWrapper>
              </FormRow>
              <FormRow>
                <Label label="Office Location" />
                <InputWrapper>
                  <TextInput
                    name="location"
                    value={form.location || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., Jakarta"
                  />
                </InputWrapper>
              </FormRow>
              <FormRow>
                <Label label="Job Type" />
                <InputWrapper>
                  <select
                    name="jobType"
                    value={form.jobType === null ? '' : form.jobType}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleInputChange({ target: { name: 'jobType', value: val === '' ? null : val } } as any);
                    }}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm bg-white appearance-none cursor-pointer transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  >
                    {jobTypeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </InputWrapper>
              </FormRow>
              <FormRow>
                <Label label="Work Method" />
                <InputWrapper>
                  <select
                    name="workMethod"
                    value={form.workMethod || ''}
                    onChange={handleInputChange}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm bg-white appearance-none cursor-pointer transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="">Please select</option>
                    {Object.values(WorkMethod).map(method => (
                      <option key={method} value={method}>{formatWorkMethodLabel(method)}</option>
                    ))}
                  </select>
                </InputWrapper>
              </FormRow>
              <FormRow className="items-center">
                <Label label="Duration" />
                <div className="sm:col-span-2 grid grid-cols-5 gap-2">
                  <InputWrapper>
                    <TextInput
                      name="duration"
                      value={form.duration || ''}
                      onChange={handleInputChange}
                      type="number"
                      placeholder="e.g., 6"
                    />
                  </InputWrapper>
                  <InputWrapper>
                    <select
                      name="durationUnit"
                      value={form.durationUnit || ''}
                      onChange={handleInputChange}
                      className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm bg-white appearance-none cursor-pointer transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="">Please select</option>
                      {Object.values(DurationUnit).map(unit => (
                        <option key={unit} value={unit}>{formatDurationUnitLabel(unit)}</option>
                      ))}
                    </select>
                  </InputWrapper>
                </div>
              </FormRow>
              <FormRow>
                <Label label="Apply Link" />
                <InputWrapper>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <TextInput 
                        name="applyLink" 
                        value={form.applyLink} 
                        onChange={handleInputChange} 
                        type="text" 
                        placeholder="https://..., email@domain.com, or phone number" 
                      />
                    </div>
                    {form.applyLink && isValidUrl(form.applyLink) && (
                      <a 
                        href={form.applyLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1 text-sm text-primary-600 bg-primary-50 px-3 py-2.5 rounded-xl hover:bg-primary-100 transition"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">Fill in the application link, HR contact email, or telephone number.</p>
                </InputWrapper>
              </FormRow>
              <FormRow><Label label="Requirements" /><InputWrapper><TextArea name="requirement" value={form.requirement} onChange={handleInputChange} rows={6} placeholder="List key qualifications and skills..." /></InputWrapper></FormRow>
              <FormRow><Label label="Job Description" /><InputWrapper><TextArea name="description" value={form.description} onChange={handleInputChange} rows={8} placeholder="Paste the full job description here..." /></InputWrapper></FormRow>
              <FormRow>
                <Label label="Platform" required />
                <InputWrapper error={errors.platform}>
                  <TextInput
                    name="platform"
                    value={form.platform || ''}
                    onChange={handleInputChange}
                    required
                    placeholder="LinkedIn, Jobstreet, etc."
                  />
                </InputWrapper>
              </FormRow>
              <FormRow>
                <Label label="Source Link" />
                <InputWrapper>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <TextInput 
                        name="sourceLink" 
                        value={form.sourceLink} 
                        onChange={handleInputChange} 
                        type="text" 
                        placeholder="https://... (job source)" 
                      />
                    </div>
                    {form.sourceLink && isValidUrl(form.sourceLink) && (
                      <a 
                        href={form.sourceLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1 text-sm text-primary-600 bg-primary-50 px-3 py-2.5 rounded-xl hover:bg-primary-100 transition"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </InputWrapper>
              </FormRow>
              <FormRow><Label label="Recruitment Status" /><InputWrapper><select name="status" value={form.status} onChange={handleInputChange} className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm bg-white appearance-none cursor-pointer transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20">{Object.values(JobStatus).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select></InputWrapper></FormRow>
            </div>
          )}

          {activeTab === 1 && (
            <div className="space-y-6">
              <FormRow><Label label="Opening Date" /><InputWrapper error={errors.openingDate}><DateInput name="openingDate" value={form.openingDate} onChange={handleInputChange} error={errors.openingDate} /></InputWrapper></FormRow>
              <FormRow><Label label="Deadline" /><InputWrapper error={errors.deadline}><DateInput name="deadline" value={form.deadline} onChange={handleInputChange} error={errors.deadline} /></InputWrapper></FormRow>
              <FormRow>
                <Label label="Applied Date" />
                <InputWrapper error={errors.appliedDate}>
                  <DateInput name="appliedDate" value={form.appliedDate} onChange={handleInputChange} />
                  <p className="text-[11px] text-neutral-500 mt-1">The date you actually applied (required when status is not BACKLOG or APPLYING).</p>
                </InputWrapper>
              </FormRow>
              <FormRow>
                <Label label="Priority" />
                <InputWrapper>
                  <select
                    name="priority"
                    value={isPriorityManuallySet ? (form.priority || '') : 'AUTO'}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'AUTO') {
                        setIsPriorityManuallySet(false);
                        const autoPriority = calculatePriorityFromDeadline(form.deadline);
                        setForm(prev => ({ ...prev, priority: autoPriority }));
                      } else {
                        setIsPriorityManuallySet(true);
                        setForm(prev => ({ ...prev, priority: val as Priority }));
                      }
                    }}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm bg-white appearance-none cursor-pointer transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="AUTO">Auto (based on deadline)</option>
                    {Object.values(Priority).map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </InputWrapper>
              </FormRow>
            </div>
          )}

          {activeTab === 2 && (
            <div className="space-y-6">
              <FormRow>
                <Label label="Planned Apply Date" />
                <InputWrapper error={errors.plannedApplyDate}>
                  <DateInput name="plannedApplyDate" value={form.plannedApplyDate} onChange={handleInputChange} error={errors.plannedApplyDate} />
                </InputWrapper>
              </FormRow>

              {/* Preparation Checklist */}
              <FormRow>
                <Label label="Preparation Checklist" />
                <InputWrapper>
                  <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
                    <div className="max-h-64 overflow-y-auto space-y-1 p-2">
                      {checklist.length === 0 && (
                        <div className="text-center text-neutral-400 text-sm py-6">
                          No checklist items yet. Add tasks to prepare.
                        </div>
                      )}
                      {checklist.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-neutral-100 hover:border-neutral-200 transition-all">
                          <button type="button" onClick={() => toggleChecklistItem(item.id)} className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${item.completed ? 'bg-success-500 border-success-500 text-white' : 'border-neutral-300 bg-white hover:border-success-300'}`}>
                            {item.completed && <CheckCircle2 size={14} />}
                          </button>
                          <span className={`flex-1 text-sm ${item.completed ? 'line-through text-neutral-400' : 'text-neutral-700'}`}>{item.text}</span>
                          <button type="button" onClick={() => deleteChecklistItem(item.id)} className="text-neutral-400 hover:text-danger-500 transition-colors p-1"><Trash2 size={15} /></button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 p-3 border-t border-neutral-100 bg-neutral-50">
                      <input type="text" value={newChecklistItem} onChange={(e) => setNewChecklistItem(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())} className="flex-1 border border-neutral-200 rounded-xl px-4 py-2 text-sm bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500" placeholder="Add a task..." />
                      <button type="button" onClick={addChecklistItem} className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1"><Plus size={16} /> Add</button>
                    </div>
                  </div>
                </InputWrapper>
              </FormRow>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4 border-t border-neutral-200 mt-4">
        {form.id && (
          <button type="button" onClick={handleDelete} className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl transition-colors">
            <Trash2 size={16} /> Delete Job
          </button>
        )}
        <div className="flex gap-3 ml-auto">
          <button type="button" onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 px-5 py-2.5 rounded-xl transition-all">Cancel</button>
          <form onSubmit={handleSubmit}>
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 px-6 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50">
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span>{loading ? 'Saving...' : 'Save Application'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-neutral-950/40">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-neutral-200 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-2"><Sparkles size={20} className="text-success-500" /><h3 className="font-bold text-lg text-neutral-900">Import from Job Posting</h3></div>
              <button onClick={() => setIsImportModalOpen(false)} className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-600">Paste the job posting text. The system will extract position, company, description, requirements, and apply link.</p>
                <button
                  type="button"
                  onClick={() => setShowTemplate(!showTemplate)}
                  className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-2"
                >
                  <FileJson size={20} /> {showTemplate ? 'Hide Template' : 'Show Template'}
                </button>
                
              </div>
              {showTemplate && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs font-mono whitespace-pre-wrap text-neutral-700">
                  {getTemplateText()}
                </div>
              )}
              <textarea value={importText} onChange={(e) => setImportText(e.target.value)} rows={8} placeholder="Paste the full job posting here..." className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm resize-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-xl transition-colors">Cancel</button>
                <button type="button" onClick={handleImport} disabled={importing || !importText.trim()} className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold text-sm rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-2">
                  {importing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  <span>{importing ? 'Importing...' : 'Import & Fill'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal CLOSED */}
      <DeadlineModal isOpen={showDeadlineModal} onClose={() => setShowDeadlineModal(false)} onConfirm={handleDeadlineConfirm} positionName={form.position} companyName={form.company} />

      {/* Stage Transition Confirm Modal */}
      <StageTransitionConfirmModal
        isOpen={stageConfirm.isOpen}
        onClose={() => setStageConfirm(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleStageConfirm}
        jobPosition={form.position}
        jobCompany={form.company}
        currentStatus={stageConfirm.currentStatus}
        targetStatus={stageConfirm.targetStatus}
        stagesToUpdate={stageConfirm.stagesToUpdate}
        stagesToReset={stageConfirm.stagesToReset}
        isForward={stageConfirm.isForward}
        customTitle={stageConfirm.isReopen ? "Reopen Job Application" : undefined}
      />

      {/* Stage Dates Input Modal */}
      <StageDatesInputModal
        isOpen={stageDatesModal.isOpen}
        onClose={() => setStageDatesModal({ isOpen: false, targetStatus: '', stagesToUpdate: [], allStagesToUpdate: [], existingDates: {}, isReopen: false })}
        onBack={() => { setStageDatesModal(prev => ({ ...prev, isOpen: false })); setStageConfirm(prev => ({ ...prev, isOpen: true })); }}
        onConfirm={handleStageDatesConfirm}
        jobPosition={form.position}
        jobCompany={form.company}
        targetStatus={stageDatesModal.targetStatus}
        stagesToUpdate={stageDatesModal.stagesToUpdate}
        existingDates={stageDatesModal.existingDates}
        isReopen={stageDatesModal.isReopen}
        currentDeadline={stageDatesModal.currentDeadline}
      />

      {/* Modal konfirmasi deadline kadaluarsa */}
      <AlertModal
        isOpen={expiredConfirmOpen}
        onClose={() => setExpiredConfirmOpen(false)}
        title="Deadline Lewat"
        message={`Deadline (${form.deadline}) sudah lewat dari hari ini. Apakah Anda ingin menutup job ini (pindah ke CLOSED)?`}
        confirmText="Ya, Tutup Job"
        cancelText="Tidak, Batalkan"
        onConfirm={handleExpiredConfirm}
      />
    </div>
  );
}