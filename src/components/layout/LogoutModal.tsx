'use client';

import { LogOut, X, AlertTriangle } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut: boolean;
}

export default function LogoutModal({ isOpen, onClose, onConfirm, isLoggingOut }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-neutral-900/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-2xl border border-neutral-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <div className="flex justify-end p-3 pb-0">
          <button
            onClick={onClose}
            disabled={isLoggingOut}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Icon & Content */}
        <div className="flex flex-col items-center text-center px-6 pb-6">
          <div className="p-3 bg-warning-50 text-warning-600 rounded-2xl border border-warning-100 mb-4 shadow-sm">
            <LogOut size={24} strokeWidth={2} />
          </div>
          <h3 className="font-bold text-lg text-neutral-900 tracking-tight">Confirm Logout</h3>
          <p className="text-sm text-neutral-500 mt-2 max-w-[260px] leading-relaxed">
            Are you sure you want to end your session and log out of{' '}
            <span className="font-semibold text-neutral-700">ApplyNode</span>?
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoggingOut}
            className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 text-neutral-700 font-semibold text-sm rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoggingOut}
            className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold text-sm rounded-xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <LogOut size={14} strokeWidth={2.5} />
            <span>{isLoggingOut ? 'Logging out...' : 'Yes, Logout'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}