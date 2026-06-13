'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Edit, Briefcase, Calendar, FileText, Building2, 
  Link as LinkIcon, CheckCircle2, Flag, ExternalLink, StickyNote, 
  AlertCircle, Clock, CalendarDays, CalendarRange, Timer, 
  Globe, BookOpen, Target, Layers, Loader2
} from 'lucide-react';
import { Job } from '@/types/job';
import { format } from 'date-fns';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface JobViewProps {
  job: Job;
}

export default function JobView({ job }: JobViewProps) {
  const router = useRouter();
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [updatingChecklist, setUpdatingChecklist] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize checklist from job.applyNotes
  useEffect(() => {
    if (job.applyNotes) {
      try {
        const parsed = JSON.parse(job.applyNotes);
        if (Array.isArray(parsed)) {
          setChecklist(parsed);
        } else {
          setChecklist([]);
        }
      } catch {
        setChecklist([]);
      }
    } else {
      setChecklist([]);
    }
  }, [job.applyNotes]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return format(new Date(dateStr), 'dd MMMM yyyy');
  };

  const statusBadgeClass: Record<string, string> = {
    BACKLOG: 'badge-neutral',
    APPLYING: 'badge-warning',
    APPLIED: 'badge-primary',
    ADMIN_SCREENING: 'badge-primary',
    ASSESSMENT: 'badge-primary',
    FGD_LGD: 'badge-primary',
    INTERVIEW_HR: 'badge-primary',
    INTERVIEW_USER: 'badge-primary',
    INTERVIEW_EXECUTIVE: 'badge-primary',
    MEDICAL_CHECK_UP: 'badge-primary',
    OFFERING: 'badge-success',
    CLOSED: 'badge-neutral'
  };

  const priorityBadgeClass: Record<string, string> = {
    HIGH: 'badge-danger',
    MEDIUM: 'badge-warning',
    LOW: 'badge-success'
  };

  const DetailRow = ({ icon: Icon, label, value, href }: { icon: React.ElementType; label: string; value: string | null; href?: string }) => {
    if (!value) return null;
    return (
      <div className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0 group">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-md bg-neutral-100 text-neutral-500 flex items-center justify-center group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
            <Icon size={14} strokeWidth={1.8} />
          </div>
          <span className="text-xs font-medium text-neutral-600 uppercase tracking-wide">{label}</span>
        </div>
        <div className="flex-1 text-right">
          {href ? (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary-600 hover:underline break-all inline-flex items-center gap-1"
            >
              {value.length > 40 ? value.substring(0, 40) + '…' : value}
              <ExternalLink size={12} className="flex-shrink-0" />
            </a>
          ) : (
            <span className="text-sm font-medium text-neutral-800">{value}</span>
          )}
        </div>
      </div>
    );
  };

  const DateRow = ({ dateStr, label, Icon }: { dateStr: string | null; label: string; Icon: React.ElementType }) => {
    const formatted = formatDate(dateStr);
    if (!formatted) return null;
    return (
      <div className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0 group">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-md bg-neutral-100 text-neutral-500 flex items-center justify-center group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
            <Icon size={14} strokeWidth={1.8} />
          </div>
          <span className="text-xs font-medium text-neutral-600 uppercase tracking-wide">{label}</span>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium text-neutral-800">{formatted}</span>
        </div>
      </div>
    );
  };

  const toggleChecklistItem = async (itemId: string) => {
    if (updatingChecklist) return;
    
    const updatedList = checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    
    // Optimistic update
    setChecklist(updatedList);
    setUpdatingChecklist(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applyNotes: JSON.stringify(updatedList) }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update checklist');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      // Revert optimistic update
      setChecklist(checklist);
    } finally {
      setUpdatingChecklist(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header with back and edit */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 px-4 py-2 rounded-xl transition-all shadow-sm"
        >
          <ArrowLeft size={16} className="text-neutral-500" />
          <span>Back</span>
        </button>
        <Link
          href={`/jobs/${job.id}/edit`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 px-5 py-2 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <Edit size={16} />
          Edit Job
        </Link>
      </div>

      {/* Hero Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 bg-gradient-to-br from-white to-neutral-50">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="p-3 bg-primary-50 rounded-2xl shadow-inner">
            <Briefcase className="text-primary-600" size={28} strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">{job.position}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="inline-flex items-center gap-1 text-sm text-neutral-600">
                <Building2 size={14} />
                {job.company}
              </span>
              <span className="text-neutral-300">•</span>
              <span className={`badge ${statusBadgeClass[job.status]}`}>
                {job.status.replace(/_/g, ' ')}
              </span>
              <span className={`badge ${priorityBadgeClass[job.priority]}`}>
                <Flag size={12} className="inline mr-1" />
                {job.priority}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-3 border-b border-neutral-100 bg-neutral-50/40 flex items-center gap-2">
              <FileText size={18} className="text-primary-500" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Job Description</h2>
            </div>
            <div className="p-6">
              {job.description ? (
                <div className="whitespace-pre-wrap text-neutral-700 text-sm leading-relaxed">{job.description}</div>
              ) : (
                <div className="flex items-center gap-2 text-neutral-400 text-sm">
                  <AlertCircle size={16} />
                  <span>No description provided.</span>
                </div>
              )}
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-3 border-b border-neutral-100 bg-neutral-50/40 flex items-center gap-2">
              <FileText size={18} className="text-success-500" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Requirements</h2>
            </div>
            <div className="p-6">
              {job.requirement ? (
                <div className="whitespace-pre-wrap text-neutral-700 text-sm leading-relaxed">{job.requirement}</div>
              ) : (
                <div className="flex items-center gap-2 text-neutral-400 text-sm">
                  <AlertCircle size={16} />
                  <span>No requirements listed.</span>
                </div>
              )}
            </div>
          </div>

          {/* Preparation Checklist - Interactive */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-3 border-b border-neutral-100 bg-neutral-50/40 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Preparation Checklist</h2>
              {updatingChecklist && <Loader2 size={14} className="animate-spin text-emerald-500 ml-auto" />}
            </div>
            <div className="p-6">
              {error && (
                <div className="mb-4 p-2 bg-danger-50 text-danger-600 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}
              {checklist.length === 0 ? (
                <div className="flex items-center gap-2 text-neutral-400 text-sm">
                  <AlertCircle size={16} />
                  <span>No checklist items.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer group"
                      onClick={() => toggleChecklistItem(item.id)}
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        item.completed
                          ? 'bg-success-500 border-success-500 text-white'
                          : 'border-neutral-300 bg-white group-hover:border-success-300'
                      }`}>
                        {item.completed && <CheckCircle2 size={14} />}
                      </div>
                      <span className={`text-sm flex-1 ${
                        item.completed ? 'line-through text-neutral-400' : 'text-neutral-700'
                      }`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          {job.notes && (
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="px-6 py-3 border-b border-neutral-100 bg-neutral-50/40 flex items-center gap-2">
                <StickyNote size={18} className="text-amber-500" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Additional Notes</h2>
              </div>
              <div className="p-6">
                <div className="whitespace-pre-wrap text-neutral-700 text-sm leading-relaxed">{job.notes}</div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Details, Dates, Links */}
        <div className="space-y-6">
          {/* Job Details */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 hover:shadow-md transition-shadow">
            <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2 mb-4 pb-2 border-b border-neutral-100">
              <Briefcase size={16} className="text-primary-500" />
              Job Details
            </h3>
            <div className="space-y-1">
              <DetailRow icon={Layers} label="Job Type" value={job.jobType.replace(/_/g, ' ')} />
              <DetailRow icon={Timer} label="Duration" value={job.duration ? `${job.duration} months` : null} />
              <DetailRow icon={Globe} label="Platform" value={job.platform} />
              {!job.duration && !job.platform && (
                <div className="flex items-center justify-center text-neutral-400 text-sm py-2">
                  <AlertCircle size={14} className="mr-2" />
                  <span>No additional details</span>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Dates */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 hover:shadow-md transition-shadow">
        <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2 mb-4 pb-2 border-b border-neutral-100">
          <Calendar size={16} className="text-amber-500" />
          Important Dates
        </h3>
        <div className="space-y-1">
          <DateRow dateStr={job.deadline} label="Deadline" Icon={CalendarDays} />
          <DateRow dateStr={job.openingDate} label="Opening Date" Icon={CalendarRange} />

          {/* Planned Apply Date - hanya untuk status yang belum applied */}
          {['BACKLOG', 'APPLYING'].includes(job.status) && job.plannedApplyDate && (
            <DateRow 
              dateStr={job.plannedApplyDate} 
              label="Planned Apply Date" 
              Icon={Target} 
            />
          )}

          {/* Applied Date - jika ada */}
          {job.appliedDate && (
            <DateRow 
              dateStr={job.appliedDate} 
              label="Applied Date" 
              Icon={CheckCircle2} 
            />
          )}

          {/* Planned Apply Time (opsional) */}
          {job.plannedApplyTime && (
            <DetailRow icon={Clock} label="Planned Time" value={job.plannedApplyTime} />
          )}

          {!job.deadline && !job.openingDate && !job.plannedApplyDate && !job.appliedDate && !job.plannedApplyTime && (
            <div className="flex items-center justify-center text-neutral-400 text-sm py-2">
              <AlertCircle size={14} className="mr-2" />
              <span>No dates provided</span>
            </div>
          )}
        </div>
      </div>


          {/* Links */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 hover:shadow-md transition-shadow">
            <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2 mb-4 pb-2 border-b border-neutral-100">
              <LinkIcon size={16} className="text-blue-500" />
              Links
            </h3>
            <div className="space-y-1">
              <DetailRow icon={ExternalLink} label="Apply Link" value={job.applyLink} href={job.applyLink || undefined} />
              <DetailRow icon={BookOpen} label="Source Link" value={job.sourceLink} href={job.sourceLink || undefined} />
              {!job.applyLink && !job.sourceLink && (
                <div className="flex items-center justify-center text-neutral-400 text-sm py-2">
                  <AlertCircle size={14} className="mr-2" />
                  <span>No links provided</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}