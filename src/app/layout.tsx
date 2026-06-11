'use client';
import { usePathname } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Tentukan rute-rute autentikasi yang tidak memerlukan navigasi aplikasi
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col overflow-x-hidden">
        {isAuthPage ? (
          // Layout polos untuk halaman Login & Register (Bebas dari TopBar & BottomNav)
          <main className="flex-1 flex flex-col justify-center items-center">
            {children}
          </main>
        ) : (
          // Layout utama aplikasi dengan navigasi lengkap
          <>
            <TopBar />
            <main className="flex-1 p-4 md:p-8 max-w-[1400px] w-full mx-auto pb-24 md:pb-8">
              {children}
            </main>
            <BottomNav />
          </>
        )}
      </body>
    </html>
  );
}