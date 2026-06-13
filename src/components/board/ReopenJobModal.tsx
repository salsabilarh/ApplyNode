'use client';

import { useState, useEffect } from 'react';
import { RotateCcw, X, AlertCircle, Calendar, CheckCircle2 } from 'lucide-react';

interface ReopenJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newDeadline: string, appliedDate?: string | null) => void;
  positionName: string;
  companyName: string;
  currentDeadline: string;
  targetStatus: string;
}

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

export default function ReopenJobModal({
  isOpen,
  onClose,
  onConfirm,
  positionName,
  companyName,
  currentDeadline,
  targetStatus,
}: ReopenJobModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [appliedDate, setAppliedDate] = useState('');
  const [error, setError] = useState('');
  const [appliedDateError, setAppliedDateError] = useState('');

  const needsAppliedDate = ADVANCED_STATUSES.includes(targetStatus);

  const getTodayDefault = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T23:59`;
  };

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(getTodayDefault());
      setAppliedDate(getTodayString());
      setError('');
      setAppliedDateError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateDeadline = (deadline: string) => {
    const selected = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
      return 'Deadline cannot be in the past when reopening a job.';
    }
    return '';
  };

  const validateAppliedDate = (date: string) => {
    if (!date && needsAppliedDate) return 'Applied date is required.';
    if (date) {
      const todayStr = getTodayString();
      if (date > todayStr) {
        return 'Applied date cannot be in the future.';
      }
    }
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const deadlineError = validateDeadline(selectedDate);
    if (deadlineError) {
      setError(deadlineError);
      return;
    }
    if (needsAppliedDate) {
      const appError = validateAppliedDate(appliedDate);
      if (appError) {
        setAppliedDateError(appError);
        return;
      }
    }
    onConfirm(selectedDate, needsAppliedDate ? appliedDate : null);
  };

  const targetLabel = targetStatus.replace(/_/g, ' ');
  const isAdvanced = needsAppliedDate;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl border border-neutral-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <div className="flex items-center gap-2 text-primary-600">
            <RotateCcw size={20} strokeWidth={1.8} />
            <h3 className="font-bold text-base text-neutral-900">Reopen Job Application</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Job info */}
        <div className="p-5 bg-neutral-50 border-b border-neutral-100">
          <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">Job Details</p>
          <p className="text-sm font-bold text-neutral-800 mt-1">{positionName}</p>
          <p className="text-sm text-neutral-600">{companyName}</p>
        </div>

        {/* Warning message */}
        <div className="p-5 border-b border-neutral-100 bg-amber-50">
          <p className="text-sm text-amber-800">
            ⚠️ You are about to reopen this job to <strong>{targetLabel}</strong>.
            {isAdvanced && ' You also need to fill in the applied date.'}
          </p>
        </div>

        {/* Deadline error */}
        {error && (
          <div className="mx-5 mt-5 p-3 bg-danger-50 text-danger-700 text-xs rounded-xl border border-danger-200 flex gap-2 items-start">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Deadline field */}
          <div>
            <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wide">
              New Deadline (required)
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                required
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  if (error) setError('');
                }}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 font-medium outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>
            <p className="text-[11px] text-neutral-500 mt-1.5">Must be today or future.</p>
          </div>

          {/* Applied date field (only if target status is advanced) */}
          {needsAppliedDate && (
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wide">
                Applied Date (required)
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={appliedDate}
                  onChange={(e) => {
                    setAppliedDate(e.target.value);
                    if (appliedDateError) setAppliedDateError('');
                  }}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 font-medium outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
              {appliedDateError && (
                <p className="text-xs text-danger-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {appliedDateError}
                </p>
              )}
              <p className="text-[11px] text-neutral-500 mt-1.5">Date when you applied (can be past or today).</p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-sm rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all active:scale-95"
            >
              Confirm & Reopen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}