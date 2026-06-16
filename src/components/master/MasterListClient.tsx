'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Filter, Layers, Building2, AlertCircle, Activity, Briefcase,
  Plus, Search, RotateCcw, Eye, CalendarDays, Clock, TrendingUp,
  ArrowUpDown, ArrowUp, ArrowDown, MapPin, Globe
} from 'lucide-react';
import { formatJobType, formatStageLabel, formatWorkMethodLabel, formatDurationUnitLabel } from '@/lib/utils';

interface Job {
  id: string;
  position: string;
  company: string;
  platform: string;
  deadline: string;
  openingDate?: string | null;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
  jobType?: string | null;
  location?: string | null;
  workMethod?: string | null;
  duration?: string | null;
  durationUnit?: string | null;
}

interface MasterListClientProps {
  initialJobs: Job[];
}

type SortField = keyof Job | 'durationValue' | 'daysOpen';

// 🎨 Status badge colors – each status has unique color
const STATUS_COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  BACKLOG: { bg: 'bg-neutral-100', text: 'text-neutral-700', border: 'border-neutral-300' },
  APPLYING: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  APPLIED: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  ADMIN_SCREENING: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
  ASSESSMENT: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  FGD_LGD: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
  INTERVIEW_HR: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
  INTERVIEW_USER: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  INTERVIEW_EXECUTIVE: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  MEDICAL_CHECK_UP: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  OFFERING: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  CLOSED: { bg: 'bg-neutral-200', text: 'text-neutral-600', border: 'border-neutral-400' },
};

