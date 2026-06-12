'use client';

import { LogOut, X, AlertTriangle } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut: boolean;
}

/**
 * Confirmation modal for logout action.
 * Prevents accidental logout and provides visual feedback during the process.
 */
export default function LogoutModal({ isOpen, onClose, onConfirm, isLoggingOut }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm select-none animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl border border-slate-100 shadow-2xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-end -mt-2 -mr-2">
          <button
            onClick={onClose}
            disabled={isLoggingOut}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col items-center text-center mt-1">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100/60 mb-4 shadow-sm">
            <AlertTriangle size={24} strokeWidth={2.2} />
          </div>
          <h3 className="font-bold text-base text-slate-900 tracking-tight">Confirm Logout</h3>
          <p className="text-xs text-slate-400 mt-1.5 max-w-[260px] font-medium leading-relaxed">
            Are you sure you want to end your session and log out of <span className="text-slate-700 font-semibold">ApplyNode</span>?
          </p>
        </div>

        <div className="flex gap-3 justify-center pt-5 mt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoggingOut}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-600 font-bold text-xs rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoggingOut}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <LogOut size={13} strokeWidth={2.5} />
            <span>{isLoggingOut ? 'Logging out...' : 'Yes, Logout'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}