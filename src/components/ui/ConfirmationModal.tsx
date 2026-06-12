'use client';

import { AlertTriangle, X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

/**
 * Generic confirmation modal for destructive actions (delete, etc.).
 * Used via ModalContext to ensure consistent UX across the app.
 */
export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }: ModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-rose-50 rounded-full text-rose-600">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{message}</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2 text-xs font-semibold bg-rose-600 text-white rounded-xl hover:bg-rose-700 shadow-sm transition-all"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}