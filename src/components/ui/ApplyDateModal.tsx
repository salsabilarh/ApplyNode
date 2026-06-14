'use client';

import { useState, useEffect } from 'react';
import { Calendar, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface ApplyDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (appliedDate: string) => void;
  positionName: string;
  companyName: string;
  targetStatus: string;
}

export default function ApplyDateModal({
  isOpen,
  onClose,
  onConfirm,
  positionName,
  companyName,
  targetStatus,
}: ApplyDateModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState('');

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(getTodayString());
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(selectedDate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-neutral-100 bg-gradient-to-r from-primary-50 to-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary-100 rounded-lg text-primary-600">
              <CheckCircle2 size={18} />
            </div>
            <h3 className="font-bold text-base text-neutral-900">Record Application Date</h3>
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
              <CheckCircle2 size={12} className="text-primary-500" />
              <p className="text-xs text-neutral-600">
                Moving to: <span className="font-medium">{targetStatus.replace(/_/g, ' ')}</span>
              </p>
            </div>
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
          <form onSubmit={handleSubmit}>
            <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wide">
              Applied Date <span className="text-danger-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setError('');
                }}
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
              />
            </div>
            <p className="text-[11px] text-neutral-500 mt-1.5">
              You can set today, a past date, or a future date.
            </p>
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
            Confirm & Move
          </button>
        </div>
      </div>
    </div>
  );
}