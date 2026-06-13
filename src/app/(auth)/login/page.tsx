'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BriefcaseBusiness, Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid email or password');

      router.refresh();
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-slate-50 px-4 py-6 select-none">
      <div className="max-w-md w-full bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-md shadow-blue-500/20 mb-3">
            <BriefcaseBusiness className="text-white" size={22} strokeWidth={2.2} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sign in to ApplyNode</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
            Monitor your job application status and manage your execution plans.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-xs rounded-xl font-semibold border border-rose-100/60">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl pl-10 pr-11 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs py-3 rounded-xl transition-all active:scale-[0.99] shadow-sm flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Validating session...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 mt-6 font-medium">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 font-bold hover:underline transition-all">
            Register new account
          </Link>
        </div>
      </div>
    </div>
  );
}