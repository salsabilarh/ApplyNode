'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, CalendarPlus, PlusCircle } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Board', icon: LayoutGrid },
    { href: '/planner', label: 'Planner', icon: CalendarPlus },
    { href: '/jobs/new', label: 'Tambah', icon: PlusCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 md:hidden">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`flex flex-col items-center text-xs ${
            pathname === link.href ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <link.icon size={20} />
          {link.label}
        </Link>
      ))}
    </nav>
  );
}