export default function MasterListClient({ initialJobs }: MasterListClientProps) {
  const [search, setSearch] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterJobType, setFilterJobType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterWorkMethod, setFilterWorkMethod] = useState('');
  const [filterDurationMin, setFilterDurationMin] = useState('');
  const [filterDurationMax, setFilterDurationMax] = useState('');
  const [filterDeadlineStart, setFilterDeadlineStart] = useState('');
  const [filterDeadlineEnd, setFilterDeadlineEnd] = useState('');

  const [sortField, setSortField] = useState<SortField>('position');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const uniquePlatforms = useMemo(() => Array.from(new Set(initialJobs.map(j => j.platform))), [initialJobs]);
  const uniqueCompanies = useMemo(() => Array.from(new Set(initialJobs.map(j => j.company))), [initialJobs]);
  const uniqueStatuses = useMemo(() => Array.from(new Set(initialJobs.map(j => j.status))), [initialJobs]);
  const uniqueJobTypes = useMemo(() => 
    Array.from(new Set(initialJobs.map(j => j.jobType).filter((v): v is string => v != null))), 
    [initialJobs]
  );
  const uniqueLocations = useMemo(() => 
    Array.from(new Set(initialJobs.map(j => j.location).filter((v): v is string => v != null))), 
    [initialJobs]
  );
  const uniqueWorkMethods = useMemo(() => 
    Array.from(new Set(initialJobs.map(j => j.workMethod).filter((v): v is string => v != null))), 
    [initialJobs]
  );

  const handleResetFilters = () => {
    setSearch('');
    setFilterPlatform('');
    setFilterCompany('');
    setFilterPriority('');
    setFilterStatus('');
    setFilterJobType('');
    setFilterLocation('');
    setFilterWorkMethod('');
    setFilterDurationMin('');
    setFilterDurationMax('');
    setFilterDeadlineStart('');
    setFilterDeadlineEnd('');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getPriorityValue = (priority: string): number => {
    const map: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return map[priority] || 0;
  };

  const getDurationValue = (job: Job): number => {
    const dur = job.duration;
    if (!dur) return 0;
    const num = parseFloat(dur);
    return isNaN(num) ? 0 : num;
  };

  const getDaysOpenValue = (job: Job): number => {
    if (!job.openingDate) return -1;
    const openDate = new Date(job.openingDate);
    const today = new Date();
    openDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return Math.floor((today.getTime() - openDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const filteredAndSortedJobs = useMemo(() => {
    let result = initialJobs.filter(job => {
      const matchesSearch = 
        job.position.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase()) ||
        (job.jobType && job.jobType.toLowerCase().includes(search.toLowerCase())) ||
        (job.location && job.location.toLowerCase().includes(search.toLowerCase())) ||
        (job.workMethod && job.workMethod.toLowerCase().includes(search.toLowerCase())) ||
        (job.duration && job.duration.toLowerCase().includes(search.toLowerCase())) ||
        (job.durationUnit && job.durationUnit.toLowerCase().includes(search.toLowerCase())) ||
        job.platform.toLowerCase().includes(search.toLowerCase()) ||
        job.status.toLowerCase().includes(search.toLowerCase());

      const matchesPlatform = filterPlatform === '' || job.platform === filterPlatform;
      const matchesCompany = filterCompany === '' || job.company === filterCompany;
      const matchesPriority = filterPriority === '' || job.priority === filterPriority;
      const matchesStatus = filterStatus === '' || job.status === filterStatus;
      const matchesJobType = filterJobType === '' || job.jobType === filterJobType;
      const matchesLocation = filterLocation === '' || job.location === filterLocation;
      const matchesWorkMethod = filterWorkMethod === '' || job.workMethod === filterWorkMethod;

      const durVal = getDurationValue(job);
      const matchesDuration = 
        (filterDurationMin === '' || durVal >= parseFloat(filterDurationMin)) &&
        (filterDurationMax === '' || durVal <= parseFloat(filterDurationMax));

      const deadlineStr = job.deadline || '';
      const matchesDeadline = 
        (filterDeadlineStart === '' || deadlineStr >= filterDeadlineStart) &&
        (filterDeadlineEnd === '' || deadlineStr <= filterDeadlineEnd);

      return matchesSearch && matchesPlatform && matchesCompany && matchesPriority && matchesStatus &&
             matchesJobType && matchesLocation && matchesWorkMethod && matchesDuration && matchesDeadline;
    });

    result.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortField) {
        case 'durationValue':
          aVal = getDurationValue(a);
          bVal = getDurationValue(b);
          break;
        case 'daysOpen':
          aVal = getDaysOpenValue(a);
          bVal = getDaysOpenValue(b);
          break;
        case 'priority':
          aVal = getPriorityValue(a.priority);
          bVal = getPriorityValue(b.priority);
          break;
        case 'deadline':
          aVal = a.deadline || '';
          bVal = b.deadline || '';
          break;
        case 'openingDate':
          aVal = a.openingDate || '';
          bVal = b.openingDate || '';
          break;
        default:
          aVal = a[sortField] ?? '';
          bVal = b[sortField] ?? '';
      }
      if (typeof aVal === 'string') {
        return aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number') {
        return aVal - bVal;
      }
      return 0;
    });

    if (sortDirection === 'desc') result.reverse();
    return result;
  }, [
    initialJobs, search,
    filterPlatform, filterCompany, filterPriority, filterStatus,
    filterJobType, filterLocation, filterWorkMethod,
    filterDurationMin, filterDurationMax,
    filterDeadlineStart, filterDeadlineEnd,
    sortField, sortDirection
  ]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="opacity-40" />;
    return sortDirection === 'asc' 
      ? <ArrowUp size={12} className="text-primary-600" />
      : <ArrowDown size={12} className="text-primary-600" />;
  };

  // 🎨 Status badge dengan warna unik
  const getStatusBadge = (status: string) => {
    const colors = STATUS_COLOR_MAP[status];
    if (!colors) {
      return <span className="badge badge-neutral">{formatStageLabel(status)}</span>;
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
        {formatStageLabel(status)}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH': return <span className="badge badge-danger text-[10px] font-bold">High</span>;
      case 'MEDIUM': return <span className="badge badge-warning text-[10px] font-bold">Medium</span>;
      default: return <span className="badge badge-neutral text-[10px] font-bold">Low</span>;
    }
  };

  const getDeadlineBadge = (deadlineStr: string) => {
    if (!deadlineStr) return <span className="text-neutral-400">-</span>;
    const rawDate = deadlineStr.split('T')[0];
    if (!rawDate) return <span className="text-neutral-400">-</span>;
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

  const getDaysSinceOpened = (openingDateStr?: string | null) => {
    if (!openingDateStr) return <span className="text-neutral-400 text-xs">-</span>;
    const openDate = new Date(openingDateStr);
    const today = new Date();
    openDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - openDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return <span className="text-neutral-500 text-xs">Not opened yet</span>;
    if (diffDays === 0) return <span className="text-primary-600 font-semibold text-xs">Today</span>;
    return <span className="text-neutral-700 text-xs">{diffDays} days</span>;
  };

  const activeFilterCount = [filterPlatform, filterCompany, filterPriority, filterStatus,
                            filterJobType, filterLocation, filterWorkMethod,
                            filterDurationMin, filterDurationMax,
                            filterDeadlineStart, filterDeadlineEnd].filter(f => f !== '').length;

  return (
    <div className="w-full space-y-5 pb-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl shadow-md shadow-primary-500/20">
            <Briefcase className="text-white" size={22} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Job Master Data</h1>
            <p className="text-sm text-neutral-500 mt-0.5">Manage and track all job applications in one place</p>
          </div>
        </div>
        <Link href="/jobs/new" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm self-start md:self-center">
          <Plus size={16} strokeWidth={2} /> Add New Job
        </Link>
      </div>

      {/* Filter Panel */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-5 pb-3 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-primary-500" />
            <h2 className="text-sm font-semibold text-neutral-700">Filters</h2>
            {activeFilterCount > 0 && (
              <button onClick={handleResetFilters} className="ml-2 flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1 rounded-lg transition-colors">
                <RotateCcw size={12} /> Reset ({activeFilterCount})
              </button>
            )}
          </div>
          <div className="flex text-xs text-neutral-500 bg-neutral-50 px-5 py-1 rounded-full gap-2">
            <TrendingUp size={14} />
            <span>Showing <strong className="text-neutral-700">{filteredAndSortedJobs.length}</strong> of {initialJobs.length} jobs</span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input
              type="text"
              placeholder="Search by position, company, job type, location, work method, duration, platform..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-800 outline-none focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
          </div>

          {/* Filter Grid - Baris 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={14} />
              <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-neutral-700 outline-none appearance-none cursor-pointer focus:border-primary-400 focus:bg-white transition-all">
                <option value="">All Platforms</option>
                {uniquePlatforms.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={14} />
              <select value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-neutral-700 outline-none appearance-none cursor-pointer focus:border-primary-400 focus:bg-white transition-all">
                <option value="">All Companies</option>
                {uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="relative">
              <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={14} />
              <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-neutral-700 outline-none appearance-none cursor-pointer focus:border-primary-400 focus:bg-white transition-all">
                <option value="">All Priorities</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div className="relative">
              <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={14} />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-neutral-700 outline-none appearance-none cursor-pointer focus:border-primary-400 focus:bg-white transition-all">
                <option value="">All Statuses</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{formatStageLabel(status)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Grid - Baris 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={14} />
              <select value={filterJobType} onChange={(e) => setFilterJobType(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-neutral-700 outline-none appearance-none cursor-pointer focus:border-primary-400 focus:bg-white transition-all">
                <option value="">All Job Types</option>
                {uniqueJobTypes.map(jt => <option key={jt} value={jt}>{formatJobType(jt)}</option>)}
              </select>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={14} />
              <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-neutral-700 outline-none appearance-none cursor-pointer focus:border-primary-400 focus:bg-white transition-all">
                <option value="">All Locations</option>
                {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={14} />
              <select value={filterWorkMethod} onChange={(e) => setFilterWorkMethod(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-neutral-700 outline-none appearance-none cursor-pointer focus:border-primary-400 focus:bg-white transition-all">
                <option value="">All Work Methods</option>
                {uniqueWorkMethods.map(wm => <option key={wm} value={wm}>{formatWorkMethodLabel(wm)}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                <th className="py-3.5 px-5 cursor-pointer hover:text-neutral-700 transition-colors" onClick={() => handleSort('position')}>
                  <div className="flex items-center gap-1">Position & Company {renderSortIcon('position')}</div>
                </th>
                <th className="py-3.5 px-5 cursor-pointer hover:text-neutral-700 transition-colors" onClick={() => handleSort('platform')}>
                  <div className="flex items-center gap-1">Platform {renderSortIcon('platform')}</div>
                </th>
                <th className="py-3.5 px-5 cursor-pointer hover:text-neutral-700 transition-colors" onClick={() => handleSort('jobType')}>
                  <div className="flex items-center gap-1">Job Type {renderSortIcon('jobType')}</div>
                </th>
                <th className="py-3.5 px-5 cursor-pointer hover:text-neutral-700 transition-colors" onClick={() => handleSort('location')}>
                  <div className="flex items-center gap-1">Location {renderSortIcon('location')}</div>
                </th>
                <th className="py-3.5 px-5 cursor-pointer hover:text-neutral-700 transition-colors" onClick={() => handleSort('workMethod')}>
                  <div className="flex items-center gap-1">Work Method {renderSortIcon('workMethod')}</div>
                </th>
                <th className="py-3.5 px-5 cursor-pointer hover:text-neutral-700 transition-colors" onClick={() => handleSort('durationValue')}>
                  <div className="flex items-center gap-1">Duration {renderSortIcon('durationValue')}</div>
                </th>
                <th className="py-3.5 px-5 cursor-pointer hover:text-neutral-700 transition-colors" onClick={() => handleSort('daysOpen')}>
                  <div className="flex items-center gap-1">Days Open {renderSortIcon('daysOpen')}</div>
                </th>
                <th className="py-3.5 px-5 cursor-pointer hover:text-neutral-700 transition-colors" onClick={() => handleSort('deadline')}>
                  <div className="flex items-center gap-1">Deadline {renderSortIcon('deadline')}</div>
                </th>
                <th className="py-3.5 px-5 text-center cursor-pointer hover:text-neutral-700 transition-colors" onClick={() => handleSort('priority')}>
                  <div className="flex items-center justify-center gap-1">Priority {renderSortIcon('priority')}</div>
                </th>
                <th className="py-3.5 px-5 text-center cursor-pointer hover:text-neutral-700 transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center justify-center gap-1">Status {renderSortIcon('status')}</div>
                </th>
                <th className="py-3.5 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredAndSortedJobs.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-neutral-500">
                    <div className="flex flex-col items-center gap-2">
                      <Briefcase size={32} className="text-neutral-300" />
                      <p className="text-sm font-medium">No matching job data found.</p>
                      <button onClick={handleResetFilters} className="text-primary-600 text-xs underline">Clear filters</button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedJobs.map(job => (
                  <tr key={job.id} className="group hover:bg-neutral-50/60 transition-colors duration-150">
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-neutral-900 text-sm">{job.position}</div>
                      <div className="text-neutral-500 text-xs mt-0.5 flex items-center gap-1">
                        {job.company}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-sm text-neutral-600 font-medium">{job.platform}</td>
                    <td className="py-3.5 px-5 text-sm text-neutral-600">{formatJobType(job.jobType)}</td>
                    <td className="py-3.5 px-5 text-sm text-neutral-600">{job.location || '-'}</td>
                    <td className="py-3.5 px-5 text-sm text-neutral-600">{formatWorkMethodLabel(job.workMethod)}</td>
                    <td className="py-3.5 px-5 text-sm text-neutral-600">
                      {job.duration && job.durationUnit 
                        ? `${job.duration} ${formatDurationUnitLabel(job.durationUnit)}` 
                        : '-'}
                    </td>
                    <td className="py-3.5 px-5">{getDaysSinceOpened(job.openingDate)}</td>
                    <td className="py-3.5 px-5">{getDeadlineBadge(job.deadline)}</td>
                    <td className="py-3.5 px-5 text-center">{getPriorityBadge(job.priority)}</td>
                    <td className="py-3.5 px-5 text-center">{getStatusBadge(job.status)}</td>
                    <td className="py-3.5 px-5 text-center">
                      <Link href={`/jobs/${job.id}/view`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-all font-semibold text-[11px] group-hover:shadow-sm">
                        <Eye size={13} /> Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}