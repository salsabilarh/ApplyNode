'use client';
import { useState } from 'react';
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

const ProfessionalDateInput = ({ 
  label, name, value, onChange, error, required 
}: { 
  label: string; name: string; value: string; onChange: any; error?: string; required?: boolean 
}) => (
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
      <Calendar 
        size={16} 
        className="absolute right-3 top-3 text-slate-400 group-hover:text-blue-500 transition-colors pointer-events-none" 
      />
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
  const errorInputStyle = "w-full border border-rose-400 bg-rose-50/10 rounded-xl p-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200";
  const baseSelectStyle = "w-full border border-slate-200 bg-slate-50/30 rounded-xl p-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all duration-200 appearance-none cursor-pointer";

  const [form, setForm] = useState<JobData>(formatInitialDataForInput(initialData) || emptyJob);
  const [loading, setLoading] = useState(false);
  // Di dalam komponen JobForm, update definisi state errors:
  const [errors, setErrors] = useState<{ 
    deadline?: string; 
    plannedApplyDate?: string; 
    openingDate?: string // Tambahkan baris ini
  }>({});
    const validateDates = (deadline: string, plannedApply: string, opening: string) => {
  const newErrors: { 
      deadline?: string; 
      plannedApplyDate?: string; 
      openingDate?: string 
    } = {};

  const dDate = deadline ? new Date(deadline) : null;
  const pDate = plannedApply ? new Date(plannedApply) : null;
  const oDate = opening ? new Date(opening) : null;

  // Normalisasi waktu
  [dDate, pDate, oDate].forEach(d => d?.setHours(0, 0, 0, 0));

  // 1. Validasi: Opening Date vs Deadline
  if (oDate && dDate && oDate > dDate) {
    newErrors.openingDate = 'Tanggal buka tidak boleh setelah deadline.';
  }

  // 2. Validasi: Opening Date vs Planned Apply
  if (oDate && pDate && oDate > pDate) {
    newErrors.openingDate = 'Tanggal buka tidak boleh setelah rencana apply.';
  }

  // 3. Validasi: Planned Apply vs Deadline
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
      
    // ================= SINKRONISASI OTOMATIS STATUS SEBELUM KIRIM =================
    let payloadForm = { ...form };
    
    if (form.deadline && form.status === 'CLOSED') {
      const targetDate = new Date(form.deadline);
      targetDate.setHours(0, 0, 0, 0);
      
      const hariIni = new Date();
      hariIni.setHours(0, 0, 0, 0);
      
      // Jika user mengedit data CLOSED dengan tanggal deadline baru yang masih berlaku
      if (targetDate >= hariIni) {
        payloadForm.status = 'BACKLOG'; // Mutasi payload lokal ke BACKLOG (To Be Apply)
      }
    }
    // ==============================================================================
    
    const url = form.id ? `/api/jobs/${form.id}` : '/api/jobs';
    const method = form.id ? 'PATCH' : 'POST';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadForm), // Gunakan payloadForm yang sudah diamankan kualifikasinya
      });
      
      if (res.ok) {
        router.push('/');
        router.refresh(); // Memaksa server component mengambil ulang data transaksi terbaru
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Gagal merespon permintaan database.');
      }
    } catch (error: any) {
      alert(`Sistem mendeteksi masalah koneksi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setForm((prev) => {
      const updatedForm = { ...prev, [name]: value };
      // Validasi ulang saat salah satu tanggal diubah
      if (['deadline', 'plannedApplyDate', 'openingDate'].includes(name)) {
        validateDates(updatedForm.deadline, updatedForm.plannedApplyDate, updatedForm.openingDate);
      }
      return updatedForm;
    });
  };
  const { openModal } = useModal();
  // 1. Ganti handleDelete menjadi fungsi yang memicu modal
  const handleDelete = () => {
    if (!form.id) return; // Tidak bisa hapus jika data belum ada (form baru)

    openModal({
      title: "Hapus Lowongan?",
      message: "Data lamaran ini akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/jobs/${form.id}`, { method: 'DELETE' });
          if (res.ok) {
            router.push('/');
            router.refresh();
          } else {
            throw new Error('Gagal menghapus data');
          }
        } catch (error) {
          alert("Terjadi kesalahan saat menghapus");
        }
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-fade-in">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke Board
      </button>

      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          {form.id ? 'Modifikasi Detail Lowongan' : 'Registrasi Lowongan Baru'}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Lengkapi variabel instrumen di bawah untuk mengoptimalkan konversi manajemen karir Anda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* INFORMASI UTAMA */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.01)] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
            <Briefcase size={16} className="text-blue-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Informasi Fundamental</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Posisi / Peran <span className="text-rose-500">*</span></label>
              <input
                name="position"
                value={form.position}
                onChange={handleChange}
                required
                placeholder="e.g. Fullstack Developer"
                className={baseInputStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Perusahaan / Enterprise <span className="text-rose-500">*</span></label>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                required
                placeholder="e.g. PT Pertamina"
                className={baseInputStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tipe Pekerjaan</label>
              <div className="relative">
                <select name="jobType" value={form.jobType} onChange={handleChange} className={baseSelectStyle}>
                  {Object.values(JobType).map((type) => (
                    <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">▼</div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Platform Lowongan <span className="text-rose-500">*</span></label>
              <input
                name="platform"
                value={form.platform}
                onChange={handleChange}
                required
                placeholder="e.g. LinkedIn, Jobstreet, Karir"
                className={baseInputStyle}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tautan URL Sumber</label>
              <input
                name="sourceLink"
                value={form.sourceLink}
                onChange={handleChange}
                type="url"
                placeholder="https://example.com/job-vacancy-link"
                className={baseInputStyle}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Deskripsi Singkat / Kualifikasi</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Tulis ringkasan spesifikasi teknologi atau requirement utama..."
                className={`${baseInputStyle} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* TENGGAT & STATUS */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.01)] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
            <Calendar size={16} className="text-amber-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Manajemen Waktu & Prioritas</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <ProfessionalDateInput
                label="Batas Akhir (Deadline)"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                error={errors.deadline}
                required
              />
            </div>
            <div>
              <ProfessionalDateInput
                label="Tanggal Pembukaan Lowongan"
                name="openingDate"
                value={form.openingDate}
                onChange={handleChange}
                error={errors.openingDate}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Level Prioritas</label>
              <div className="relative">
                <select name="priority" value={form.priority} onChange={handleChange} className={baseSelectStyle}>
                  {Object.values(Priority).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">▼</div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status Alur Kerja</label>
              <div className="relative">
                <select name="status" value={form.status} onChange={handleChange} className={baseSelectStyle}>
                  {Object.values(JobStatus).map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">▼</div>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Estimasi Durasi Kontrak Pekerjaan (Opsional)</label>
              <input
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="e.g. 6 Bulan Intern, Kontrak Tetap"
                className={baseInputStyle}
              />
              {errors.openingDate && (
                <div className="flex items-center gap-1.5 text-rose-600 text-[11px] font-medium mt-1.5">
                  <AlertCircle size={13} />
                  <span>{errors.openingDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RENCANA APPLY */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.01)] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
            <FileText size={16} className="text-emerald-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Rencana Eksekusi Lamaran</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Catatan Khusus / Rencana Persiapan</label>
              <textarea
                name="applyNotes"
                value={form.applyNotes}
                onChange={handleChange}
                rows={2}
                placeholder="e.g. Siapkan CV ATS Bahasa Inggris, Kustomisasi Portofolio Git..."
                className={`${baseInputStyle} resize-none`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Rencana Tanggal Apply</label>
              <input
                type="date"
                name="plannedApplyDate"
                value={form.plannedApplyDate}
                onChange={handleChange}
                className={errors.plannedApplyDate ? errorInputStyle : baseInputStyle}
              />
              {errors.plannedApplyDate && (
                <div className="flex items-center gap-1.5 text-rose-600 text-[11px] font-medium mt-1.5">
                  <AlertCircle size={13} className="flex-shrink-0" />
                  <span>{errors.plannedApplyDate}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Rencana Waktu Eksekusi (Jam)</label>
              <input
                type="time"
                name="plannedApplyTime"
                value={form.plannedApplyTime}
                onChange={handleChange}
                className={baseInputStyle}
              />
            </div>
          </div>
        </div>

        {/* FOOTER ACTION BUTTONS */}
        <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
          {/* Tombol Hapus (Ditempatkan di kiri untuk memisahkan dari aksi utama) */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-1.5 border border-red-200 text-red-600 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-red-50 active:scale-[0.98] transition-all disabled:opacity-50 mr-auto"
          >
            <Trash2 size={16} />
            <span>Hapus</span>
          </button>

          {/* Tombol Batal */}
          <button
            type="button"
            disabled={loading}
            onClick={() => router.back()}
            className="flex items-center gap-1.5 border border-slate-200 text-slate-500 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <XCircle size={16} />
            <span>Batal</span>
          </button>
          
          {/* Tombol Simpan */}
          <button
            type="submit"
            disabled={loading || Object.keys(errors).length > 0}
            className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-blue-700 active:scale-[0.98] shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Simpan Transaksi</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}