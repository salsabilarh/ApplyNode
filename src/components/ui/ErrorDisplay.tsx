// components/ui/ErrorDisplay.tsx
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  return (
    <div className="w-full p-8 text-center text-red-600 bg-red-50 rounded-2xl">
      <AlertCircle className="mx-auto mb-2" size={32} />
      <p>{error}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl">
          Coba Lagi
        </button>
      )}
    </div>
  );
}