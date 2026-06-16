'use client';

import { useState, useEffect } from 'react';
import { Calendar, X, Target, CheckCircle2, Loader2, AlertCircle, Clock } from 'lucide-react';

interface PlannedDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (plannedDate: string | null) => Promise<void> | void;
  positionName: string;
  companyName: string;
  targetStatus: string;
  deadline?: string; 
}

export default function PlannedDateModal({
  isOpen,
  onClose,
  onConfirm,
  positionName,
  companyName,
  targetStatus,
  deadline,
}: PlannedDateModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(getTodayString());
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const validateDate = (date: string): boolean => {
    if (!date) return true;
    const selected = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selected < today) {
      setError('Planned apply date cannot be in the past. Please choose today or a future date.');
      return false;
    }
    
    if (deadline) {
      const deadlineDate = new Date(deadline);
      deadlineDate.setHours(0, 0, 0, 0);
      if (selected > deadlineDate) {
        setError(`Planned apply date cannot be after the deadline (${deadline}). Please choose a date on or before ${deadline}.`);
        return false;
      }
    }
    
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      onConfirm(null);
      return;
    }
    if (!validateDate(selectedDate)) {
      return;
    }
    setIsLoading(true);
    try {
      await onConfirm(selectedDate);
    } finally {
      setIsLoading(false);
    }
  };

  // Compute max date for input field
  const maxDate = deadline || undefined;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-neutral-100 bg-gradient-to-r from-primary-50 to-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary-100 rounded-lg text-primary-600">
              <Target size={18} />
            </div>
            <h3 className="font-bold text-base text-neutral-900">Set Planned Date</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 pb-0">
          <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
            <p className="text-sm font-semibold text-neutral-800">{positionName}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{companyName}</p>
            <div className="mt-2 pt-2 border-t border-neutral-200 flex items-center gap-2">
              <Target size={12} className="text-primary-500" />
              <p className="text-xs text-neutral-600">
                Moving to: <span className="font-medium">{targetStatus.replace(/_/g, ' ')}</span>
              </p>
            </div>
            {deadline && (
              <div className="mt-2 pt-2 border-t border-neutral-200 flex items-center gap-2 text-amber-700">
                <Clock size={12} className="text-amber-500" />
                <p className="text-xs font-medium">
                  Application Deadline: <span className="font-bold">{deadline}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 space-y-4">
          <form onSubmit={handleSubmit}>
            <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wide">
              Planned Apply Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  if (error) setError('');
                }}
                min={getTodayString()}
                max={maxDate}
                disabled={isLoading}
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition disabled:bg-neutral-100"
              />
            </div>
            {error && (
              <p className="text-xs text-danger-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {error}
              </p>
            )}
            <p className="text-[11px] text-neutral-500 mt-1.5">
              You can select a date (today or future) or leave it empty for no plan.
              {deadline && (
                <span className="block text-amber-600 mt-1">
                  ⚠️ Must be on or before deadline: <strong>{deadline}</strong>
                </span>
              )}
            </p>
          </form>
        </div>

        <div className="flex justify-end gap-3 p-5 pt-0 bg-neutral-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-semibold text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-xl transition shadow-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm transition active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            <span>{isLoading ? 'Saving...' : 'Save & Move'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}