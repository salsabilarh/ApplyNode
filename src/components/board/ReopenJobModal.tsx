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
  'APPLIED', 'ADMIN_SCREENING', 'ASSESSMENT', 'FGD_LGD', 'INTERVIEW_HR',
  'INTERVIEW_USER', 'INTERVIEW_EXECUTIVE', 'MEDICAL_CHECK_UP', 'OFFERING',
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
    if (selected < today) return 'Deadline cannot be in the past when reopening a job.';
    return '';
  };

  const validateAppliedDate = (date: string) => {
    if (!date && needsAppliedDate) return 'Applied date is required.';
    if (date && date > getTodayString()) return 'Applied date cannot be in the future.';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-neutral-100 bg-gradient-to-r from-primary-50 to-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary-100 rounded-lg text-primary-600">
              <RotateCcw size={18} />
            </div>
            <h3 className="font-bold text-base text-neutral-900">Reopen Job Application</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Job Info Card */}
        <div className="p-5 pb-0">
          <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
            <p className="text-sm font-semibold text-neutral-800">{positionName}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{companyName}</p>
            <div className="mt-2 pt-2 border-t border-neutral-200 flex items-center gap-2">
              <RotateCcw size={12} className="text-primary-500" />
              <p className="text-xs text-neutral-600">
                Reopening to: <span className="font-medium">{targetLabel}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="px-5">
          <div className="bg-amber-50 p-3 rounded-xl text-amber-800 text-sm flex items-start gap-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>You are about to reopen this job to <strong>{targetLabel}</strong>. {needsAppliedDate && 'You also need to fill in the applied date.'}</span>
          </div>
        </div>

        {/* Form */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-danger-50 text-danger-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wide">
                New Deadline <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  required
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setError('');
                  }}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
                />
                <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              </div>
              <p className="text-[11px] text-neutral-500 mt-1.5">Must be today or future.</p>
            </div>

            {needsAppliedDate && (
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wide">
                  Applied Date <span className="text-danger-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={appliedDate}
                    onChange={(e) => {
                      setAppliedDate(e.target.value);
                      setAppliedDateError('');
                    }}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
                  />
                  <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                </div>
                {appliedDateError && (
                  <p className="text-xs text-danger-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {appliedDateError}
                  </p>
                )}
                <p className="text-[11px] text-neutral-500 mt-1.5">Date when you applied (can be past or today).</p>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 pt-0 bg-neutral-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-xl transition shadow-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm transition active:scale-95 flex items-center gap-2"
          >
            <CheckCircle2 size={16} />
            Confirm & Reopen
          </button>
        </div>
      </div>
    </div>
  );
}