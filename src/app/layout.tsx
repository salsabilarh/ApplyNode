'use client';
import { usePathname } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import './globals.css';
import { ModalProvider } from '@/context/ModalContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <html lang="id" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col overflow-x-hidden">
        {/* ModalProvider harus membungkus segalanya agar tersedia di mana saja */}
        <ModalProvider>
          {isAuthPage ? (
            <main className="flex-1 flex flex-col justify-center items-center">
              {children}
            </main>
          ) : (
            <>
              <TopBar />
              <main className="flex-1 p-4 md:p-8 max-w-[1400px] w-full mx-auto pb-24 md:pb-8">
                {children}
              </main>
              <BottomNav />
            </>
          )}
        </ModalProvider>
      </body>
    </html>
  );
}