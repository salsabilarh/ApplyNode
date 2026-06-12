'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BriefcaseBusiness, LayoutGrid, Calendar, TableProperties, User, ChevronDown, LogOut, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useModal } from '@/context/ModalContext';
import LogoutModal from './LogoutModal';

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { openModal } = useModal();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { href: '/', label: 'Board', icon: LayoutGrid },
    { href: '/planner', label: 'Planner', icon: Calendar },
    { href: '/jobs', label: 'Master Data', icon: TableProperties },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutConfirm = async () => {
    await logout();
    router.push('/login');
  };

  const handleDeleteAccount = () => {
    setIsDropdownOpen(false);
    openModal({
      title: 'Hapus Akun Permanen?',
      message: 'Tindakan ini akan menghapus akun beserta seluruh data Anda. Tidak dapat dibatalkan.',
      onConfirm: async () => {
        await fetch('/api/user', { method: 'DELETE' });
        window.location.href = '/register';
      }
    });
  };

  return (
    <>
      <header className="hidden md:flex items-center justify-between bg-white/75 backdrop-blur-md border-b border-slate-100 px-8 py-3.5 sticky top-0 z-40 shadow-sm select-none">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <BriefcaseBusiness className="text-white" size={20} strokeWidth={2.2} />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight">
            ApplyNode
          </span>
        </Link>

        <nav className="flex gap-6 items-center">
          <div className="flex gap-4 items-center">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`text-sm font-medium transition-all duration-200 relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 ${
                    isActive ? 'text-blue-600 font-semibold bg-blue-50/60' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
          <span className="w-px h-4 bg-slate-200" aria-hidden="true" />
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(prev => !prev)}
              className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full hover:bg-slate-50 transition-all border border-slate-100"
              aria-label="Menu Profil"
            >
              <User size={16} className="text-slate-600" />
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-100 shadow-xl p-2 animate-in fade-in slide-in-from-top-2 z-50">
                <div className="px-3 py-2 border-b border-slate-50 mb-1">
                  <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Memuat...'}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email || '...'}</p>
                </div>
                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <LogOut size={14} /> Keluar dari Akun
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 size={14} /> Hapus Akun Permanen
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        isLoggingOut={false}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}