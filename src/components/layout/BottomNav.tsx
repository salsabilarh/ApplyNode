'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Calendar, PlusCircle, TableProperties, User } from 'lucide-react';

/**
 * Mobile bottom navigation bar that provides quick access to main routes.
 * Shows active indicator and uses subtle animations for better UX.
 */
export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Board', icon: LayoutGrid },
    { href: '/planner', label: 'Planner', icon: Calendar },
    { href: '/jobs', label: 'Data', icon: TableProperties },
    { href: '/jobs/new', label: 'Tambah', icon: PlusCircle },
    { href: '/profile', label: 'Profil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-100 flex justify-around items-center py-2 md:hidden z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] px-2 pb-safe">
      {links.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-all duration-200 rounded-xl gap-0.5 relative ${
              isActive 
                ? 'text-blue-600 font-semibold' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {isActive && (
              <span className="absolute top-0 w-4 h-0.5 bg-blue-600 rounded-full" />
            )}
            <div className={`p-1.5 rounded-xl ${isActive ? 'bg-blue-50 text-blue-600' : 'bg-transparent'}`}>
              <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
            </div>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}