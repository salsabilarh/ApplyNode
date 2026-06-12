'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { JobType, Priority, JobStatus } from '@prisma/client';
import { 
  ArrowLeft, Save, XCircle, Loader2, Briefcase, Calendar, 
  FileText, AlertCircle, Trash2, Plus, CheckCircle2, ExternalLink,
  Upload, X, Sparkles
} from 'lucide-react';
import { useModal } from '@/context/ModalContext';

// ---------- Types ----------
interface NoteItem {
  id: string;
  text: string;
  completed: boolean;
}

interface JobFormData {
  id?: string;
  position: string;
  jobType: JobType;
  company: string;
  platform: string;
  sourceLink: string;
  applyLink: string;
  description: string;
  requirement: string;
  duration: string;
  deadline: string;
  openingDate: string;
  priority: Priority;
  status: JobStatus;
  plannedApplyDate: string;
  plannedApplyTime: string;
  applyNotes: string;
  notes: string;
}

const emptyJob: JobFormData = {
  position: '',
  jobType: 'FULL_TIME',
  company: '',
  platform: 'LinkedIn',
  sourceLink: '',
  applyLink: '',
  description: '',
  requirement: '',
  duration: '',
  deadline: '',
  openingDate: '',
  priority: 'MEDIUM',
  status: 'BACKLOG',
  plannedApplyDate: '',
  plannedApplyTime: '',
  applyNotes: '[]',
  notes: '',
};

const formatInitialData = (data: any): JobFormData => {
  if (!data) return emptyJob;
  return {
    id: data.id,
    position: data.position || '',
    jobType: data.jobType || 'FULL_TIME',
    company: data.company || '',
    platform: data.platform || 'LinkedIn',
    sourceLink: data.sourceLink || '',
    applyLink: data.applyLink || '',
    description: data.description || '',
    requirement: data.requirement || '',
    duration: data.duration || '',
    deadline: data.deadline ? data.deadline.split('T')[0] : '',
    openingDate: data.openingDate ? data.openingDate.split('T')[0] : '',
    priority: data.priority || 'MEDIUM',
    status: data.status || 'BACKLOG',
    plannedApplyDate: data.plannedApplyDate ? data.plannedApplyDate.split('T')[0] : '',
    plannedApplyTime: data.plannedApplyTime || '',
    applyNotes: data.applyNotes || '[]',
    notes: data.notes || '',
  };
};

// ========== PARSING FUNCTION ==========
interface ParsedJobData {
  position?: string;
  company?: string;
  description?: string;
  requirement?: string;
  applyLink?: string;
  platform?: string;
}

function parseJobPosting(text: string): ParsedJobData {
  const result: ParsedJobData = {};

  // Extract position (common patterns)
  const positionMatch = text.match(/(?:Position|Job Title|Role):\s*(.+)/i) ||
                        text.match(/^([^\n]{10,80})/m); // first line that's not too short/long
  if (positionMatch) result.position = positionMatch[1].trim();

  // Extract company
  const companyMatch = text.match(/(?:Company|At|Organization):\s*(.+)/i) ||
                       text.match(/(?:for|at)\s+([A-Z][a-zA-Z0-9\s&.]+)(?:\n|\.)/);
  if (companyMatch) result.company = companyMatch[1].trim();

  // Extract description (text between "Description" and next section)
  const descSection = text.match(/Description:?([\s\S]*?)(?=\n\s*(?:Requirements|Qualifications|Responsibilities|Benefits|$))/i);
  if (descSection) result.description = descSection[1].trim();

  // Extract requirements
  const reqSection = text.match(/(?:Requirements|Qualifications):?([\s\S]*?)(?=\n\s*(?:Benefits|About|Apply|$))/i);
  if (reqSection) result.requirement = reqSection[1].trim();

  // Extract URL
  const urlMatch = text.match(/https?:\/\/[^\s]+/);
  if (urlMatch) result.applyLink = urlMatch[0];

  // Detect platform from known keywords
  if (text.match(/linkedin/i)) result.platform = 'LinkedIn';
  else if (text.match(/jobstreet/i)) result.platform = 'Jobstreet';
  else if (text.match(/indeed/i)) result.platform = 'Indeed';
  else if (text.match(/glassdoor/i)) result.platform = 'Glassdoor';
  else if (text.match(/karir|glints/i)) result.platform = 'Glints';

  return result;
}

