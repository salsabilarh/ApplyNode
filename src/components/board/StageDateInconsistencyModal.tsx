'use client';

import { AlertTriangle } from 'lucide-react';

interface StageDateInconsistencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: () => void;
  onKeepStatus: () => void;
  jobPosition: string;
  jobCompany: string;
  currentStatus: string;
  computedStage: string;
}

export default function StageDateInconsistencyModal({
  isOpen,
  onClose,
  onUpdateStatus,
  onKeepStatus,
  jobPosition,
  jobCompany,
  currentStatus,
  computedStage,
}: StageDateInconsistencyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/25" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-2xl p-6 shadow-xl z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 rounded-full">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">
            Inconsistent Stage Data
          </h3>
        </div>
        <div className="mt-2 space-y-3">
          <p className="text-sm text-neutral-700">
            <span className="font-semibold">{jobPosition}</span> di{' '}
            <span className="font-semibold">{jobCompany}</span> memiliki:
          </p>
          <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
            <li>Status saat ini: <span className="font-mono font-medium">{currentStatus.replace(/_/g, ' ')}</span></li>
            <li>Tanggal tahap tertinggi terisi: <span className="font-mono font-medium">{computedStage.replace(/_/g, ' ')}</span></li>
          </ul>
          <p className="text-sm text-neutral-700 mt-2">
            Bagaimana Anda ingin menyelesaikan ketidaksesuaian ini?
          </p>
        </div>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onKeepStatus}
            className="inline-flex justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-all"
          >
            Pertahankan Status (hapus tanggal lanjutan)
          </button>
          <button
            type="button"
            onClick={onUpdateStatus}
            className="inline-flex justify-center rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-all"
          >
            Update Status ke {computedStage.replace(/_/g, ' ')}
          </button>
        </div>
      </div>
    </div>
  );
}