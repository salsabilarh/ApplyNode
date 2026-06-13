'use client';

import { AlertCircle, X } from 'lucide-react';

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
  if (!isOpen) return null;

  const targetLabel = targetStatus === 'BACKLOG' ? 'To Apply' : 'Applying';

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl border border-neutral-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle size={20} strokeWidth={1.8} />
            <h3 className="font-bold text-base text-neutral-900">Confirm Status Change</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-neutral-800">{jobPosition}</p>
            <p className="text-sm text-neutral-600">{jobCompany}</p>
          </div>

          <div className="bg-neutral-50 p-3 rounded-xl space-y-1 text-sm">
            <p><span className="font-medium">Current status:</span> {currentStatus.replace(/_/g, ' ')}</p>
            {appliedDate && (
              <p><span className="font-medium">Applied date:</span> {appliedDate}</p>
            )}
          </div>

          <div className="text-sm text-neutral-700 space-y-1">
            <p className="font-semibold">This action will:</p>
            <ul className="list-disc pl-5 space-y-0.5">
              <li>Remove the applied date.</li>
              <li>Reset or clear the planned apply date.</li>
              <li>Move the status back to "{targetLabel}".</li>
            </ul>
          </div>

          <p className="text-sm text-neutral-600">
            Are you sure you want to move to <strong>{targetLabel}</strong>?
          </p>
        </div>

        <div className="flex gap-3 justify-end p-5 pt-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-sm rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all active:scale-95"
          >
            Yes, Move
          </button>
        </div>
      </div>
    </div>
  );
}