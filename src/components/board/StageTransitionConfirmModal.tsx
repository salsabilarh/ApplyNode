'use client';

import { useState, useEffect, useRef } from 'react';
import { AlertCircle, X, ArrowRightLeft, CheckCircle2, RotateCcw, Loader2 } from 'lucide-react';
import { formatStageLabel } from '@/lib/utils';

const STATUS_ORDER = [
  'BACKLOG', 'APPLYING', 'APPLIED', 'ADMIN_SCREENING', 'ASSESSMENT', 'FGD_LGD',
  'INTERVIEW_HR', 'INTERVIEW_USER', 'INTERVIEW_EXECUTIVE', 'MEDICAL_CHECK_UP', 'OFFERING', 'CLOSED'
];

interface StageTransitionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedStages: string[]) => void;
  jobPosition: string;
  jobCompany: string;
  currentStatus: string;
  targetStatus: string;
  stagesToUpdate: string[];
  stagesToReset: string[];
  isForward: boolean;
  customTitle?: string;
}

export default function StageTransitionConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  jobPosition,
  jobCompany,
  currentStatus,
  targetStatus,
  stagesToUpdate,
  stagesToReset,
  isForward,
  customTitle,
}: StageTransitionConfirmModalProps) {
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const isInitialized = useRef(false);

  // ========== LOGIS MANDATORY ==========
  const isMandatory = (stage: string): boolean => {
    // Stage target selalu wajib
    if (stage === targetStatus) return true;

    // Stage APPLIED wajib jika target status BUKAN CLOSED
    // dan target status berada di posisi APPLIED atau setelahnya
    if (stage === 'APPLIED') {
      if (targetStatus === 'CLOSED') return false;
      const targetIdx = STATUS_ORDER.indexOf(targetStatus);
      const appliedIdx = STATUS_ORDER.indexOf('APPLIED');
      return targetIdx >= appliedIdx;
    }

    return false;
  };

  // Inisialisasi selectedStages saat modal terbuka pertama kali
  useEffect(() => {
    if (isOpen && !isInitialized.current) {
      isInitialized.current = true;
      const mandatory = stagesToUpdate.filter(s => isMandatory(s));
      const optional = stagesToUpdate.filter(s => !isMandatory(s));
      setSelectedStages([...mandatory, ...optional]);
      setError('');
    } else if (!isOpen) {
      isInitialized.current = false;
      setIsProcessing(false);
    }
  }, [isOpen, stagesToUpdate, targetStatus]);

  const toggleStage = (stage: string) => {
    if (isMandatory(stage)) return;
    setSelectedStages(prev =>
      prev.includes(stage) ? prev.filter(s => s !== stage) : [...prev, stage]
    );
    if (error) setError('');
  };

  const toggleAll = () => {
    const mandatoryStages = stagesToUpdate.filter(s => isMandatory(s));
    const selectableStages = stagesToUpdate.filter(s => !isMandatory(s));
    if (selectedStages.length === stagesToUpdate.length) {
      setSelectedStages(mandatoryStages);
    } else {
      setSelectedStages([...stagesToUpdate]);
    }
    if (error) setError('');
  };

  const allSelected = stagesToUpdate.length > 0 && selectedStages.length === stagesToUpdate.length;
  const hasNoSelection = selectedStages.length === 0;

  const handleConfirm = () => {
    const missingMandatory = stagesToUpdate.filter(s => isMandatory(s) && !selectedStages.includes(s));
    if (missingMandatory.length > 0) {
      setError(`Stage(s) "${missingMandatory.map(s => formatStageLabel(s)).join(', ')}" must be selected.`);
      return;
    }
    if (hasNoSelection) {
      setError('Please select at least one stage to set a date.');
      return;
    }
    setIsProcessing(true);
    onConfirm(selectedStages);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-neutral-100 bg-gradient-to-r from-amber-50 to-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600">
              <AlertCircle size={18} />
            </div>
            <h3 className="font-bold text-base text-neutral-900">
              {customTitle || "Confirm Stage Change"}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-600">
            <X size={18} />
          </button>
        </div>

        {/* Job Info */}
        <div className="p-5 pb-0">
          <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
            <p className="text-sm font-semibold text-neutral-800">{jobPosition}</p>
            <p className="text-xs text-neutral-500">{jobCompany}</p>
            <div className="mt-2 pt-2 border-t border-neutral-200 flex items-center gap-2">
              <ArrowRightLeft size={12} className="text-amber-500" />
              <p className="text-xs text-neutral-600">
                From: <span className="font-medium">{formatStageLabel(currentStatus)}</span> →{' '}
                To: <span className="font-medium">{formatStageLabel(targetStatus)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Tabel Stages */}
        <div className="p-5">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold text-neutral-800 text-sm">Stages affected:</p>
            {stagesToUpdate.filter(s => !isMandatory(s)).length > 0 && (
              <button onClick={toggleAll} className="text-xs text-primary-600 hover:underline">
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
          <div className="border border-neutral-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2 w-8">
                    {stagesToUpdate.filter(s => !isMandatory(s)).length > 0 && (
                      <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                    )}
                  </th>
                  <th className="text-left px-4 py-2">Stage</th>
                  <th className="text-left px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {stagesToUpdate.map((stage, idx) => (
                  <tr key={stage} className={idx !== stagesToUpdate.length-1 ? 'border-b' : ''}>
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedStages.includes(stage)}
                        onChange={() => toggleStage(stage)}
                        disabled={isMandatory(stage)}
                      />
                    </td>
                    <td className="px-4 py-2">
                      {formatStageLabel(stage)}
                      {isMandatory(stage) && (
                        <span className="ml-2 text-xs text-danger-500">(Required)</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        <CheckCircle2 size={10} /> Set date
                      </span>
                    </td>
                  </tr>
                ))}
                {stagesToReset.map((stage) => (
                  <tr key={stage} className="border-b">
                    <td className="px-4 py-2">　</td>
                    <td className="px-4 py-2">{formatStageLabel(stage)}</td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                        <RotateCcw size={10} /> Reset date
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {error && (
            <div className="mt-2 text-xs text-danger-500 flex items-center gap-1">
              <AlertCircle size={12} /> {error}
            </div>
          )}
<p className="text-sm text-neutral-600 mt-3">
  {customTitle === "Reopen Job Application" 
    ? "Select which stages you want to set dates for (from Applied up to the target stage). Unselected stages will have their dates reset to null."
    : "Select which stages you want to set dates for. Unselected stages will have their dates reset to null."
  }
</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 pt-0 bg-neutral-50/50">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-5 py-2.5 text-sm font-semibold text-neutral-700 bg-white border rounded-xl disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={hasNoSelection || isProcessing}
            className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition flex items-center gap-2 ${
              hasNoSelection || isProcessing
                ? 'bg-neutral-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 active:scale-95'
            }`}
          >
            {isProcessing && <Loader2 size={16} className="animate-spin" />}
            <span>{isProcessing ? 'Processing...' : 'Yes, Continue'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}