import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";

export const metadata: Metadata = {
  title: "LamaranKu",
  description: "Tracker lowongan kerja pribadi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-gray-50 pb-16 md:pb-0">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}