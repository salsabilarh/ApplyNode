'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BriefcaseBusiness, 
  LogOut, 
  LayoutGrid, 
  Calendar, 
  TableProperties, 
  User,
  Trash2,
  ChevronDown
} from 'lucide-react';
import LogoutModal from './LogoutModal';
import { useModal } from '@/context/ModalContext'; // Pastikan path ini benar

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userData, setUserData] = useState({ name: 'Loading...', email: '...' });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { openModal } = useModal();
  const dropdownRef = useRef<HTMLDivElement>(null);
  // State untuk mengontrol kemunculan Pop-up Modal Kustom & Loading State Logout
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Mempertahankan struktur menu routes asli milik Anda
  const navItems = [
    { href: '/', label: 'Board', icon: LayoutGrid },
    { href: '/planner', label: 'Planner', icon: Calendar },
    { href: '/jobs', label: 'Master Data', icon: TableProperties },
  ];

  // Fungsi eksekusi utama ketika dikonfirmasi melalui Pop-up Modal Profesional
  const handleLogoutConfirm = async () => {
    try {
      setIsLoggingOut(true);
      
      // Hit API Route handler untuk membersihkan cookie HTTP-only token JWT
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      
      if (!res.ok) throw new Error('Gagal memproses logout');

      setIsModalOpen(false); // Tutup modal secara aman
      router.refresh();
      router.push('/login'); // Arahkan kembali pengguna ke gerbang login
    } catch (error) {
      alert('Terjadi kendala saat mencoba keluar aplikasi. Silakan coba lagi.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccount = () => {
    setIsDropdownOpen(false);
    openModal({
      title: "Hapus Akun Permanen?",
      message: "Tindakan ini akan menghapus akun beserta seluruh data Anda. Tidak dapat dibatalkan.",
      onConfirm: async () => {
        await fetch('/api/user', { method: 'DELETE' });
        window.location.href = '/register';
      }
    });
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user');
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
        }
      } catch (error) {
        console.error("Gagal mengambil data user");
      }
    };

    if (isDropdownOpen) {
      fetchUser();
    }
  }, [isDropdownOpen]);
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="hidden md:flex items-center justify-between bg-white/75 backdrop-blur-md border-b border-slate-100 px-8 py-3.5 sticky top-0 z-40 shadow-[0_1px_2px_rgba(0,0,0,0.01)] select-none">
        {/* Brand Identity / Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-all duration-200">
            <BriefcaseBusiness className="text-white" size={20} strokeWidth={2.2} />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight">
            ApplyNode
          </span>
        </Link>

        {/* Navigation & Primed CTA */}
        <nav className="flex gap-6 items-center">
          <div className="flex gap-4 items-center">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={`text-sm font-medium transition-all duration-200 relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 ${
                    isActive 
                      ? 'text-blue-600 font-semibold bg-blue-50/60' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
          
          {/* Divider */}
          <span className="w-px h-4 bg-slate-200" aria-hidden="true" />
          {/* Dropdown Profil */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full hover:bg-slate-50 transition-all border border-slate-100"
              >
                <User size={16} className="text-slate-600" />
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-100 shadow-xl p-2 animate-in fade-in slide-in-from-top-2">
                  {/* Menampilkan data dinamis */}
                  <div className="px-3 py-2 border-b border-slate-50 mb-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{userData.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{userData.email}</p>
                  </div>
                  
                  <button onClick={() => setIsModalOpen(true)} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg">
                    <LogOut size={14} /> Keluar dari Akun
                  </button>
                  <button onClick={handleDeleteAccount} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg">
                    <Trash2 size={14} /> Hapus Akun Permanen
                  </button>
                </div>
              )}
            </div>
            </nav>
          </header>

          {/* Meletakkan Modal Pop-up di level root agar terhindar dari pemangkasan layout CSS parent */}
          <LogoutModal
            isOpen={isModalOpen}
            isLoggingOut={isLoggingOut}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleLogoutConfirm}
          />
    </>
  );
}