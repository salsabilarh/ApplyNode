import BoardClient from '@/components/board/BoardClient';

export default function HomePage() {
  // Halaman utama bertindak sebagai wrapper bersih untuk memuat Board Utama (Kanban)
  return <BoardClient />;
}