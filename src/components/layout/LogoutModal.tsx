'use client';

import { LogOut, X, CheckCircle2 } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut: boolean;
}

export default function LogoutModal({ isOpen, onClose, onConfirm, isLoggingOut }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-neutral-100 bg-gradient-to-r from-primary-50 to-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary-100 rounded-lg text-primary-600">
              <LogOut size={18} />
            </div>
            <h3 className="font-bold text-base text-neutral-900">Confirm Logout</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoggingOut}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-sm text-neutral-600">
            Are you sure you want to end your session and log out of{' '}
            <span className="font-semibold">ApplyNode</span>?
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 pt-0 bg-neutral-50/50">
          <button
            onClick={onClose}
            disabled={isLoggingOut}
            className="px-5 py-2.5 text-sm font-semibold text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-xl transition shadow-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoggingOut}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm transition active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            <LogOut size={16} />
            {isLoggingOut ? 'Logging out...' : 'Yes, Logout'}
          </button>
        </div>
      </div>
    </div>
  );
}