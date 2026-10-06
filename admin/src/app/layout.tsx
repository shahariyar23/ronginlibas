import type { Metadata } from 'next';
import './globals.css';
import { AdminLayout } from '@/components/layout/AdminLayout';

export const metadata: Metadata = {
  title: 'Rongin Libas | Admin Atelier Suite',
  description: 'Operations console for Rongin Libas luxury South Asian bespoke menswear atelier.',
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#fbf9f2] text-[#1b1c18] antialiased">
        <AdminLayout>{children}</AdminLayout>
      </body>
    </html>
  );
}