// ========== REUSABLE FORM COMPONENTS ==========
const FormRow = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
    {children}
  </div>
);

const Label = ({ label, required }: { label: string; required?: boolean }) => (
  <div className="md:col-span-1">
    <label className="block text-sm font-medium text-slate-700 mt-1">
      {label} {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
  </div>
);

const InputWrapper = ({ children, error }: { children: React.ReactNode; error?: string }) => (
  <div className="md:col-span-2 space-y-1.5">
    {children}
    {error && (
      <p className="text-xs text-rose-500 flex items-center gap-1">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
);

const TextInput = ({ name, value, onChange, required, placeholder, type = 'text' }: any) => (
  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    required={required}
    placeholder={placeholder}
    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-base bg-white transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
  />
);

const TextArea = ({ name, value, onChange, rows, placeholder }: any) => (
  <textarea
    name={name}
    value={value}
    onChange={onChange}
    rows={rows}
    placeholder={placeholder}
    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-base bg-white transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
  />
);

const Select = ({ name, value, onChange, options }: any) => (
  <select
    name={name}
    value={value}
    onChange={onChange}
    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-base bg-white appearance-none cursor-pointer transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
  >
    {options.map((opt: string) => (
      <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
    ))}
  </select>
);

const DateInput = ({ name, value, onChange, required, error }: any) => (
  <div className="relative">
    <input
      type="date"
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      max="2100-12-31"
      className={`w-full border rounded-xl px-4 py-2.5 text-base bg-white transition-all ${
        error
          ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
          : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
      }`}
    />
    <Calendar size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
  </div>
);

// ========== MAIN COMPONENT ==========
export default function JobForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const { openModal } = useModal();
  const [form, setForm] = useState<JobFormData>(() => formatInitialData(initialData));
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ deadline?: string; plannedApplyDate?: string; openingDate?: string }>({});
  
  // Import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);

  // Checklist state
  const [checklist, setChecklist] = useState<NoteItem[]>(() => {
    try { return JSON.parse(form.applyNotes); } catch { return []; }
  });
  const [newChecklistItem, setNewChecklistItem] = useState('');

  const updateChecklist = useCallback((newList: NoteItem[]) => {
    setChecklist(newList);
    setForm(prev => ({ ...prev, applyNotes: JSON.stringify(newList) }));
  }, []);

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    updateChecklist([...checklist, { id: Date.now().toString(), text: newChecklistItem.trim(), completed: false }]);
    setNewChecklistItem('');
  };

  const toggleChecklistItem = (id: string) => {
    updateChecklist(checklist.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const deleteChecklistItem = (id: string) => {
    updateChecklist(checklist.filter(item => item.id !== id));
  };

  const validateDates = (deadline: string, plannedApply: string, opening: string) => {
    const newErrors: typeof errors = {};
    const dDate = deadline ? new Date(deadline) : null;
    const pDate = plannedApply ? new Date(plannedApply) : null;
    const oDate = opening ? new Date(opening) : null;
    [dDate, pDate, oDate].forEach(d => d?.setHours(0, 0, 0, 0));

    if (oDate && dDate && oDate > dDate) newErrors.openingDate = 'Opening date cannot be after deadline.';
    if (oDate && pDate && oDate > pDate) newErrors.openingDate = 'Opening date cannot be after planned apply date.';
    if (pDate && dDate && pDate > dDate) {
      newErrors.plannedApplyDate = 'Planned apply date cannot exceed deadline.';
      newErrors.deadline = 'Deadline cannot be before planned apply date.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (['deadline', 'plannedApplyDate', 'openingDate'].includes(name)) {
      validateDates(
        name === 'deadline' ? value : form.deadline,
        name === 'plannedApplyDate' ? value : form.plannedApplyDate,
        name === 'openingDate' ? value : form.openingDate
      );
    }
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    setImporting(true);
    // Simulate parsing delay
    setTimeout(() => {
      const parsed = parseJobPosting(importText);
      setForm(prev => ({
        ...prev,
        position: parsed.position || prev.position,
        company: parsed.company || prev.company,
        description: parsed.description || prev.description,
        requirement: parsed.requirement || prev.requirement,
        applyLink: parsed.applyLink || prev.applyLink,
        platform: parsed.platform || prev.platform,
      }));
      setImportText('');
      setIsImportModalOpen(false);
      setImporting(false);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDates(form.deadline, form.plannedApplyDate, form.openingDate)) return;
    setLoading(true);
    try {
      const res = await fetch(form.id ? `/api/jobs/${form.id}` : '/api/jobs', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) { router.push('/'); router.refresh(); }
      else { const err = await res.json(); throw new Error(err.error || 'Failed to save'); }
    } catch (error: any) { alert(error.message); }
    finally { setLoading(false); }
  };

  const handleDelete = () => {
    if (!form.id) return;
    openModal({
      title: 'Delete Job?',
      message: 'This job application will be permanently deleted.',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/jobs/${form.id}`, { method: 'DELETE' });
          if (res.ok) { router.push('/'); router.refresh(); }
          else throw new Error('Delete failed');
        } catch { alert('Delete failed'); }
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 px-4 sm:px-6 lg:px-8">
      {/* Back button and Import button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>
        {!form.id && (
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-colors"
          >
            <Sparkles size={16} />
            <span>Quick Import from Job Posting</span>
          </button>
        )}
      </div>

      <div className="bg-gradient-to-r from-slate-50 via-white to-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-xl">
            <Briefcase className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {form.id ? 'Edit Job Application' : 'Create New Job Application'}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {form.id ? 'Update details to keep your tracking accurate.' : 'Fill in the details to start tracking your application journey.'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ===== SECTION 1: BASIC INFORMATION ===== */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-3.5 border-b bg-slate-50/40">
            <Briefcase size={18} className="text-blue-500" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Basic Information</h2>
          </div>
          <div className="p-6 space-y-5">
            <FormRow>
              <Label label="Position" required />
              <InputWrapper>
                <TextInput name="position" value={form.position} onChange={handleInputChange} required placeholder="e.g., Frontend Developer" />
              </InputWrapper>
            </FormRow>
            <FormRow>
              <Label label="Company" required />
              <InputWrapper>
                <TextInput name="company" value={form.company} onChange={handleInputChange} required placeholder="e.g., PT Tech Solutions" />
              </InputWrapper>
            </FormRow>
            <FormRow>
              <Label label="Job Type" required />
              <InputWrapper>
                <Select name="jobType" value={form.jobType} onChange={handleInputChange} options={Object.values(JobType)} />
              </InputWrapper>
            </FormRow>
            <FormRow>
              <Label label="Platform" required />
              <InputWrapper>
                <TextInput name="platform" value={form.platform} onChange={handleInputChange} required placeholder="LinkedIn, Jobstreet, etc." />
              </InputWrapper>
            </FormRow>

            {/* Apply Link */}
            <FormRow>
              <Label label="Apply Link" required />
              <InputWrapper>
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <TextInput
                      name="applyLink"
                      value={form.applyLink}
                      onChange={handleInputChange}
                      type="url"
                      required
                      placeholder="https://..."
                    />
                  </div>
                  {form.applyLink && (
                    <a
                      href={form.applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2.5 rounded-xl transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink size={16} />
                      <span className="hidden sm:inline">Open</span>
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Direct link to submit your application.</p>
              </InputWrapper>
            </FormRow>

            {/* Source Link */}
            <FormRow>
              <Label label="Source Link" required />
              <InputWrapper>
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <TextInput
                      name="sourceLink"
                      value={form.sourceLink}
                      onChange={handleInputChange}
                      type="url"
                      required
                      placeholder="https://..."
                    />
                  </div>
                  {form.sourceLink && (
                    <a
                      href={form.sourceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2.5 rounded-xl transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink size={16} />
                      <span className="hidden sm:inline">Open</span>
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Original job posting source.</p>
              </InputWrapper>
            </FormRow>

            <FormRow>
              <Label label="Job Description" />
              <InputWrapper>
                <TextArea name="description" value={form.description} onChange={handleInputChange} rows={6} placeholder="Paste the full job description here..." />
              </InputWrapper>
            </FormRow>
            <FormRow>
              <Label label="Requirements" />
              <InputWrapper>
                <TextArea name="requirement" value={form.requirement} onChange={handleInputChange} rows={6} placeholder="List key qualifications and skills..." />
              </InputWrapper>
            </FormRow>
          </div>
        </section>

        {/* ===== SECTION 2: TIME & PRIORITY ===== */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-3.5 border-b bg-slate-50/40">
            <Calendar size={18} className="text-amber-500" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Time & Priority</h2>
          </div>
          <div className="p-6 space-y-5">
            <FormRow>
              <Label label="Deadline" required />
              <InputWrapper error={errors.deadline}>
                <DateInput name="deadline" value={form.deadline} onChange={handleInputChange} required error={errors.deadline} />
              </InputWrapper>
            </FormRow>
            <FormRow>
              <Label label="Opening Date" />
              <InputWrapper error={errors.openingDate}>
                <DateInput name="openingDate" value={form.openingDate} onChange={handleInputChange} error={errors.openingDate} />
              </InputWrapper>
            </FormRow>
            <FormRow>
              <Label label="Priority" />
              <InputWrapper>
                <Select name="priority" value={form.priority} onChange={handleInputChange} options={Object.values(Priority)} />
              </InputWrapper>
            </FormRow>
            <FormRow>
              <Label label="Status" />
              <InputWrapper>
                <Select name="status" value={form.status} onChange={handleInputChange} options={Object.values(JobStatus)} />
              </InputWrapper>
            </FormRow>
            <FormRow>
              <Label label="Duration (months)" />
              <InputWrapper>
                <TextInput name="duration" value={form.duration} onChange={handleInputChange} type="number" placeholder="e.g., 6" />
              </InputWrapper>
            </FormRow>
          </div>
        </section>

        {/* ===== SECTION 3: EXECUTION PLAN ===== */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-3.5 border-b bg-slate-50/40">
            <FileText size={18} className="text-emerald-500" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Execution Plan</h2>
          </div>
          <div className="p-6 space-y-5">
            <FormRow>
              <Label label="Planned Date" />
              <InputWrapper error={errors.plannedApplyDate}>
                <DateInput name="plannedApplyDate" value={form.plannedApplyDate} onChange={handleInputChange} error={errors.plannedApplyDate} />
              </InputWrapper>
            </FormRow>
            <FormRow>
              <Label label="Planned Time" />
              <InputWrapper>
                <TextInput name="plannedApplyTime" value={form.plannedApplyTime} onChange={handleInputChange} type="time" />
              </InputWrapper>
            </FormRow>
            <FormRow>
              <Label label="Preparation Checklist" />
              <InputWrapper>
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/20">
                  <div className="max-h-60 overflow-y-auto space-y-1 p-2">
                    {checklist.length === 0 && (
                      <div className="text-center text-slate-400 text-sm py-6">No checklist items yet. Add tasks below.</div>
                    )}
                    {checklist.map(item => (
                      <div key={item.id} className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-100 group hover:border-slate-200 transition-all">
                        <button
                          type="button"
                          onClick={() => toggleChecklistItem(item.id)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                            item.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-300 bg-white hover:border-emerald-300'
                          }`}
                        >
                          {item.completed && <CheckCircle2 size={14} />}
                        </button>
                        <span className={`flex-1 text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                          {item.text}
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteChecklistItem(item.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 p-3 border-t border-slate-100 bg-white">
                    <input
                      type="text"
                      value={newChecklistItem}
                      onChange={e => setNewChecklistItem(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
                      className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Add a task (e.g., Update CV, Write cover letter)"
                    />
                    <button
                      type="button"
                      onClick={addChecklistItem}
                      className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>
                </div>
              </InputWrapper>
            </FormRow>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100">
          {form.id && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-1.5 border border-red-200 text-red-600 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50 mr-auto"
            >
              <Trash2 size={16} /> Delete
            </button>
          )}
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="flex items-center gap-1.5 border border-slate-200 text-slate-600 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <XCircle size={16} /> Cancel
          </button>
          <button
            type="submit"
            disabled={loading || Object.keys(errors).length > 0}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{loading ? 'Saving...' : 'Save Job'}</span>
          </button>
        </div>
      </form>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-emerald-500" />
                <h3 className="font-bold text-lg text-slate-900">Import from Job Posting</h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Copy and paste the job posting text (from LinkedIn, Jobstreet, etc.). The system will automatically extract:
                position, company, description, requirements, and apply link.
              </p>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={8}
                placeholder="Paste the full job posting here..."
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={importing || !importText.trim()}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-5 py-2 rounded-xl shadow-sm transition-all disabled:opacity-50"
                >
                  {importing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  <span>{importing ? 'Importing...' : 'Import & Fill Form'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}