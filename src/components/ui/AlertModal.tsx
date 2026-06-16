'use client';

import { useState } from 'react';
import { AlertCircle, X, CheckCircle2, Loader2 } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
}: AlertModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Ganti handleConfirm menjadi async
const handleConfirm = async () => {
  if (onConfirm) {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  }
  onClose();
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-neutral-100 bg-gradient-to-r from-amber-50 to-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600">
              <AlertCircle size={18} />
            </div>
            <h3 className="font-bold text-base text-neutral-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-sm text-neutral-600 whitespace-pre-line">{message}</p>
        </div>

        {/* Footer */}
        <div className={`flex p-5 pt-0 gap-2 bg-neutral-50/50 ${onConfirm ? 'justify-between' : 'justify-end'}`}>
          {onConfirm ? (
            <>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-5 py-2.5 text-sm font-semibold text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-xl transition shadow-sm disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm transition active:scale-95 flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                <span>{isLoading ? 'Processing...' : confirmText}</span>
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm transition active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              <span>{isLoading ? 'Processing...' : 'OK'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}