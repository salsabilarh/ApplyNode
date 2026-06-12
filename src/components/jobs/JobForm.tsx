'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { JobType, Priority, JobStatus } from '@prisma/client';
import { ArrowLeft, Save, XCircle, Loader2, Briefcase, Calendar, FileText, AlertCircle, Trash2 } from 'lucide-react';
import { useModal } from '@/context/ModalContext';

type JobData = {
  id?: string;
  position: string;
  jobType: JobType;
  company: string;
  platform: string;
  sourceLink: string;
  description: string;
  duration: string;
  deadline: string;
  openingDate: string;
  priority: Priority;
  status: JobStatus;
  plannedApplyDate: string;
  plannedApplyTime: string;
  applyNotes: string;
  notes: string;
};

const emptyJob: JobData = {
  position: '',
  jobType: 'FULL_TIME',
  company: '',
  platform: 'LinkedIn',
  sourceLink: '',
  description: '',
  duration: '',
  deadline: '',
  openingDate: '',
  priority: 'MEDIUM',
  status: 'BACKLOG',
  plannedApplyDate: '',
  plannedApplyTime: '',
  applyNotes: '',
  notes: '',
};

const formatInitialDataForInput = (data: any) => {
  if (!data) return undefined;
  return {
    ...data,
    deadline: data.deadline ? data.deadline.split('T')[0] : '',
    openingDate: data.openingDate ? data.openingDate.split('T')[0] : '',
    plannedApplyDate: data.plannedApplyDate ? data.plannedApplyDate.split('T')[0] : '',
  };
};

const DATE_INPUT_STYLE = "w-full border border-slate-200 bg-white rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200";
const ERROR_DATE_STYLE = "w-full border border-rose-300 bg-rose-50/50 rounded-xl px-3 py-2.5 text-sm text-rose-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all duration-200";

const ProfessionalDateInput = ({ label, name, value, onChange, error, required }: any) => (
  <div className="flex flex-col">
    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative group">
      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        max="2100-12-31"
        className={`${error ? ERROR_DATE_STYLE : DATE_INPUT_STYLE} cursor-pointer transition-all`}
      />
      <Calendar size={16} className="absolute right-3 top-3 text-slate-400 group-hover:text-blue-500 transition-colors pointer-events-none" />
    </div>
    {error && (
      <p className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-rose-500">
        <AlertCircle size={10} /> {error}
      </p>
    )}
  </div>
);

