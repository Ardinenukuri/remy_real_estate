import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';

export const metadata: Metadata = {
  title: 'Remy Real Estates — Luxury Property Listings in Rwanda',
  description:
    'Find your dream space with verified real estate listings. Search top-tier residential, commercial, and luxury properties with direct realtor communication.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-[var(--emerald)] selection:text-white">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
