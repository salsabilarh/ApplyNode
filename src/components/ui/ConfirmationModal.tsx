'use client';

import { AlertTriangle, X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }: ModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-neutral-900/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-2xl border border-neutral-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <div className="flex justify-end p-3 pb-0">
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors"
            aria-label="Close"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Icon & Content */}
        <div className="flex flex-col items-center text-center px-6 pb-6">
          <div className="p-3 bg-danger-50 text-danger-600 rounded-2xl border border-danger-100 mb-4 shadow-sm">
            <AlertTriangle size={24} strokeWidth={2} />
          </div>
          <h3 className="font-bold text-lg text-neutral-900 tracking-tight">{title}</h3>
          <p className="text-sm text-neutral-500 mt-2 max-w-[260px] leading-relaxed">{message}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-300 disabled:bg-red-400 text-white font-semibold text-sm rounded-xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Yes, Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-sm rounded-xl transition-all"
          >
            Cancel
          </button>

        </div>
      </div>
    </div>
  );
}