'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Calendar, CheckCircle2, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import { formatStageLabel } from '@/lib/utils';

const STATUS_ORDER = [
  'BACKLOG', 'APPLYING', 'APPLIED', 'ADMIN_SCREENING', 'ASSESSMENT', 'FGD_LGD',
  'INTERVIEW_HR', 'INTERVIEW_USER', 'INTERVIEW_EXECUTIVE', 'MEDICAL_CHECK_UP', 'OFFERING', 'CLOSED'
];

interface StageDatesInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dates: Record<string, string>, deadline?: string) => void;
  onBack?: () => void;
  jobPosition: string;
  jobCompany: string;
  targetStatus: string;
  stagesToUpdate: string[];
  existingDates: Record<string, string | null>;
  isReopen?: boolean;
  currentDeadline?: string;
}

const formatDateToYMD = (dateValue: any): string => {
  if (!dateValue) return '';
  try {
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
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
}: StageDatesInputModalProps) {
  const [dates, setDates] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deadline, setDeadline] = useState('');
  const [deadlineError, setDeadlineError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    if (isOpen) {
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

  // Validasi real-time (required, kronologis, dan deadline vs applied date)
  useEffect(() => {
    if (!isOpen) return;
    const newErrors: Record<string, string> = {};

    // Required check
    for (const stage of orderedStages) {
      if (!dates[stage]) {
        newErrors[stage] = `${formatStageLabel(stage)} date is required.`;
      }
    }

    // Chronological check
    const entries = orderedStages
      .map((stage) => ({ stage, date: dates[stage] }))
      .filter(item => item.date);
    for (let i = 0; i < entries.length - 1; i++) {
      const current = entries[i];
      const next = entries[i + 1];
      const currentDate = new Date(current.date);
      const nextDate = new Date(next.date);
      if (currentDate > nextDate) {
        newErrors[next.stage] = `${formatStageLabel(next.stage)} date cannot be earlier than ${formatStageLabel(current.stage)} date.`;
        newErrors[current.stage] = `${formatStageLabel(current.stage)} date cannot be later than ${formatStageLabel(next.stage)} date.`;
      }
    }
    setErrors(newErrors);

    // Validasi khusus untuk reopen: deadline tidak boleh lebih kecil dari applied date
    if (isReopen && deadline) {
      const appliedDateStr = dates['APPLIED'];
      if (appliedDateStr) {
        const appliedDateObj = new Date(appliedDateStr);
        const deadlineObj = new Date(deadline);
        // Bandingkan tanggal (abaikan jam)
        appliedDateObj.setHours(0, 0, 0, 0);
        deadlineObj.setHours(0, 0, 0, 0);
        if (deadlineObj < appliedDateObj) {
          setDeadlineError('Deadline cannot be earlier than applied date.');
        } else {
          if (deadlineError === 'Deadline cannot be earlier than applied date.') {
            setDeadlineError('');
          }
        }
      }
    }
  }, [dates, orderedStages, isOpen, isReopen, deadline, deadlineError]);

  const hasDateErrors = Object.keys(errors).length > 0;
  const hasDeadlineError = isReopen && !!deadlineError;
  const isValid = !hasDateErrors && !hasDeadlineError && !isSubmitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setIsSubmitting(true);
    try {
      if (isReopen) {
        if (!deadline) {
          setDeadlineError('New deadline is required for reopening.');
          return;
        }
        // Tidak ada validasi deadline di masa lalu
        onConfirm(dates, deadline);
      } else {
        onConfirm(dates);
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
            <div className="p-1.5 bg-primary-100 rounded-lg text-primary-600">
              <Calendar size={18} strokeWidth={1.8} />
            </div>
            <h3 className="font-bold text-base text-neutral-900">
              {isReopen ? 'Reopen Job Application' : 'Set Stage Dates'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pt-4 pb-2">
          <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
            <p className="text-sm font-semibold text-neutral-800">{jobPosition}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{jobCompany}</p>
            <div className="mt-2 pt-2 border-t border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={12} className="text-primary-500" />
                <p className="text-xs text-neutral-600">
                  Moving to: <span className="font-medium text-primary-700">{formatStageLabel(targetStatus)}</span>
                </p>
              </div>
              <div className="text-xs text-neutral-400">
                {filledCount}/{totalCount} filled
              </div>
            </div>
          </div>
        </div>

        <div className="max-h-[45vh] overflow-y-auto px-4 space-y-3">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isReopen && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-800 mb-2">
                  <AlertCircle size={14} className="text-amber-600" />
                  New Deadline <span className="text-danger-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={deadline}
                  onChange={(e) => {
                    setDeadline(e.target.value);
                    setDeadlineError('');
                  }}
                  className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
                />
                {deadlineError && (
                  <p className="text-xs text-danger-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {deadlineError}
                  </p>
                )}
                <p className="text-[10px] text-neutral-500 mt-1">
                  Can be past, today, or future. Must be ≥ applied date if applied date exists.
                </p>
              </div>
            )}

            {orderedStages.map((stage) => (
              <div key={stage} className="bg-white border border-neutral-200 rounded-xl p-3 hover:border-primary-200 transition-colors">
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-800 mb-2">
                  <CheckCircle2 size={14} className="text-primary-500" />
                  {formatStageLabel(stage)} Date <span className="text-danger-500 text-xs">*</span>
                </label>
                <input
                  type="date"
                  value={dates[stage] || ''}
                  onChange={(e) => handleDateChange(stage, e.target.value)}
                  className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
                  required
                />
                {errors[stage] && (
                  <p className="text-xs text-danger-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors[stage]}
                  </p>
                )}
              </div>
            ))}
          </form>
        </div>

        <div className="px-4 pt-2 pb-1">
          <div className="bg-blue-50 rounded-lg p-2 border border-blue-100 text-[11px] text-blue-700 flex items-start gap-2">
            <Calendar size={12} className="flex-shrink-0 mt-0.5" />
            <span>
              All dates are required and must be in chronological order (can be equal). {isReopen && 'Deadline must be ≥ applied date (if applied date is set).'}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 pt-2 bg-neutral-50/50">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-sm font-semibold text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-xl transition shadow-sm flex items-center gap-1"
            >
              <ArrowLeft size={14} /> Back
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition flex items-center gap-2 ${
              isValid ? 'bg-primary-600 hover:bg-primary-700 active:scale-95' : 'bg-neutral-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 size={14} />
            {isReopen ? 'Confirm Reopen' : 'Confirm & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}