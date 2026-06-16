import { ModalProvider } from '@/context/ModalContext';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <ModalProvider>{children}</ModalProvider>
      </body>
    </html>
  );
}