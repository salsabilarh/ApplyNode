// components/ui/LoadingSpinner.tsx
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Memuat data...' }: LoadingSpinnerProps) {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-2 select-none">
      <Loader2 className="animate-spin text-blue-600" size={32} />
      <p className="text-xs font-semibold text-slate-400">{message}</p>
    </div>
  );
}