export default function JobForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const baseInputStyle = "w-full border border-slate-200 bg-slate-50/30 rounded-xl p-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all duration-200";
  const baseSelectStyle = "w-full border border-slate-200 bg-slate-50/30 rounded-xl p-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all duration-200 appearance-none cursor-pointer";

  const [form, setForm] = useState<JobData>(formatInitialDataForInput(initialData) || emptyJob);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ deadline?: string; plannedApplyDate?: string; openingDate?: string }>({});

  const validateDates = (deadline: string, plannedApply: string, opening: string) => {
    const newErrors: typeof errors = {};
    const dDate = deadline ? new Date(deadline) : null;
    const pDate = plannedApply ? new Date(plannedApply) : null;
    const oDate = opening ? new Date(opening) : null;

    [dDate, pDate, oDate].forEach(d => d?.setHours(0, 0, 0, 0));

    if (oDate && dDate && oDate > dDate) newErrors.openingDate = 'Tanggal buka tidak boleh setelah deadline.';
    if (oDate && pDate && oDate > pDate) newErrors.openingDate = 'Tanggal buka tidak boleh setelah rencana apply.';
    if (pDate && dDate && pDate > dDate) {
      newErrors.plannedApplyDate = 'Rencana apply tidak boleh melewati deadline.';
      newErrors.deadline = 'Deadline tidak boleh mendahului rencana apply.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateDates(form.deadline, form.plannedApplyDate, form.openingDate);
    if (!isValid) return;
    setLoading(true);

    let payloadForm = { ...form };
    if (form.deadline && form.status === 'CLOSED') {
      const targetDate = new Date(form.deadline);
      targetDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (targetDate >= today) {
        payloadForm.status = 'BACKLOG';
      }
    }

    const url = form.id ? `/api/jobs/${form.id}` : '/api/jobs';
    const method = form.id ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadForm),
      });
      
      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal menyimpan data.');
      }
    } catch (error: any) {
      alert(`Gagal: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (['deadline', 'plannedApplyDate', 'openingDate'].includes(name)) {
        validateDates(updated.deadline, updated.plannedApplyDate, updated.openingDate);
      }
      return updated;
    });
  };

  const { openModal } = useModal();
  const handleDelete = () => {
    if (!form.id) return;
    openModal({
      title: 'Hapus Lowongan?',
      message: 'Data lamaran ini akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/jobs/${form.id}`, { method: 'DELETE' });
          if (res.ok) {
            router.push('/');
            router.refresh();
          } else {
            throw new Error('Gagal menghapus');
          }
        } catch (error) {
          alert('Terjadi kesalahan saat menghapus');
        }
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-fade-in">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Kembali
      </button>

      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          {form.id ? 'Edit Lowongan' : 'Tambah Lowongan Baru'}
        </h1>
        <p className="text-xs text-slate-400 mt-1">Lengkapi data di bawah untuk manajemen karir yang optimal.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Informasi Utama */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
            <Briefcase size={16} className="text-blue-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Informasi Fundamental</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Posisi <span className="text-rose-500">*</span></label>
              <input name="position" value={form.position} onChange={handleChange} required className={baseInputStyle} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Perusahaan <span className="text-rose-500">*</span></label>
              <input name="company" value={form.company} onChange={handleChange} required className={baseInputStyle} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tipe Pekerjaan</label>
              <select name="jobType" value={form.jobType} onChange={handleChange} className={baseSelectStyle}>
                {Object.values(JobType).map(type => <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Platform <span className="text-rose-500">*</span></label>
              <input name="platform" value={form.platform} onChange={handleChange} required className={baseInputStyle} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tautan Sumber</label>
              <input name="sourceLink" value={form.sourceLink} onChange={handleChange} type="url" className={baseInputStyle} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Deskripsi</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={`${baseInputStyle} resize-none`} />
            </div>
          </div>
        </div>

        {/* Waktu & Prioritas */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
            <Calendar size={16} className="text-amber-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Manajemen Waktu</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfessionalDateInput label="Deadline" name="deadline" value={form.deadline} onChange={handleChange} error={errors.deadline} required />
            <ProfessionalDateInput label="Tanggal Buka" name="openingDate" value={form.openingDate} onChange={handleChange} error={errors.openingDate} />
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Prioritas</label>
              <select name="priority" value={form.priority} onChange={handleChange} className={baseSelectStyle}>
                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className={baseSelectStyle}>
                {Object.values(JobStatus).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Durasi (opsional)</label>
              <input name="duration" value={form.duration} onChange={handleChange} className={baseInputStyle} />
            </div>
          </div>
        </div>

        {/* Rencana Apply */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
            <FileText size={16} className="text-emerald-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Rencana Eksekusi</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Catatan Persiapan</label>
              <textarea name="applyNotes" value={form.applyNotes} onChange={handleChange} rows={2} className={`${baseInputStyle} resize-none`} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Rencana Tanggal</label>
              <input type="date" name="plannedApplyDate" value={form.plannedApplyDate} onChange={handleChange} className={errors.plannedApplyDate ? ERROR_DATE_STYLE : baseInputStyle} />
              {errors.plannedApplyDate && <p className="text-rose-500 text-[10px] mt-1">{errors.plannedApplyDate}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Rencana Waktu</label>
              <input type="time" name="plannedApplyTime" value={form.plannedApplyTime} onChange={handleChange} className={baseInputStyle} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
          <button type="button" onClick={handleDelete} disabled={loading} className="flex items-center gap-1.5 border border-red-200 text-red-600 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-red-50 active:scale-95 transition-all disabled:opacity-50 mr-auto">
            <Trash2 size={16} /> Hapus
          </button>
          <button type="button" onClick={() => router.back()} disabled={loading} className="flex items-center gap-1.5 border border-slate-200 text-slate-500 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50">
            <XCircle size={16} /> Batal
          </button>
          <button type="submit" disabled={loading || Object.keys(errors).length > 0} className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-blue-700 active:scale-95 shadow-sm transition-all disabled:opacity-50">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : <><Save size={16} /> Simpan</>}
          </button>
        </div>
      </form>
    </div>
  );
}