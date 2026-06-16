'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { X, Calendar, CheckCircle2, Clock, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { formatStageLabel } from '@/lib/utils';

const STATUS_ORDER = [
  'BACKLOG', 'APPLYING', 'APPLIED', 'ADMIN_SCREENING', 'ASSESSMENT', 'FGD_LGD',
  'INTERVIEW_HR', 'INTERVIEW_USER', 'INTERVIEW_EXECUTIVE', 'MEDICAL_CHECK_UP', 'OFFERING', 'CLOSED'
];

interface StageDatesInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dates: Record<string, string>, deadline?: string) => Promise<void> | void;
  onBack?: () => void;
  jobPosition: string;
  jobCompany: string;
  targetStatus: string;
  stagesToUpdate: string[];
  existingDates: Record<string, string | null>;
  isReopen?: boolean;
  currentDeadline?: string;
  showDeadline?: boolean;
}

const formatDateToYMD = (dateValue: any): string => {
  if (!dateValue) return '';
  try {
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
};

export default function StageDatesInputModal({
  isOpen,
  onClose,
  onConfirm,
  onBack,
  jobPosition,
  jobCompany,
  targetStatus,
  stagesToUpdate,
  existingDates,
  isReopen = false,
  currentDeadline = '',
  showDeadline = false,
}: StageDatesInputModalProps) {
  const [dates, setDates] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deadline, setDeadline] = useState('');
  const [deadlineError, setDeadlineError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isInitializedRef = useRef(false);

  const orderedStages = useMemo(() => {
    return [...stagesToUpdate].sort((a, b) => STATUS_ORDER.indexOf(a) - STATUS_ORDER.indexOf(b));
  }, [stagesToUpdate]);

  const todayString = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Inisialisasi state
  useEffect(() => {
    if (isOpen && !isInitializedRef.current) {
      isInitializedRef.current = true;
      const initial: Record<string, string> = {};
      orderedStages.forEach((stage) => {
        initial[stage] = formatDateToYMD(existingDates[stage]);
      });
      if (orderedStages.length === 1 && !initial[orderedStages[0]]) {
        initial[orderedStages[0]] = todayString;
      }
      setDates(initial);
      setErrors({});

      if (isReopen) {
        const defaultDeadline = currentDeadline || (() => {
          const now = new Date();
          now.setHours(23, 59, 59, 999);
          return now.toISOString().slice(0, 16);
        })();
        setDeadline(defaultDeadline);
        setDeadlineError('');
      }
    }
  }, [isOpen, orderedStages, existingDates, isReopen, currentDeadline, todayString]);

  useEffect(() => {
    if (!isOpen) isInitializedRef.current = false;
  }, [isOpen]);

  // Validasi real-time (urutan tanggal, appliedDate <= deadline)
  useEffect(() => {
    if (!isOpen) return;
    const newErrors: Record<string, string> = {};

    for (const stage of orderedStages) {
      if (!dates[stage]) {
        newErrors[stage] = `${formatStageLabel(stage)} date is required.`;
      }
    }

    const entries = orderedStages.map(s => ({ stage: s, date: dates[s] })).filter(i => i.date);
    for (let i = 0; i < entries.length - 1; i++) {
      const cur = entries[i], next = entries[i+1];
      if (new Date(cur.date) > new Date(next.date)) {
        newErrors[next.stage] = `${formatStageLabel(next.stage)} date cannot be earlier than ${formatStageLabel(cur.stage)} date.`;
        newErrors[cur.stage] = `${formatStageLabel(cur.stage)} date cannot be later than ${formatStageLabel(next.stage)} date.`;
      }
    }

    const deadlineToCheck = isReopen ? deadline : currentDeadline;
    if (orderedStages.includes('APPLIED') && deadlineToCheck && dates['APPLIED']) {
      const appliedDateObj = new Date(dates['APPLIED']);
      const deadlineDateObj = new Date(deadlineToCheck);
      if (appliedDateObj > deadlineDateObj) {
        newErrors['APPLIED'] = `Applied date cannot be later than deadline (${formatDateToYMD(deadlineToCheck)}).`;
      }
    }

    setErrors(prev => {
      const prevKeys = Object.keys(prev), newKeys = Object.keys(newErrors);
      if (prevKeys.length !== newKeys.length) return newErrors;
      for (const k of newKeys) if (prev[k] !== newErrors[k]) return newErrors;
      return prev;
    });
  }, [dates, orderedStages, isOpen, isReopen, deadline, currentDeadline]);

  // Validasi deadline untuk reopen
  useEffect(() => {
    if (isReopen && isOpen) {
      if (!deadline) {
        setDeadlineError('New deadline is required for reopening.');
      } else {
        setDeadlineError('');
      }
    }
  }, [deadline, isReopen, isOpen]);

  const hasDateErrors = Object.keys(errors).length > 0;
  const hasDeadlineError = isReopen && !!deadlineError;
  const isValid = !hasDateErrors && !hasDeadlineError && !isSubmitting;

  const [deadlineForClose, setDeadlineForClose] = useState('');

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setIsSubmitting(true);
    try {
      if (isReopen) {
        await onConfirm(dates, deadline);
      } else if (showDeadline) {
        // deadlineForClose boleh kosong -> kirim undefined agar tidak mengupdate field deadline
        await onConfirm(dates, deadlineForClose || undefined);
      } else {
        await onConfirm(dates, deadlineForClose || undefined);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateChange = (stage: string, value: string) => {
    setDates(prev => ({ ...prev, [stage]: value }));
  };

  const filledCount = Object.values(dates).filter(d => d).length;
  const totalCount = orderedStages.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-neutral-100 bg-gradient-to-r from-primary-50 to-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary-100 rounded-lg text-primary-600"><Calendar size={18} strokeWidth={1.8} /></div>
            <h3 className="font-bold text-base text-neutral-900">{isReopen ? 'Reopen Job Application' : 'Set Stage Dates'}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg"><X size={18} /></button>
        </div>

        <div className="px-4 pt-4 pb-2">
          <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
            <p className="text-sm font-semibold text-neutral-800">{jobPosition}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{jobCompany}</p>
            <div className="mt-2 pt-2 border-t border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2"><Clock size={12} className="text-primary-500" />
                <p className="text-xs text-neutral-600">Moving to: <span className="font-medium text-primary-700">{formatStageLabel(targetStatus)}</span></p>
              </div>
              <div className="text-xs text-neutral-400">{filledCount}/{totalCount} filled</div>
            </div>
          </div>
        </div>

        <div className="max-h-[45vh] overflow-y-auto px-4 space-y-3">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isReopen && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-800 mb-2">
                  <AlertCircle size={14} className="text-amber-600" /> New Deadline <span className="text-danger-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm bg-white focus:border-primary-500 focus:ring-2"
                />
                {deadlineError && <p className="text-xs text-danger-500 mt-1 flex items-center gap-1"><AlertCircle size={12} /> {deadlineError}</p>}
                <p className="text-[11px] text-neutral-500 mt-1">Can be any date (past, today, or future).</p>
              </div>
            )}

            {showDeadline && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-800 mb-2">
                  <AlertCircle size={14} className="text-amber-600" /> Deadline Applied <span className="text-neutral-400 text-xs">(Optional)</span>
                </label>
                <input
                  type="date"
                  value={deadlineForClose}
                  onChange={(e) => setDeadlineForClose(e.target.value)}
                  className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm bg-white focus:border-primary-500 focus:ring-2"
                />
                <p className="text-[11px] text-neutral-500 mt-1">Can be any date (past allowed) or left empty.</p>
              </div>
            )}

            {!isReopen && currentDeadline && (
              <div className="bg-neutral-100 rounded-lg p-2 text-xs text-neutral-600 flex items-center gap-2">
                <Calendar size={12} /> Current deadline: {formatDateToYMD(currentDeadline)}
              </div>
            )}

            {orderedStages.map((stage) => (
              <div key={stage} className="bg-white border border-neutral-200 rounded-xl p-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-800 mb-2">
                  <CheckCircle2 size={14} className="text-primary-500" /> {formatStageLabel(stage)} Date <span className="text-danger-500 text-xs">*</span>
                </label>
                <input
                  type="date"
                  value={dates[stage] || ''}
                  onChange={(e) => handleDateChange(stage, e.target.value)}
                  className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm bg-white focus:border-primary-500"
                  required
                />
                {errors[stage] && <p className="text-xs text-danger-500 mt-1"><AlertCircle size={12} /> {errors[stage]}</p>}
              </div>
            ))}
          </form>
        </div>

        <div className="px-4 pt-2 pb-1">
          <div className="bg-blue-50 rounded-lg p-2 border border-blue-100 text-[11px] text-blue-700">
            <Calendar size={12} className="inline mr-1" /> All dates are required and must be in chronological order (can be equal).
            {isReopen && ' Deadline can be any date (past allowed).'}
            {!isReopen && currentDeadline && ' Applied date cannot exceed the current deadline.'}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 pt-2 bg-neutral-50/50">
          {onBack && <button type="button" onClick={onBack} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-neutral-700 bg-white border rounded-xl"><ArrowLeft size={13} /> Back</button>}
          <button type="button" onClick={handleSubmit} disabled={!isValid} className={`px-4 py-2 text-sm font-semibold text-white rounded-xl flex items-center gap-2 ${isValid ? 'bg-primary-600 hover:bg-primary-700' : 'bg-neutral-400 cursor-not-allowed'}`}>
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            <span>{isSubmitting ? 'Processing...' : (isReopen ? 'Confirm Reopen' : 'Confirm & Continue')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}