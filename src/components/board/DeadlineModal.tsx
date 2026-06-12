'use client';

import { useState, useEffect } from 'react';
import { Calendar, X, AlertCircle } from 'lucide-react';

interface DeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedDate: string) => void;
  positionName: string;
  companyName: string;
}

/**
 * Modal that prompts user to set a past deadline when closing a job.
 * Ensures that the selected date is strictly before the current time.
 */
export default function DeadlineModal({
  isOpen,
  onClose,
  onConfirm,
  positionName,
  companyName
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
      setError('Deadline must be in the past to close the job.');
      return;
    }
    onConfirm(selectedDate);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm select-none">
      <div className="bg-white w-full max-w-md rounded-2xl border border-slate-100 shadow-xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-amber-600">
            <Calendar size={18} strokeWidth={2.2} />
            <h3 className="font-bold text-sm text-slate-900">Confirm Closing Date</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Job Details</p>
          <p className="text-xs font-bold text-slate-800 mt-0.5">{positionName}</p>
          <p className="text-xs text-slate-500 font-medium">{companyName}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-amber-50 text-amber-700 text-xs rounded-xl font-medium border border-amber-100/70 flex gap-2 items-start">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Deadline Date & Time (Past)
            </label>
            <input
              type="datetime-local"
              required
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                if (error) setError('');
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all active:scale-95"
            >
              Confirm & Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}