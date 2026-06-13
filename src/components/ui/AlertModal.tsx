'use client';

import { AlertCircle, X } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm?: () => void;      // opsional, jika ada akan muncul tombol konfirmasi
  confirmText?: string;        // teks tombol konfirmasi, default "OK"
  cancelText?: string;         // teks tombol batal, default "Cancel"
}

export default function AlertModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  onConfirm, 
  confirmText = 'OK', 
  cancelText = 'Cancel' 
}: AlertModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-2xl border border-neutral-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header dengan ikon peringatan */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle size={20} strokeWidth={1.8} />
            <h3 className="font-bold text-base text-neutral-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pesan */}
        <div className="p-5">
          <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">{message}</p>
        </div>

        {/* Tombol - dinamis berdasarkan ada/tidaknya onConfirm */}
        <div className={`flex p-5 pt-0 gap-2 ${onConfirm ? 'justify-between' : 'justify-end'}`}>
          {onConfirm ? (
            <>
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-sm rounded-xl transition-all"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all active:scale-95"
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all active:scale-95"
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}