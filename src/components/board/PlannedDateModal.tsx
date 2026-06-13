'use client';

import { useState, useEffect } from 'react';
import { Calendar, X, Target } from 'lucide-react';

interface PlannedDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (plannedDate: string | null) => void;
  positionName: string;
  companyName: string;
  targetStatus: string;
}

export default function PlannedDateModal({
  isOpen,
  onClose,
  onConfirm,
  positionName,
  companyName,
  targetStatus,
}: PlannedDateModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState('');

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    onConfirm(selectedDate || null);
  };

  const handleClear = () => {
    onConfirm(null);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl border border-neutral-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <div className="flex items-center gap-2 text-primary-600">
            <Target size={20} strokeWidth={1.8} />
            <h3 className="font-bold text-base text-neutral-900">Set Planned Date</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 bg-neutral-50 border-b border-neutral-100">
          <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">
            Moving to: {targetStatus.replace(/_/g, ' ')}
          </p>
          <p className="text-sm font-bold text-neutral-800 mt-1">{positionName}</p>
          <p className="text-sm text-neutral-600">{companyName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wide">
              Planned Apply Date (optional)
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  if (error) setError('');
                }}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 font-medium outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
              <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            </div>
            <p className="text-[11px] text-neutral-500 mt-1.5">
              You can select a date or leave it empty for no plan.
            </p>
          </div>

          <div className="flex gap-3 justify-between pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-sm rounded-xl transition-all"
            >
              Clear
            </button>
            <div className="flex gap-3">
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
                Save & Move
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}