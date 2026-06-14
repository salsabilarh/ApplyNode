'use client';

import { useState, useEffect } from 'react';
import { Calendar, X, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedDate: string) => void;
  positionName: string;
  companyName: string;
}

export default function DeadlineModal({
  isOpen,
  onClose,
  onConfirm,
  positionName,
  companyName,
}: DeadlineModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setSelectedDate(`${year}-${month}-${day}T${hours}:${minutes}`);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenDate = new Date(selectedDate);
    const now = new Date();
    if (chosenDate >= now) {
      setError('Deadline must be in the past to close this job.');
      return;
    }
    onConfirm(selectedDate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-neutral-100 bg-gradient-to-r from-amber-50 to-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600">
              <Calendar size={18} />
            </div>
            <h3 className="font-bold text-base text-neutral-900">Confirm Job Closure</h3>
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
              Deadline <span className="text-danger-500">*</span>
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
            </div>
            <p className="text-[11px] text-neutral-500 mt-1.5">
              Set the exact date and time when this job opportunity ended.
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
            Confirm & Close
          </button>
        </div>
      </div>
    </div>
  );
}