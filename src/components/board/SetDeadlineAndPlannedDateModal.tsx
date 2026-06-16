'use client';

import { useState, useEffect } from 'react';
import { Calendar, X, Target, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface SetDeadlineAndPlannedDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deadline: string, plannedDate: string) => Promise<void>;
  positionName: string;
  companyName: string;
  targetStatus: string;
  currentDeadline?: string;
  currentPlannedDate?: string | null;
}

export default function SetDeadlineAndPlannedDateModal({
  isOpen,
  onClose,
  onConfirm,
  positionName,
  companyName,
  targetStatus,
  currentDeadline,
  currentPlannedDate,
}: SetDeadlineAndPlannedDateModalProps) {
  const [deadline, setDeadline] = useState('');
  const [plannedDate, setPlannedDate] = useState('');
  const [deadlineError, setDeadlineError] = useState('');
  const [plannedDateError, setPlannedDateError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getTodayString = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (isOpen) {
      const today = getTodayString();
      const initialDeadline = currentDeadline && currentDeadline >= today ? currentDeadline : today;
      const initialPlanned = currentPlannedDate || today;
      setDeadline(initialDeadline);
      setPlannedDate(initialPlanned);
      setDeadlineError('');
      setPlannedDateError('');
      setIsLoading(false);
    }
  }, [isOpen, currentDeadline, currentPlannedDate]);

  // Validasi deadline (real-time)
  const validateDeadline = (value: string): boolean => {
    if (!value) {
      setDeadlineError('Deadline is required.');
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(value);
    if (deadlineDate < today) {
      setDeadlineError('Deadline cannot be in the past. Please choose today or a future date.');
      return false;
    }
    setDeadlineError('');
    return true;
  };

  // Validasi planned date (real-time, tergantung deadline)
  const validatePlannedDate = (value: string, currentDeadline: string): boolean => {
    if (!value) {
      setPlannedDateError('Planned apply date is required.');
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const plannedDateObj = new Date(value);
    if (plannedDateObj < today) {
      setPlannedDateError('Planned apply date cannot be in the past.');
      return false;
    }
    if (currentDeadline) {
      const deadlineDate = new Date(currentDeadline);
      if (plannedDateObj > deadlineDate) {
        setPlannedDateError(`Planned apply date cannot be after the deadline (${currentDeadline}).`);
        return false;
      }
    }
    setPlannedDateError('');
    return true;
  };

  const handleDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDeadline = e.target.value;
    setDeadline(newDeadline);
    validateDeadline(newDeadline);
    // Re-validate planned date if exists
    if (plannedDate) {
      validatePlannedDate(plannedDate, newDeadline);
    }
  };

  const handlePlannedDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPlanned = e.target.value;
    setPlannedDate(newPlanned);
    validatePlannedDate(newPlanned, deadline);
  };

  const validateForm = (): boolean => {
    const isDeadlineValid = validateDeadline(deadline);
    const isPlannedValid = validatePlannedDate(plannedDate, deadline);
    return isDeadlineValid && isPlannedValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await onConfirm(deadline, plannedDate);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-neutral-100 bg-gradient-to-r from-amber-50 to-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600">
              <Calendar size={18} />
            </div>
            <h3 className="font-bold text-base text-neutral-900">
              {targetStatus === 'BACKLOG' ? 'Set Target Dates' : 'Prepare to Apply'}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Job Info */}
        <div className="p-5 pb-0">
          <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
            <p className="text-sm font-semibold text-neutral-800">{positionName}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{companyName}</p>
            <div className="mt-2 pt-2 border-t border-neutral-200 flex items-center gap-2">
              <Target size={12} className="text-primary-500" />
              <p className="text-xs text-neutral-600">
                Moving to: <span className="font-medium">{targetStatus === 'BACKLOG' ? 'To Apply' : 'Applying'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-5 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Deadline Field */}
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wide">
                Deadline <span className="text-danger-500">*</span>
              </label>
              <input
                type="date"
                required
                value={deadline}
                min={getTodayString()}
                onChange={handleDeadlineChange}
                disabled={isLoading}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition disabled:bg-neutral-100 ${
                  deadlineError
                    ? 'border-danger-500 focus:ring-2 focus:ring-danger-500/20'
                    : 'border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                }`}
              />
              {deadlineError && (
                <p className="text-xs text-danger-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {deadlineError}
                </p>
              )}
              <p className="text-[11px] text-neutral-500 mt-1.5">
                Final date to submit the application (must be today or future).
              </p>
            </div>

            {/* Planned Apply Date Field - tanpa atribut max */}
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wide">
                Planned Apply Date <span className="text-danger-500">*</span>
              </label>
              <input
                type="date"
                required
                value={plannedDate}
                min={getTodayString()}
                // HAPUS atribut max untuk menghindari pesan bawaan browser
                onChange={handlePlannedDateChange}
                disabled={isLoading}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition disabled:bg-neutral-100 ${
                  plannedDateError
                    ? 'border-danger-500 focus:ring-2 focus:ring-danger-500/20'
                    : 'border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                }`}
              />
              {plannedDateError && (
                <p className="text-xs text-danger-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {plannedDateError}
                </p>
              )}
              <p className="text-[11px] text-neutral-500 mt-1.5">
                When you plan to submit the application (cannot be after deadline).
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-5 py-2.5 text-sm font-semibold text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-xl transition shadow-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm transition active:scale-95 flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                <span>{isLoading ? 'Saving...' : 'Save & Move'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}