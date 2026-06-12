'use client';

import { useAuth } from '@/hooks/useAuth';
import { useModal } from '@/context/ModalContext';
import { User, Mail, Trash2, LogOut, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const { openModal } = useModal();
  const router = useRouter();

  const handleDelete = () => {
    openModal({
      title: 'Hapus Akun Permanen?',
      message: 'Tindakan ini permanen. Semua data lamaran kerja akan dihapus.',
      onConfirm: async () => {
        const res = await fetch('/api/user', { method: 'DELETE' });
        if (res.ok) router.push('/register');
      }
    });
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Profil Pengguna</h2>
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-900">{user?.name}</h1>
            <p className="text-sm text-slate-500 flex items-center gap-1.5">
              <Mail size={14} /> {user?.email}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-50">
          <button onClick={logout} className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">
            <LogOut size={16} /> Logout
          </button>
          <button onClick={handleDelete} className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all">
            <Trash2 size={16} /> Hapus Akun
          </button>
        </div>
      </div>
    </div>
  );
}