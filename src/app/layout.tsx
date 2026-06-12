import { ModalProvider } from '@/context/ModalContext';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <ModalProvider>{children}</ModalProvider>
      </body>
    </html>
  );
}