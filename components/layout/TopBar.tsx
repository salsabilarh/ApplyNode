'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BriefcaseBusiness, 
  LogOut, 
  LayoutGrid, 
  Calendar, 
  TableProperties 
} from 'lucide-react';
import LogoutModal from './LogoutModal';

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  
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
        <nav className="flex gap-7 items-center">
          <div className="flex gap-6 items-center">
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

          {/* Tombol Logout - Sekarang memancing Pop-up Modal Kustom muncul */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors group active:scale-95"
            title="Log Out dari Sistem"
          >
            <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>      
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