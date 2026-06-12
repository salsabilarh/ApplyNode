'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Filter, Layers, Building2, AlertCircle, Activity, Briefcase,
  Plus, Search, RotateCcw, Info, CalendarDays
} from 'lucide-react';

interface Job {
  id: string;
  position: string;
  company: string;
  platform: string;
  deadline: string;
  openingDate?: string | null;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
}

interface MasterListClientProps {
  initialJobs: Job[];
}

/**
 * Master data table with advanced filtering, search, and responsive design.
 * Displays all job applications in a sortable/filterable list.
 */
export default function MasterListClient({ initialJobs }: MasterListClientProps) {
  const [search, setSearch] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const uniquePlatforms = useMemo(() => Array.from(new Set(initialJobs.map(j => j.platform))), [initialJobs]);
  const uniqueCompanies = useMemo(() => Array.from(new Set(initialJobs.map(j => j.company))), [initialJobs]);
  const uniqueStatuses = useMemo(() => Array.from(new Set(initialJobs.map(j => j.status))), [initialJobs]);

  const handleResetFilters = () => {
    setSearch('');
    setFilterPlatform('');
    setFilterCompany('');
    setFilterPriority('');
    setFilterStatus('');
  };

  const filteredJobs = useMemo(() => {
    return initialJobs.filter(job => {
      const matchesSearch = job.position.toLowerCase().includes(search.toLowerCase()) ||
                            job.company.toLowerCase().includes(search.toLowerCase());
      const matchesPlatform = filterPlatform === '' || job.platform === filterPlatform;
      const matchesCompany = filterCompany === '' || job.company === filterCompany;
      const matchesPriority = filterPriority === '' || job.priority === filterPriority;
      const matchesStatus = filterStatus === '' || job.status === filterStatus;
      return matchesSearch && matchesPlatform && matchesCompany && matchesPriority && matchesStatus;
    });
  }, [initialJobs, search, filterPlatform, filterCompany, filterPriority, filterStatus]);

  const getDaysSinceOpened = (openingDateStr?: string | null) => {
    if (!openingDateStr) return '-';
    const openDate = new Date(openingDateStr);
    const today = new Date();
    openDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - openDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Not opened yet';
    return diffDays === 0 ? 'Today' : `${diffDays} days`;
  };

  const getDeadlineBadge = (deadlineStr: string) => {
    const rawDate = deadlineStr.split('T')[0];
    if (!rawDate) return <span className="text-slate-400">-</span>;
    const parts = rawDate.split('-');
    const deadlineDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const formatted = deadlineDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    if (diffDays < 0) {
      return (
        <div className="flex flex-col">
          <span className="text-slate-700 font-medium text-xs">{formatted}</span>
          <span className="text-[10px] text-rose-600 font-bold mt-0.5">Expired</span>
        </div>
      );
    } else if (diffDays === 0) {
      return (
        <div className="flex flex-col">
          <span className="text-slate-700 font-medium text-xs">{formatted}</span>
          <span className="text-[10px] text-amber-600 font-bold mt-0.5 animate-pulse">Last day!</span>
        </div>
      );
    }
    return (
      <div className="flex flex-col">
        <span className="text-slate-700 font-medium text-xs">{formatted}</span>
        <span className="text-[10px] text-blue-600 font-semibold mt-0.5 bg-blue-50 px-1.5 py-0.5 rounded-md w-fit">{diffDays} days left</span>
      </div>
    );
  };

  return (
    <div className="w-full space-y-4 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-sm gap-4">
        <div className="flex items-center gap-2.5">
          <Briefcase className="text-blue-600" size={22} strokeWidth={2.2} />
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Job Master Data</h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              All job applications with advanced filtering and search capabilities.
            </p>
          </div>
        </div>
        <Link
          href="/jobs/new"
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl active:scale-95 transition-all shadow-sm self-start md:self-center"
        >
          <Plus size={14} strokeWidth={2.5} /> Add Job
        </Link>
      </div>

      {/* Filter Panel */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by position or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/70 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
          {(filterPlatform || filterCompany || filterPriority || filterStatus || search) && (
            <button
              onClick={handleResetFilters}
              className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            >
              <RotateCcw size={14} /> Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Layers className="absolute left-3 top-3 text-slate-400 pointer-events-none" size={14} />
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/70 rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-600 outline-none appearance-none cursor-pointer focus:border-blue-500 focus:bg-white transition-all font-medium"
            >
              <option value="">All Platforms</option>
              {uniquePlatforms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="relative">
            <Building2 className="absolute left-3 top-3 text-slate-400 pointer-events-none" size={14} />
            <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/70 rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-600 outline-none appearance-none cursor-pointer focus:border-blue-500 focus:bg-white transition-all font-medium"
            >
              <option value="">All Companies</option>
              {uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="relative">
            <AlertCircle className="absolute left-3 top-3 text-slate-400 pointer-events-none" size={14} />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/70 rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-600 outline-none appearance-none cursor-pointer focus:border-blue-500 focus:bg-white transition-all font-medium"
            >
              <option value="">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div className="relative">
            <Activity className="absolute left-3 top-3 text-slate-400 pointer-events-none" size={14} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/70 rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-600 outline-none appearance-none cursor-pointer focus:border-blue-500 focus:bg-white transition-all font-medium"
            >
              <option value="">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Position & Company</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4">Days Open</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4 text-center">Priority</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 font-medium">
                    No matching job data found.
                  </td>
                </tr>
              ) : (
                filteredJobs.map(job => (
                  <tr key={job.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{job.position}</div>
                      <div className="text-slate-400 text-[11px] font-medium mt-0.5">{job.company}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-500">{job.platform}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{getDaysSinceOpened(job.openingDate)}</td>
                    <td className="py-3.5 px-4">{getDeadlineBadge(job.deadline)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${
                        job.priority === 'HIGH' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        job.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {job.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                        job.status === 'CLOSED' ? 'bg-slate-100 text-slate-500' :
                        job.status === 'APPLIED' ? 'bg-blue-50 text-blue-600' :
                        ['BACKLOG', 'APPLYING'].includes(job.status) ? 'bg-amber-50 text-amber-600' :
                        'bg-purple-50 text-purple-600'
                      }`}>
                        {job.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/jobs/${job.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all font-semibold text-[10px]"
                      >
                        <Info size={14} /> Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3.5 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-[11px] font-medium text-slate-400">
          <span>Showing {filteredJobs.length} of {initialJobs.length} jobs</span>
        </div>
      </div>
    </div>
  );
}