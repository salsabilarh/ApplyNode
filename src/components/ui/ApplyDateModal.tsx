'use client';

import { useState, useEffect } from 'react';
import { Calendar, AlertCircle, X, CheckCircle2 } from 'lucide-react';

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

  // Helper: dapatkan hari ini dalam format YYYY-MM-DD (lokal)
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // VALIDASI: tidak ada batasan tanggal (boleh masa lalu, hari ini, atau masa depan)
  const validateDate = (date: string) => {
    if (!date) return 'Please select a date.';
    // Tidak ada penolakan berdasarkan perbandingan dengan hari ini
    return '';
  };

  useEffect(() => {
    if (isOpen) {
      // Default ke hari ini
      setSelectedDate(getTodayString());
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateDate(selectedDate);
    if (validationError) {
      setError(validationError);
      return;
    }
    onConfirm(selectedDate);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl border border-neutral-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <div className="flex items-center gap-2 text-primary-600">
            <CheckCircle2 size={20} strokeWidth={1.8} />
            <h3 className="font-bold text-base text-neutral-900">Record Application Date</h3>
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
          <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">
            Moving to: {targetStatus.replace(/_/g, ' ')}
          </p>
          <p className="text-sm font-bold text-neutral-800 mt-1">{positionName}</p>
          <p className="text-sm text-neutral-600">{companyName}</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-5 mt-5 p-3 bg-danger-50 text-danger-700 text-xs rounded-xl border border-danger-200 flex gap-2 items-start">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wide">
              Applied Date
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={selectedDate}
                // Hapus atribut max agar bisa memilih tanggal masa depan
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  if (error) setError('');
                }}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 font-medium outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>
            <p className="text-[11px] text-neutral-500 mt-1.5">
              You can set today, a past date, or a future date.
            </p>
          </div>

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
              Confirm & Move
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}