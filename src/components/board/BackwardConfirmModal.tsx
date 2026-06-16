'use client';

import { useState } from 'react';
import { AlertCircle, X, ArrowLeft, Calendar, CheckCircle2, Loader2 } from 'lucide-react';
import { formatStageLabel } from '@/lib/utils';

interface BackwardConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  jobPosition: string;
  jobCompany: string;
  currentStatus: string;
  appliedDate: string | null;
  targetStatus: 'BACKLOG' | 'APPLYING';
}

export default function BackwardConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  jobPosition,
  jobCompany,
  currentStatus,
  appliedDate,
  targetStatus,
}: BackwardConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Ganti handleConfirm menjadi async dan await onConfirm
const handleConfirm = async () => {
  setIsLoading(true);
  try {
    await onConfirm();
  } finally {
    setIsLoading(false);
  }
};

  const targetLabel = targetStatus === 'BACKLOG' ? 'To Apply' : 'Applying';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-neutral-100 bg-gradient-to-r from-amber-50 to-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600">
              <AlertCircle size={18} strokeWidth={1.8} />
            </div>
            <h3 className="font-bold text-base text-neutral-900">Confirm Status Change</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Job Info Card */}
        <div className="p-5 pb-0">
          <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
            <p className="text-sm font-semibold text-neutral-800">{jobPosition}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{jobCompany}</p>
            <div className="mt-2 pt-2 border-t border-neutral-200 flex items-center gap-2">
              <ArrowLeft size={12} className="text-amber-500" />
              <p className="text-xs text-neutral-600">
                Moving from <span className="font-medium">{formatStageLabel(currentStatus)}</span> to{' '}
                <span className="font-medium">{targetLabel}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-5 space-y-3">
          {appliedDate && (
            <div className="flex items-center gap-2 text-sm text-neutral-600 bg-blue-50 p-2 rounded-lg">
              <Calendar size={14} className="text-blue-500" />
              <span>Applied date: <span className="font-medium">{appliedDate}</span></span>
            </div>
          )}

          <div className="text-sm space-y-2">
            <p className="font-semibold text-neutral-800">This action will:</p>
            <ul className="list-disc pl-5 space-y-0.5 text-neutral-600">
              <li>Remove the applied date.</li>
              <li>Reset or clear the planned apply date.</li>
              <li>Move the status back to "{targetLabel}".</li>
            </ul>
          </div>

          <p className="text-sm text-neutral-600">Are you sure you want to move to <strong>{targetLabel}</strong>?</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 pt-0 bg-neutral-50/50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-semibold text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-xl transition shadow-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm transition active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            <span>{isLoading ? 'Processing...' : 'Yes, Move'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}