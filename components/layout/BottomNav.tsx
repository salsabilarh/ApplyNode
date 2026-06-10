'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Calendar, PlusCircle, TableProperties } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Board', icon: LayoutGrid },
    { href: '/planner', label: 'Planner', icon: Calendar },
    { href: '/jobs', label: 'Data', icon: TableProperties }, // <-- Menu Baru untuk URL /jobs pada Mobile
    { href: '/jobs/new', label: 'Tambah', icon: PlusCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-100 flex justify-around items-center py-2 md:hidden z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] px-2 pb-safe">
      {links.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;
        
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-all duration-200 rounded-xl gap-0.5 relative ${
              isActive 
                ? 'text-blue-600 font-semibold transform scale-102' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {/* Active Indication Bar */}
            {isActive && (
              <span className="absolute top-0 w-4 h-0.5 bg-blue-600 rounded-full" />
            )}
            
            <div className={`p-1.5 rounded-xl ${isActive ? 'bg-blue-50 text-blue-600' : 'bg-transparent'}`}>
              <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
            </div>
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}