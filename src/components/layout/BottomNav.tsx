'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Calendar, PlusCircle, TableProperties, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Board', icon: LayoutGrid },
    { href: '/planner', label: 'Planner', icon: Calendar },
    { href: '/jobs', label: 'Data', icon: TableProperties },
    { href: '/jobs/new', label: 'Add', icon: PlusCircle },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-neutral-200 flex justify-around items-center py-1.5 md:hidden z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] px-2 pb-safe">
      {links.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={`group flex flex-col items-center justify-center flex-1 py-1.5 text-[11px] font-medium transition-all duration-200 rounded-xl gap-0.5 relative ${
              isActive 
                ? 'text-primary-600' 
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {isActive && (
              <span className="absolute -top-1.5 w-5 h-0.5 bg-primary-500 rounded-full shadow-sm" />
            )}
            <div className={`p-1.5 rounded-xl transition-all ${
              isActive 
                ? 'bg-primary-50 text-primary-600' 
                : 'bg-transparent group-hover:bg-neutral-100'
            }`}>
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
            </div>
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}