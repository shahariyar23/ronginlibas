import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { CartDrawer } from '@/components/common/CartDrawer';
import { BottomNav } from '@/components/common/BottomNav';
import { StorefrontProvider } from '@/context/StorefrontContext';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import { ConsentBanner } from '@/components/analytics/ConsentBanner';
import { Toaster } from '@/components/ui/sonner';
import { Suspense } from 'react';
import Script from 'next/script';

export const metadata: Metadata = {
  metadataBase: new URL('https://ronginlibas.com'),
  title: {
    default: 'Rongin Libas | Cloth Your Identity — Aristocratic Menswear & Bespoke Panjabis',
    template: '%s | Rongin Libas',
  },
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
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Rongin Libas | Cloth Your Identity',
    description: 'Aristocratic Menswear & Bespoke Panjabis handcrafted with ancestral Bengal weaves.',
    url: 'https://ronginlibas.com',
    siteName: 'Rongin Libas',
    locale: 'en_US',
    images: [{ url: '/hero-model.jpg', width: 1200, height: 630, alt: 'Rongin Libas — Cloth Your Identity' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rongin Libas | Cloth Your Identity',
    description: 'Aristocratic Menswear & Bespoke Panjabis handcrafted with ancestral Bengal weaves.',
    images: ['/hero-model.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://ronginlibas.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="bg-[#fbf9f2] text-[#1b1c18] antialiased flex flex-col min-h-screen"
        suppressHydrationWarning
      >
        <StorefrontProvider>
          <Suspense fallback={null}>
            <AnalyticsProvider>
              <AuthProvider>
                <CartProvider>
                  <WishlistProvider>
                    <NotificationProvider>
                      <Header />
                      <main className="flex-1 w-full pb-14 sm:pb-16 lg:pb-0">{children}</main>
                      <CartDrawer />
                      <Footer />
                      <BottomNav />
                      <ConsentBanner />
                      <Toaster position="top-right" richColors />
                    </NotificationProvider>
                  </WishlistProvider>
                </CartProvider>
              </AuthProvider>
            </AnalyticsProvider>
          </Suspense>
        </StorefrontProvider>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
