import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AuthProvider } from '@/context/AuthContext';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { CartDrawer } from '@/components/common/CartDrawer';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  metadataBase: new URL('https://ronginlibas.com'),
  title: 'Rongin Libas | Cloth Your Identity — Aristocratic Menswear & Bespoke Panjabis',
  description:
    'Luxury Bangladeshi menswear atelier specializing in bespoke panjabis, mercerized knitwear, and architectural casual wear. Handcrafted in Dhaka.',
  keywords: [
    'Rongin Libas',
    'Panjabi',
    'Bespoke Menswear Dhaka',
    'Luxury Panjabi Bangladesh',
    'Mercerized Polo',
    'Bangladeshi Fashion',
    'Cloth Your Identity',
  ],
  authors: [{ name: 'Rongin Libas Atelier' }],
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    title: 'Rongin Libas | Cloth Your Identity',
    description: 'Aristocratic Menswear & Bespoke Panjabis handcrafted with ancestral Bengal weaves.',
    url: 'https://ronginlibas.com',
    siteName: 'Rongin Libas',
    images: [{ url: '/logo.svg' }],
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className="bg-[#fbf9f2] text-[#1b1c18] antialiased flex flex-col min-h-screen"
        suppressHydrationWarning
      >
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Header />
              <main className="flex-1 w-full">{children}</main>
              <CartDrawer />
              <Footer />
              <Toaster position="top-right" richColors />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
