'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Filter, Layers, Building2, AlertCircle, Activity, Briefcase,
  Plus, Search, RotateCcw, Eye, CalendarDays, Clock, TrendingUp
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
 * Optimized for consistency with global design system.
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
    if (!openingDateStr) return <span className="text-neutral-400 text-xs">—</span>;
    const openDate = new Date(openingDateStr);
    const today = new Date();
    openDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - openDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return <span className="text-neutral-500 text-xs">Not opened yet</span>;
    if (diffDays === 0) return <span className="text-primary-600 font-semibold text-xs">Today</span>;
    return <span className="text-neutral-700 text-xs">{diffDays} days</span>;
  };

  const getDeadlineBadge = (deadlineStr: string) => {
    const rawDate = deadlineStr.split('T')[0];
    if (!rawDate) return <span className="text-neutral-400">—</span>;
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
          <span className="text-neutral-600 text-xs font-medium">{formatted}</span>
          <span className="text-[10px] text-danger-600 font-bold mt-0.5 bg-danger-50 px-1.5 py-0.5 rounded-md w-fit">Expired</span>
        </div>
      );
    } else if (diffDays === 0) {
      return (
        <div className="flex flex-col">
          <span className="text-neutral-600 text-xs font-medium">{formatted}</span>
          <span className="text-[10px] text-warning-600 font-bold mt-0.5 bg-warning-50 px-1.5 py-0.5 rounded-md w-fit animate-pulse">Last day!</span>
        </div>
      );
    }
    return (
      <div className="flex flex-col">
        <span className="text-neutral-600 text-xs font-medium">{formatted}</span>
        <span className="text-[10px] text-primary-600 font-semibold mt-0.5 bg-primary-50 px-1.5 py-0.5 rounded-md w-fit">{diffDays} days left</span>
      </div>
    );
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <span className="badge badge-danger text-[10px] font-bold">HIGH</span>;
      case 'MEDIUM':
        return <span className="badge badge-warning text-[10px] font-bold">MEDIUM</span>;
      default:
        return <span className="badge badge-neutral text-[10px] font-bold">LOW</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    const isClosed = status === 'CLOSED';
    const isApplied = status === 'APPLIED';
    const isBacklog = ['BACKLOG', 'APPLYING'].includes(status);
    if (isClosed) return <span className="badge badge-neutral">Closed</span>;
    if (isApplied) return <span className="badge badge-primary">Applied</span>;
    if (isBacklog) return <span className="badge badge-warning">In Progress</span>;
    return <span className="badge badge-neutral">{status.replace(/_/g, ' ')}</span>;
  };

  return (
    <div className="w-full space-y-5 pb-8">
      {/* Header Section */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl shadow-md shadow-primary-500/20">
            <Briefcase className="text-white" size={22} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Job Master Data</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Manage and track all job applications in one place
            </p>
          </div>
        </div>
        <Link
          href="/jobs/new"
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm self-start md:self-center"
        >
          <Plus size={16} strokeWidth={2} /> Add New Job
        </Link>
      </div>

      {/* Filter Panel - Enhanced */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-5 pb-3 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-primary-500" />
            <h2 className="text-sm font-semibold text-neutral-700">Filters</h2>
            {(filterPlatform || filterCompany || filterPriority || filterStatus || search) && (
              <button
                onClick={handleResetFilters}
                className="ml-2 flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1 rounded-lg transition-colors"
              >
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>
          <div className="text-xs text-neutral-500 bg-neutral-50 px-3 py-1 rounded-full">
            {filteredJobs.length} of {initialJobs.length} jobs
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input
              type="text"
              placeholder="Search by position or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-800 outline-none focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={14} />
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-neutral-700 outline-none appearance-none cursor-pointer focus:border-primary-400 focus:bg-white transition-all"
              >
                <option value="">All Platforms</option>
                {uniquePlatforms.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={14} />
              <select
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-neutral-700 outline-none appearance-none cursor-pointer focus:border-primary-400 focus:bg-white transition-all"
              >
                <option value="">All Companies</option>
                {uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="relative">
              <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={14} />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-neutral-700 outline-none appearance-none cursor-pointer focus:border-primary-400 focus:bg-white transition-all"
              >
                <option value="">All Priorities</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div className="relative">
              <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={14} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-neutral-700 outline-none appearance-none cursor-pointer focus:border-primary-400 focus:bg-white transition-all"
              >
                <option value="">All Statuses</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section - Responsive with hover effects */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Position & Company</th>
                <th className="py-3.5 px-5">Platform</th>
                <th className="py-3.5 px-5">Days Open</th>
                <th className="py-3.5 px-5">Deadline</th>
                <th className="py-3.5 px-5 text-center">Priority</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-neutral-500">
                    <div className="flex flex-col items-center gap-2">
                      <Briefcase size={32} className="text-neutral-300" />
                      <p className="text-sm font-medium">No matching job data found.</p>
                      <button onClick={handleResetFilters} className="text-primary-600 text-xs underline">Clear filters</button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredJobs.map(job => (
                  <tr key={job.id} className="group hover:bg-neutral-50/60 transition-colors duration-150">
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-neutral-900 text-sm">{job.position}</div>
                      <div className="text-neutral-500 text-xs mt-0.5 flex items-center gap-1">
                        <Building2 size={10} /> {job.company}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-sm text-neutral-600 font-medium">{job.platform}</td>
                    <td className="py-3.5 px-5">{getDaysSinceOpened(job.openingDate)}</td>
                    <td className="py-3.5 px-5">{getDeadlineBadge(job.deadline)}</td>
                    <td className="py-3.5 px-5 text-center">{getPriorityBadge(job.priority)}</td>
                    <td className="py-3.5 px-5 text-center">{getStatusBadge(job.status)}</td>
                    <td className="py-3.5 px-5 text-center">
                      <Link
                        href={`/jobs/${job.id}/view`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-all font-semibold text-[11px] group-hover:shadow-sm"
                      >
                        <Eye size={13} /> Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Footer summary */}
        <div className="p-3.5 bg-neutral-50/50 border-t border-neutral-200 flex justify-between items-center text-xs text-neutral-500 font-medium">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} />
            <span>Showing <strong className="text-neutral-700">{filteredJobs.length}</strong> of {initialJobs.length} jobs</span>
          </div>
          <div className="flex gap-3">
            <span className="flex items-center gap-1"><Clock size={12} /> Active deadlines shown</span>
          </div>
        </div>
      </div>
    </div>
  );
}