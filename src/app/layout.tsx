import type { Metadata, Viewport } from 'next';
import React, { Suspense } from 'react';
import './globals.css';
import { AuthProvider } from '@/lib/authContext';
import { Navbar } from '@/components/Navbar';
import { MobileNav } from '@/components/MobileNav';
import { Footer } from '@/components/Footer';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';

export const metadata: Metadata = {
  title: 'Salem Entrepreneurs Club | Connect. Collaborate. Grow.',
  description:
    'The premier digital community for Salem entrepreneurs, business founders, manufacturers, and innovators across Tamil Nadu. Business networking, high-value referrals, conclaves, and mastermind growth.',
  keywords: [
    'Salem Entrepreneurs Club',
    'Entrepreneurs Club Salem',
    'Business networking Salem',
    'Entrepreneurs network Salem',
    'Business community Salem',
    'Salem business networking',
    'Tamil Nadu MSME network',
  ],
  manifest: '/manifest.json',
  openGraph: {
    title: 'Salem Entrepreneurs Club — Connect. Collaborate. Grow.',
    description:
      'Where Entrepreneurs Connect, Collaborate, Have Fun & Grow Together in Salem, Tamil Nadu.',
    url: 'https://salementrepreneursclub.com',
    siteName: 'Salem Entrepreneurs Club',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Salem Entrepreneurs Club',
    description: 'Premier private entrepreneur community in Salem, Tamil Nadu.',
  },
};

export const viewport: Viewport = {
  themeColor: '#D4AF37',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#070B14] text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
        <AuthProvider>
          <Suspense fallback={<header className="h-16 bg-[#070B14] border-b border-slate-800" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1 pb-16 lg:pb-0">{children}</main>
          <Footer />
          <Suspense fallback={null}>
            <MobileNav />
          </Suspense>
          <PWAInstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}
