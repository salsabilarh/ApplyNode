// app/(dashboard)/layout.tsx
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <main className="flex-1 p-4 md:p-8 max-w-[1400px] w-full mx-auto pb-24 md:pb-8">
        {children}
      </main>
      <BottomNav />
    </>
  );
}