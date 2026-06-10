'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { JobType, Priority, Status } from '@prisma/client';

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
  status: Status;
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
  status: 'TO_BE_APPLY',
  plannedApplyDate: '',
  plannedApplyTime: '',
  applyNotes: '',
  notes: '',
};

export default function JobForm({ initialData }: { initialData?: JobData }) {
  const router = useRouter();
  const [form, setForm] = useState<JobData>(initialData || emptyJob);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = form.id ? `/api/jobs/${form.id}` : '/api/jobs';
    const method = form.id ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.push('/jobs');
      router.refresh();
    } else {
      alert('Error menyimpan data');
    }
    setLoading(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">
        {form.id ? 'Edit Lowongan' : 'Tambah Lowongan Baru'}
      </h1>

      {/* Posisi */}
      <div>
        <label className="block text-sm font-medium">Posisi</label>
        <input
          name="position"
          value={form.position}
          onChange={handleChange}
          required
          className="mt-1 w-full border rounded p-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Tipe Pekerjaan</label>
          <select
            name="jobType"
            value={form.jobType}
            onChange={handleChange}
            className="mt-1 w-full border rounded p-2"
          >
            {Object.values(JobType).map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Platform</label>
          <input
            name="platform"
            value={form.platform}
            onChange={handleChange}
            required
            className="mt-1 w-full border rounded p-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Perusahaan</label>
        <input
          name="company"
          value={form.company}
          onChange={handleChange}
          required
          className="mt-1 w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Link Sumber</label>
        <input
          name="sourceLink"
          value={form.sourceLink}
          onChange={handleChange}
          className="mt-1 w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Deskripsi</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          className="mt-1 w-full border rounded p-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Deadline</label>
          <input
            type="date"
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
            required
            className="mt-1 w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Tanggal Buka</label>
          <input
            type="date"
            name="openingDate"
            value={form.openingDate}
            onChange={handleChange}
            className="mt-1 w-full border rounded p-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Prioritas</label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="mt-1 w-full border rounded p-2"
          >
            {Object.values(Priority).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="mt-1 w-full border rounded p-2"
          >
            {Object.values(Status).map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Durasi (opsional)</label>
        <input
          name="duration"
          value={form.duration}
          onChange={handleChange}
          className="mt-1 w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Catatan Rencana Apply</label>
        <textarea
          name="applyNotes"
          value={form.applyNotes}
          onChange={handleChange}
          rows={2}
          className="mt-1 w-full border rounded p-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Tgl Rencana Apply</label>
          <input
            type="date"
            name="plannedApplyDate"
            value={form.plannedApplyDate}
            onChange={handleChange}
            className="mt-1 w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Jam Rencana</label>
          <input
            type="time"
            name="plannedApplyTime"
            value={form.plannedApplyTime}
            onChange={handleChange}
            className="mt-1 w-full border rounded p-2"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Menyimpan...' : 'Simpan'}
      </button>
    </form>
  );
}