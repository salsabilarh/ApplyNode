import { useState, useEffect, useCallback } from 'react';
import { Job } from '@/types/job';
import { useRouter } from 'next/navigation';

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/jobs');
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const result = await res.json();
      const jobsData = result.success ? result.data : result;
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateJob = useCallback(async (id: string, payload: Partial<Job>) => {
    const previousJobs = [...jobs];
    setJobs(prev => prev.map(job => job.id === id ? { ...job, ...payload } : job));
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Update failed');
      router.refresh();
      return true;
    } catch (err) {
      setJobs(previousJobs);
      await fetchJobs();
      return false;
    }
  }, [jobs, fetchJobs, router]);

  const deleteJob = useCallback(async (id: string) => {
    const previousJobs = [...jobs];
    setJobs(prev => prev.filter(job => job.id !== id));
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      router.refresh();
      return true;
    } catch (err) {
      setJobs(previousJobs);
      return false;
    }
  }, [jobs, router]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, loading, error, fetchJobs, updateJob, deleteJob };
}